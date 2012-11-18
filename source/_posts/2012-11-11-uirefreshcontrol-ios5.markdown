---
layout: post
title: "UIRefreshControlをiOS5で実現したときの話"
date: 2012-11-11 01:41
comments: true
categories: 
---

iOS6のUIRefreshControl、使っていますか？  

いままでもpull-to-refreshを実現するライブラリが幾つかありましたが、
UIRefreshControlは実装が単純明快でいいなあと思いました。
一度そう感じてしまうと、当然iOS5でも同じコードで同じものを実現したいと思うわけで、
さっそくそれを実現するライブラリをつくってみました。

[ISRefreshControl](https://github.com/ishkawa/ISRefreshControl)

最終的には、iOS5でもiOS6でも以下のコードで`UIRefreshControl`が使えるようになりました。  
(iOS5では`UIRefreshControl`らしきものになりますが、
特別な`UITableViewController`は必要ありません)

```objectivec
self.refreshControl = (UIRefreshControl *)[[ISRefreshControl alloc] init];
[self.refreshControl addTarget:self
                        action:@selector(refresh)
              forControlEvents:UIControlEventValueChanged];
```

で、これを実現するには"変なこと"をしなければならなかったので、その"変なこと"を紹介します。  
(普通なことについてはコードを参照してください。)

　

### 目標

- iOS6では標準の`UIRefreshControl`が利用される。
- iOS5でもiOS6と同じコードで同等の動きをする。

　

### `UIRefreshControl`の代替クラスの作成
iOS5では`[[UIRefreshControl alloc] init]`としても`nil`が返るので、
代替クラスとして`ISRefreshControl`というものをつくりました。
以下のような感じのものです。

- iOS6: 標準の`UIRefreshControl`のインスタンスとなる
- iOS5: `UIRefreshControl`と同じような動きをする

iOS6では以下のようにして`alloc`時に`UIRefreshControl`をインスタンス化します。

```objectivec
+ (id)alloc
{
    if ([UIRefreshControl class]) {
        return (id)[UIRefreshControl alloc];
    }
    return [super alloc];
}
```

iOS5では`ISRefreshControl`がインスタンス化されます。
`ISRefreshControl`には`UITableView`のスクロール量が閾値を超えると
`UIControlEventValueChanged`を送るなど、`UIRefreshControl`と同等の機能を実装しました。
([ISRefreshControl.h](https://github.com/ishkawa/ISRefreshControl/blob/master/ISRefreshControl/ISRefreshControl.h),
 [ISRefreshControl.m](https://github.com/ishkawa/ISRefreshControl/blob/master/ISRefreshControl/ISRefreshControl.m))

　


### `UITableViewController`の拡張

iOS6とiOS5では`UITableViewController`の実装も異なるので以下のようにしました。

- iOS6: 標準の`UITableViewController`をそのまま使う
- iOS5: `ISRefreshControl`のために拡張された`UITableViewController`を使う

iOS5でも`UIRefreshControl`(らしきもの)が動くように以下の拡張を行いました。

- iOS5でも`refreshControl`プロパティがある
- `refreshControl`に変更があった場合、`tableView`に追加したり削除したりする。
- `refreshControl`にスクロール量を逐次知らせる。

これらにはインスタンス変数が必要だったり、初期化時に必要な処理があったりするので、
サブクラスをつくるのが普通だと思います。
しかし、それではiOS5の`UITableViewController`がiOS6の`UITableViewController`に
準拠したということにはならないので、`UITableViewController`のスーパークラスで
これらを実装しました。

スーパークラスで実装するというのは元々のスーパークラス(`UIViewController`)のサブクラスを
作成し、`UITableViewController`のカテゴリで`load`時にスーパークラスを
変更するというものです。
普段のコーディングでは混乱の元となるので、あまりやるべきではないと思いますが、
今回はiOS6の`UITableViewController`に準拠するという大義名分のもとでやってしまいました。
([ISRefreshViewController.h](https://github.com/ishkawa/ISRefreshControl/blob/master/ISRefreshControl/ISRefreshViewController.h),
 [ISRefreshViewController.m](https://github.com/ishkawa/ISRefreshControl/blob/master/ISRefreshControl/ISRefreshViewController.m))

```objectivec
+ (void)load
{
    @autoreleasepool {
        if ([[[UIDevice currentDevice] systemVersion] hasPrefix:@"5"]) {
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wdeprecated"
            class_setSuperclass([self class], [ISRefreshViewController class]);
#pragma GCC diagnostic pop
        }
    }
}
```

この方法はHMDTの木下さんの記事を参考にしました。([URL](http://hmdt.jp/blog/?p=610))  

　

-----

　

"元々iOS5で使っていたライブラリをiOS6でも使えばいいじゃん"という意見もあると思いますが、
自分は以下のことを優先させたかったので、このような実装をしました。

- できるだけ標準のUIを利用したい。
- OSのバージョンごとに分岐するコードはできるだけ書きたくない。
- iOS5のサポートを終了するときに、すぐに`UIRefreshControl`を使えるようにしたい。

奇妙な実装になったので、もっといい方法があればぜひ知りたいです。
