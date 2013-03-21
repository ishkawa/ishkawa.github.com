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

#if __IPHONE_OS_VERSION_MIN_REQUIRED < 60000
@property (nonatomic, assign) dispatch_semaphore_t semaphore;
#else
@property (nonatomic, strong) dispatch_semaphore_t semaphore;
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
#if __IPHONE_OS_VERSION_MIN_REQUIRED < 60000
    dispatch_release(_semaphore);
#endif
}
```

　

間違ってたら教えてください。
