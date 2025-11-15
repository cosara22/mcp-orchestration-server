# MCP サーバー経由のマルチエージェントオーケストレーション設計

## 1. アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────┐
│                    Cursor/Claude Code                        │
│                  (Orchestrator Agent UI)                     │
└────────────────────────┬────────────────────────────────────┘
                         │ MCP Protocol
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              MCP Orchestration Server                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Agent Manager                                       │   │
│  │  - Task Queue                                        │   │
│  │  - State Management (Redis)                          │   │
│  │  - Agent Lifecycle Control                           │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────┬──────────────┬──────────────────────┐     │
│  │ MCP Tool:    │ MCP Tool:    │ MCP Tool:            │     │
│  │ create_task  │ get_status   │ list_agents          │     │
│  └──────────────┴──────────────┴──────────────────────┘     │
└────────┬────────────────┬────────────────┬──────────────────┘
         │                │                │
         ↓ MCP Protocol   ↓                ↓
┌────────────────┐ ┌──────────────┐ ┌────────────────────┐
│ Claude Code    │ │ Claude Code  │ │ Claude Code        │
│ (Planning      │ │ (Implement   │ │ (Testing Agent)    │
│  Agent)        │ │  Agent)      │ │                    │
└────────────────┘ └──────────────┘ └────────────────────┘
```

## 2. MCP (Model Context Protocol) とは

MCPは、Anthropicが開発した**AIアプリケーションとデータソース/ツールを接続する標準プロトコル**です。

### 2.1 主要概念

- **MCP Server**: ツールやリソースを提供するサービス
- **MCP Client**: ツールを使用するAIアプリケーション(Claude Code/Cursor)
- **Tools**: エージェントが呼び出せる関数
- **Resources**: エージェントがアクセスできるデータ
- **Prompts**: 再利用可能なプロンプトテンプレート

## 3. システム設計

### 3.1 MCP Orchestration Server の責務

1. **タスク管理**
   - Orchestrator からのタスク作成要求を受付
   - タスクをキューに追加し、適切なエージェントに割り当て
   - タスクの状態追跡 (pending/in_progress/completed/failed)

2. **エージェント管理**
   - 各 Claude Code インスタンスの登録と状態監視
   - エージェントへのタスク配信
   - エージェントからの結果受信

3. **状態共有**
   - Redis を使った共有ステートストア
   - エージェント間のデータ共有
   - 実行履歴とログの保存

### 3.2 通信フロー

```
1. Orchestrator (Cursor/Claude Code)
   ↓ MCP Tool: create_task({type: "planning", description: "..."})

2. MCP Server
   - タスクをRedisキューに追加
   - Planning Agent 用のタスクキューに配置

3. Claude Code (Planning Agent)
   ↓ MCP Tool: poll_tasks({agent_type: "planning"})
   ← タスクを取得

4. Planning Agent
   - タスクを実行
   ↓ MCP Tool: submit_result({task_id: "...", result: {...}})

5. MCP Server
   - 結果をRedisに保存
   - Orchestrator に完了通知

6. Orchestrator
   ↓ MCP Tool: get_result({task_id: "..."})
   ← 結果を取得
