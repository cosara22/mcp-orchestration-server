# MCP Orchestration Server - マルチエージェント開発環境

複数の Claude Code インスタンスを MCP (Model Context Protocol) 経由で統合し、Orchestrator Agent が他のサブエージェント (Planning, Implementation, Testing) を管理するシステムです。

## 🎯 概要

```
Cursor/Claude Code (Orchestrator)
    ↓ MCP
MCP Orchestration Server (Redis)
    ↓ MCP
複数の Cursor/Claude Code (Planning, Implementation, Testing Agent)
```

## 📁 ディレクトリ構成

```
Orchestrations/
├── mcp-server/                          # MCP サーバー実装
│   ├── src/
│   │   └── index.ts                     # メインサーバーコード
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── claude-code-configs/                 # Claude Code 設定ファイル
│   ├── orchestrator-config.json         # Orchestrator 用
│   ├── planning-agent-config.json       # Planning Agent 用
│   ├── implementation-agent-config.json # Implementation Agent 用
│   └── testing-agent-config.json        # Testing Agent 用
├── mcp-orchestration-architecture.md    # システムアーキテクチャ
├── agent-protocols.md                   # 通信プロトコル詳細
├── comprehensive_orchestration_guide.md # 総合ガイド
├── setup.bat                            # Windows セットアップスクリプト
└── README.md                            # このファイル
```

## 🚀 クイックスタート

### 前提条件

- **Node.js** 18.0.0 以上
- **Docker Desktop** (Redis 用)
- **Cursor** または **Claude Code** (VSCode 拡張機能)

### セットアップ手順

#### 1. 自動セットアップ (推奨)

```bash
# Windows
setup.bat
```

#### 2. 手動セットアップ

```bash
# 1. MCP Server のビルド
cd mcp-server
npm install
npm run build

# 2. 環境変数の設定
copy .env.example .env

# 3. Redis の起動
docker run -d --name redis-orchestration -p 6379:6379 redis:7.2-alpine

# 4. MCP Server の起動
npm run dev
```

### Cursor/Claude Code の設定

各エージェントごとに **別々の Cursor ウィンドウ** を開き、色分けとMCP設定を行います。

#### 🎨 ワークスペース準備 (色分け設定)

```bash
# 各エージェント用のワークスペースフォルダを作成
mkdir agent-workspaces\orchestrator
mkdir agent-workspaces\planning-agent
mkdir agent-workspaces\implementation-agent
mkdir agent-workspaces\testing-agent

# 色分け設定をコピー
xcopy workspace-configs\orchestrator\.vscode agent-workspaces\orchestrator\.vscode /E /I
xcopy workspace-configs\planning-agent\.vscode agent-workspaces\planning-agent\.vscode /E /I
xcopy workspace-configs\implementation-agent\.vscode agent-workspaces\implementation-agent\.vscode /E /I
xcopy workspace-configs\testing-agent\.vscode agent-workspaces\testing-agent\.vscode /E /I
```

#### 各エージェントの起動と設定

| エージェント | 色 | 起動方法 |
|------------|-----|---------|
| 🎯 **Orchestrator** | 紫 | `cd agent-workspaces\orchestrator && code .` |
| 📋 **Planning Agent** | 青 | `cd agent-workspaces\planning-agent && code .` |
| ⚙️ **Implementation Agent** | 緑 | `cd agent-workspaces\implementation-agent && code .` |
| 🧪 **Testing Agent** | オレンジ | `cd agent-workspaces\testing-agent && code .` |

各ウィンドウで MCP 設定を追加:
1. `Ctrl+Shift+P` → "Preferences: Open User Settings (JSON)"
2. または Claude Dev の設定から MCP サーバーを追加
3. [claude-code-configs/](claude-code-configs/) 内の対応する設定ファイルの内容を追加

詳細は [workspace-configs/README.md](workspace-configs/README.md) を参照してください。

## 📖 使い方

### 1. エージェントの起動

各 Cursor ウィンドウで、エージェントに対して自己紹介を促します:

**Planning Agent ウィンドウ:**
```
Planning Agent として起動してください
```

**Implementation Agent ウィンドウ:**
```
Implementation Agent として起動してください
```

**Testing Agent ウィンドウ:**
```
Testing Agent として起動してください
```

各エージェントは自動的に `register_agent` を実行し、`poll_tasks` ループを開始します。

