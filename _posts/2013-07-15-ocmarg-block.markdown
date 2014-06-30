---
layout: post
title: "OCMArgをBlocksとして渡すときに困ること"
date: 2013-07-15 01:42
comments: true
categories: 
---

iOSの標準フレームワークでは至るところにBlocksが登場します。
引数として渡されるBlocks自体に制限を設けたテストを書くことはあまりないので
`[OCMArg any]`を指定しようと考えるのですが、Blocksは内部的にcopyして扱われることが多いらしく、
以下のようなテストを書くとOCMConstraintをcopyしようとしたところで例外が発生します。
OCMConstraintがNSCopyingに適合していないので当然のことですが、ちょっと困ります。

```objectivec
- (void)testSomeMethod
{
    id mock = [OCMockObject partialMockForObject:viewController];
    [[mock expect] dismissViewControllerAnimated:NO completion:[OCMArg any]];

    // 何かする

    STAssertNoThrow([mock verify], @"did not dismiss.");
}
```

めんどくさいので自分は以下のようなコードをOCMConstraintのカテゴリに書いて問題を回避しました。

```objectivec
- (id)copyWithZone:(NSZone *)zone
{
    return self;
}
```

テストコードとは言えどもこういった雑なことばっかりしてるといつか痛い目に遭いそうだと思ったので、
より良い方法があれば聞きたいところです。

### 追記

OCMock 2.2では同様の実装がされていると、[@azu_re](https://twitter.com/azu_re/)さんに教えていただきました。  
2.2以降を利用すれば上記のメソッドを実装しなくてもcopyの問題は起こりません。

<blockquote class="twitter-tweet"><p><a href="https://twitter.com/_ishkawa">@_ishkawa</a> OCMock 2.2だとcopyWithZone: 実装されてるように見えるけど、これとは別? <a href="https://t.co/lDzgB5tMSb">https://t.co/lDzgB5tMSb</a> <a href="https://t.co/w11Yr14Um9">https://t.co/w11Yr14Um9</a></p>&mdash; azu (@azu_re) <a href="https://twitter.com/azu_re/statuses/356620135156551681">July 15, 2013</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>


