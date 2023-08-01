---
title: "Dart 3におけるtable driven test"
date: 2023-08-01 09:00 +0900
description: ""
---

今年リリースされたDart 3には、新たにrecordという機能が導入された([Doc](https://dart.dev/language/records))。これは他の言語でいうところのtuple的なもので、複数の値を持つことができる。keyやindexで要素にアクセスできるし、destructureもできる。

それほど多用する機能ではないが、table driven testを書く場合には重宝する。

```dart
void main() {
  group('NumberParser.parse', () {
    for (final testCase in [
      (input: 'one', output: 1),
      (input: 'two', output: 2),
      (input: 'three', output: 3),
      (input: 'four', output: 4),
    ]) {
      test('"${testCase.input}"を渡すと${testCase.output}が返される', () {
        final parser = NumberParser();
        final output = parser.parse(testCase.input);
        expect(output, testCase.output);
      });
    }
  });
}
```

実行結果

```
✓ NumberParser.parse "one"を渡すと1が返される
✓ NumberParser.parse "two"を渡すと2が返される
✓ NumberParser.parse "three"を渡すと3が返される
✓ NumberParser.parse "four"を渡すと4が返される
Exited
```

他の言語でも、TypeScriptやSwiftあたりは同じ書き方ができそう。
