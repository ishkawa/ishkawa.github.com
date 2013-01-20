---
layout: post
title: "lsでVimのバックアップファイルを非表示にする"
date: 2013-01-20 23:23
comments: true
categories: 
---

最近転職しました。

転職とは関係ないのですが、最近はObjective-C以外の開発もしていてVimを使う機会が増えました。
で、Vimでコードを書くと`*~`というファイルがたくさん出ててきてつらい気持ちになってしまうので、
`ls`コマンドの結果から取り除く方法を調べました。

Stack Overflowで以下の様な投稿をみつけました。  
[Can I put something in in bashrc to hide text editor (~ extension) files?](http://stackoverflow.com/a/6011437)

### 設定方法

どうやらMacの`ls`というのはGNUの`ls`と違うらしいので、GNUの方の`ls`をインストールします。
その他諸々のコマンドも入り、`g`プレフィックスをつけるとそちらが使えるようです。
`gls`は`ls`とオプションがいくらか異なり、`-B`の意味が違ったり`--hide`などが追加されていたりします。

```
brew install coreutils
```

`~/.zshrc`で以下のようなエイリアスを設定します。(bashの方は`~/bashrc`です。)
```
alias ls='/usr/local/bin/gls -B'
```

`-a`オプションとかをつけたときにはバックアップファイルも表示したい場合、以下のようにします。
```
alias ls="/usr/local/bin/gls --hide='*~'"
```


以上でおしまいです。
