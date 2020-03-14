---
title: "Dartのjson_serializableにカスタムの型変換を追加する"
date: 2020-03-09 09:00 +0900
description: ""
---


[`json_serializable`](https://github.com/dart-lang/json_serializable)はJSONのシリアライズ/デシリアライズを行うパッケージ。
クラスに`@JsonSerializable`アノテーションをつけると、JSONの変換コードを生成してくれるという方式になっている。

生成するコードのオプションは色々と揃っていて、カスタムの型変換を指定する方法も当然用意されている。フィールドに指定する`@JsonKey`アノテーションには`fromJson`と`toJson`が設定でき、ここで型変換の関数を指定できる。

```dart
@JsonSerializable
class TestObject {
    @JsonKey(fromJson: dateTimeFromJson, toJson: dateTimeToJson)
    DateTime dateTime;
}
```

プロジェクトが小さいうちはこれで十分かもしれないが、プロジェクトが大きくなって何度も同じ設定を書くようになると、段々とつらくなってくる。

そんなわけで、`@JsonKey`アノテーションなしでカスタムの型変換を実現する方法を模索した。

## コード生成の流れを探る

`json_serializable`のコード生成は、[`build_runner`](https://github.com/dart-lang/build/tree/master/build_runner)というパッケージが提供する仕組みに乗っかって実現されている。`pub run build_runner build`を実行すると、`json_serializable`の`build.yaml`から設定を読み出し、何をすべきか判断するという流れになっている。

で、`json_serializable`では`JsonSerializableGenerator`クラスを呼び出すように設定されているので、ここに手を加えればカスタムの型変換を追加できることがわかる。

`JsonSerializableGenerator`クラスの内部では、個々の型変換は`TypeHelper`のサブクラス群が担っており、使用する`TypeHelper`は`JsonSerializableGenerator`クラスのコンストラクタで指定できる。ここにカスタムの型変換を行う`TypeHelper`を追加すれば、カスタムの型変換をビルトインの型変換と同様に扱えるようになる。

以上をまとめると、やりたいことが実現するには次のものが必要そうだ。

* カスタムの型変換を行う`TypeHelper`を用意する。
* パッケージを作成し、`build.yaml`で↑を使うコードジェネレーターを設定する。

## 型変換の実装

`TypeHelper`クラスを継承し、`serialize()`メソッドと`deserialize()`メソッドを実装する。それぞれのメソッドには変換対象の式と変換元(先)の型が渡されるので、必要に応じて変換するコードを文字列として返す。

`json_serializable`の[`json_serializable/lib/src/type_helpers`](https://github.com/dart-lang/json_serializable/tree/4e89afeb60530fe8c9e309e9325a75ab6d3ab523/json_serializable/lib/src/type_helpers)に実際に使われている`TypeHelper`の例があるので、参考にすると理解が早い。

例として、JSONのUNIXミリ秒のnumberをDartの`DateTime`クラスに変換する`TypeHelper`を実装した。

```dart
class UnixmillisecondHelper extends TypeHelper {
  final _typeChecker = TypeChecker.fromUrl('dart:core#DateTime');

  UnixmillisecondHelper();

  @override
  String serialize(
    DartType targetType,
    String expression,
    TypeHelperContext context,
  ) {
    if (!_typeChecker.isExactlyType(targetType)) {
      return null;
    }

    if (context.nullable) {
      expression = '$expression?';
    }

    return '$expression.millisecondsSinceEpoch';
  }

  @override
  String deserialize(
    DartType targetType,
    String expression,
    TypeHelperContext context,
  ) {
    if (!_typeChecker.isExactlyType(targetType)) {
      return null;
    }

    return context.nullable
        ? '$expression == null ? null : DateTime.fromMillisecondsSinceEpoch($expression)'
        : 'DateTime.fromMillisecondsSinceEpoch($expression)';
  }
}
```

## ビルダーの設定

`build_runner`にカスタムの`JsonSerializableGenerator`を認識してもらうには、`build.yaml`で`Builder`を返す関数を指定する。`build.yaml`の設定の書き方や`Builder`を返す関数の書き方は、`json_serializable`の[`json_serializable/build.yaml`](https://github.com/dart-lang/json_serializable/blob/4e89afeb60530fe8c9e309e9325a75ab6d3ab523/json_serializable/build.yaml)や[`json_serializable/lib/builder.dart`](https://github.com/dart-lang/json_serializable/blob/4e89afeb60530fe8c9e309e9325a75ab6d3ab523/json_serializable/lib/builder.dart)を参考にすれば良い。

今回は次のようにして、`UnixmillisecondHelper`を使う`Builder`を返した。

```dart
Builder customJsonSerializable(BuilderOptions options) {
  try {
    final config = JsonSerializable.fromJson(options.config);
    return SharedPartBuilder(
      [
        JsonSerializableGenerator(
          config: config,
          typeHelpers: [
            UnixmillisecondHelper(),
          ],
        ),
        const JsonLiteralGenerator()
      ],
      'custom_json_serializable',
    );
  } on CheckedFromJsonException catch (e) {
    final lines = <String>[
      'Could not parse the options provided for `json_serializable`.'
    ];

    if (e.key != null) {
      lines.add('There is a problem with "${e.key}".');
    }
    if (e.message != null) {
      lines.add(e.message);
    } else if (e.innerError != null) {
      lines.add(e.innerError.toString());
    }

    throw StateError(lines.join('\n'));
  }
}
```

`build.yaml`は以下のように書いた。

```yaml
builders:
  custom_json_serializable:
    import: "package:custom_json_serializable/builder.dart"
    builder_factories: ["customJsonSerializable"]
    build_extensions: {".dart": ["custom_json_serializable.g.part"]}
    auto_apply: dependents
    build_to: cache
    applies_builders: ["source_gen|combining_builder"]
```

## 実際にコードを生成する

例として、以下のようなファイルを用意した。

```dart
import 'package:json_annotation/json_annotation.dart';

part 'item.g.dart';

@JsonSerializable()
class Item {
  String name;
  DateTime createdAt;

  Item(this.name, this.createdAt);

  factory Item.fromJson(Map<String, dynamic> json) => _$ItemFromJson(json);
  Map<String, dynamic> toJson() => _$ItemToJson(this);
}
```

`pubspec.yaml`の`dependencies`に`json_annotation`を追加し、`dev_dependencies`に作成したパッケージと`build_runner`を追加する。そして、`pub run build_runner build`を実行すると、以下のようなファイルが生成された。

```dart
// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Item _$ItemFromJson(Map<String, dynamic> json) {
  return Item(
    json['name'] as String,
    json['createdAt'] == null
        ? null
        : DateTime.fromMillisecondsSinceEpoch(json['createdAt']),
  );
}

Map<String, dynamic> _$ItemToJson(Item instance) => <String, dynamic>{
      'name': instance.name,
      'createdAt': instance.createdAt?.millisecondsSinceEpoch,
    };
```

生成されたコードから`DateTime`とUNIXミリ秒の相互変換を行っていることがわかる。また、実際に`Item('Apple', DateTime(2020, 3, 8))`をJSONに変換すると、以下のようになった。

```json
{
    "name": "Apple",
    "createdAt": 1583593200000
}
```

## 感想

`json_serializable`のコードベースはカスタマイズしやすい構造になっていると感じた。とはいえ、この記事で紹介したようなを調査して、実際にカスタマイズできるようになるにはそれなりに時間が掛かったし、パッケージの利用者がカスタマイズしやすい状態になっているとは言い難い。

プラグインみたいな機構ができて、アプリケーションの`pubspec.yaml`と`build.yaml`の設定だけで型変換のルールを追加できたら、もっと幅広い利用者が使えるようになるんじゃないかと思う。


## サンプルコード

* [https://github.com/ishkawa/custom_json_serializable_example](https://github.com/ishkawa/custom_json_serializable_example)

