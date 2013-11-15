---
layout: post
title: "#potatotips で隅々までタップできるUINavigationBarの話をしました"
date: 2013-11-15 01:22
comments: true
categories: 
---

potatotipsというのはクックパッドさんが開催しているiOS/Android開発者のtips共有会です。
普段は社内のメンバーで定期的に行っているそうなんですが、今回は社外の開発者も含めて開催でした。
持ち時間は1人あたり5分と短かったので、すぐに活用できそうなtipsが多かったように思います。

### 話したこと

iOS 7になってからUINavigationBarのcustomViewが中央寄りになってしまい、
バーの両サイドに配置されたカスタムボタンが押しにくいという問題が起きました。
これだけを理由にUINavigationBarを使うのを辞めるのはもったいないので、
customViewのフレームに影響されずに隅々までタップできるUINavigationBarを実現する方法を考えました。

実装のアイディアは結構単純で、customViewのフレーム外であってもタッチイベントの位置にsubviewがあれば、
タッチイベントを貫通させるというものです。イメージがつきにくい話だとは思うのですが、
たぶん同じような問題に直面した人には通じる話だと思います。

　

<script async class="speakerdeck-embed" data-id="9d882ad02e7e0131dc8166d07d2effc2" data-ratio="1.33333333333333" src="//speakerdeck.com/assets/embed.js"></script>

一応このtipsをライブラリにまとめたので、何を言ってるのかサッパリわからなかった人も、
以下のライブラリを入れればとにかくUINavigationBarが隅々までタップできるようになります。

[ISInteractiveEdgesNavigationBar](https://github.com/ishkawa/ISInteractiveEdgesNavigationBar)

```objectivec
Class navigationBarClass = [ISInteractiveEdgesNavigationBar class];
Class toolbarClass = [UIToolbar class];

UINavigationController *navigationController =
[[UINavigationController alloc] initWithNavigationBarClass:navigationBarClass
                                              toolbarClass:toolbarClass];
```

### 感想

tips共有会は小規模なら簡単に開催できるし有益なので、周りを適当に誘ってみよう思いました。

