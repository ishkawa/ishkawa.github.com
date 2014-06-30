---
layout: post
title: "ISHTTPOperation 1.1.0をリリースした"
date: 2013-08-07 11:02
comments: true
categories: 
---

朝6時に目が覚めたら意識が高かったので、ISHTTPOperationに欲しかった機能をつけてリリースしました。  
[ISHTTPOperation](https://github.com/ishkawa/ISHTTPOperation)

　

ISHTTPOperationは特徴のあるライブラリではなくて、単純に非同期のNSURLConnectionをラップするNSOperationです。
こういったライブラリはたくさんあって、いわゆる車輪の再発明なのですが、わざわざ自分で作っているのには理由があります。
理由の1つは多くの通信ライブラリは機能が多すぎるため、大量の不要なコードをプロジェクトに導入することになってしまうからです。
もう1つはNSURLConnectionをNSOperationで正しくラップするときにはミスしやすい箇所が多いので、
シンプルなライブラリであってもキャンセルなどの目立ちにくい動作に不具合を出しやすいからです。

### かわったところ

- テストにスタブサーバーを利用する
- Travis CIとCoverallsを利用して品質(?)を表示
- NSPredicateを利用してキャンセル

元々、3つ目のキャンセル機構をつけたかったのですが、
最近は[iOSのライブラリだってTravis CIとかCoverallsとか使うべき](http://www.tokoro.me/2013/07/09/objc-travis-coveralls/)という話だったので、
その辺りにも手を入れてみたらテストがださかったのでテストも直したという感じです。
それと、せっかくここまでやったんだからと思ってCocoaPodsにもpull requestを送っておきました。

NSPredicateでキャンセルというのは以下のような感じです。

```objectivec
NSPredicate *predicate = [NSPredicate predicateWithFormat:@"request.HTTPMethod MATCHES %@", @"GET"];
[[ISHTTPOperationQueue defaultQueue] cancelOperationsUsingPredicate:predicate];
```

よく使いそうなやつには以下のようなショートカットも用意しました。

```objectivec
[[ISHTTPOperationQueue defaultQueue] cancelOperationsWithHTTPMethod:@"GET"];
```

