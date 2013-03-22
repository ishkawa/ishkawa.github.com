---
layout: post
title: "iOS6(ARC)でのGCDのメモリ管理"
date: 2013-03-21 20:30
comments: true
categories: 
---

Deployment TargetがiOS6.0以上の場合、GCDのオブジェクトもARCの管轄下になるらしいです。　　
以下のStack Overflowによると`<os/object.h>`というヘッダに書かれているそうです。  
[Why is ARC complaining about dispatch_queue_create and dispatch_release in iOS 6?](http://stackoverflow.com/questions/13702701/why-is-arc-complaining-about-dispatch-queue-create-and-dispatch-release-in-ios-6)

これが適用される場合には`dispatch_release`などに対してXcodeが警告を出してくれます。

で、GCDのオブジェクトをプロパティとして持つ場合にどうしたらいいのか、  
ちょっと迷ったので、`dispatch_semaphore_t`を例に書いておきます。

### Deployment Targetが6.0未満の場合

```objectivec
@interface ISHoge ()

@property (nonatomic, assign) dispatch_semaphore_t semaphore;

@end

@implementation ISHTTPOperation

- (id)init
{
    self = [super init];
    if (self) {
        _semaphore = dispatch_semaphore_create(1);
    }
    return self;
}

- (void)dealloc
{
    dispatch_release(_semaphore);
}
```

### Deployment Targetが6.0以上の場合

```objectivec
@interface ISHoge ()

@property (nonatomic, strong) dispatch_semaphore_t semaphore;

@end

@implementation ISHoge

- (id)init
{
    self = [super init];
    if (self) {
        _semaphore = dispatch_semaphore_create(1);
    }
    return self;
}

```

### どっちでも大丈夫にしたい場合

ライブラリをつくったりする場合です。

```objectivec
@interface ISHoge ()

#if OS_OBJECT_USE_OBJC
@property (nonatomic, assign) dispatch_semaphore_t semaphore;
#else
@property (nonatomic, assign) dispatch_semaphore_t semaphore;
#endif

@end

@implementation ISHoge

- (id)init
{
    self = [super init];
    if (self) {
        _semaphore = dispatch_semaphore_create(1);
    }
    return self;
}

- (void)dealloc
{
#if !OS_OBJECT_USE_OBJC
    dispatch_release(self.semaphore);
#endif
}
```

　

間違ってたら教えてください。

#### 追記(3/22)

Twitterで@nakiwo さんに`OS_OBJECT_USE_OBJC`を教えて頂きました。

<blockquote class="twitter-tweet" data-conversation="none" lang="ja"><p>@<a href="https://twitter.com/akisutesama">akisutesama</a> @<a href="https://twitter.com/_ishkawa">_ishkawa</a> この挙動、OS_OBJECT_USE_OBJC マクロで制御可能です</p>&mdash; Yuichi Fujishigeさん (@nakiwo) <a href="https://twitter.com/nakiwo/status/314770719257006081">2013年3月21日</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

こちらのほうが`__IPHONE_OS_VERSION_MIN_REQUIRED`より適切ですので、  
`__IPHONE_OS_VERSION_MIN_REQUIRED < 60000`としていたところを  
`OS_OBJECT_USE_OBJC`に
置き換えました。

#### さらに追記

`#ifdef`ではなく`#if`に修正しました。
