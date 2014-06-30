---
layout: post
title: "Travis CIがXcode 5に対応してからのあれこれ"
date: 2013-11-28 20:34
comments: true
categories: 
---

Xcode 5のxcodebuildでテストを実行するには`xcodebuild test`を使うといいみたいです。
`man xcodebuild`のbuildactionの説明に以下のように書かれているので`-scheme SchemeName`が必要となります。
Travis CIなどの手元以外の環境でbuild schemeを利用する場合には、他の環境でも同じbuild schemeを使えるようにする必要があるので、
あらかじめXcodeのManage SchemeというメニューのShareというチェックボックスを有効しておく必要があります。

> This requires specifying a scheme and optionally a destination.

Xcode 4のときにはMakefileを以下のように書いていましたが

```
test:
    xcodebuild \
        -sdk iphonesimulator \
        -target ISFooTests \
        -configuration Debug \
        clean build \
        TEST_AFTER_BUILD=YES
```

`xcodebuild test`を使う形式に書き換えると

```
test:
    xcodebuild \
        -sdk iphonesimulator \
        -scheme ISFoo \
        -configuration Debug \
        clean build test
```

という感じになります。

Xcode 4では普通にテストを書いて適切にcpp-coverallsを実行すればコードカバレッジまで取得できたのですが、
Xcode 5では`*.gcda`が出力されなくなってしまったらしくてそのままではコードカバレッジを測れないようです。

<blockquote class="twitter-tweet" lang="ja"><p><a href="https://twitter.com/_ishkawa">@_ishkawa</a> iOS7だと.gcdaが出てこない問題?&#10;<a href="http://t.co/PCPIVz2BDU">http://t.co/PCPIVz2BDU</a>&#10;<a href="https://t.co/4ESNcybO8W">https://t.co/4ESNcybO8W</a></p>&mdash; azu (@azu_re) <a href="https://twitter.com/azu_re/statuses/405963463421218816">2013, 11月 28</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

詳しい話は[@azu_re](https://twitter.com/azu_re)さんのツイートのリンク先に書いてあって、
テスト完了後に`__gcov_flush()`というものを実行すると解決できるようなのですが、まだ試していません。

上手くいっている例があったら覗きに行きます。

