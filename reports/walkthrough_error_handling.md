# Walkthrough - Error Handling & Resilience

## 変更内容
MCP Orchestration Server に以下の回復性機能を追加しました。

1.  **タスク再試行 (Retry Logic)**
    *   タスクが `failed` ステータスで報告された場合、`max_retries` (デフォルト3回) に達するまで自動的に再試行します。
    *   再試行時は `retry_count` がインクリメントされ、タスクはキューの先頭に戻されます（即時再試行）。

2.  **デッドレターキュー (DLQ)**
    *   最大再試行回数を超えて失敗したタスクは、`queue:dead-letter` に移動されます。
    *   新しいツール `get_dead_letter_tasks` で DLQ の内容を確認できます。

3.  **タイムアウト監視 (Timeout Monitoring)**
    *   バックグラウンドプロセスが 60秒ごとに実行中のタスクをチェックします。
    *   `started_at` から `timeout_seconds` (デフォルト300秒) 以上経過したタスクは、自動的に `failed` (タイムアウトエラー) として処理され、再試行ロジックが適用されます。

## 検証方法

### 1. ビルド確認
```bash
cd mcp-server
npm run build
```
正常にビルドが完了することを確認済みです。

### 2. 動作確認手順 (手動)

#### 再試行ロジックの確認
1.  Orchestrator でタスクを作成: `create_task({ ..., max_retries: 2 })`
2.  Agent でタスクを取得: `poll_tasks(...)`
3.  Agent で失敗を報告: `submit_result({ status: "failed", ... })`
4.  Redis または `get_task_status` で確認:
    *   Status が `pending` に戻っていること
    *   `retry_count` が 1 になっていること
5.  3回失敗させると、Status が `failed` になり、DLQ に入ることを確認。

#### タイムアウトの確認
1.  Orchestrator でタスクを作成: `create_task({ ..., timeout_seconds: 10 })`
2.  Agent でタスクを取得: `poll_tasks(...)`
3.  10秒以上待機（何もしない）
4.  サーバーログに "Task timed out" が表示され、タスクが再試行（または失敗）扱いになることを確認。

#### DLQ の確認
1.  Orchestrator で `get_dead_letter_tasks()` を実行。
2.  失敗したタスクのリストが返されることを確認。