```

## 4. MCP Tools 定義

### 4.1 Orchestrator 用ツール

#### `create_task`
```typescript
{
  name: "create_task",
  description: "新しいタスクを作成し、適切なエージェントに割り当てる",
  inputSchema: {
    type: "object",
    properties: {
      agent_type: {
        type: "string",
        enum: ["planning", "implementation", "testing", "documentation"],
        description: "タスクを実行するエージェントのタイプ"
      },
      task_description: {
        type: "string",
        description: "タスクの詳細な説明"
      },
      context: {
        type: "object",
        description: "タスク実行に必要なコンテキスト情報"
      },
      dependencies: {
        type: "array",
        items: { type: "string" },
        description: "依存する他のタスクのID"
      }
    },
    required: ["agent_type", "task_description"]
  }
}
```

#### `get_task_status`
```typescript
{
  name: "get_task_status",
  description: "タスクの実行状態を取得する",
  inputSchema: {
    type: "object",
    properties: {
      task_id: {
        type: "string",
        description: "タスクID"
      }
    },
    required: ["task_id"]
  }
}
```

#### `list_agents`
```typescript
{
  name: "list_agents",
  description: "登録されている全エージェントの状態を取得する",
  inputSchema: {
    type: "object",
    properties: {
      filter: {
        type: "string",
        enum: ["all", "active", "idle"],
        description: "フィルタ条件"
      }
    }
  }
}
```

### 4.2 サブエージェント用ツール

#### `poll_tasks`
```typescript
{
  name: "poll_tasks",
  description: "自分に割り当てられた未実行タスクを取得する",
  inputSchema: {
    type: "object",
    properties: {
      agent_id: {
        type: "string",
        description: "エージェントID"
      },
      max_tasks: {
        type: "number",
        description: "最大取得数",
        default: 1
      }
    },
    required: ["agent_id"]
  }
}
```

#### `submit_result`
```typescript
{
  name: "submit_result",
  description: "タスクの実行結果を送信する",
  inputSchema: {
    type: "object",
    properties: {
      task_id: {
        type: "string",
        description: "タスクID"
      },
      status: {
        type: "string",
        enum: ["completed", "failed"],
        description: "実行結果のステータス"
      },
      result: {
        type: "object",
        description: "実行結果データ"
      },
      error: {
        type: "string",
        description: "エラーメッセージ (failed時)"
      }
    },
    required: ["task_id", "status"]
  }
}
```

#### `get_shared_state`
```typescript
{
  name: "get_shared_state",
  description: "共有ステートストアからデータを取得する",
  inputSchema: {
    type: "object",
    properties: {
      key: {
        type: "string",
        description: "取得するデータのキー"
      }
    },
    required: ["key"]
  }
}
```

#### `set_shared_state`
```typescript
{
  name: "set_shared_state",
  description: "共有ステートストアにデータを保存する",
  inputSchema: {
    type: "object",
    properties: {
      key: {
        type: "string",
        description: "保存するデータのキー"
      },
      value: {
        type: "object",
        description: "保存するデータ"
      },
      ttl: {
        type: "number",
        description: "有効期限(秒)",
        default: 3600
      }
    },
    required: ["key", "value"]
  }
}
```

## 5. データ構造

### 5.1 Task オブジェクト
```json
{
  "task_id": "task-20250116-001",
  "agent_type": "planning",
  "status": "pending",
  "created_at": "2025-01-16T10:00:00Z",
  "updated_at": "2025-01-16T10:00:00Z",
  "assigned_agent_id": null,
  "task_description": "ユーザー認証機能の実装計画を作成",
  "context": {
    "project_name": "my-web-app",
    "tech_stack": ["Python", "FastAPI", "React"]
  },
  "dependencies": [],
  "result": null,
  "error": null
}
```

### 5.2 Agent 登録情報
```json
{
  "agent_id": "planning-agent-001",
  "agent_type": "planning",
  "status": "idle",
  "last_heartbeat": "2025-01-16T10:05:00Z",
  "capabilities": ["task_decomposition", "dependency_analysis"],
  "current_task_id": null
}
```

## 6. セキュリティ考慮事項

### 6.1 認証
- MCP サーバーへのアクセスには **APIキー** を使用
- 各エージェントに個別のAPIキーを発行
- 環境変数 `MCP_API_KEY` で管理

### 6.2 認可
- エージェントタイプごとにアクセス可能なツールを制限
  - Orchestrator: 全ツールにアクセス可能
  - サブエージェント: `poll_tasks`, `submit_result`, `get/set_shared_state` のみ

### 6.3 データ保護
- Redis への接続は **TLS** を使用
- タスクデータに個人情報が含まれる場合は暗号化

## 7. デプロイ戦略

### 7.1 ローカル開発
```
- MCP Server: localhost:3000
- Redis: localhost:6379
- 各 Claude Code インスタンス: 別々の Cursor ウィンドウ
```

### 7.2 本番環境
```
- MCP Server: Docker コンテナ (Kubernetes/ECS)
- Redis: Managed Redis (AWS ElastiCache/Azure Redis)
- Claude Code: CI/CD パイプライン内で実行
```

## 8. 監視とロギング

### 8.1 ログ項目
- タスク作成/完了/失敗のイベント
- エージェントの登録/ハートビート/切断
- ツール呼び出しの履歴

### 8.2 メトリクス
- タスク処理時間
- エージェント稼働率
- タスク成功/失敗率
- キュー待機時間

### 8.3 統合
- **LangSmith**: Claude API 呼び出しのトレース
- **Prometheus**: システムメトリクスの収集
- **Grafana**: ダッシュボード表示

## 9. 使用例

### 9.1 Orchestrator による計画タスクの作成

```
Orchestrator (Cursor/Claude Code でユーザーが指示):
"ユーザー認証機能を実装してください"

Claude Code の思考:
1. まず Planning Agent にタスクを作成する必要がある
2. create_task ツールを使用

MCP Tool 呼び出し:
create_task({
  agent_type: "planning",
  task_description: "ユーザー認証機能(登録/ログイン/JWT発行)の実装計画を作成。技術スタックはPython/FastAPI/PostgreSQL。",
  context: {
    project_path: "/path/to/project",
    existing_files: ["app/main.py", "app/database.py"]
  }
})

→ task_id: "task-001" が返される
```

### 9.2 Planning Agent によるタスク実行

```
別の Cursor ウィンドウで Planning Agent を起動:

MCP Tool 呼び出し:
poll_tasks({
  agent_id: "planning-agent-001"
})

→ task-001 を取得

Planning Agent の思考:
1. タスクを分析
2. サブタスクに分解
3. 実行計画を作成

MCP Tool 呼び出し:
submit_result({
  task_id: "task-001",
  status: "completed",
  result: {
    subtasks: [
      {id: "task-001-1", description: "Userモデルの作成", agent_type: "implementation"},
      {id: "task-001-2", description: "認証エンドポイントの実装", agent_type: "implementation"},
      {id: "task-001-3", description: "認証テストの作成", agent_type: "testing"}
    ]
  }
})
```

### 9.3 Orchestrator による進捗確認

```
MCP Tool 呼び出し:
get_task_status({
  task_id: "task-001"
})

→ status: "completed" を確認

次に、Implementation Agent にサブタスクを割り当て:
create_task({
  agent_type: "implementation",
  task_description: "Userモデルの作成...",
  dependencies: ["task-001"]
})
```

## 10. 実装の利点

✅ **分離**: 各エージェントが独立した Claude Code インスタンスで動作
✅ **スケーラビリティ**: エージェントを動的に追加/削除可能
✅ **可視性**: MCP Server が全タスクの状態を一元管理
✅ **信頼性**: エージェント障害時も他のエージェントは継続動作
✅ **拡張性**: 新しいエージェントタイプを容易に追加可能

## 11. 次のステップ

1. MCP Server の実装 (Python/TypeScript)
2. Claude Code 用の MCP クライアント設定ファイル作成
3. サンプルエージェントプロンプトの作成
4. ローカル環境でのテスト実行
5. ドキュメントと運用手順の整備
