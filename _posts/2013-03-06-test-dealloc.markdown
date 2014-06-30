---
layout: post
title: "ARC環境でdeallocされるかテストする"
date: 2013-03-06 02:37
comments: true
categories: 
---

ARCを導入するとメモリ管理がいい加減になりがちですが、  
Blocksの循環参照など、メモリ管理の落とし穴は依然として多いです。  
なので、テストを書く方法を考えました。

### 書き方

- `dealloc`されるか確認したいオブジェクトと同じ型の`__weak`な変数を宣言する。
- `@autoreleasepool`をつくり、その中で確認したいオブジェクトを作る。
- つくったオブジェクトを`__weak`な変数に入れる。
- `@autoreleasepool`を閉じたあと、`__weak`な変数に対して`STAssertNil`する。

確認したいオブジェクトの暗黙的な`__strong`は`@autoreleasepool`に収まるので、  
`@autoreleasepool`外ではそのオブジェクトは`dealloc`されているはず、というわけです。


### 例

最近、`NSURLConnection`をラップする`NSOperation`を改めて書いているので、それを例にします。  
非同期のテストの書き方は[@grassonion1 さんの方法](http://d.hatena.ne.jp/glass-_-onion/20120702/1341241666)に準じるものにしています。

```objectivec
- (void)testDeallocOnCancelBeforeStart
{
    __weak ISHTTPOperation *woperation;
    
    @autoreleasepool {
        NSURL *URL = [NSURL URLWithString:ISTestURL];
        NSURLRequest *request = [NSURLRequest requestWithURL:URL];
        ISHTTPOperation *operation = [[ISHTTPOperation alloc] initWithRequest:request handler:nil];
        woperation = operation;
        [operation cancel];
        [NSThread sleepForTimeInterval:.1];
    }
    
    STAssertNil(woperation, nil);
    self.isFinished = YES;
}
```

これで、`cancel`された`NSOperation`がちゃんと`dealloc`されるか確認できます。  
(もちろん、`testDeallocOnCancelAfterStart`も書いてあります。)

　

リポジトリはこちらです。  
[ISHTTPOperation](https://github.com/ishkawa/ISHTTPOperation)
