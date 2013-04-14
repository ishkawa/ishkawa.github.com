---
layout: post
title: "iOSのライブラリにTravis CIを導入する"
date: 2013-04-14 18:37
comments: true
categories: 
---

最近、Travis CIがiOSのビルドに対応したようです。  
[Introducing Mac, iOS and RubyMotion Testing on Travis CI](http://about.travis-ci.org/blog/introducing-mac-ios-rubymotion-testing/)

なので、早速拙作のISRefreshControlに導入してみました。  
[ISRefreshControl](https://github.com/ishkawa/ISRefreshControl)  

[![Build Status](https://travis-ci.org/ishkawa/ISRefreshControl.png?branch=develop)](https://travis-ci.org/ishkawa/ISRefreshControl)

## 導入手順

驚くほど簡単で、基本的には以下の2つだけで導入完了となります。

- `.travis.yml`に`language: objective-c`と書く
- Travis CI上でリポジトリを選択する

デフォルトのビルド設定には[objc-build-scripts](https://github.com/jspahrsummers/objc-build-scripts)が採用されているようです。  
もちろんカスタマイズも可能で、ISRefreshControlではMakefileを書いてそちらを使っています。

依存関係はPodfileを書いておけば自動的に解決されます。  
CocoaPods以外の方法も`.travis.yml`にスクリプトを書けば利用できるようです。

詳細は公式ドキュメントを参照してください。  
[Travis CI: Building an Objective-C Project](http://about.travis-ci.org/docs/user/languages/objective-c/)

### Podfileを書く

依存がある場合は書きます。  
ISRefreshControlはISMethodSwizzlingとKiwiを利用しています。

```
pod 'ISMethodSwizzling', :git => 'https://github.com/ishkawa/ISMethodSwizzling.git'

target :ISRefreshControlTests, :exclusive => true do
    pod 'Kiwi', '~> 2.0.6'
end
```

### Makefileを書く

"`xcodebuild`でビルドしてテストを実行してね"って書きます。  
`GCC_PREPROCESSOR_DEFINITIONS`は`ISRefreshControl`固有のものです。

```
test:
	xcodebuild \
		-sdk iphonesimulator \
		-workspace ISRefreshControl.xcworkspace \
		-scheme ISRefreshControlTests \
		-configuration Debug \
		clean build \
		ONLY_ACTIVE_ARCH=NO \
		TEST_AFTER_BUILD=YES \
		GCC_PREPROCESSOR_DEFINITIONS="IS_TEST_FROM_COMMAND_LINE=1"
```

### .travis.ymlを書く

`script:`にmakeを利用するように書きます。  
`script:`を書かなければobjc-build-scriptsが利用されます。

```
language: objective-c
script: "make test"
```

### リポジトリを選択する

Travis CIにGitHubアカウントでログインし、リポジトリのスイッチをオンにします。  
すると、コミットフックがTravis CIに飛んでいき、自動的にビルドされるようになります。

--

ビルドログを見る限り、Kiwiのテストも実行されているようです。
```
Test Suite 'ISRefreshControlSpec' finished at 2013-04-14 07:57:09 +0000.
Executed 25 tests, with 0 failures (0 unexpected) in 0.318 (0.327) seconds
```

以下のようなStatus Imageというよくあるやつも提供されています。

[![Build Status](https://travis-ci.org/ishkawa/ISRefreshControl.png?branch=develop)](https://travis-ci.org/ishkawa/ISRefreshControl)

