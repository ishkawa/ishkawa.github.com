---
title: "ESLintのwarningでCIのジョブを失敗させる"
date: 2020-04-01 09:00 +0900
description: ""
---

ESLintのexit codeはwarningがあっても0になる。これ自体は自然なことだが、CIのジョブではwarningがあっても成功とみなされてしまうので困る。

warningをerror扱いに変更できないかと調べてみたら、`--max-warnings`というオプションをみつけた。これはexit codeを非ゼロに変更するwarningの数を指定するオプションで、`--max-warnings=0`を指定すれば、warningが1つでもあったら失敗する。

- [Command Line Interface - ESLint - Pluggable JavaScript linter](https://eslint.org/docs/user-guide/command-line-interface)
