# エージェント間通信プロトコル定義

## 1. 通信パターン

### 1.1 Orchestrator → サブエージェント
```
Orchestrator が MCP Tool を使用してタスクを作成
  ↓
MCP Server が Redis キューにタスクを追加
  ↓
サブエージェントが poll_tasks でタスクを取得
  ↓
サブエージェントがタスクを実行
  ↓
サブエージェントが submit_result で結果を報告
  ↓
Orchestrator が get_task_status で結果を確認
```

### 1.2 サブエージェント間の間接通信
```
Agent A が set_shared_state で共有データを保存
  ↓
Agent B が get_shared_state で共有データを取得
```

## 2. メッセージフォーマット

### 2.1 タスク作成メッセージ

**Orchestrator → MCP Server**

```json
{
  "tool": "create_task",
  "arguments": {
    "agent_type": "planning",
    "task_description": "ユーザー認証機能の実装計画を作成してください。FastAPI + PostgreSQL を使用します。",
    "context": {
      "project_path": "c:\\Users\\zeroz\\my-project",
      "tech_stack": ["Python", "FastAPI", "PostgreSQL", "React"],
      "requirements": [
        "ユーザー登録機能",
        "ログイン機能 (JWT認証)",
        "パスワードリセット機能"
      ]
    },
    "dependencies": []
  }
}
```

**応答**
```json
{
  "task_id": "task-1705401234567-abc123",
  "agent_type": "planning",
  "status": "pending",
  "created_at": "2025-01-16T10:00:34.567Z",
  "updated_at": "2025-01-16T10:00:34.567Z",
  "assigned_agent_id": null,
  "task_description": "ユーザー認証機能の実装計画を作成してください...",
  "context": { ... },
  "dependencies": [],
  "result": null,
  "error": null
}
```

### 2.2 タスク取得メッセージ

**サブエージェント → MCP Server**

```json
{
  "tool": "poll_tasks",
  "arguments": {
    "agent_id": "planning-agent-001",
    "max_tasks": 1
  }
}
```

**応答**
```json
[
  {
    "task_id": "task-1705401234567-abc123",
    "agent_type": "planning",
    "status": "in_progress",
    "assigned_agent_id": "planning-agent-001",
    "task_description": "...",
    "context": { ... }
  }
]
```

### 2.3 結果報告メッセージ

**サブエージェント → MCP Server**

```json
{
  "tool": "submit_result",
  "arguments": {
    "task_id": "task-1705401234567-abc123",
    "status": "completed",
    "result": {
      "execution_plan": {
        "plan_id": "plan-12345",
        "tasks": [
          {
            "task_id": "subtask-001",
            "description": "User モデルの作成 (SQLAlchemy)",
            "agent_type": "implementation",
            "estimated_time": "2h",
            "dependencies": []
          },
          {
            "task_id": "subtask-002",
            "description": "/register エンドポイントの実装",
            "agent_type": "implementation",
            "estimated_time": "3h",
            "dependencies": ["subtask-001"]
          },
          {
            "task_id": "subtask-003",
            "description": "/login エンドポイントの実装 (JWT発行)",
            "agent_type": "implementation",
            "estimated_time": "3h",
            "dependencies": ["subtask-001"]
          },
          {
            "task_id": "subtask-004",
            "description": "認証テストの作成",
            "agent_type": "testing",
            "estimated_time": "4h",
            "dependencies": ["subtask-002", "subtask-003"]
          }
        ]
      },
      "risk_assessment": "- データベースマイグレーションの失敗リスク: 事前にバックアップを推奨\n- JWT秘密鍵の管理: 環境変数で管理すること",
      "recommendations": "- パスワードハッシュ化には bcrypt を使用\n- レート制限を追加してブルートフォース攻撃を防止"
    }
  }
}
```

失敗時:
```json
{
  "tool": "submit_result",
  "arguments": {
    "task_id": "task-1705401234567-abc123",
    "status": "failed",
    "error": "タスクの依存関係に循環参照が検出されました"
  }
}
```

### 2.4 共有ステート操作

**保存**
```json
{
  "tool": "set_shared_state",
  "arguments": {
    "key": "project:database_schema",
    "value": {
      "tables": {
        "users": {
          "columns": ["id", "email", "password_hash", "created_at"]
        }
      }
    },
    "ttl": 7200
  }
}
```

**取得**
```json
{
  "tool": "get_shared_state",
  "arguments": {
    "key": "project:database_schema"
  }
}
```

## 3. エージェントライフサイクル

### 3.1 起動シーケンス

1. **エージェント登録**
```json
{
  "tool": "register_agent",
  "arguments": {
    "agent_id": "planning-agent-001",
    "agent_type": "planning",
    "capabilities": ["task_decomposition", "dependency_analysis", "risk_assessment"]
  }
}
```

