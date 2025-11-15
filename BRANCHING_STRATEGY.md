# ブランチ戦略とワークフロー

このプロジェクトでは、マルチエージェント開発に最適化された **Git Flow ベース** のブランチ戦略を採用します。

## 🌳 ブランチ構造

```
main (本番環境)
  ↑
develop (開発統合)
  ↑
  ├── feature/user-auth (新機能)
  ├── feature/task-queue (新機能)
  ├── bugfix/redis-connection (バグ修正)
  └── refactor/agent-protocol (リファクタリング)
```

## 📋 ブランチの種類

### 1. `main` ブランチ
- **目的**: 本番環境にデプロイされる安定版
- **保護**: 直接コミット禁止
- **マージ元**: `develop` ブランチのみ
- **命名**: `main`

### 2. `develop` ブランチ
- **目的**: 開発の統合ブランチ
- **保護**: 直接コミットは推奨されない (PRを推奨)
- **マージ元**: `feature/*`, `bugfix/*`, `refactor/*`
- **命名**: `develop`

### 3. `feature/*` ブランチ
- **目的**: 新機能の開発
- **起点**: `develop`
- **マージ先**: `develop`
- **命名規則**: `feature/<機能名>`
- **例**:
  - `feature/user-authentication`
  - `feature/planning-agent-improvements`
  - `feature/websocket-support`

### 4. `bugfix/*` ブランチ
- **目的**: バグの修正
- **起点**: `develop`
- **マージ先**: `develop`
- **命名規則**: `bugfix/<バグ内容>`
- **例**:
  - `bugfix/redis-connection-timeout`
  - `bugfix/task-queue-deadlock`

### 5. `hotfix/*` ブランチ
- **目的**: 本番環境の緊急修正
- **起点**: `main`
- **マージ先**: `main` と `develop` の両方
- **命名規則**: `hotfix/<修正内容>`
- **例**:
  - `hotfix/critical-security-patch`

### 6. `refactor/*` ブランチ
- **目的**: コードのリファクタリング
- **起点**: `develop`
- **マージ先**: `develop`
- **命名規則**: `refactor/<対象>`
- **例**:
  - `refactor/agent-communication-protocol`

## 🔄 開発ワークフロー

### 標準的な機能開発フロー

```bash
# 1. develop ブランチを最新に更新
git checkout develop
git pull origin develop

# 2. 新しい feature ブランチを作成
git checkout -b feature/user-authentication

# 3. 開発作業を行う
# ... コードを書く ...

# 4. コミット
git add .
git commit -m "feat: Implement user authentication endpoints"

# 5. リモートにプッシュ
git push -u origin feature/user-authentication

# 6. GitHub でプルリクエストを作成
gh pr create --base develop --title "feat: User authentication" --body "Implements user authentication with JWT"

# 7. レビュー後、develop にマージ
# (GitHub UI または gh pr merge で実行)

# 8. ローカルのブランチを削除
git checkout develop
git pull origin develop
git branch -d feature/user-authentication
```

### マルチエージェント並列開発フロー

複数のエージェントが同時に異なる機能を開発する場合:

```bash
# Agent 1: Planning Agent が計画を作成
git checkout -b feature/payment-system develop

# Agent 2: Implementation Agent (Backend) が実装
git checkout -b feature/payment-backend develop

# Agent 3: Implementation Agent (Frontend) が実装
git checkout -b feature/payment-frontend develop

# Agent 4: Testing Agent がテストを作成
git checkout -b feature/payment-tests develop
```

**並列開発時の注意**:
- 共有ファイルの同時編集を避ける
- 依存関係を明確にする
- 定期的に `develop` から最新を取り込む

```bash
# 定期的に develop の変更を取り込む
git checkout feature/payment-backend
git pull origin develop
git merge develop
```

## 🚀 リリースフロー

### 通常リリース

```bash
# 1. develop から main にマージするPRを作成
git checkout develop
git pull origin develop

gh pr create --base main --title "Release v1.1.0" --body "Release notes..."

# 2. PR レビュー後、main にマージ

# 3. タグを作成
git checkout main
git pull origin main
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0

# 4. GitHub Release を作成
gh release create v1.1.0 --title "v1.1.0" --notes "Release notes..."
```

### ホットフィックス (緊急修正)

```bash
# 1. main から hotfix ブランチを作成
git checkout main
git pull origin main
git checkout -b hotfix/security-patch

# 2. 修正を実装
git add .
git commit -m "fix: Apply security patch for CVE-2025-XXXX"

# 3. main にマージ
git push -u origin hotfix/security-patch
gh pr create --base main --title "hotfix: Security patch"

# 4. develop にもマージ
git checkout develop
git merge hotfix/security-patch
git push origin develop

# 5. タグを作成
git checkout main
git pull origin main
git tag -a v1.0.1 -m "Hotfix v1.0.1"
git push origin v1.0.1
```

