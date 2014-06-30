---
layout: post
title: "カスタマイズ可能なUIRefreshControlのインターフェースについて考えた"
date: 2013-06-01 01:14
comments: true
categories: 
---

インターフェースというのはプログラム上のものを指します。  

iphone_dev_jpの勉強会で、独自の`UIRefreshControl`を実装するにはどうすればよいか、  
という質問をいただきましたので、しばらく考えていました。  

`UIRefreshControl`のメソッド群はよく隠蔽化されていて、カスタマイズすることは難しいです。  
なので、独自のものをつくるには`UIControl`からスタートすることになると思います。  
どんなインターフェースがあれば`UIRefershControl`はカスタマイズ可能だったのかと考えつつ、  
独自の`UIRefreshControl`を実装するための抽象的なクラスを実装しました。

[ISAlternativeRefreshControl](https://github.com/ishkawa/ISAlternativeRefreshControl)

--

### 抽象クラスが持つ値

- `progress`: `UIControlEventValueChanged`を発火させるまでの引っ張り具合(0.0〜1.0)
- `refreshingState`: 更新前/更新中/更新後の状態
- `firesOnRelease`: 閾値を超えたらすぐ発火するか、閾値を超えた状態で指を離してから発火するか

### `progress`の変更を通知するメソッド

- `willChangeProgress:`
- `didChangeProgress`

これらのタイミングで、`progress`に応じて`UIRefreshControl`を変形させます。  
公式の`UIRefreshControl`であれば`progress`に応じて伸び具合を変え、  
従来型の矢印の"引っぱって更新"であれば`progress`に応じて角度を変えます。

### `refreshingState`の変更を通知するメソッド

- `willChangeProgress:`
- `didChangeProgress`

これらのタイミングで、状態に応じたアニメーションを開始したりします。  
公式の`UIRefreshControl`であればガムを収縮させて`UIActivityIndicator`を拡大させ、  
従来型の矢印の"引っぱって更新"であれば矢印を消して`UIActivityIndicator`を表示します。

--

このようなインターフェースがあれば、上記のメソッドをオーバーライドすることで、  
独自の動きを表現する実装が可能となるはずです。  
実際、従来型の"引っぱって更新"や公式の`UIRefreshControl`はこれらの枠組みで再現できました。

興味が有る方はリポジトリにデモアプリが入っているので見てみてください。

