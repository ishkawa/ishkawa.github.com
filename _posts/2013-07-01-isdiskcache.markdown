---
layout: post
title: "ISDiskCacheというのを書いた"
date: 2013-07-01 03:41
comments: true
categories: 
---

2ヶ月ほど前に[ISMemoryCacheというのを書いた](http://blog.ishkawa.org/blog/2013/04/24/ismemorycache/)のですが、
実はこれと並行してISDiskCacheというのもつくっていました。
しかし、良いアイディアが浮かばなくて完成度が十分に上がらず、リリースできないまま放置していました。
先週末にちょうど[Put Objective-C Back On the Map](https://objectivechackathon.appspot.com)というWeb上のイベントがあったので、
それに参加することをモチベーションにISDiskCacheの実装に再挑戦しました。

[ISDiskCache](https://github.com/ishkawa/ISDiskCache)

### 特徴

- 合計のファイルサイズの上限を持ち、上限を超えたら古いファイルを自動的に削除(LRU)。
- NSCodingに適合するオブジェクトをキー/値に設定できる。
- NSDateを指定してアクセス日時が古いファイルを削除できる。

類似のライブラリにはtumblrがつくっている[TMCache](https://github.com/tumblr/TMCache)があります。
TMCacheとISMemoryCache/ISDiskCacheの違いは説明するが大変なので、お互いにないものを挙げていきます。

- 実績がある: TMCache
- メモリキャッシュ/ディスクキャッシュを意識せずに使える: TMCache
- 参照がある限りキャッシュをクリアしない: ISMemoryCache/ISDiskCache
- NSString以外をキーにできる: ISMemoryCache/ISDiskCache

メモリキャッシュ/ディスクキャッシュを意識させないつくりが必要かどうかは少し疑問に思いました。
確かに同じAPIで利用できるのは手軽で便利なのですが、メモリキャッシュはメインスレッドでも同期的に扱うことができるのに、
メモリキャッシュかディスクキャッシュかわからなくなってしまうと非同期的に処理するしかなくなってしまいます。

自分は同期的にかける箇所は同期的に書きたかったので、メモリキャッシュとディスクキャッシュを分けることにしました。
キャッシュを分けると利用側のコードが増えてしまうのですが、ディスクキャッシュへのアクセスとサーバーとの通信を1つのNSOperationにまとめてしまえば、
以下のように同期的な処理と非同期的な処理の2通りを書けば済んでしまいます。

```objectivec
UIImage *cachedImage = [[ISMemoryCache sharedCache] objectForKey:URL];
if (cachedImage) {
    imageView.image = cachedImage;
} else {
    imageView.image = [UIImage imageNamed:@"placeholder"];
    [ISImageLoaderOperation loadURL:URL handler:^(UIImage *image) {
        imageView.image = image;
    }];
}
```


