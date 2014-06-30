---
layout: post
title: "OCMockでも[[foo shouldEventually] receive:@selector(bar)]がしたい"
date: 2013-06-26 00:35
comments: true
categories: 
---

そう思って、雑に実装をしてみました。  

`[[foo shouldEventually] receive:@selector(bar)]`はKiwiの構文で、  
一定時間以内に`bar`というメソッドが呼ばれないとテスト失敗とするものです。

具体的には以下のようなプログラムで`foo`の`bar`が呼ばれるか確認するテストに使えます。

```objectivec
- (void)someMethod:(id)foo
{
    dispatch_queue_t queue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0);
    dispatch_async(queue, ^{
        ...

        [foo bar];
    });
}
```

Kiwiの`shouldEventually`は`KWProbePoller`が0.1秒ごとに`NSRunLoop`を回し、  
`KWAsyncMatcherProbe`の  `isSatisfied`が`YES`になるまで回し続けるという実装をしています。  

```objectivec
// KWProbePoller

- (BOOL)check:(id<KWProbe>)probe;
{
  KWTimeout *timeout = [[KWTimeout alloc] initWithTimeout:timeoutInterval];

  while (![probe isSatisfied]) {
    if ([timeout hasTimedOut]) {
      [timeout release];
      return NO;
    }
    [[NSRunLoop currentRunLoop] runUntilDate:[NSDate dateWithTimeIntervalSinceNow:delayInterval]];
    [probe sample];
  }
  [timeout release];

  return YES;
}
```

`OCMock`で`receive:`に相当するものは`expect`/`verify`なので、これらを使って同じことをします。  

`OCMockObject`は`expectations`という`NSArray`があり、`expect`すると`OCMockRecorder`を追加し、  
メソッドが呼ばれると`OCMockRecorder`を`expectations`から外すという処理をします。  
そして、`verify`時に`expectations`が残っているとテストを失敗させる仕組みになっています。

```objectivec
// OCMockObject

- (void)verify
{
	if([expectations count] == 1)
	{
		[NSException raise:NSInternalInconsistencyException format:@"%@: expected method was not invoked: %@", 
			[self description], [[expectations objectAtIndex:0] description]];
	}
	if([expectations count] > 0)
	{
		[NSException raise:NSInternalInconsistencyException format:@"%@ : %ld expected methods were not invoked: %@", 
			[self description], [expectations count], [self _recorderDescriptions:YES]];
	}
	if([exceptions count] > 0)
	{
		[[exceptions objectAtIndex:0] raise];
	}
}
```

なので、`expectations`が変わるまで`NSRunLoop`を回すという`verify`の代替メソッドを用意すれば、  
`OCMock`らしく`[[foo shouldEventually] receive:@selector(bar)]`に相当するものが実装できます。

以下がその実装です。

```objectivec
@implementation OCMockObject (Lazy)

- (void)verifyLazily
{
    [self verifyLazilyWithTimeout:1.0];
}

- (void)verifyLazilyWithTimeout:(NSTimeInterval)timeout
{
    NSTimeInterval interval = 0.1;
    NSDate *startedDate = [NSDate date];
    BOOL shouldContinue = YES;
    
    while (shouldContinue) {
        @autoreleasepool {
            shouldContinue = [[NSDate date] timeIntervalSinceDate:startedDate] < timeout;
            if (!shouldContinue || [self->expectations count] == 0) {
                [self verify];
            }
            
            NSDate *date = [NSDate dateWithTimeIntervalSinceNow:interval];
            [[NSRunLoop currentRunLoop] runUntilDate:date];
        }
    }
}

@end
```

これを利用したテストケースは以下のように書くことができます。

```objectivec
- (void)testFooInvokesBarOnSomeMethod
{
    id fooMock = [OCMockObject mockForClass:[Foo class]];
    [[fooMock expect] bar];
    
    [testObject someMethod:fooMock];
    STAssertNoThrow([fooMock verifyLazily], @"foo did not invoke bar.");
}
```

--

勢い余ってやってみたという感じなのですが、もっと良い方法があれば知りたいです。
