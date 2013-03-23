---
layout: post
title: "通信用のNSOperationをモック化する"
date: 2013-03-23 18:37
comments: true
categories: 
---

最近書いているアプリでは、`ISHTTPOperation`という通信用の`NSOperation`を採用しています。  
使い方は`NSURLConnection`の`sendAsynchronousRequest:queue:completionHandler:`と大体同じです。

```objectivec
NSURL *URL = [NSURL URLWithString:@"http://date.jsontest.com"];
NSURLRequest *request = [NSURLRequest requestWithURL:URL];
[ISHTTPOperation sendRequest:request handler:^(NSHTTPURLResponse *response, id object, NSError *error) {
    if (error) {
        return;
    }
    // completion
}];
```

で、通信を含む処理のテストを書くとき、完了ハンドラの引数に任意の値を入れたかったりします。  
なので、`ISHTTPOperation`をモック化する`ISHTTPOperationMockifier`というのをつくりました。

[ISHTTPOperation](https://github.com/ishkawa/ISHTTPOperation)  
[ISHTTPOperationMockifier](https://github.com/ishkawa/ISHTTPOperationMockifier)

### 使い方

- `ISHTTPOperationMockifier`をつくる
- 完了ハンドラに入れたい値を`mockifier`にセットする
- `[mockifier mockify]`

```objectivec
- (void)testSuccessCase
{
    NSDictionary *dictionary =  @{@"hogeKey": @"hogeValue"};

    ISHTTPOperationMockifier *mockifier = [[ISHTTPOperationMockifier alloc] init];
    mockifier.statusCode = 200;
    mockifier.object = dictionary;
    mockifier.error = nil;
    [mockifier mockify];

    [ISHTTPOperation sendRequest:_request handler:^(NSHTTPURLResponse *response, id object, NSError *error) {
        STAssertEqualObjects([object objectForKey:@"hogeKey"], [dictionary objectForKey:@"hogeKey"], nil);
        [self endWaiting];
    }];

    [self beginWaiting];
}
```

### 仕組み

`mockify`の中身は以下のようになっていて、
```objectivec
- (void)mockify
{
    if (self.isMockified) {
        return;
    }
    
    Class class = [ISHTTPOperation class];
    objc_setAssociatedObject(class, ISHTTPOperationMockStatusCodeKey, @(self.statusCode), OBJC_ASSOCIATION_RETAIN);
    objc_setAssociatedObject(class, ISHTTPOperationMockObjectKey, self.object, OBJC_ASSOCIATION_RETAIN);
    objc_setAssociatedObject(class, ISHTTPOperationMockErrorKey, self.error, OBJC_ASSOCIATION_RETAIN);
    
    ISSwizzleInstanceMethod(class, @selector(main), @selector(_main));
    self.mockified = YES;
}
```

`ISHTTPOperation`の`main`が以下のものに差し替えられます。

```objectivec
- (void)_main
{
    dispatch_async(dispatch_get_main_queue(), ^{
        Class class = [ISHTTPOperation class];
        NSInteger statusCode = [objc_getAssociatedObject(class, ISHTTPOperationMockStatusCodeKey) integerValue];
        id object = objc_getAssociatedObject(class, ISHTTPOperationMockObjectKey);
        NSError *error = objc_getAssociatedObject(class, ISHTTPOperationMockErrorKey);
        
        NSHTTPURLResponse *response = [[NSHTTPURLResponse alloc] initWithURL:self.request.URL
                                                                  statusCode:statusCode
                                                                 HTTPVersion:@"1.1"
                                                                headerFields:nil];
        
        self.handler(response, object, error);
    });
    
    [self completeOperation];
}
```

通信をする部分を、予めセットした値を引数とするハンドラの実行にすり替えたわけです。  
このすり替えは、`ISHTTPOperationMockifier`が生存している間のみ有効です。


### 実際の例

ViewControllerに以下のような処理があったとします。

```objectivec
- (void)refresh
{
    NSURL *URL = [NSURL URLWithString:@"http://date.jsontest.com"];
    NSURLRequest *request = [NSURLRequest requestWithURL:URL];
    [ISHTTPOperation sendRequest:request handler:^(NSHTTPURLResponse *response, id object, NSError *error) {
        if (error || response.statusCode != 200) {
            return;
        }
        
        [self insertObjectsWithData:object];
    }];
}

- (void)insertObjectsWithData:(NSData *)data
{
    // NSManagedObjectをつくったりする
}
```

これに対して以下のようなテストを書くことができます。

```objectivec
- (void)testUpdateData
{
    NSData *data = [@"hoge" dataUsingEncoding:NSUTF8StringEncoding];

    ISHTTPOperationMockifier *mockifier = [[ISHTTPOperationMockifier alloc] init];
    mockifier.statusCode = 200;
    mockifier.object = data;
    mockifier.error = nil;
    [mockifier mockify];
    
    id mock = [OCMockObject partialmockiforObject:_viewController];
    [[mock expect] insertObjectsWithData:[OCMArg any]];
    
    [_viewController refresh];
    [[NSRunLoop currentRunLoop] runUntilDate:[NSDate dateWithTimeIntervalSinceNow:.1]];
    
    STAssertNoThrow([mock verify], nil);
}

- (void)testFailUpdatingData
{
    NSError *mockError = [NSError errorWithDomain:@"ISHTTPOperationDomain"
                                             code:-1234
                                         userInfo:nil];
    
    ISHTTPOperationMockifier *mockifier = [[ISHTTPOperationMockifier alloc] init];
    mockifier.statusCode = 0;
    mockifier.object = nil;
    mockifier.error = mockError;
    [mockifier mockify];
    
    id mock = [OCMockObject partialmockiforObject:_viewController];
    [[mock expect] insertObjectsWithData:[OCMArg any]];
    
    [_viewController refresh];
    [[NSRunLoop currentRunLoop] runUntilDate:[NSDate dateWithTimeIntervalSinceNow:.1]];
    
    STAssertThrows([mock verify], nil);
}
```

1個目は通信成功時に`insertObjectsWithData:`が呼ばれるテストで、  
2個めは通信失敗時に`insertObjectsWithData:`が呼ばれないテストです。

