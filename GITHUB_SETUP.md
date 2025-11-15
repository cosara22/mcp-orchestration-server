# GitHub リポジトリ連携手順

このドキュメントでは、MCP Orchestration Server を GitHub に公開する手順を説明します。

## 📋 前提条件

- GitHub アカウントを持っていること
- Git がインストールされていること
- GitHub CLI (`gh`) がインストールされていること (オプション)

## 🚀 方法1: GitHub CLI を使う (推奨)

### 1. GitHub CLI のインストール

```bash
# Windows (winget)
winget install --id GitHub.cli

# または Scoop
scoop install gh
```

### 2. GitHub にログイン

```bash
gh auth login
```

プロンプトに従って認証を完了してください。

### 3. リポジトリを作成してプッシュ

```bash
# 現在のディレクトリでリポジトリを作成
gh repo create mcp-orchestration-server --public --source=. --remote=origin --push

# または、プライベートリポジトリとして作成
gh repo create mcp-orchestration-server --private --source=. --remote=origin --push
```

完了! リポジトリが自動的に作成され、コードがプッシュされます。

### 4. リポジトリを開く

```bash
gh repo view --web
```

## 🌐 方法2: GitHub Web UIを使う

### 1. GitHub で新しいリポジトリを作成

1. https://github.com/new にアクセス
2. リポジトリ名を入力: `mcp-orchestration-server`
3. 説明を入力: `MCP Orchestration Server for Multi-Agent Development with Claude Code`
4. Public または Private を選択
5. **「Add a README file」のチェックを外す** (既に README.md があるため)
6. **「Create repository」** をクリック

### 2. ローカルリポジトリとリモートを接続

GitHub の指示に従って、以下のコマンドを実行:

```bash
# リモートリポジトリを追加
git remote add origin https://github.com/YOUR_USERNAME/mcp-orchestration-server.git

# または SSH を使う場合
git remote add origin git@github.com:YOUR_USERNAME/mcp-orchestration-server.git

# ブランチ名を main に設定
git branch -M main

# プッシュ
git push -u origin main
```

## 📝 リポジトリの設定 (オプション)

### トピックを追加

GitHub のリポジトリページで、About セクションの ⚙️ アイコンをクリックし、以下のトピックを追加:

- `mcp`
- `model-context-protocol`
- `claude-code`
- `cursor`
- `multi-agent`
- `orchestration`
- `ai-agents`
- `typescript`
- `redis`

### GitHub Actions の設定

将来的に CI/CD を追加する場合のサンプル:

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install dependencies
      run: |
        cd mcp-server
        npm install

    - name: Build
      run: |
        cd mcp-server
        npm run build

    - name: Test
      run: |
        cd mcp-server
        npm test
```

## 🔄 日常的な Git 操作

### 変更をコミットしてプッシュ

```bash
# 変更をステージング
git add .

# コミット
git commit -m "feat: Add new feature"

# プッシュ
git push
```

### リモートから最新の変更を取得

```bash
git pull
```

### ブランチを作成して作業

```bash
# 新しいブランチを作成
git checkout -b feature/new-agent

# 変更をコミット
git add .
git commit -m "feat: Add new agent type"

# ブランチをプッシュ
git push -u origin feature/new-agent

# GitHub でプルリクエストを作成
gh pr create --title "Add new agent type" --body "Adds support for documentation agent"
```

## 📦 リリースの作成

### GitHub CLI でリリース

```bash
# タグを作成
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# リリースを作成
gh release create v1.0.0 --title "v1.0.0" --notes "Initial release of MCP Orchestration Server"
```

### Web UI でリリース

1. リポジトリページの右側の「Releases」をクリック
2. 「Create a new release」をクリック
3. タグを入力: `v1.0.0`
4. リリースタイトル: `v1.0.0 - Initial Release`
5. 説明を入力
6. 「Publish release」をクリック

## 🛡️ セキュリティ設定

### Secrets の追加 (CI/CD用)

1. リポジトリページ → Settings → Secrets and variables → Actions
2. 「New repository secret」をクリック
3. 以下のシークレットを追加:
   - `REDIS_URL` (テスト用)
   - 他の必要な環境変数

### .gitignore の確認

以下のファイルが除外されていることを確認:

- [x] `.env` (環境変数)
- [x] `node_modules/` (依存関係)
- [x] `dist/` (ビルド成果物)
- [x] `agent-workspaces/` (個人のワークスペース)

## 📄 ライセンスの追加

```bash
# MIT License を追加
cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2025 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF

git add LICENSE
git commit -m "docs: Add MIT License"
git push
```

## 🔗 README にバッジを追加

README.md の先頭に以下を追加:

```markdown
# MCP Orchestration Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
```

## 📊 GitHub の統計情報

リポジトリを公開後、以下が利用可能になります:

- **Insights**: コミット履歴、コントリビューター
- **Issues**: バグ報告や機能リクエスト
- **Discussions**: コミュニティとの議論
- **Projects**: タスク管理
- **Wiki**: 追加ドキュメント

## 🤝 コラボレーション

### コントリビューターの追加

1. Settings → Collaborators and teams
2. 「Add people」でユーザーを招待

### プロテクトブランチの設定

1. Settings → Branches
2. 「Add rule」
3. Branch name pattern: `main`
4. 以下を有効化:
   - Require pull request reviews before merging
   - Require status checks to pass before merging

## 🎉 完了

これで GitHub リポジトリが設定され、チームでの共同開発や公開が可能になりました!

リポジトリURL: `https://github.com/YOUR_USERNAME/mcp-orchestration-server`
