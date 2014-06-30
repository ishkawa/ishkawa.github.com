---
layout: post
title: "GHFeedで利用しているライブラリ一覧"
date: 2013-08-28 08:18
comments: true
categories: 
---

先日GHFeedというGitHubのフィードを読めるiOSアプリをリリースしました。  
今日はGHFeedの開発に利用したライブラリを紹介しようと思います。

#### NJKWebViewProgress

UIWebViewの読み込み状況を取得してくれるライブラリです。
作者は[@ninjinkun](https://twitter.com/ninjinkun)さんです。
このライブラリが出してくれる値は大体0.0, 0.1, 1.0なので、
GHFeedではこれらの値を補間するようなアニメーションを追加で実装しています。


#### KLSwitch

フラットデザインなUIButtonのライブラリです。  
UIAppearanceにも対応するなど、結構細かいところまで実装が行き届いていました。


#### TUSafariActivity

UIActivityViewControllerにOpen in Safariを追加するライブラリです。


#### SSKeychain

キーチェーンのwrapperです。


#### SVProgressHUD

ユーザーに待ってもらいたいときに表示するUIViewです。


#### ISHTTPOperation

NSURLConnectionをwrapしたNSOperationです。
実際には直接ISHTTPOperationを使うのではなく、JSONパースまで含んだサブクラスや、
画像のディスクキャッシュへの保存/読込を追加したサブクラスを利用しています。


#### ISDiskCache

ディスクキャッシュです。画像と通知APIのレスポンスのキャッシュに利用しています。


#### ISMemoryCache

メモリキャッシュです。画像のキャッシュにのみ利用しています。


#### ISRemoveNull

GitHub APIのレスポンスからNSNullを外すのに利用しています。

　

### テストのライブラリ

SenTestingKitを利用しています。

#### OHHTTPStubs

スタブサーバーです。通信を含む処理をテストできます。

#### OCMock

スタブ/モックを提供してくれるライブラリです。

#### OCMockObject+Lazy

OCMockのverifyを非同期のAPIに対しても実行できるようにする拡張です。
NSRunLoopを回しながらverifyを反復して実行するというアレ気味な実装になっているので、
もう少しマシなものを考えたいものです。

