---
layout: post
title: "main queueのNSManagedObjectContextの話"
date: 2013-09-26 02:25
comments: true
categories: 
---

ふとTwitterで[@cockscomb](https://twitter.com/cockscomb/status/382914504637419520)さんと[@k_katsumi](https://twitter.com/k_katsumi)さんとCoreDataの話になって考えました。
これから書くことは正しさが曖昧なので、鵜呑みにしないように気をつけてください。
なお、マルチスレッドに関する話にはここでは触れません。

### 前提

CoreDataを使うときにNSManagedObjectContext, NSPersistentStoreCoordinator, NSManagedObjectModelを持つ、以下のようなsingletonを作ったことがあると思います。
こういう実装をすると確かに便利なんですが、共有されたNSManagedObjectContextが色んな所からアクセスされることになって、それをどうにかしたいなと思いました。

```objectivec
#import <Foundation/Foundation.h>
#import <CoreData/CoreData.h>

@interface CDECoreDataManager : NSObject

@property (readonly, strong, nonatomic) NSManagedObjectContext *managedObjectContext;
@property (readonly, strong, nonatomic) NSManagedObjectModel *managedObjectModel;
@property (readonly, strong, nonatomic) NSPersistentStoreCoordinator *persistentStoreCoordinator;

+ (instancetype)sharedManager;

@end
```

### 共有されたNSManagedObjectContextを避けたい理由

UIViewControllerは基本的に他のUIViewControllerから独立していて、1つの画面のことだけを考えて実装すればいいと思います。
共有されたNSManagedObjectContextを避けたい理由は、このような状況を壊してしまうからです。
singletonを介しているので当然といえばその通りなんですが、そのことに気がついたときには少し驚きました。

例を1つ挙げます。
NSFetchedResultsControllerのデリゲートメソッドにはcontrollerDidChangeContent:というものがあります。
このメソッドはNSFetchedResultsControllerがNSManagedObjectContextの変更を検知したときに呼ばれるものです。
つまり、NSManagedObjectContextが共有されている場合、どこか1箇所でNSManagedObjectContextに変更を与えると、
生存しているすべてのNSFetchedResultControllerについてこのデリゲートメソッドが呼ばれてしまうのです。
controllerDidChangeContent:の中身が全箇所で一斉に走っても問題ないことが多いとは思いますが、
全箇所で意図していなかった何かが一斉に走るということはできるだけ避けたいと自分は考えました。

再現するサンプルコードも用意しました。
Push next view controllerというボタンを何度か押してから、+ボタンを押してみてください。
すると、すべてのNSFetchedResultsControllerについてデリゲートメソッドが呼ばれます。

[サンプルコード](https://github.com/ishkawa/CoreDataExperiment)


### Appleが示す方法は？

CoreData snippetsというドキュメントの[Accessing the Core Data Stack](https://developer.apple.com/library/mac/documentation/DataManagement/Conceptual/CoreDataSnippets/Articles/stack.html#//apple_ref/doc/uid/TP40008283-SW2)によると、
CoreDataを利用するUIViewControllerにはNSManagedObjectContextのpropertyを用意して、既存のNSManagedObjectContextを渡す、
もしくは(そのUIViewControllerの編集が既存のものとは分離されている場合に)新たなNSManagedObjectContextつくりなさいとのことでした。
既存のものとして渡されるNSManagedObjectContextはApplication Delegateが作成して、最初のUIViewControllerに渡すべきだそうです。

つまり、Appleは共有されたNSManagedObjectContextを利用すべきと言うと同時に、編集が分離されている場合は新しいのNSManagedObjectContextもつくっていいとも言っています。
これらに加えて以下のようにも言っています。

- Application DelegateのようなグローバルなオブジェクトからNSManagedObjectContextを取得するべきではない
- 各UIViewController自身のためだけのNSManagedObjectContextをつくるべきではない

そうなると、どちらも行き過ぎてはよくないということなんでしょうか。何がよりよいのかわからなくなってきます。

### 実際みんなどうやってるの？

はじめに書いた方法のような感じで、main queueのNSManagedObjectContextは1つでやっているようです。
自分もこの方法でやっていましたが、先に紹介した理由もあってモヤモヤしています。

### UIViewController毎にNSManagedObjectContextをつくるべきではない理由は？

意見募集中です。Twitterやメールなどで教えていただけると幸いです。

