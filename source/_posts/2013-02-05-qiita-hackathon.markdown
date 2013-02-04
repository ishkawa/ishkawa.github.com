---
layout: post
title: "Qiita Hackathonに参加して来ました"
date: 2013-02-05 00:45
comments: true
categories: 
---

テーマはGitHub APIを利用してプログラマーの問題を解決するというものでした。  
[http://qiitahackathon03.peatix.com](http://qiitahackathon03.peatix.com)  

　

### つくったもの

Gitのコミット毎に親コミットとのdiffから`TODO: `や`FIXME: `というコメントを探し出し、
それを元に自動的にissueのオープン/クローズを行うツールをつくりました。
このツールを使うと、`TODO: `コメントの挿入/削除 = issueのオープン/クローズとなります。
あまりウケないかなと思っていたのですが、思いの外受け入れてくれた方がいて嬉しかったです。

### スライド

GitHubのゲストの方向けに資料は英語で書かれていますが、発表は日本語でした。
<script async class="speakerdeck-embed" data-id="928eba30511601308fcd1231381d555c" data-ratio="1.33333333333333" src="//speakerdeck.com/assets/embed.js"></script>  

　

### デモビデオ

音声はありません。
<iframe src="http://player.vimeo.com/video/58892168?title=0&amp;byline=0&amp;portrait=0" width="500" height="375" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>

　


### 実装方法

いつも通り、Objective-Cで書きました。  
前後のコミットの取得やdiffの取得にはlibgit2を利用しました。


### 結果

最優秀賞をいただきました。  
GitHubのScott Chacon氏にも"Great Idea"と褒めていただき、票も入れてくれたそうです。


### 今後

大変ありがたいことに、もし公開することになったら連絡をくださいと言ってくださった方が数名いました。
が、現在のコードでは一部の実装が甘かったり、実行環境を整えるのに手間がかかったりするので、
もう少し磨いてからソースを公開しようと思います。

連絡先をいただいた方には、公開時にあらためて連絡いたします。

--

2日目は疲れてしまってほとんどコードが書けませんでしたが、
なんとか動かせるところまで持って行けてよかったです。
酔っ払いながら書いた部分が汚くて今の悩みの種となってしまいましたが、
ハッカソンの夜はとても楽しかったです。


