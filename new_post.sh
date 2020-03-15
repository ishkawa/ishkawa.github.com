#!/bin/bash
unixtime=`date +%s`
today=`date '+%Y-%m-%d 09:00 +0900'`

mkdir content/blog/$unixtime
cat - << EOS > content/blog/$unixtime/index.md
---
title: "$today"
date: $today
description: ""
---
EOS