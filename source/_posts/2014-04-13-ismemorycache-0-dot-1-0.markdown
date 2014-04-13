---
layout: post
title: "ISMemoryCache 0.1.0"
date: 2014-04-13 20:56
comments: true
categories: 
---

[世の中にはたくさんキャッシュの実装があり](http://cocoapods.org/?q=cache)、
[自前の実装は捨てろ](https://speakerdeck.com/ninjinkun/sdwebimagewo1nian-ban-shi-tutemita)なんて言われたりするのですが、
それでも自分の思い通りのキャッシュ機構を作りたくなるものだと思います。
自分はlimitに達したときにすべてのオブジェクトを削除するようなメモリキャッシュではなく、
他からの参照がないオブジェクトを選択して削除するようなメモリキャッシュが欲しかったのでISMemoryCacheを実装しました。
最近、ISMemoryCacheを更新して0.1.0を出したので、その機能を紹介します。

- アプリがバックグラウンドに入ったときに他からの参照がないオブジェクトを削除
- メモリ警告が出たときにすべてのオブジェクトを削除

ディスクキャッシュについてはISDiskCacheというのもあるので、そちらをどうぞ。

- [ISMemoryCache](https://github.com/ishkawa/ISMemoryCache)
- [ISDiskCache](https://github.com/ishkawa/ISDiskCache)

