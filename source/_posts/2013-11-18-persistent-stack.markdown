---
layout: post
title: "ISPersistentStackというCoreDataのヘルパーを書いた"
date: 2013-11-18 01:23
comments: true
categories: 
---

最近iOS 4を相手にする機会がなくなったので、いつも使うCoreDataのヘルパーを共通化しようと思い、ついでに公開することにしました。
あまり他人が使うことを想定したつくりになっていないので、そのまま使おうとするとちょっと苦労するかもしれません。

[ISPersistentStack](https://github.com/ishkawa/ISPersistentStack)

いままで使っていたものをそのままコピペすればOKかと思っていたんですが、できるだけ幅広い構造に対応できるようにするには
いくらか抽象化が必要となりました。サブクラスを作ってしまえば"一般的な"ケースには対応できると思うのですが、
少し凝ったつくりには対応できない場合があると思います。(そういう理由もあって、CocoaPodsには送らない予定です。)

### 主な機能

- メインのNSManagedObjectContextの提供
- 永続ストアとNSManagedObjectModelの互換性のチェック
- 永続ストアの廃棄

Web APIのクライアントのアプリの場合、消してはいけないデータはあまりないので、自分はよく以下のようにして使います。
このようにすると、永続ストアのモデルとバンドルされているモデルが一致しない場合にデータベースを捨ててくれます。
捨ててはいけないデータがある場合にも`#ifdef DEBUG`を利用すればデバッグに役立つかもしれません。

```objectivec
ISPersistentStack *persistentStack = [ISPersistentStack sharedStack];
if (!persistentStack.isCompatibleWithCurrentStore) {
    [persistentStack deleteCurrentStore];
}
```

### 想定しているケース

- 単一のNSPersistentStore
- 単一のNSManagedObjectModel(複数バージョンは想定内)
- 複数のNSManagedObjectContext(ただし、main queueのcontextはISPersistentStackが提供するものを利用)

デフォルトで使用するNSPersistentStoreはドキュメント以下の`Model.sqlite`となっていて、
モデルはメインバンドル以下の`Model.momd`となっています。
もしここから外れる場合にはISPersistentStackのサブクラスを作成してstoreURL, modelURL, sharedStackをオーバーライドする必要があります。
その他にもmanagedObjectModel, persistentStoreCoordinator, managedObjectContextをオーバーライドすることもできます。

### 感想

CoreDataのオレオレ便利ヘルパーは他人にとっても使いやすい形にするのは難しいなあと思いました。