### 2. Orchestrator からタスクを作成

**Orchestrator ウィンドウ:**
```
ユーザー認証機能を実装してください。
技術スタックは Python + FastAPI + PostgreSQL です。
```

Orchestrator は以下を実行します:
1. `create_task` で Planning Agent にタスクを作成
2. `get_task_status` で完了を待機
3. 計画を確認して Implementation Agent にサブタスクを割り当て
4. 全タスク完了後、結果をユーザーに報告

### 3. 進捗の確認

**Orchestrator ウィンドウ:**
```
現在のエージェントの状態を確認してください
```

→ `list_agents` が呼び出され、全エージェントの状態が表示されます

## 🛠️ 利用可能な MCP Tools

### Orchestrator 用

- **create_task**: 新しいタスクを作成
- **get_task_status**: タスクの状態を取得
- **list_agents**: 全エージェントの状態を確認

### サブエージェント用

- **poll_tasks**: 自分宛のタスクを取得
- **submit_result**: タスク実行結果を報告
- **get_shared_state**: 共有データを取得
- **set_shared_state**: 共有データを保存
- **register_agent**: エージェント登録 (起動時)

## 📚 ドキュメント

- **[mcp-orchestration-architecture.md](mcp-orchestration-architecture.md)** - システムアーキテクチャの詳細
- **[agent-protocols.md](agent-protocols.md)** - エージェント間通信プロトコル
- **[comprehensive_orchestration_guide.md](comprehensive_orchestration_guide.md)** - マルチエージェント開発の総合ガイド

## 🔧 トラブルシューティング

### MCP Server に接続できない

**症状**: Claude Code が MCP ツールを認識しない

**解決策**:
1. MCP Server が起動しているか確認
   ```bash
   cd mcp-server
   npm run dev
   ```
2. ビルドが成功しているか確認
   ```bash
   ls dist/index.js
   ```
3. Cursor を再起動

### Redis 接続エラー

**症状**: `Redis Client Error`

**解決策**:
```bash
# Redis が起動しているか確認
docker ps | findstr redis

# 起動していない場合
docker run -d --name redis-orchestration -p 6379:6379 redis:7.2-alpine

# Redis 接続テスト
docker exec -it redis-orchestration redis-cli ping
# 応答: PONG
```

### タスクが取得できない

**症状**: `poll_tasks` が空の配列を返す

**解決策**:
1. エージェントが正しく登録されているか確認
   ```
   Orchestrator: list_agents を実行
   ```
2. タスクが正しいキューに追加されているか確認
   ```bash
   docker exec -it redis-orchestration redis-cli
   > LRANGE queue:planning 0 -1
   ```

## 🎯 実装例

### Example 1: シンプルな機能実装

**Orchestrator:**
```
シンプルなTODOリストAPIを実装してください
- GET /todos - 全TODO取得
- POST /todos - TODO作成
- DELETE /todos/{id} - TODO削除
```

**期待される動作:**
1. Orchestrator が Planning Agent にタスク作成
2. Planning Agent が実装計画を策定
3. Orchestrator が Implementation Agent にコード実装を依頼
4. Implementation Agent がコードを生成
5. Orchestrator が Testing Agent にテスト作成を依頼
6. Testing Agent がテストコードを生成・実行

### Example 2: 既存コードのリファクタリング

**Orchestrator:**
```
app/services/user_service.py のパスワードハッシュ化ロジックを
app/utils/security.py に切り出してリファクタリングしてください
```

**期待される動作:**
1. Orchestrator が Implementation Agent に直接依頼
2. Implementation Agent がコードを修正
3. Testing Agent が既存テストが通ることを確認

## 🚧 制限事項と今後の改善

### 現在の制限

- ローカル環境のみ対応 (本番環境用の認証なし)
- ポーリングベースの通信 (Redis Pub/Sub 未実装)
- エージェント障害時の自動復旧なし

### 今後の改善予定

- [ ] Redis Pub/Sub によるリアルタイム通知
- [ ] エージェント認証・認可機能
- [ ] LangSmith/Prometheus 統合
- [ ] Web UI ダッシュボード
- [ ] エージェント自動スケーリング

## 📄 ライセンス

MIT License

## 🤝 貢献

Issue や Pull Request を歓迎します!

---

**開発者**: Claude Code Multi-Agent Orchestration Project
**バージョン**: 1.0.0
**更新日**: 2025-01-16
