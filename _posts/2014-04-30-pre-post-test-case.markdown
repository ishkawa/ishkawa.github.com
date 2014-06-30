---
layout: post
title: "すべてのテストケースの前後にあれこれする"
date: 2014-04-30 13:25
comments: true
categories: 
---

iOSのアプリケーションテストを書いていると、各テストケースの前後に永続ストアやスタブサーバーなどをリセットしたくなることがあると思います。
リセットが必要なテストスイートのsetUp/tearDownに書いても良いのですが、書くのが面倒だったり書き忘れてしまうこともあるので、
すべてのテストケースについてリセットが走るようにしておいた方が心を穏やかにすることができると思います。

### 実現方法

すぐに思いついたのは以下のような方法です。

- setUp/tearDownにリセット処理を加えたサブクラスを継承させる
- XCTestCaseのsetUp/tearDownをswizzleする

サブクラスを継承させる方法には、KIFTestCaseなど他のライブラリのクラスには適用ができないという問題があります。
method swizzlingを利用する方法は、他のmethod swizzlingと衝突する可能性があるのでなるべく避けたいものです。

そこで、着目したのがXCTestObserverです。
XCTestObserverは以下のようなイベントが発生したときに対応したメソッドを実行します。

- テストの開始/終了
- テストスイートの開始/終了
- テストケースの開始/終了

これらのイベントを受け取るには予めNSUserDefaultsのXCTestObserverClassKeyというキーにクラス名を設定しておく必要があります。
具体的には、以下のようなクラスを作成します。

```objectivec
@implementation ISTestObserver

+ (void)load
{
    @autoreleasepool {
        NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
        [defaults setObject:@"XCTestLog,ISTestObserver" forKey:XCTestObserverClassKey];
        [defaults synchronize];
    }
}

- (void)testCaseDidStart:(XCTestRun *)testRun
{
    // reset
}

- (void)testCaseDidStop:(XCTestRun *)testRun
{
    // reset
}

@end
```

### リセット処理の例

自分が利用している例を紹介します。

#### NSUserDefaultsのリセット

```
- (void)removeStandardUserDefaultsPersistentDomain
{
    NSString *bundleIndetifier = [NSBundle mainBundle].bundleIdentifier;
    NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
    [userDefaults removePersistentDomainForName:bundleIndetifier];
}
```


#### NSHTTPCookieStorageのリセット

```objectivec
- (void)removeAllCookies
{
    NSHTTPCookieStorage *cookieStrage = [NSHTTPCookieStorage sharedHTTPCookieStorage];
	for (id cookie in [cookieStrage cookies]) {
		[cookieStrage deleteCookie:cookie];
	}
}
```


#### OHHTTPStubsのリセットと汎用スタブ

汎用スタブはテスト実行中に誤って外のURLを読みに行かないようにするためにtestCaseDidStart:で用意しています。
testCaseDidStart:はsetUpよりも先に実行されるので、setUpで他のスタブを追加した場合にはそちらが優先されます。

```objectivec
- (void)stubGeneralRequest
{
    [OHHTTPStubs stubRequestsPassingTest:^BOOL(NSURLRequest *request) {
        return YES;
    } withStubResponse:^OHHTTPStubsResponse *(NSURLRequest *request) {
        NSData *data = [@"Dummy" dataUsingEncoding:NSUTF8StringEncoding];
        return [OHHTTPStubsResponse responseWithData:data
                                          statusCode:200
                                             headers:nil];
    }];
}
```

```objectivec
- (void)removeAllStubs
{
    [OHHTTPStubs removeAllStubs];
}
```

OHHTTPStubsの優先順位についてはREADMEに次のように書かれています。

> When a network request is performed by the system, the stubs are called in the reverse order that they have been added, the last added stub having priority over the first added ones. The first stub that returns YES for the first parameter of stubRequestsPassingTest:withStubResponse: is then used to reply to the request.


#### CoreDataの永続ストアの削除

[ISPersistentStack](https://github.com/ishkawa/ISPersistentStack)を利用しています。
deleteCurrentStoreの実装については[ソース](https://github.com/ishkawa/ISPersistentStack/blob/master/ISPersistentStack/ISPersistentStack.m)を参照してください。

```objectivec
- (void)dropDatabase
{
    [[ISPersistentStack sharedStack] deleteCurrentStore];
}
```


