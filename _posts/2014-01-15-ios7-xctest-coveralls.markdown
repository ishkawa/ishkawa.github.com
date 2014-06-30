---
layout: post
title: "XCTest + iOS 7でCoverallsを利用する"
date: 2014-01-15 23:14
comments: true
categories: 
---

XCTest + iOS7でテストを実行しても上手くコードカバレッジが取得できずに困っていたのですが、
最近[@tokorom](https://twitter.com/tokorom)さんが取得できる方法を紹介していたので、
そちらを参考にして対応してみました。資料は以下のものです。

[My unit test environment for Objective-C](https://speakerdeck.com/tokorom/my-unit-test-environment-for-objective-c)

Coverallsに対応したライブラリは以下のものです。

- [ISHTTPOperation](http://github.com/ishkawa/ISHTTPOperation)
- [ISDiskCache](http://github.com/ishkawa/ISDiskCache)
- [ISMemoryCache](http://github.com/ishkawa/ISMemoryCache)
- [NSRunLoop+PerformBlock](http://github.com/ishkawa/NSRunLoop-PerformBlock)

対応の肝となるのは[ISGcovFlusher](http://github.com/ishkawa/ISGcovFlusher)をテストターゲットに追加しておくことです。
これを追加することでテスト終了時に`__gcov_flush()`を自動的に呼んでくれて`*.gcda`が出力されるようになります。
なお、`__gcov_flush()`を呼び出すにはBuild Settingsの"Instrument Program Flow"と"Generate Test Coverage Files"をYESにする必要があるようです。

その他の詳しいことは各リポジトリの以下のファイルを参照してください。

- Podfile
- Makefile
- .travis.yml

