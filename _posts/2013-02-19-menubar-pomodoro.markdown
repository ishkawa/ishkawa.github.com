---
layout: post
title: "ミニマルなPomodoroタイマーを書きました"
date: 2013-02-19 22:48
comments: true
categories: 
---

仕事に集中する方法は色々あると思いますが、その1つにPomodoroがあります。  

25分仕事をして5分休憩するというのを4セットやって、30分休むというものです。  
作業を何セットでできるか見積もってやるらしいのですが、方法自体に縛られたくなかったので、  
単純に集中とダラダラを区切る目的でやってみました。

始めるために210円でタイマーアプリを買ったのですが、自分に合わなかったのでつくりました。  
Mountain Lion以降で動作します。  

[PMDR.dmg](/images/2013-02-19/PMDR.dmg)

　

### 機能

以下のスクリーンショットの通り、Start, Stop, Quitしかありません。

![](/assets/2013-02-19/menu.png)

25分経つと以下のように通知センターに通知してくれます。

![](/assets/2013-02-19/notification.png)

その後5分経つとまた通知してくれ、また25分数え始めます。  
これがずっと続きます。

--

ソースはこちらにおいてあります。  
[https://github.com/ishkawa/PMDR](https://github.com/ishkawa/PMDR)
