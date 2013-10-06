---
layout: post
title: "複数のiOSバージョンでのテストを自動的に実行する"
date: 2013-10-06 21:47
comments: true
categories: 
---

Xcode 5になって`xcodebuild`コマンドも進化したらしいのですが、あまり変更を追えていませんでした。
今日、ぼんやりと`man xcodebuild`を眺めていたら`-destination`というオプションをみつけました。
これを使えば任意のiOSバージョンでテストを走らせられるなと思ってやってみました。

はじめはXCTestで実行したかったのですが、`iPhoneSimulator6.0.sdk`や`iPhoneSimulator5.0.sdk`には
`xctest`という実行ファイルが含まれていないため、以下のようなコマンドでテストを実行することができませんでした。
(OS=7.0だと実行できます。)

```sh
xcodebuild test -scheme Example -destination "name=iPhone,OS=6.0"
```

OCUnitを実行する`ounit`という実行ファイルは`iPhoneSimulator6.0.sdk`や`iPhoneSimulator5.0.sdk`にも含まれているので、
仕方がなくOCUnitでセットアップしなおしました。
すると、同じコマンドでiOS 6のシミュレーターでのテストを実行できるようになりました。

ここまでできれば、あとは複数のdestinationに対して自動的に実行できるようにするだけです。
以下のようなRakefileを書いておくと`DESTINATIONS`に並べたすべてのdestinationでのテストが、
`rake`で実行できるようになります。

```ruby
SCHEME = "Example"
DESTINATIONS = ["name=iPhone,OS=5.0",
                "name=iPhone,OS=6.0",
                "name=iPhone Retina (3.5-inch),OS=5.0",
                "name=iPhone Retina (3.5-inch),OS=6.0",
                "name=iPhone Retina (3.5-inch),OS=7.0",
                "name=iPhone Retina (4-inch),OS=6.0",
                "name=iPhone Retina (4-inch),OS=7.0",
                "name=iPhone Retina (4-inch 64-bit),OS=7.0", ]

task :default => [:clean, :test]
 
desc "clean"
task :clean do
  sh "xcodebuild clean"
end
 
desc "run unit tests"
task :test do
  DESTINATIONS.each do |destination|
    sh "xcodebuild test -scheme #{SCHEME} -destination \"#{destination}\""
  end
end
```

サンプルのプロジェクトはGitHubに置いてあります。  
[ishkawa/RunTestsForAllDestinationsExample](https://github.com/ishkawa/RunTestsForAllDestinationsExample)

Travis CIがXcode 5に対応するのが楽しみになりました。

