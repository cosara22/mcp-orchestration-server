# MCP Orchestration Server プロジェクト概要

## プロジェクトの目的
複数の Claude Code エージェントを連携させ、複雑なタスクを自律的に実行するためのオーケストレーションサーバーです。
MCP (Model Context Protocol) を使用して、Orchestrator Agent が Planning, Implementation, Testing などの専門エージェントを管理します。

## アーキテクチャ
- **Orchestrator Agent (Cursor/Claude Code)**: ユーザーからの指示を受け、タスクを作成・管理します。
- **MCP Orchestration Server**: Redis をバックエンドに使用し、タスクキューとエージェントの状態管理を行います。
- **Sub-Agents**:
    - **Planning Agent**: タスクを分析し、実装計画を策定します。
    - **Implementation Agent**: コードの実装を行います。
    - **Testing Agent**: テストコードを作成・実行します。

## 主要コンポーネント
- `mcp-server/`: MCP サーバーの実装 (Node.js/TypeScript)。
    - `src/index.ts`: サーバーのエントリーポイント。Redis 接続と MCP ツール定義が含まれます。
- `agent-workspaces/`: 各エージェントの作業ディレクトリ。
- `claude-code-configs/`: 各エージェント用の MCP 設定ファイル。

## 現在の状態
- 基本的な MCP サーバー機能 (`create_task`, `poll_tasks` 等) は実装済み。
- Redis を使用したタスクキューと状態管理が動作。
- ローカル環境での実行を想定 (Windows 用のセットアップスクリプトあり)。

## 次のステップ (ドキュメントより)
- Redis Pub/Sub によるリアルタイム通知
- エージェント認証・認可
- Web UI ダッシュボード