## 📏 コミットメッセージ規約

### Conventional Commits 準拠

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type の種類

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント変更
- `style`: コードフォーマット (機能変更なし)
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: ビルド、補助ツールの変更

### 例

```bash
# 新機能
git commit -m "feat(orchestrator): Add task priority queue"

# バグ修正
git commit -m "fix(redis): Handle connection timeout gracefully"

# ドキュメント
git commit -m "docs: Update installation guide for Windows"

# リファクタリング
git commit -m "refactor(agent): Extract common protocol logic"

# テスト
git commit -m "test(planning-agent): Add unit tests for task decomposition"
```

### 複数行のコミットメッセージ

```bash
git commit -m "$(cat <<'EOF'
feat(orchestrator): Add task priority queue

- Implement priority-based task scheduling
- Add priority field to Task schema
- Update Redis queue to support priorities

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

## 🛡️ ブランチ保護ルール

### GitHub でのブランチ保護設定

#### `main` ブランチ

1. Settings → Branches → Add rule
2. Branch name pattern: `main`
3. 有効化する設定:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (1以上)
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Do not allow bypassing the above settings

#### `develop` ブランチ

1. Settings → Branches → Add rule
2. Branch name pattern: `develop`
3. 有効化する設定:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging (CI設定後)

## 🔍 プルリクエスト規約

### PRテンプレート

PRを作成する際は、以下の情報を含める:

```markdown
## 概要
この PR の目的を簡潔に説明

## 変更内容
- 変更点1
- 変更点2

## テスト
- [ ] ローカルでテスト済み
- [ ] 既存のテストが通る
- [ ] 新しいテストを追加した

## チェックリスト
- [ ] コーディング規約に準拠
- [ ] ドキュメントを更新した
- [ ] CHANGELOG を更新した (リリース時)

## 関連 Issue
Closes #123
```

### PR作成コマンド

```bash
# テンプレートを使ってPR作成
gh pr create --template

# または直接指定
gh pr create \
  --base develop \
  --title "feat: Add WebSocket support" \
  --body "Implements real-time task notifications via WebSocket"
```

## 📊 ブランチ管理のベストプラクティス

### ✅ 推奨事項

1. **小さく、頻繁にコミット**: 1つのコミットは1つの論理的な変更
2. **定期的にdevelopと同期**: コンフリクトを早期に解決
3. **作業前にissueを作成**: 作業内容を明確化
4. **PRは小さく保つ**: レビューしやすい単位で分割
5. **ブランチは短命に**: 長期間のブランチは避ける

### ❌ 避けるべきこと

1. **mainへの直接コミット**: 常にPR経由
2. **巨大なPR**: 複数の機能を1つのPRにまとめない
3. **コミットメッセージの手抜き**: "fix", "update" だけは避ける
4. **未完成のコードをpush**: 常に動作するコードを維持
5. **コンフリクトの放置**: 早めに解決する

## 🤝 マルチエージェント協調開発のルール

### 1. タスク分担の明確化

```bash
# Orchestrator が Issue を作成
gh issue create --title "Implement user authentication" --body "..."

# Planning Agent が実装計画を作成し、サブタスクに分解
# → Issue にコメントで計画を追加

# 各 Implementation Agent がサブタスクごとにブランチを作成
git checkout -b feature/auth-backend develop
git checkout -b feature/auth-frontend develop
```

### 2. 依存関係の管理

```yaml
# .github/workflows/dependency-check.yml
# PRの依存関係をチェック
name: Check Dependencies

on: pull_request

jobs:
  check-deps:
    runs-on: ubuntu-latest
    steps:
      - name: Check if base branch is up to date
        run: |
          # develop が最新か確認
```

### 3. コンフリクト解決戦略

```bash
# コンフリクトが発生した場合
git checkout feature/my-feature
git pull origin develop
git merge develop

# コンフリクトを解決
# ... 手動で修正 ...

git add .
git commit -m "merge: Resolve conflicts with develop"
git push
```

## 📝 CHANGELOG の管理

### フォーマット

```markdown
# Changelog

## [Unreleased]
### Added
- New feature X
### Changed
- Modified behavior Y
### Fixed
- Bug fix Z

## [1.0.0] - 2025-01-16
### Added
- Initial release
```

### 自動生成

```bash
# GitHub CLI で自動生成
gh release create v1.1.0 --generate-notes
```

## 🎯 まとめ

このブランチ戦略により:

- ✅ 複数のエージェントが並行して作業可能
- ✅ 本番環境 (`main`) の安定性を保証
- ✅ コードレビューを強制
- ✅ 変更履歴が追跡可能
- ✅ いつでもロールバック可能

次のステップ: [develop ブランチの作成](#develop-ブランチの初期設定)
