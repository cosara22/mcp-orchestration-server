# エージェント別ワークスペース設定

各エージェント用の Cursor/VSCode ウィンドウを視覚的に区別するための設定ファイルです。

## 🎨 色分けスキーム

| エージェント | 色 | アイコン | タイトルバー色 |
|------------|-----|---------|--------------|
| **Orchestrator** | 紫 (Purple) | 🎯 | `#7C3AED` |
| **Planning Agent** | 青 (Blue) | 📋 | `#0EA5E9` |
| **Implementation Agent** | 緑 (Green) | ⚙️ | `#10B981` |
| **Testing Agent** | オレンジ (Orange) | 🧪 | `#F59E0B` |

## 📁 使い方

### 方法1: ワークスペースフォルダを開く (推奨)

各エージェント用に専用のフォルダを作成し、そこで Cursor を起動します。

```bash
# 1. 各エージェント用のプロジェクトフォルダを作成
mkdir orchestrator-workspace
mkdir planning-agent-workspace
mkdir implementation-agent-workspace
mkdir testing-agent-workspace

# 2. 設定ファイルをコピー
xcopy workspace-configs\orchestrator\.vscode orchestrator-workspace\.vscode /E /I
xcopy workspace-configs\planning-agent\.vscode planning-agent-workspace\.vscode /E /I
xcopy workspace-configs\implementation-agent\.vscode implementation-agent-workspace\.vscode /E /I
xcopy workspace-configs\testing-agent\.vscode testing-agent-workspace\.vscode /E /I

# 3. 各フォルダで Cursor を起動
cd orchestrator-workspace && code .
cd planning-agent-workspace && code .
cd implementation-agent-workspace && code .
cd testing-agent-workspace && code .
```

### 方法2: 既存プロジェクトに設定を追加

既存のプロジェクトフォルダに `.vscode/settings.json` を追加します。

**例: プロジェクトで Orchestrator を使う場合**

```bash
cd c:\path\to\your\project
xcopy c:\Users\zeroz\Orchestrations\workspace-configs\orchestrator\.vscode .vscode /E /I
```

## 🔧 MCP 設定の追加

色分け設定に加えて、MCP サーバーの設定も必要です。

### Cursor の場合

**設定場所**: `C:\Users\<YourName>\AppData\Roaming\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`

各エージェントの Cursor ウィンドウで、以下の設定を追加:

**Orchestrator ウィンドウ:**
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

**Planning Agent ウィンドウ:**
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

(他のエージェントも同様)

## 🎯 完全なセットアップ手順

### ステップ1: ワークスペースフォルダを準備

```bash
cd c:\Users\zeroz\Orchestrations

# 各エージェント用のフォルダを作成
mkdir agent-workspaces\orchestrator
mkdir agent-workspaces\planning-agent
mkdir agent-workspaces\implementation-agent
mkdir agent-workspaces\testing-agent

# 設定をコピー
xcopy workspace-configs\orchestrator\.vscode agent-workspaces\orchestrator\.vscode /E /I
xcopy workspace-configs\planning-agent\.vscode agent-workspaces\planning-agent\.vscode /E /I
xcopy workspace-configs\implementation-agent\.vscode agent-workspaces\implementation-agent\.vscode /E /I
xcopy workspace-configs\testing-agent\.vscode agent-workspaces\testing-agent\.vscode /E /I
```

### ステップ2: 各ワークスペースで Cursor を起動

**Orchestrator (紫色):**
```bash
cd agent-workspaces\orchestrator
code .
```

**Planning Agent (青色):**
```bash
cd agent-workspaces\planning-agent
code .
```

**Implementation Agent (緑色):**
```bash
cd agent-workspaces\implementation-agent
code .
```

**Testing Agent (オレンジ色):**
```bash
cd agent-workspaces\testing-agent
code .
```

### ステップ3: 各ウィンドウで MCP 設定を追加

各 Cursor ウィンドウで:
1. `Ctrl+Shift+P` → "Preferences: Open User Settings (JSON)"
2. または Claude Dev の設定から MCP サーバーを追加
3. 該当する設定ファイルの内容を追加

## 🖼️ 視覚的な確認

正しく設定されると、各ウィンドウは以下のように表示されます:

```
┌────────────────────────────────────┐
│ 🎯 ORCHESTRATOR - file.py          │ ← 紫色
├────────────────────────────────────┤
│ [ファイルエクスプローラー]          │
│                                    │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ 📋 PLANNING AGENT - plan.md        │ ← 青色
├────────────────────────────────────┤
│ [ファイルエクスプローラー]          │
│                                    │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ ⚙️ IMPLEMENTATION AGENT - code.py  │ ← 緑色
├────────────────────────────────────┤
│ [ファイルエクスプローラー]          │
│                                    │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ 🧪 TESTING AGENT - test.py         │ ← オレンジ色
├────────────────────────────────────┤
│ [ファイルエクスプローラー]          │
│                                    │
└────────────────────────────────────┘
```

## 🎨 カスタマイズ

色を変更したい場合は、各 `.vscode/settings.json` の色コードを編集してください。

**カラーパレット参考:**
- 赤: `#EF4444`
- ピンク: `#EC4899`
- 紫: `#7C3AED`
- 青: `#0EA5E9`
- 緑: `#10B981`
- 黄: `#F59E0B`
- グレー: `#6B7280`

## 📝 注意事項

- Cursor を再起動すると設定が反映されます
- タイトルバーの色はテーマ (ダークモード/ライトモード) によって見え方が変わる場合があります
- Windows でタイトルバーの色が表示されない場合は、Windows の設定で「タイトルバーとウィンドウの境界線にアクセントカラーを表示する」を有効にしてください
