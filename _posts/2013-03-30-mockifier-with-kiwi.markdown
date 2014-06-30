---
layout: post
title: "ISHTTPOperationMockifierをKiwiで使う"
date: 2013-03-30 12:34
comments: true
categories: 
---

最近、OCUnit+OCMockからKiwiに乗り換えました。  

Kiwiを使えばあらゆる業から逃れられます。  
つまり、解脱です。

そんなKiwiで`ISHTTPOperationMockifier`を使ってみました。

### ISViewController.h

```objectivec
@interface ISViewController : UIViewController

- (void)refresh;
- (void)insertObjectsWithData:(NSData *)data;

@end
```

### ISViewController.m

```objectivec
@implementation ISViewController

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

@end
```

### ISViewControllerSpec.m


```objectivec
#import "Kiwi.h"
#import "ISViewController.h"

SPEC_BEGIN(ISViewControllerSpec)

describe(@"ISViewController", ^{
    __block ISViewController *viewController;
    
    beforeEach(^{
        viewController = [[ISViewController alloc] init];
    });
    
    context(@"when succeeded refreshing", ^{
        ISHTTPOperationMockifier *mockifier = [[ISHTTPOperationMockifier alloc] init];
        mockifier.statusCode = 200;
        mockifier.object = [@"data" dataUsingEncoding:NSUTF8StringEncoding];
        
        beforeEach(^{
            [mockifier mockify];
        });
        afterEach(^{
            [mockifier unmockify];
        });
        
        it(@"invokes insertObjectsWithData", ^{
            [[viewController shouldEventually] receive:@selector(insertObjectsWithData:)];
            [viewController refresh];
        });
    });
    
    context(@"when failed refreshing", ^{
        ISHTTPOperationMockifier *mockifier = [[ISHTTPOperationMockifier alloc] init];
        mockifier.error = [[NSError alloc] init];
        
        beforeEach(^{
            [mockifier mockify];
        });
        afterEach(^{
            [mockifier unmockify];
        });
        
        it(@"does not invoke insertObjectsWithData", ^{
            [[viewController shouldNot] receive:@selector(insertObjectsWithData:)];
            [viewController refresh];
            
            // wait a moment
            [[NSRunLoop currentRunLoop] runUntilDate:[NSDate dateWithTimeIntervalSinceNow:0.1]];
        });
    });
});

SPEC_END
```

