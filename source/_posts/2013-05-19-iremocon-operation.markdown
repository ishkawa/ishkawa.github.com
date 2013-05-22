---
layout: post
title: "NSStreamを利用してiRemoconと通信する"
date: 2013-05-19 03:59
comments: true
categories: 
---

以前、[Qiita Hackathon](http://blog.ishkawa.org/blog/2013/02/05/qiita-hackathon/)でiRemoconをいただきました。

iPhoneがあらゆるリモコンになるという画期的な製品なのですが、公式アプリは4インチ非対応な上に  
iPhoneとあまりマッチしないUIとなっているので、自分用に代用品をつくろうと思いました。

おそらく、そう考える人はたくさんいると思うので、通信の仕方を紹介します。

--

iRemoconにはTCP/IP通信でコマンドを送信することができます。  
TCP/IP通信を行う手段には`NSStream`を採用しました。  

### NSStreamのペアを作成する

`NSStream`自体は抽象クラスで、実際には`NSInputStream`と`NSOutputStream`のペアを利用します。  
`CFStreamCreatePairWithSocketToHost`を利用するとペアを作成してくれます。

```objectivec
CFReadStreamRef readStream = NULL;
CFWriteStreamRef writeStream = NULL;
CFStringRef hostNameRef = (__bridge CFStringRef)@"10.0.1.3";

CFStreamCreatePairWithSocketToHost(NULL,
                                   hostNameRef,
                                   51013,
                                   &readStream,
                                   &writeStream);

NSInputStream *inputStream = (__bridge_transfer NSInputStream *)readStream;
NSOutputStream *outputStream = (__bridge_transfer NSOutputStream *)writeStream;
```

### NSRunLoopにスケジュールする

`NSStream`を`NSRunLoop`にスケジュールするとデリゲートメソッドで通知を受け取ることができます。

```objectivec
NSRunLoop *runLoop = [NSRunLoop currentRunLoop];
NSString *mode = NSDefaultRunLoopMode;

inputStream.delegate = self;
[inputStream scheduleInRunLoop:runLoop forMode:mode];
[inputStream open];

outputStream.delegate = self;
[outputStream scheduleInRunLoop:runLoop forMode:mode];
[outputStream open];
```

`self`が何者かは特に指定していませんが、`NSStreamDelegate`に適合しているものとします。  
これらがメインスレッド以外のスレッドで実行される場合には`NSRunLoop`を回す必要があります。  
以下は非同期型の`NSOperation`での実装例です。

```objectivec
do {
    @autoreleasepool {
        [self.runLoop runUntilDate:[NSDate dateWithTimeIntervalSinceNow:.1]];
        if (self.isCancelled) {
            [self unscheduleStreams];
            [self completeOperation];
        }
    }
} while (self.isExecuting);
```

### NSStreamのイベントを受け取る

イベントに対して行う処理は以下の通りです。

- NSStreamEventHasSpaceAvailable: `NSOutputStream`にiRemoconのコマンドを書き込む
- NSStreamEventHasBytesAvailable: `NSInputStream`からレスポンスを読み込む

イベントは`NSStreamDelegate`の`stream:handleEvent:`で受け取ります。

```objectivec
- (void)stream:(NSStream *)stream handleEvent:(NSStreamEvent)eventCode
{
    switch(eventCode) {
        case NSStreamEventHasBytesAvailable:
            if (stream == self.inputStream) {
                [self readBuffer];
            }
            break;
            
        case NSStreamEventHasSpaceAvailable:
            if (stream == self.outputStream) {
                [self sendCommand];
            }
            break;
        
        ...
    }
}
```

### NSOutputStreamにコマンドを書き込む

コマンドの形式は[公式の技術資料](http://i-remocon.com/development/)にある通りで、通信確認を行うためには`*au\r\n`を送信します。  
送信後は`NSOutputStream`が要らなくなるので`NSRunLoop`から外します。

```objectivec
- (void)sendCommand
{
    NSString *command = @"*au\r\n";
    const uint8_t *ccommand = (const uint8_t *)[command UTF8String];
    
    [self.outputStream write:ccommand maxLength:strlen((const char *)ccommand)];
    [self.outputStream close];
    [self.outputStream removeFromRunLoop:self.runLoop forMode:self.mode];
}
```

### NSInputStreamからレスポンスを読み込む

結果が`ok\r\n`ならば通信成功です。  
レスポンスの末尾は`\r\n`なので、`\r\n`を受け取ったら`NSInputStream`も`NSRunLoop`から外します。

```objectivec
- (void)readBuffer
{
    uint8_t buffer[1024];
    unsigned int length = [self.inputStream read:buffer maxLength:1024];
    [self.data appendBytes:buffer length:length];
    
    NSString *joinedString = [[NSString alloc] initWithData:self.data encoding:NSUTF8StringEncoding];
    if ([joinedString rangeOfString:@"\r\n"].location != NSNotFound) {
        [self.inputStream close];
        [self.inputStream removeFromRunLoop:self.runLoop forMode:self.mode];
    }
}
```

--

以上で完了です。

これらの手順を非同期型の`NSOperation`にまとめてGitHubに上げました。  
[IRMCommandOperation](https://github.com/ishkawa/IRMCommandOperation)

`IRMCommandOperation`を利用すると、以下のようにしてコマンドを送信出来ます。

```objectivec
IRMCommandOperation *operation =
[[IRMCommandOperation alloc] initWithCommand:@"is"
                                    argument:@"1000"
                                     handler:^(NSData *data, NSError *error) {
                                         // completion
                                     }];
[operation start];
```

