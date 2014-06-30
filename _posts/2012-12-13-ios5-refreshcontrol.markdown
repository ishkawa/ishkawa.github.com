---
layout: post
title: "iOS5で動作するUIRefreshControlのライブラリをつくったときの話"
date: 2012-12-13 22:26
comments: true
categories: 
---

先日、iOS5でも動作する`UIRefreshControl`と銘打った`ISRefreshControl`というライブラリを公開しました。
今回は`ISRefreshControl`でやっていることについて、簡単に解説したいと思います。

詳細には踏み入らずにアイディアとコアのコードだけを書きますので、
アプリに組み込む場合にはGitHubに上がっているものを利用することをおすすめします。

[ISRefreshControl](https://github.com/ishkawa/ISRefreshControl)

--

### 基本方針

- iOS6: 本物の`UIRefreshControl`として動作する。
- iOS5: `UIRefreshControl`の真似をする。

### 使い方

`UIRefreshControl`と概ね同じ使い方ができます。

```objectivec
UIScrollView *scrollView = [[UIScrollView alloc] init];
ISRefreshControl *refreshControl = [[ISRefreshControl alloc] init];
[scrollView addSubview:refreshControl];
[refreshControl addTarget:self
                   action:@selector(refresh)
         forControlEvents:UIControlEventValueChanged];
```

または

```objectivec
self.refreshControl = (id)[[ISRefreshControl alloc] init];
[self.refreshControl addTarget:self
                        action:@selector(refresh)
              forControlEvents:UIControlEventValueChanged];
```

### 実現するためにやったこと

- iOS5のときだけ`UITableViewController`に`refreshControl`プロパティを生やす。
- superviewとなる`UIScrollView`の`contentOffset`をキー値監視して、閾値を超えたら`UIControlEventValueChanged`を送る。
- `contentOffset`に応じてびよーんってなるやつを頑張って描画する。


## iOS6では`UIRefreshControl`として動作させる

`+ (id)alloc`内で`UIRefreshControl`クラスの存在を判定し、存在すれば`UIRefreshControl`のインスタンスを、
存在しなければ`ISRefreshControl`のインスタンスを返すようにしました。

ISRefreshControl
```objectivec


+ (id)alloc
{
    if ([UIRefreshControl class]) {
        return (id)[UIRefreshControl alloc];
    }
    return [super alloc];
}
```

## `contentOffset`をキー値監視する

`UIRefreshControl`は`UIScrollView`に追加されるとスクロール量に応じて`UIControlEventValueChanged`を発火させます。
これを再現するには`superview`の`contentOffset`をキー値監視する必要があります。
適切にキー値監視を開始/終了させるため、`superview`に追加されたときにキー値監視を開始し、
`superview`から削除された時にキー値監視を終了させます。

```objectivec
- (void)willMoveToSuperview:(UIView *)newSuperview
{
    if ([self.superview isKindOfClass:[UIScrollView class]]) {
        [self.superview removeObserver:self forKeyPath:@"contentOffset"];
    }
}

- (void)didMoveToSuperview
{
    if ([self.superview isKindOfClass:[UIScrollView class]]) {
        [self.superview addObserver:self forKeyPath:@"contentOffset" options:0 context:NULL];
        
        self.frame = CGRectMake(0, -50, self.superview.frame.size.width, 50);
        self.autoresizingMask = UIViewAutoresizingFlexibleWidth;
        [self setNeedsLayout];
    }
}
```

`UIRefreshControl`を上部に配置させるため、`didMoveToSuperview`で`frame`を適当に設定しています。

## びよーんってなるやつを描画する

`ISRefreshControl`はびよーんってなるViewを別のクラス(`ISGumView`)で実装しています。
`contentOffset`の変更毎にこのViewの`setNeedsLayout`を呼び、
drawRectでスクロール量に応じたものを`CGPath`で描画します。

`mainRadius`は"びよーん"の上部の丸の半径、`subRadius`は下部の丸の半径を表しています。

```
- (void)drawRect:(CGRect)rect
{
    ...

    CGContextRef ctx = UIGraphicsGetCurrentContext();
    CGMutablePathRef path = CGPathCreateMutable();
    
    CGPathMoveToPoint(path, NULL, offset, 25);
    CGPathAddArcToPoint(path, NULL,
                        offset, 0,
                        offset + self.mainRadius, 0,
                        self.mainRadius);
    
    CGPathAddArcToPoint(path, NULL,
                        offset + self.mainRadius*2.f, 0,
                        offset + self.mainRadius*2.f, self.mainRadius,
                        self.mainRadius);

    CGPathAddCurveToPoint(path, NULL,
                          offset + self.mainRadius*2.f,            self.mainRadius*2.f,
                          offset + self.mainRadius+self.subRadius, self.mainRadius*2.f,
                          offset + self.mainRadius+self.subRadius, self.distance+self.mainRadius);
    
    CGPathAddArcToPoint(path, NULL,
                        offset + self.mainRadius+self.subRadius, self.distance+self.mainRadius+self.subRadius,
                        offset + self.mainRadius,                self.distance+self.mainRadius+self.subRadius,
                        self.subRadius);
    
    CGPathAddArcToPoint(path, NULL,
                        offset + self.mainRadius-self.subRadius, self.distance+self.mainRadius+self.subRadius,
                        offset + self.mainRadius-self.subRadius, self.distance+self.mainRadius,
                        self.subRadius);
    
    CGPathAddCurveToPoint(path, NULL,
                          offset + self.mainRadius-self.subRadius, self.mainRadius*2.f,
                          offset + 0, self.mainRadius*2.f,
                          offset + 0, self.mainRadius);
    
    CGPathCloseSubpath(path);
    CGContextAddPath(ctx, path);
    CGContextSetFillColorWithColor(ctx, [UIColor lightGrayColor].CGColor);
    CGContextFillPath(ctx);
    CGPathRelease(path);
}
```

## `UITableViewController`を拡張する

iOS6の`UITableViewController`には`refreshControl`プロパティが用意されていて、
`addSubview:`を呼ぶことなく`UIRefreshControl`を設定することが可能となっています。

```objectivec
@property (nonatomic,retain) UIRefreshControl *refreshControl NS_AVAILABLE_IOS(6_0);
```

当然、iOS5にこのプロパティは存在しないので、拡張する必要があります。
カテゴリで普通に拡張するとiOS6で衝突してしまうので、iOS5のときだけ`+ (void)load`で動的にアクセサを追加します。
既存のクラスにインスタンス変数を追加することはできないので、Associated Objectを使って同等のものを実現しています。

```objectivec
@implementation UITableViewController (RefreshControl)

+ (void)load
{
    @autoreleasepool {
        if ([[[UIDevice currentDevice] systemVersion] hasPrefix:@"5"]) {
            Swizzle([self class], @selector(refreshControl),     @selector(iOS5_refreshControl));
            Swizzle([self class], @selector(setRefreshControl:), @selector(iOS5_setRefreshControl:));
            Swizzle([self class], @selector(viewDidLoad),        @selector(iOS5_viewDidLoad));
        }
    }
}

#pragma mark -

- (void)iOS5_viewDidLoad
{
    [super viewDidLoad];
    
    if (self.refreshControl) {
        [self.view addSubview:self.refreshControl];
    }
}

- (ISRefreshControl *)iOS5_refreshControl
{
    return objc_getAssociatedObject(self, @"iOS5RefreshControl");
}

- (void)iOS5_setRefreshControl:(ISRefreshControl *)refreshControl
{
    if (self.isViewLoaded) {
        ISRefreshControl *oldRefreshControl = objc_getAssociatedObject(self, @"iOS5RefreshControl");
        [oldRefreshControl removeFromSuperview];
        [self.view addSubview:refreshControl];
    }
    
    objc_setAssociatedObject(self, @"iOS5RefreshControl", refreshControl, OBJC_ASSOCIATION_RETAIN);
}

@end
```

ここで使用されている`Swizzle`という関数はいわゆるMethod Swizzlingを行うもので、
以下のように実装されています。

```
void Swizzle(Class c, SEL original, SEL alternative)
{
    Method orgMethod = class_getInstanceMethod(c, original);
    Method altMethod = class_getInstanceMethod(c, alternative);
    
    if(class_addMethod(c, original, method_getImplementation(altMethod), method_getTypeEncoding(altMethod))) {
        class_replaceMethod(c, alternative, method_getImplementation(orgMethod), method_getTypeEncoding(orgMethod));
    } else {
        method_exchangeImplementations(orgMethod, altMethod);
    }
}
```

`viewDidLoad`にも手を加えているのは、`+ (id)init`や`+ (id)initWithCoder:`で
既に`refreshControl`プロパティが設定されているケースを考慮するためです。

### まとめ

`ISRefreshControl`は以上のアイディアに沿って実装しました。
同じようなアイディアでiPhoneに対応した`UIPopOverController`も作れたりするのではないかと思います。

`ISRefreshControl`にはアニメーションの詰めが甘い箇所があったりするので、開発に協力してくださる方は是非GitHubでpull requestをください。

