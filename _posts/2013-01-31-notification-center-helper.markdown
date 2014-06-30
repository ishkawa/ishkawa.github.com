---
layout: post
title: "ISNotificationHelperというのを書いた"
date: 2013-01-31 21:13
comments: true
categories: 
---

Mountain LionからOSXにも通知センターが導入されました。  

スクリプトの実行完了時とかに通知したいと思って使い方を調べたのですが、
どうやらCommand Line ToolからはこのAPIを叩けないようでした。
なので、Cocoaアプリ(ISNotificationHelper)を常駐させて、Command Line Toolから
`NSDistributedNotification`を投げることにしました。

[ISNotificationHelper](https://github.com/ishkawa/ISNotificationHelper)

### 使い方

ISNotificationHelper.appを起動しておいて、`ISNotification`という名前の
`NSDistributedNotification`を投げると通知センターに表示されます。
`userInfo`に`title`, `subtitle`, `informativeText`を入れると表示内容を設定出来ます。

`isnotify`というツールも同梱していて、以下のコマンドで`NSDistributedNotification`を投げられます。
```
isnotify -t title -s subtitle -i informativeText
```

全体的に結構雑な作りになっているので、ちゃんと作ってやるぜって方は完成したらおしえてください。

