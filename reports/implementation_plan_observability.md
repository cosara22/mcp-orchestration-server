# 実装計画 - 観測性 (Observability)

## 目標
MCP Orchestration Server の稼働状況、パフォーマンス、エラー発生状況を可視化するための仕組みを導入します。
具体的には、構造化ロギング、メトリクス収集、およびリクエスト追跡（トレーシング）の実装を行います。

## ユーザーレビューが必要な事項
> [!NOTE]
> 新たに `winston` (ロギング) と `prom-client` (メトリクス) のパッケージ依存関係を追加します。
> メトリクス確認のために、別途 Prometheus サーバーの立ち上げが必要になる場合があります（本計画ではエンドポイントの実装までを範囲とします）。

## 提案される変更

### mcp-server

#### [MODIFY] [package.json](file:///c:/Users/zeroz/Orchestrations/mcp-server/package.json)
- `winston`: 構造化ロギング用
- `prom-client`: Prometheus メトリクス収集用
- `uuid`: トレースID生成用 (もし未導入なら)

#### [NEW] [src/logger.ts](file:///c:/Users/zeroz/Orchestrations/mcp-server/src/logger.ts)
- Winston を使用したロガー設定。
- コンソール出力およびファイル出力を設定（JSON形式）。
- ログレベルの設定 (INFO, ERROR, DEBUG)。

#### [NEW] [src/metrics.ts](file:///c:/Users/zeroz/Orchestrations/mcp-server/src/metrics.ts)
- `prom-client` のレジストリ初期化。
- 主要メトリクスの定義:
    - `mcp_task_created_total`: 作成されたタスク総数 (Counter)
    - `mcp_task_completed_total`: 完了したタスク総数 (Counter)
    - `mcp_task_failed_total`: 失敗したタスク総数 (Counter)
    - `mcp_task_duration_seconds`: タスク処理時間 (Histogram)
    - `mcp_active_agents`: アクティブなエージェント数 (Gauge)

#### [MODIFY] [src/index.ts](file:///c:/Users/zeroz/Orchestrations/mcp-server/src/index.ts)
1.  **ロガーの統合**: `console.log/error` を `logger.info/error` に置き換え。
2.  **メトリクスの計測**:
    - `create_task`: `mcp_task_created_total` をインクリメント。
    - `submit_result`: ステータスに応じて `mcp_task_completed_total` または `mcp_task_failed_total` をインクリメント。処理時間を `mcp_task_duration_seconds` に記録。
    - `register_agent`: `mcp_active_agents` を更新。
3.  **トレースIDの導入**:
    - `Task` インターフェースに `trace_id` を追加。
    - ログ出力時に `trace_id` を含めることで、タスクのライフサイクルを追跡可能にする。
4.  **メトリクスサーバーの追加**:
    - 別ポート (例: 9090) で Express サーバー等を立ち上げ、`/metrics` エンドポイントでメトリクスを公開する（または既存のサーバーに機能追加が可能か検討するが、MCPはstdio通信が主なので別ポートが望ましい）。

## 検証計画

### 自動テスト
- メトリクスエンドポイントが正しいフォーマットでデータを返すか確認するテストスクリプトを作成。

### 手動検証
1.  **ログ確認**:
    - タスク作成・実行を行い、ログが JSON 形式で `trace_id` 付きで出力されることを確認。
2.  **メトリクス確認**:
    - ブラウザまたは curl で `http://localhost:9090/metrics` にアクセス。
    - タスク実行後にカウンタが増加していることを確認。
