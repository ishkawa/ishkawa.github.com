---
layout: post
title: "NSRunLoop+PerformBlockをCocoaPodsに登録"
date: 2014-05-28 02:18
comments: true
categories: 
---

<blockquote class="twitter-tweet" lang="ja"><p>NSRunLoop-PerformBlockをCocoapPodsに登録しろLINE株式会社</p>&mdash; laiso(レイソー) (@laiso) <a href="https://twitter.com/laiso/statuses/471286202810003459">2014, 5月 27</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

　

なぜかテスト関連のツールはマジカルな実装が多いのですが、自分は愚直にテストをしたいので愚直なライブラリを書きました。
書いたのは半年前だったのですが、需要があったのでCocoaPodsに登録しました。

ざっくり説明すると、以下のようなものです。

- 引数に渡したblockの実行中はNSRunLoopを回してテストケースが終了しないようする
- *finish = YESとするとblockから抜ける
- タイムアウトした場合は例外を投げてテストケースを失敗させる

[NSRunLoop+PerformBlock](https://github.com/ishkawa/NSRunLoop-PerformBlock)


```objectivec
- (void)testPerformBlockAndWait
{
    // 1
    __block BOOL flag = NO;

    [[NSRunLoop currentRunLoop] performBlockAndWait:^(BOOL *finish) {
        double delayInSeconds = 2.0;
        dispatch_time_t popTime = dispatch_time(DISPATCH_TIME_NOW, (int64_t)(delayInSeconds * NSEC_PER_SEC));
        dispatch_queue_t queue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0);
        dispatch_after(popTime, queue, ^(void){
            // 2
            flag = YES;
            *finish = YES;
        });
    }];

    // 3
    XCTAssertTrue(flag);
}
```
