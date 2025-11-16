# MCP Orchestration Server セットアップガイド

このドキュメントは、実際のセットアップ作業で得られたノウハウとトラブルシューティングをまとめたものです。

## 📋 目次

1. [環境構成](#環境構成)
2. [セットアップ手順](#セットアップ手順)
3. [トラブルシューティング](#トラブルシューティング)
4. [使用方法](#使用方法)

---

## 環境構成

### 必要なソフトウェア
- Node.js (v18以上)
- Docker Desktop
- Cursor IDE
- Redis (Dockerコンテナで実行)

### ディレクトリ構成
```
C:\Users\zeroz\Orchestrations\
├── mcp-server/              # MCPサーバー本体
│   ├── src/
│   │   └── index.ts         # メインサーバー実装
│   ├── dist/                # ビルド成果物
│   └── package.json
├── agent-workspaces/        # 各エージェントのワークスペース
│   ├── orchestrator/
│   │   └── .vscode/         # 色設定（紫）
│   ├── planning-agent/
│   │   └── .vscode/         # 色設定（青）
│   ├── implementation-agent/
│   │   └── .vscode/         # 色設定（緑）
│   └── testing-agent/
│       └── .vscode/         # 色設定（オレンジ）
└── start-agents.bat         # 起動スクリプト
```

### MCP設定ファイルの場所

**重要:** CursorでMCPを使う場合、以下の2つの設定ファイルが必要です：

1. **Cursor全体のMCP設定**
   - パス: `C:\Users\zeroz\.cursor\mcp.json`
   - 用途: Cursor IDEのグローバルMCP設定

2. **Cline拡張機能のMCP設定**
   - パス: `C:\Users\zeroz\AppData\Roaming\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`
   - 用途: Cline (Claude Dev) 拡張機能が使用するMCP設定

**両方のファイルに同じ設定が必要です。**

---

## セットアップ手順

### 1. 初回セットアップ

#### 1.1 依存関係のインストール
```bash
cd C:\Users\zeroz\Orchestrations\mcp-server
npm install
```

#### 1.2 MCPサーバーのビルド
```bash
npm run build
```

#### 1.3 Redisコンテナの起動
```bash
docker run -d --name redis-orchestration -p 6379:6379 redis:7.2-alpine
```

#### 1.4 Redis接続確認
```bash
docker exec -it redis-orchestration redis-cli PING
# 出力: PONG
```

### 2. MCP設定ファイルの作成

#### 2.1 Cursor全体のMCP設定
ファイル: `C:\Users\zeroz\.cursor\mcp.json`

```json
{
  "mcpServers": {
    "orchestration": {
      "command": "node",
      "args": ["c:\\Users\\zeroz\\Orchestrations\\mcp-server\\dist\\index.js"],
      "env": {
        "REDIS_URL": "redis://localhost:6379"
      }
    }
  }
}
```

#### 2.2 Cline拡張機能のMCP設定
ファイル: `C:\Users\zeroz\AppData\Roaming\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`

```json
{
  "mcpServers": {
    "orchestration": {
      "command": "node",
      "args": [
        "c:\\Users\\zeroz\\Orchestrations\\mcp-server\\dist\\index.js"
      ],
      "env": {
        "REDIS_URL": "redis://localhost:6379"
      }
    }
  }
}
```

### 3. ワークスペースの色設定

各エージェントのワークスペースに色を設定します。

#### Orchestrator (紫)
ファイル: `agent-workspaces\orchestrator\.vscode\settings.json`

```json
{
  "workbench.colorCustomizations": {
    "titleBar.activeBackground": "#7C3AED",
    "titleBar.activeForeground": "#FFFFFF",
    "titleBar.inactiveBackground": "#5B21B6",
    "titleBar.inactiveForeground": "#E9D5FF",
    "statusBar.background": "#7C3AED",
    "statusBar.foreground": "#FFFFFF",
    "activityBar.background": "#6D28D9",
    "activityBar.foreground": "#FFFFFF"
  },
  "window.title": "🎯 ORCHESTRATOR - ${dirty}${activeEditorShort}${separator}${rootName}"
}
```

#### Planning Agent (青)
色コード: `#0EA5E9`

#### Implementation Agent (緑)
色コード: `#10B981`

#### Testing Agent (オレンジ)
色コード: `#F59E0B`

### 4. 起動スクリプトの作成

OneDriveデスクトップに配置: `C:\Users\zeroz\OneDrive\デスクトップ\start-mcp-agents.bat`

```batch
@echo off
title MCP Orchestration Startup
echo ======================================
echo Starting MCP Orchestration Server
echo ======================================
echo.

cd /d C:\Users\zeroz\Orchestrations

echo [1/5] Checking prerequisites...

REM Check if Redis is running
docker ps | findstr redis-orchestration >nul
if %errorlevel% neq 0 (
    echo ERROR: Redis container is not running!
    pause
    exit /b 1
)
echo Redis is running

REM Check if MCP Server is built
if not exist mcp-server\dist\index.js (
    echo ERROR: MCP Server is not built!
    pause
    exit /b 1
)
echo MCP Server is built

echo.
echo [2/5] Starting MCP Server...
start "MCP Server" cmd /k "cd /d C:\Users\zeroz\Orchestrations\mcp-server && npm run dev"
timeout /t 3 /nobreak >nul
echo MCP Server started

echo.
echo [3/5] Opening Cursor windows for each agent...

echo Opening Orchestrator...
start "" cmd /c "cd /d C:\Users\zeroz\Orchestrations\agent-workspaces\orchestrator && cursor ."
timeout /t 2 /nobreak >nul

echo Opening Planning Agent...
start "" cmd /c "cd /d C:\Users\zeroz\Orchestrations\agent-workspaces\planning-agent && cursor ."
timeout /t 2 /nobreak >nul

echo Opening Implementation Agent...
start "" cmd /c "cd /d C:\Users\zeroz\Orchestrations\agent-workspaces\implementation-agent && cursor ."
timeout /t 2 /nobreak >nul

echo Opening Testing Agent...
start "" cmd /c "cd /d C:\Users\zeroz\Orchestrations\agent-workspaces\testing-agent && cursor ."
timeout /t 2 /nobreak >nul

echo.
echo [4/5] All Cursor windows opened!
echo.
echo Setup Complete!
echo.
echo Press any key to exit...
pause
```

---

## トラブルシューティング

### 問題1: バッチファイルが実行できない

**症状:**
- ダブルクリックしても一瞬でウィンドウが消える
- コマンドが認識されないエラー

**原因:**
- `@echo on` の使用によるコマンドの破損
- ファイルエンコーディングの問題

**解決方法:**
1. `@echo off` を使用する
2. `pause` コマンドでエラーメッセージを確認できるようにする
3. ファイルを再作成する（`cat` コマンドや新規作成）

```bash
# ファイルを再作成
rm "パス\to\batch.bat"
# 新規作成...
```

### 問題2: Cursorコマンドが見つからない

**症状:**
```
'cursor' は、内部コマンドまたは外部コマンド、
操作可能なプログラムまたはバッチ ファイルとして認識されていません。
```

**解決方法:**
バッチファイルで、以下の方法でCursorを起動：

```batch
# 正しい方法
start "" cmd /c "cd /d <ディレクトリパス> && cursor ."

# 間違った方法
start "" cursor "<ディレクトリパス>"
```

### 問題3: MCPツールが表示されない

**症状:**
- Cursorチャットで `@` を入力してもMCPツールが出ない
- `call_mcp_tool` で「orchestration サーバーが利用できません」

**原因:**
- MCP設定ファイルが適切な場所にない
- Clineのグローバル設定が空
- MCPサーバーが起動していない

**解決方法:**

1. **設定ファイルの確認**
   ```bash
   # 両方のファイルが存在し、正しい設定があるか確認
   C:\Users\zeroz\.cursor\mcp.json
   C:\Users\zeroz\AppData\Roaming\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json
   ```

2. **MCPサーバーの再起動**
   - MCPサーバーのコマンドウィンドウを閉じる
   - 全Cursorウィンドウを閉じる
   - `start-mcp-agents.bat` を再実行

3. **Cursorウィンドウのリロード**
   - `Ctrl+Shift+P` → `Developer: Reload Window`

4. **Clineチャットの使用**
   - 通常のCursorチャットではなく、左サイドバーのClineアイコンからチャットを開く

### 問題4: `.cursor/mcp.json` vs ワークスペース設定

**混乱ポイント:**
- 各ワークスペースに `.cursor/mcp.json` を作成すべきか？
- グローバル設定だけでいいのか？

**結論:**
**Clineのグローバル設定だけで十分です。**

以下のファイルは**不要**です（削除済み）：
```
agent-workspaces/orchestrator/.cursor/mcp.json
agent-workspaces/planning-agent/.cursor/mcp.json
agent-workspaces/implementation-agent/.cursor/mcp.json
agent-workspaces/testing-agent/.cursor/mcp.json
```

グローバル設定が全てのワークスペースで共有されます。

### 問題5: MCPサーバーの接続確認

**確認方法:**
```bash
# MCPサーバーのログを確認
# 正常な場合の出力:
Connected to Redis
MCP Orchestration Server running on stdio
```

**問題がある場合:**
- `Connected to Redis` が表示されない → Redis未起動
- プロセスが killed → 再起動が必要

### 問題6: OneDriveデスクトップのパス

**注意:**
Windows 11でOneDriveを使用している場合、デスクトップのパスは以下になります：

```
C:\Users\<ユーザー名>\OneDrive\デスクトップ
```

通常の `C:\Users\<ユーザー名>\Desktop` ではありません。

---

## 使用方法

### 起動手順

1. **Redisの起動確認**
   ```bash
   docker ps | findstr redis-orchestration
   ```

   起動していない場合：
   ```bash
   docker start redis-orchestration
   ```

2. **バッチファイルの実行**
   OneDriveデスクトップの `start-mcp-agents.bat` をダブルクリック

3. **MCPツールの確認**
   - Orchestratorウィンドウを開く
   - 左サイドバーのClineアイコンをクリック
   - 「利用可能なツールを表示して」と入力
   - `call_mcp_tool` が表示されることを確認

### MCPツールの使い方

#### 1. エージェント一覧の取得

```
call_mcp_tool を使って、サーバー名 orchestration のツール list_agents を呼び出してください
```

または

```
mcp_orchestration_list_agents を使ってエージェント一覧を取得してください
```

**出力例:**
```json
{
  "agent_id": "test-agent-1",
  "agent_type": "planning",
  "status": "idle",
  "last_heartbeat": "2025-11-15T21:29:26.317Z",
  "capabilities": ["task_planning", "architecture_design"],
  "current_task_id": null
}
```

#### 2. エージェントの登録

Planning Agentウィンドウで：

```
mcp_orchestration_register_agent を使って、以下の情報でエージェントを登録してください：
- agent_id: "planning-agent-1"
- agent_type: "planning"
- capabilities: ["task_planning", "architecture_design"]
```

#### 3. タスクの作成

Orchestratorウィンドウで：

```
mcp_orchestration_create_task を使って、以下のタスクを作成してください：
- title: "新機能の設計"
- description: "ユーザー認証機能の設計を行う"
- assigned_to: "planning-agent-1"
- priority: "high"
```

#### 4. タスクの取得

Planning Agentウィンドウで：

```
mcp_orchestration_poll_tasks を使って、planning-agent-1 のタスクを取得してください
```

#### 5. 結果の送信

タスク完了後：

```
mcp_orchestration_submit_result を使って、タスクID <task_id> の結果を送信してください：
- status: "completed"
- result: "設計書を作成しました"
```

#### 6. 共有ステートの使用

データの保存：
```
mcp_orchestration_set_shared_state を使って、キー "project_config" に値 {"version": "1.0.0"} を保存してください
```

データの取得：
```
mcp_orchestration_get_shared_state を使って、キー "project_config" の値を取得してください
```

### 利用可能なMCPツール一覧

| ツール名 | 説明 |
|---------|------|
| `mcp_orchestration_create_task` | 新しいタスクを作成し、エージェントに割り当てる |
| `mcp_orchestration_get_task_status` | タスクの実行状態を取得する |
| `mcp_orchestration_poll_tasks` | エージェントが未実行タスクを取得する |
| `mcp_orchestration_submit_result` | タスクの実行結果を送信する |
| `mcp_orchestration_list_agents` | 登録されている全エージェントの状態を取得する |
| `mcp_orchestration_register_agent` | 新しいエージェントを登録する |
| `mcp_orchestration_get_shared_state` | 共有ステートストアからデータを取得する |
| `mcp_orchestration_set_shared_state` | 共有ステートストアにデータを保存する |

---

## ベストプラクティス

### 1. ワークフロー

```
┌─────────────────┐
│  Orchestrator   │ ← タスク作成・管理
│   (Purple)      │
└────────┬────────┘
         │
    ┌────┴────┐
    │  Tasks  │
    └────┬────┘
         │
    ┌────┴────────────────────┐
    │                         │
┌───▼────────┐    ┌──────────▼──┐
│  Planning  │    │ Implementa- │
│   Agent    │───▶│  tion Agent │
│   (Blue)   │    │   (Green)   │
└────────────┘    └──────┬──────┘
                         │
                    ┌────▼────┐
                    │ Testing │
                    │  Agent  │
                    │(Orange) │
                    └─────────┘
```

### 2. エージェントの役割分担

- **Orchestrator**: タスク作成、進捗管理、結果の集約
- **Planning Agent**: タスクの設計、アーキテクチャ決定
- **Implementation Agent**: コード実装
- **Testing Agent**: テスト実行、品質確認

### 3. エラーハンドリング

各エージェントで以下を実装すべき：

```javascript
// タスク実行時のエラーハンドリング例
try {
  // タスク実行
  const result = await executeTask(task);

  // 成功時
  await submitResult(taskId, {
    status: "completed",
    result: result
  });
} catch (error) {
  // 失敗時
  await submitResult(taskId, {
    status: "failed",
    error: error.message
  });
}
```

---

## よくある質問

### Q1: MCPサーバーはAPIクレジットを消費しますか？

**A:** いいえ。MCPサーバー自体はローカルで動作し、クレジットを消費しません。CursorのClineチャット機能を使う際のみ、Cursor Proのプラン内でクレジットが消費されます。

### Q2: 複数のCursorウィンドウを同時に使うとクレジットは倍消費されますか？

**A:** いいえ。各ウィンドウで独立してチャットを使った場合のみ消費されます。MCPサーバーを通じた通信自体はクレジットを消費しません。

### Q3: エージェント間で直接通信できますか？

**A:** いいえ。全ての通信はMCPサーバー（Redis）を経由します。これにより、タスクの追跡と管理が容易になります。

### Q4: Dockerが起動していない場合はどうなりますか？

**A:** `start-mcp-agents.bat` がエラーを表示して停止します。Docker Desktopを起動してから再実行してください。

### Q5: MCPサーバーのログはどこで確認できますか？

**A:** バッチファイル実行時に開く「MCP Server」という名前のコマンドウィンドウで確認できます。

---

## まとめ

### セットアップ完了チェックリスト

- [ ] Node.js インストール済み
- [ ] Docker Desktop インストール・起動済み
- [ ] Redis コンテナ起動済み (`docker ps` で確認)
- [ ] MCP Server ビルド済み (`mcp-server/dist/index.js` 存在)
- [ ] `~/.cursor/mcp.json` 設定済み
- [ ] `cline_mcp_settings.json` 設定済み
- [ ] ワークスペースの色設定完了 (4つのエージェント)
- [ ] `start-mcp-agents.bat` 実行成功
- [ ] Clineチャットで `mcp_orchestration_*` ツールが使える

### トラブル時の確認順序

1. Redis起動確認: `docker ps | findstr redis-orchestration`
2. MCPサーバービルド確認: `ls mcp-server/dist/index.js`
3. MCP設定ファイル確認: 2つのファイルの内容を確認
4. Cursorウィンドウのリロード: `Developer: Reload Window`
5. Clineチャットで確認: 「利用可能なツールを表示して」

---

**作成日:** 2025-11-16
**最終更新:** 2025-11-16
**バージョン:** 1.0.0
