---
layout: post
title: "NSDictionaryのリテラルのnilを無視する"
date: 2013-06-07 02:07
comments: true
categories: 
---

はじめに断っておきますが、今回のコードはプロダクトに入れるべきではありません。  
プログラムとして好ましくない上に、Appleの審査でリジェクトされる可能性もあります。

興味本位でやってみたら動いたので書いていますが、取り扱い注意です。

--

`NSDictionary`のリテラルを以下のように書くと、例外が投げられます。  
理由は`piyo`が`nil`だからです。

```objectivec
NSString *hoge = @"hoge";
NSString *fuga = @"fuga";
NSString *piyo = nil;
NSDictionary *dictionary = @{@"hoge": hoge,
                             @"fuga": fuga,
                             @"piyo": piyo, };
```

この例外は至極まっとうなもので適切にフォローすべきものなのですが、  
意識が低くなってくると自動的に以下のように変換されて欲しいと思ってしまうことがあります。

```objectivec
NSString *hoge = @"hoge";
NSString *fuga = @"fuga";
NSDictionary *dictionary = @{@"hoge": hoge,
                             @"fuga": fuga, };
```

これは以下のような`NSDictionary`のカテゴリを書くことで実現出来ます。

```objectivec
#import "NSDictionary+IgnoreNil.h"
#import <objc/runtime.h>

@implementation NSDictionary (IgnoreNil)

+ (void)load
{
    @autoreleasepool {
        Class class = NSClassFromString(@"__NSPlaceholderDictionary");
        Method originalMethod = class_getInstanceMethod(class, @selector(initWithObjects:forKeys:count:));
        Method alternativeMethod = class_getInstanceMethod(class, @selector(_initWithObjects:forKeys:count:));
        method_exchangeImplementations(originalMethod, alternativeMethod);
    }
}

- (id)_initWithObjects:(const id [])objects forKeys:(const id<NSCopying> [])keys count:(NSUInteger)count
{
    NSMutableArray *validObjectArray = [NSMutableArray array];
    NSMutableArray *validKeyArray = [NSMutableArray array];
    NSInteger validCount = 0;
    
    for (NSInteger index = 0; index < count; index++) {
        id object = objects[index];
        id key = keys[index];
        if (object && key) {
            [validObjectArray addObject:object];
            [validKeyArray addObject:key];
            validCount++;
        }
    }
    
    id *validObjects = malloc(sizeof(id) * validCount);
    id *validKeys = malloc(sizeof(id) * validCount);
    for (NSInteger index = 0; index < validCount; index++) {
        validObjects[index] = [validObjectArray objectAtIndex:index];
        validKeys[index] = [validKeyArray objectAtIndex:index];
    }
    
    self = [self _initWithObjects:validObjects forKeys:validKeys count:validCount];
    
    free(validObjects);
    free(validKeys);
    
    return self;
}

@end
```

やっていることは単純です。

`NSDictionary`のリテラルは`__NSPlaceholderDictionary`(`NSDictionary`クラスクラスタの一部)の  
`initWithObjects:keys:count:`を呼ぶので、それをswizzleしてnilでないもののみを元の実装に渡しています。

--

このコードをプロダクトに入れると同僚に殴られ、アプリもリジェクトされると思います。  
たぶん、`NSArray`のリテラルでやっても同じ事が起きます。


