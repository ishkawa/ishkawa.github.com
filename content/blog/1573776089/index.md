---
title: "ローカルのKubernetesでGCRのイメージをpullする"
date: 2019-11-15 09:01 +0900
description: ""
---

GKEでは特に何も設定しなくても、同一プロジェクトのGCRのDockerイメージをpullできる。GCRはプライベートレジストリなので当然だが、プロジェクト外では認証が必要となる。今回は、ローカルのKubernetesでGCRのイメージをpullしたかったので、その手順を残す。

## サービスアカウントのキーを作成

まず、GCRの読み取り権限を持つサービスアカウントのキーをつくる。

1. GCPのメニューから"API & Services" > "Credentials" > "Create Credentials" > "Service account key" > と進む。
2. "Service account"には"New service account"を、"Role"には"Storage Object Viewer"を、"Key type"には"JSON"を設定して、キーを作成する。

## Kubernetesのsecretの作成

続いて、以下のコマンドでsecretを作成する。

```
kubectl create secret docker-registry gcr-puller \
  --docker-server=gcr.io \
  --docker-username=_json_key \
  --docker-password="$(cat /path/to/service_account_key.json)" \
  --docker-email=you@example.com
```

YAMLにエクスポートする場合は、以下のコマンドを実行する。

```
kubectl get secret gcr-puller -o yaml > secret.yaml
```

## deploymentのimagePullSecretsを設定

最後に、deploymentの`imagePullSecrets`に作成したsecretを指定する。自分の場合、Kustomizeでローカル環境のみ`imagePullSecrets`を設定したかったので、以下のようなpatchを書いた。

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: target-deployment
spec:
  template:
    spec:
      imagePullSecrets:
      - name: gcr-puller
```


## 参考

- [Using Google Container Registry with Kubernetes](https://blog.container-solutions.com/using-google-container-registry-with-kubernetes)
