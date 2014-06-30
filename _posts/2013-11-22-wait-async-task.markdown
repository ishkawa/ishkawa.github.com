---
layout: post
title: "単体テストの実行時に非同期処理を待つ"
date: 2013-11-22 00:23
comments: true
categories: 
---

SenTestingKit/XCTestは非同期処理を待たずにテストケースを終了してしまうので、
直接SenTestingKit/XCTestを利用する場合には自分でNSRunLoopを回して処理の完了を待つ必要があります。
これまでSenTestCaseにfinishedフラグが追加されたサブクラスを使ったりしていたのですが、
どうしてもテストコードが明示的にならなくて悩んでいました。

いままで書いていたテストコードは以下のような感じです。

```objectivec
- (void)testExample
{
    // step 1

    dispatch_queue_t queue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0);
    dispatch_async(queue, ^(void){
        // step 3
        [self stopWaiting];
    });

    // step 2
    [self startWaiting];
    // step 4
}
```

これではどのようにして待っているのかあまり想像がつきませんし、順序をひと目で理解することも難しいです。
そこで、昨日新しい方法を考えました。
以下のように書くと、実行順序も上から順番通りになりますし、何をしているのか明示的になったと思います。

```objectivec
- (void)testPerformBlockAndWait
{
    // step 1

    [[NSRunLoop currentRunLoop] performBlockAndWait:^(BOOL *finish) {
        dispatch_queue_t queue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0);
        dispatch_async(queue, ^(void){
            // step 2
            *finish = YES;
        });
    }];

    // step 3
}
```

NSRunLoopのperformBlockAndWait:は新しく拡張したメソッドで、名前からわかる通りNSManagedObjectContextの
performBlockAndWait:を使っているときに思いつきました。
BOOL *を渡すアイディアはNSArrayのenumerateObjectsUsingBlock:を真似しました。

このコードを使えるようにするためのNSRunLoopのカテゴリはまとめて以下のリポジトリに置いてあります。
興味がある人は是非使ってみてください。
もっといいアイディアがあるという人は是非教えて下さい。

[NSRunLoop-PerformBlock](https://github.com/ishkawa/NSRunLoop-PerformBlock)

