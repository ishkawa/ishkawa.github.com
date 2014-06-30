---
layout: post
title: "supertestでNode.jsのテストを始めました"
date: 2013-03-31 21:54
comments: true
categories: 
---

最近、Node.jsを始めました。  

サーバーサイドの経験はほとんどないので色々と新鮮に感じています。  
クライアントサイドと違ってテストがないとプログラムが動いているかよくわからないのですが、  
テストってどうやって書くのか全然わかんねーって感じだったのであれこれ模索しました。

その結果、supertestを使ってリクエストとレスポンスの対応をテストすることから始めるのが  
良さそうかなと思いましたので紹介します。

対象はExpressアプリとします。

### supertestとMochaをインストール

mochaはなくても使えるのですが、あった方が楽なのでインストールします。  
mochaについては以下のページが詳しいです。  
[http://d.hatena.ne.jp/hokaccha/20111202/1322840375](http://d.hatena.ne.jp/hokaccha/20111202/1322840375)

```
npm install supertest --save
npm install -g mocha
```

### app.jsをエクスポート

テストファイルからappにアクセスできるようにエクスポートします。

```javascript
module.exports = app;
```

### テストを書く

`test/`以下にテストを書く`.js`ファイルを作成します。  
例として以下のような緩い仕様を例にテストを書いてみます。

- username/passwordのいずれかが空だと400
- username/passwordの両方があれば200

```javascript
var request = require('supertest');
var app = require('../app');

describe('POST /signup', function() {
  it('returns 400 if username is empty', function(done) {
    request(app)
    .post('/signup')
    .expect(400, done);
  });

  it('returns 400 if password is empty', function(done) {
    request(app)
    .post('/signup')
    .expect(400, done);
  });

  it('returns 200 when parameters are valid', function(done) {
    request(app)
    .post('/signup')
    .send({username: 'hoge', password: 'hoge'})
    .expect(200, done);
  });
});
```

### 実行する

mochaコマンドで実行します。
```
mocha
```

すると、以下のような感じの出力が得られます。
```
3 tests complete (72 ms)
```

　

早くまともにテストを書けるようになりたいものです。
