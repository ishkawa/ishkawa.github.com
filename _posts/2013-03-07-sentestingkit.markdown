---
layout: post
title: "GHUnitをやめてSenTestingKitを使う理由"
date: 2013-03-07 21:38
comments: true
categories: 
---

※ はじめにことわっておきますが、GHUnitを批判したくて書いているわけではなく、  
SenTestingKitが意外と使えたということを書きたくて書いています。

--

- 特定のテストがターミナルから実行できないという問題に遭遇した。
- GHUnitは新しいXcodeやiOS SDKが出たときに対応されるまでにラグがある。
- やっぱりcommand+Uでマメにテストを実行したい。
- SenTestingKitではできないと思い込んでいたことが実はできた。

以下、誤解していたことについて書きます。  

### SenTestingKitへの誤解

- 実機ではテストを実行できない。
- UIKitが絡むテストは書けない。
- 非同期のテストが書きづらい。

#### 実機での実行

SenTestingKitで実行できるテストにはLogic Unit TestsとApplication Unit Testsがあります。  
前者は実機での実行はできないのですが、後者はできます。  
具体的なセットアップ手順は[Xcode Unit Testing Guide](https://developer.apple.com/library/ios/#documentation/DeveloperTools/Conceptual/UnitTesting/02-Setting_Up_Unit_Tests_in_a_Project/setting_up.html#//apple_ref/doc/uid/TP40002143-CH3-SW1)を参照してください。

#### 非同期のテスト

[@glassonion1 さんの方法](http://d.hatena.ne.jp/glass-_-onion/20120702/1341241666)で書くことができます。  
自分は`tearDown`で`NSRunLoop`を回す前に`dispatch_after`でタイムアウトを設定しています。

```objectivec
- (void)tearDown
{
    double delayInSeconds = self.timeoutInterval;
    dispatch_time_t popTime = dispatch_time(DISPATCH_TIME_NOW, (int64_t)(delayInSeconds * NSEC_PER_SEC));
    dispatch_after(popTime, dispatch_get_main_queue(), ^(void){
        STFail(@"timed out.");
        self.finished = YES;
    });
    
    do {
        [[NSRunLoop currentRunLoop] runUntilDate:[NSDate dateWithTimeIntervalSinceNow:.1]];
    } while (!self.isFinished);
    
    [super tearDown];
}
```

非同期の処理ををまとめて`SenAsyncTestCase`というクラスにしておけば、  
追加で必要なことはテストケースの終了時に`self.finished = YES`を書くことだけです。

```objectivec
- (void)testHoge
{
    NSURL *URL = [NSURL URLWithString:@"http://www.apple.com"];
    NSURLRequest *reqeust = [NSURLRequest requestWithURL:URL];
    [NSURLConnection sendAsynchronousRequest:reqeust
                                       queue:[NSOperationQueue mainQueue]
                           completionHandler:^(NSURLResponse *response, NSData *data, NSError *error) {
                               NSInteger statusCode = [(NSHTTPURLResponse *)response statusCode];
                               STAssertEquals(statusCode, 200, nil);
                               STAssertNil(error, nil);
                               
                               self.finished = YES;
                           }];
}
```

`SenAsyncTestCase`の例は以下にアップしてあります。  
[SenAsyncTestCase](https://github.com/ishkawa/SenAsyncTestCase)


