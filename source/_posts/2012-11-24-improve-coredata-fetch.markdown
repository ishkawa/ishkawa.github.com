---
layout: post
title: "画像を含むCoreDataのフェッチ速度を改善する"
date: 2012-11-24 23:12
comments: true
categories: 
---

LRUなディスクキャッシュを実装する場合など、CoreDataに画像を突っ込みたくなることがあると思います。
しかし、画像をそのままattributesに突っ込むことはフェッチ速度の低下につながります。

何か上手い方法はないかな〜と思ってAppleのCoreDataプログラミングガイドを眺めていたら、ありました。
画像などのBLOBをCoreDataに突っ込む場合、BLOBであるattributeをエンティティから切り離すと良いそうです。
今回は、これについて検証したことを紹介します。

## 比較するデータ構造

### ISFatUser

attributesに画像が突っ込まれたエンティティです。
BLOBが入っているので"Fat"です。

{% img /images/2012-11-24/ISFatUser.png %}

### ISUser

画像を別のエンティティに切り分けたエンティティです。  
attributesに画像を持たない代わりに、画像を持つエンティティ(`ISIcon`)とrelationで結ばれています。

ISUser  
{% img /images/2012-11-24/ISUser.png %}

ISIcon  
{% img /images/2012-11-24/ISIcon.png %}


## 比較結果

以下の条件で比較しました。
読み込んだ画像は`UITableView`で表示します。

- データ件数: 200
- 画像サイズ: 約5〜10KB程度

### フェッチ速度

圧倒的に`ISUser`の方が速かったです。大きいサイズの画像を扱う場合、更に差が出ると思います。

- `ISFatUser`: 15ms
- `ISUser`: 1ms


### メモリ使用状況

メモリの使用傾向にも差がありました。

`ISFatUser`  
{% img /images/2012-11-24/ISFatUserAllocations.png %}

`ISUser`  
{% img /images/2012-11-24/ISUserAllocations.png %}

エンティティを切り分けた場合にはフォールティングが利くので、
`ISUser`ではスクロールごとに徐々に使用メモリが増えています。
一方、`ISFatUser`の場合にはフェッチ時に一気に使用メモリが最大まで増えます。

それと、このグラフでは見えないのですが、`ISFatUser`の場合にはフェッチ直後に一瞬最大メモリ使用量の2倍くらいのメモリを使用します。
おそらく、これは1度にすべての`UIImage`をインスタンス化しているせいだと思います。
大きい画像を扱う場合、シビアな環境ではメモリが足りなくなってしまうケースもあるかもしれません。

…

今回はBLOBをCoreData突っ込むときのことを紹介しましたが、
BLOBは本来ファイルシステム上に保存するものなので、利用すべきかどうかは慎重に判断してください。

