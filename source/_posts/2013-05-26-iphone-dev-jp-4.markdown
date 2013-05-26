---
layout: post
title: "第4回 iphone_dev_jp 東京iPhone/Mac勉強会に参加しました"
date: 2013-05-26 01:57
comments: true
categories: 
---

ちょっと早めに会場に着いたので前方に座ったら、隣が[@ninjinkun](https://twitter.com/ninjinkun)さんでした。

### 自分の発表

自分はiOS 5で動作するUIRefreshControlのつくり方を発表しました。  
つくり方は以下の5つの段階に分けて、それぞれサンプルコードを用意しました。

- Step 1: コントロールがUIScrollViewの上部にとどまるようにする
- Step 2: 閾値を超えたらコントロールを出したままにし、UIActivityIndicatorを回す。
- Step 3: 外見を整える。
- Step 4: UIRefreshControlと併用できるようにする。
- Step 5: Storyboardに対応させる。

[iOS5UIRefreshControlTotorial](https://github.com/ishkawa/iOS5UIRefreshControlTotorial)

Step 4, Step 5にはいくらか黒いテクニックを使用していて、  
それらも説明しようと試みたのですが、イマイチ伝わらなかったようでした。


### NJKWebViewProgress

NJKWebViewProgressは[@ninjinkun](https://twitter.com/ninjinkun)さんが発表していたライブラリで、  
UIWebViewの読み込みの進捗を取得してくれます。

以下のような使い方になっていて、UIWebViewとdelegateの間にproxyが入ります。

```objectivec
- (void)viewDidLoad
{
    [super viewDidLoad];

    self.progressProxy = [[NJKWebViewProgress alloc] init];
    self.webView.delegate = self.progressProxy;
    self.progressProxy.webViewProxyDelegate = self;
    self.progressProxy.progressDelegate = self;
}

-(void)webViewProgress:(NJKWebViewProgress *)webViewProgress updateProgress:(float)progress
{
    self.progressView = progress;
}
```

発表を聞いたときにproxyなしで以下のように使えるようにしたいと思い、挑戦してみました。

```objectivec
- (void)viewDidLoad
{
    [super viewDidLoad];

    self.webView.delegate = self;
    self.webView.progressDelegate = self;
}

#pragma mark - NJKWebViewProgressDelegate

-(void)webViewProgress:(NJKWebViewProgress *)webViewProgress updateProgress:(float)progress
{
    self.progressView = progress;
}
```

で、出来たものが以下です。  
[UIWebView+Progress](https://github.com/ishkawa/UIWebView-Progress)

インターフェースはなかなか良いと思うのですが、実装に黒いテクニックを多用してしまったので、  
本家のNJKWebViewProgressには送らない予定です。

--

その他にも面白い発表や、開発に役立つ発表がたくさんありました。  
また機会があったら参加しようと思います。

