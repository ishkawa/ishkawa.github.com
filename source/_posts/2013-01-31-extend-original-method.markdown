---
layout: post
title: "既存のメソッドの実装を残しつつ拡張する"
date: 2013-01-31 17:48
comments: true
categories: 
---

例えば、`UIViewController`の`viewDidLoad`を2つのカテゴリでmethod swizzlingしていた場合、
`viewDidLoad`の実装はあとにロードされたカテゴリのものとなります。
先にロードされたカテゴリの実装は、あとにロードされたカテゴリによって捨てられます。
元々あったUIKitによる実装ももちろん使われません。

両方残せるように、既存の実装に新しい実装をくっつける関数を書きました。  
元の実装を退避させて、新しいIMPの中で新旧両方のメソッドを呼ぶだけです。

```objectivec
#import <objc/runtime.h>

static void ISExtendImplementationWithSelector(Class class, SEL originalSelector, SEL selector)
{
    Method originalMethod = class_getInstanceMethod(class, originalSelector);
    
    NSString *replacedSignature = [@"original_" stringByAppendingString:NSStringFromSelector(originalSelector)];
    SEL replacedSelector = NSSelectorFromString(replacedSignature);
    class_addMethod(class, replacedSelector, method_getImplementation(originalMethod), method_getTypeEncoding(originalMethod));
    
    IMP extendedImplementation = imp_implementationWithBlock(^(id obj){
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Warc-performSelector-leaks"
        [obj performSelector:replacedSelector];
        [obj performSelector:selector];
#pragma clang diagnostic pop
    });
    method_setImplementation(originalMethod, extendedImplementation);
}
```

この関数に柔軟性はなく、戻り値が`void`で引数なしのメソッドのみ拡張することができます。  
`viewDidLoad`とかその辺のメソッドに使うのが目的だからです。

