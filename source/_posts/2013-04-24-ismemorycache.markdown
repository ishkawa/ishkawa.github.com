---
layout: post
title: "ISMemoryCacheというのを書いた"
date: 2013-04-24 04:32
comments: true
categories: 
---

<blockquote class="twitter-tweet" lang="ja"><p>@<a href="https://twitter.com/interface">interface</a> ISMemoryCache : NSMutableDictionary+ (ISMemoryCache *)sharedCache;- (void)removeUnretainedObjects;@<a href="https://twitter.com/end">end</a>ってのを書いた。</p>&mdash; ishkawaさん (@_ishkawa) <a href="https://twitter.com/_ishkawa/status/326752483705761792">2013年4月23日</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

　

メモリキャッシュとありますが、ヘッダから分かる通り`NSMutableDictioary`です。  
`NSCache`よりしつこいメモリキャッシュが欲しかったので、頭の体操をしながらつくりました。

[ISMemoryCache](https://github.com/ishkawa/ISMemoryCache)

--

### 特徴

- `removeUnretainedObjects`を呼ぶと使われていないオブジェクトを削除する。
- `UIApplicationDidReceiveMemoryWarningNotification`で`removeUnretainedObjects`を実行。

具体的には、以下の実行後に`[cache objectForKey:@"key"]`は`NSObject`を返しますが、

```objectivec
NSObject *retainedObject = [[NSObject alloc] init];
@autoreleasepool {
    [cache setObject:retainedObject forKey:@"key"];
}
[cache removeUnretainedObjects];
```

以下の実行後には`nil`を返すという感じです。　

```objectivec
@autoreleasepool {
    NSObject *unretainedObject = [[NSObject alloc] init];
    [cache setObject:unretainedObject forKey:@"key"];
}
[cache removeUnretainedObjects];
```

### 使われているかどうかの判定方法

自分の強参照を外しても生き残っていれば、他でも使われているということです。

```objectivec
- (void)removeUnretainedObjects
{
    for (NSString *key in [self allKeys]) {
        __weak id wobject;
        
        @autoreleasepool {
            wobject = [self objectForKey:key];
            [self removeObjectForKey:key];
        }
        
        if (wobject) {
            [self setObject:wobject forKey:key];
        }
    }
}
```

### NSDictionaryのサブクラス化

`NSDictionary`はクラスクラスタなのでサブクラス化の作法がちょっと変わっています。  
今回は面倒だったので内部に`NSMutableDictionary`を持って適宜プロキシする感じにしました。  
適宜というのは`NSDictionary`のドキュメントに書かれている以下のメソッドが呼ばれた時です。

```objectivec
// NSDictionary
- (id)initWithObjects:(NSArray *)objects forKeys:(NSArray *)keys;
- (NSUInteger)count;
- (id)objectForKey:(id)key;
- (NSEnumerator *)keyEnumerator;

// NSMutableDictionary
- (void)setObject:(id)object forKey:(id <NSCopying>)key;
- (void)removeObjectForKey:(id)key;
```

