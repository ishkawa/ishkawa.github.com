---
layout: post
title: "1行で導入するback gestureの話とUINavigationBarを拡張した話"
date: 2013-02-24 13:33
comments: true
categories: 
---

昨日、conferenceWithDevelopersのLTで、1行で導入するback gestureの話をしてきました。  
LTの内容と、やろうとして間に合わなかったことの紹介を書きます。

### 1行で導入するback gesture

iPhone 5が発売されて、`UINavigationBar`の`backButtonItem`に指が届きにくくなったので、
スワイプして戻るという動作を実装するアプリが増えてきたように思います。

これを実装するには`UIGestureRecognizer`を使ってあれこれするのですが、
毎回これを書くのはだるいので、`UIViewController`を拡張して
1行で導入できるようにしたライブラリを書きました。  
[ISBackGesture](https://github.com/ishkawa/ISBackGesture)

#### 使い方

`UIViewController`に`backGestureEnabled`というプロパティが追加されているので、
これの値を`YES`にするだけです。

```objc
UIViewController *viewController = [[UIViewController alloc] init];
viewController.backGestureEnabled = YES;
```

progressも取得出来ます。

```objc
float progress = viewController.backProgress;
```

#### 実装の話

`UIViewController`の拡張はカテゴリで実現していて、ヘッダーは以下のようになっています。

```objc
#import <UIKit/UIKit.h>

@interface UIViewController (BackGesture)

@property (nonatomic) BOOL backGestureEnabled;
@property (nonatomic, readonly) float backProgress;

@end
```

`viewDidLoad`の実装を書き換えて、`backGestureEnabled`が`YES`だったら
`self.view`に`UIPanGestureRecognizer`を追加するという感じになっています。

```objc
- (void)startRecognizing
{
    if (!self.isViewLoaded || !self.backGestureEnabled) {
        return;
    }
    
    self.backGestureRecognizer = [[UIPanGestureRecognizer alloc] initWithTarget:self action:@selector(handleGesture:)];
    [self.view addGestureRecognizer:self.backGestureRecognizer];
}
```

#### スライド

"ハゲ"ってところにSteve Jobsが写ってますが、気にしないでください。

<script async class="speakerdeck-embed" data-id="5b6384c0609e0130d93422000a1e9114" data-ratio="1.33333333333333" src="//speakerdeck.com/assets/embed.js"></script>  

　  

### UINavigationBarを拡張した話

このライブラリの目指すところは、元々webtronさんが提案していた
"Interaction Concept of Swiping to Go Back"を1行で導入できるようにすることでした。  
[Interaction Concept of Swiping to Go Back](http://blog.webtron.jp/archives/2012/11/000092.html)

`ISBackGesture`を拡張して実現できたのですが、1行で導入することに固執したせいで、
プライベートクラスを使った骨の折れる作業が必要だったので、それを紹介します。  
(※ 以下に書くことはwebtronさんのコンセプト自体とは無関係です)  
(※ 先に紹介したバージョンの`ISBackGesture`ではプライベートクラスは利用していません。 )

#### UINavigationItemButtonViewのクラスの差し替え

`UINavigationBar`のViewヒエラルキーの中のボタンにあたる部分は、
`UINavigationItemButtonView`というプライベートなクラスで実装されています。
デフォルトで表示される`backButtonItem`に戻りゲージをつけるために、
このオブジェクトのクラスを差し替えました。
クラスを差し替えるにはObjective-C Runtime APIにある、object_setClass()を使います。

差し替えるタイミングには色々と候補がありますが、`UIView`の`didMoveToSuperview`を選びました。
具体的には、`didMoveToSuperview`の実装を以下のものに差し替えます。

```objc
- (void)_didMoveToSuperview
{
    Class class = NSClassFromString(@"UINavigationItemButtonView");
    if ([self isKindOfClass:class]) {
        object_setClass(self, [ISNavigationItemProgressButtonView class]);
    }
}
```

#### ゲージを描画するUINavigationItemButtonViewの実装

`UINavigationItemButtonView`のサブクラスを普通に作ることはできないので、
一旦`UIView`のサブクラスを作成し、`load`の中でスーパークラスを差し替えます。

```
+ (void)load
{
    @autoreleasepool {
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
        Class class = NSClassFromString(@"UINavigationItemButtonView");
        class_setSuperclass([self class], class);
#pragma clang diagnostic pop
    }
}
```

progressの値に応じて、ゲージを描画します。

```objc
- (void)setProgress:(float)progress
{
    UIView *progressView = objc_getAssociatedObject(self, ISProgressViewKey);
    CGRect frame = progressView.frame;
    frame.origin.x = self.frame.size.width * (1.f - progress);
    
    progressView.frame = frame;
    progressView.alpha = pow(progress, 1.2) * .25f + .1f;
}
```

`UINavigationItemButtonView`は`drawText:inRect:barStyle:`というメソッドの中で
タイトルの描画をしているのですが、そのまま描画されてしまうとゲージの奥に隠れてしまうので、
このメソッドでの文字列の描画をキャンセルし、代わりに`UILabel`をゲージの上に配置します。

```objc
- (void)drawText:(NSString *)text inRect:(CGRect)rect barStyle:(UIBarStyle)style
{
    UILabel *label = objc_getAssociatedObject(self, ISLabelKey);
    label.text = text;
}
```

#### progressの受け渡し

UIViewControllerのgestureを受け取る箇所で`UINavigationItemButtonView`にprogressを渡します。

```objc
- (void)handleGesture:(UIPanGestureRecognizer *)gestureRecognizer
{
    NSInteger count = [self.navigationController.viewControllers count];
    if (count >= 2) {
        for (UIView *subview in [self.navigationController.navigationBar subviews]) {
            if ([subview isKindOfClass:[ISNavigationItemProgressButtonView class]]) {
                ISNavigationItemProgressButtonView *progressButtonView = (id)subview;
                if (gestureRecognizer.state == UIGestureRecognizerStateChanged) {
                    progressButtonView.progress = self.backProgress;
                } else {
                    [UIView animateWithDuration:.3
                                     animations:^{
                                         progressButtonView.progress = 0.f;
                                     }];
                }
            }
        }
    }
    
    ...
}
```

`else`では、gestureをやめたときに徐々にゲージが戻るようにしています。

　

以上のような感じで、以下のようなUIが1行で導入できるようになりました。  

<iframe src="http://player.vimeo.com/video/60376912?title=0&amp;byline=0&amp;portrait=0" width="500" height="281" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>

こちらのバージョンのコードは別のブランチに置いてあります。  
[ISBackGesture(extended)](https://github.com/ishkawa/ISBackGesture/tree/extended)



　

2つ目に紹介したバージョンではプライベートなクラスに触れてる箇所もあり、  
リジェクトされる可能性があるので、プロダクトへの導入は自己責任でお願いします。