2. **ポーリングループ開始**
```
while (true) {
  tasks = poll_tasks({agent_id: "planning-agent-001", max_tasks: 1})
  if (tasks.length > 0) {
    executeTask(tasks[0])
  }
  wait(5000) // 5秒待機
}
```

3. **タスク実行**
```
task = pollされたタスク
result = processTask(task)
submit_result({
  task_id: task.task_id,
  status: "completed",
  result: result
})
```

### 3.2 シャットダウンシーケンス

1. 現在実行中のタスクを完了
2. エージェントステータスを "offline" に更新
3. Redis接続をクローズ

## 4. エラーハンドリング

### 4.1 タスク実行失敗

```typescript
try {
  const result = await executeTask(task);
  await submitResult({
    task_id: task.task_id,
    status: "completed",
    result: result
  });
} catch (error) {
  await submitResult({
    task_id: task.task_id,
    status: "failed",
    error: error.message
  });
}
```

### 4.2 MCP Server 接続エラー

- **リトライ戦略**: 指数バックオフ (1s, 2s, 4s, 8s, ...)
- **最大リトライ回数**: 5回
- **タイムアウト**: 30秒

### 4.3 Redis 接続エラー

- MCP Server がRedisへの再接続を試みる
- クライアント側では MCP Tool の呼び出しが失敗として返る
- エージェントはエラーログを記録し、一定時間後に再試行

## 5. セキュリティ

### 5.1 認証

現在の実装では認証なし（ローカル開発用）

**本番環境向けの拡張案:**
```json
{
  "tool": "register_agent",
  "arguments": {
    "agent_id": "planning-agent-001",
    "api_key": "sk-agent-xxxxxxxxxxxxxxxx",
    ...
  }
}
```

### 5.2 認可

- エージェントタイプごとに使用可能なツールを制限
- Orchestrator のみが `create_task` を呼び出せる設定を追加可能

### 5.3 データ検証

- Zod スキーマによる入力検証
- 不正なデータは即座に拒否

## 6. パフォーマンス最適化

### 6.1 ポーリング最適化

**現在**: 固定間隔ポーリング (5秒)

**改善案**: Redis Pub/Sub を使用した Push 通知
```typescript
// タスク作成時
await redis.publish('task:planning', task_id);

// エージェント側
redis.subscribe('task:planning', (message) => {
  const task_id = message;
  fetchAndExecuteTask(task_id);
});
```

### 6.2 バッチ処理

複数タスクの一括取得:
```json
{
  "tool": "poll_tasks",
  "arguments": {
    "agent_id": "implementation-agent-001",
    "max_tasks": 3
  }
}
```

## 7. 監視とデバッグ

### 7.1 ログフォーマット

**構造化ログ (JSON)**
```json
{
  "timestamp": "2025-01-16T10:00:00.000Z",
  "level": "info",
  "agent_id": "planning-agent-001",
  "event": "task_completed",
  "task_id": "task-1705401234567-abc123",
  "duration_ms": 12345,
  "metadata": {
    "subtasks_created": 4
  }
}
```

### 7.2 トレーシング

- 各タスクに `correlation_id` を付与
- 一連のタスクチェーンを追跡可能に

```json
{
  "task_id": "task-001",
  "correlation_id": "req-12345",
  "parent_task_id": null
}

{
  "task_id": "subtask-001",
  "correlation_id": "req-12345",
  "parent_task_id": "task-001"
}
```

## 8. 実装例

### 8.1 Orchestrator の使用例

```markdown
# Cursor/Claude Code で実行

ユーザー: "ユーザー認証機能を実装してください"

Claude Code の思考:
1. Planning Agent にタスクを作成する
2. タスクの完了を待つ
3. 計画を確認して次のステップを実行

Claude Code の実行:
- create_task を呼び出す
- タスクIDを取得
- get_task_status で定期的に状態をチェック
- 完了したら結果を取得して次のタスクを作成
```

### 8.2 Planning Agent の動作例

```markdown
# 別の Cursor ウィンドウで Planning Agent として起動

起動時:
1. register_agent でエージェント登録
2. poll_tasks のポーリングループ開始

タスク受信時:
1. タスクの内容を分析
2. comprehensive_orchestration_guide.md の指示に従って計画を立てる
3. 実行計画を JSON 形式で生成
4. submit_result で結果を報告
```

## 9. トラブルシューティング

### 9.1 タスクが取得できない

**原因**:
- エージェントが登録されていない
- 間違った agent_type のキューを確認している

**解決策**:
```
1. list_agents でエージェントが登録されているか確認
2. agent_type が正しいか確認
```

### 9.2 Redis 接続エラー

**原因**:
- Redis が起動していない
- 接続URLが間違っている

**解決策**:
```bash
# Redis を起動
docker-compose up -d redis

# 接続確認
redis-cli ping
# 応答: PONG
```

### 9.3 MCP Server が応答しない

**原因**:
- MCP Server が起動していない
- ビルドされていない

**解決策**:
```bash
cd mcp-server
npm install
npm run build
npm run dev
```
