# ブランチ保護ルールの設定手順

GitHub のブランチ保護機能を使用して、`main` と `develop` ブランチへの不正なマージを防ぎます。

## 🛡️ 設定するブランチ

1. **`main`** - 本番環境ブランチ (厳格な保護)
2. **`develop`** - 開発統合ブランチ (中程度の保護)

## 📋 設定手順

### 前提条件

- リポジトリの管理者権限が必要
- GitHub リポジトリ: https://github.com/cosara22/mcp-orchestration-server

---

## 🔐 1. `main` ブランチの保護設定

### Web UI での設定

1. **リポジトリページにアクセス**
   - https://github.com/cosara22/mcp-orchestration-server

2. **Settings タブをクリック**

3. **左サイドバーの「Branches」をクリック**

4. **「Add rule」ボタンをクリック**

5. **Branch name pattern を設定**
   ```
   main
   ```

6. **以下のオプションを有効化**

   #### ✅ Protect matching branches

   - [x] **Require a pull request before merging**
     - [x] Require approvals: **1** (最低1人の承認が必要)
     - [x] Dismiss stale pull request approvals when new commits are pushed
     - [x] Require review from Code Owners (オプション)

   - [x] **Require status checks to pass before merging**
     - [x] Require branches to be up to date before merging
     - Status checks to require:
       - `build-and-test` (CI ワークフローが実行された後に表示)
       - `lint`

   - [x] **Require conversation resolution before merging**
     (すべてのコメントが解決されるまでマージ不可)

   - [x] **Require signed commits** (オプション、推奨)

   - [x] **Require linear history** (オプション)
     (マージコミットを禁止し、rebase または squash のみ許可)

   - [x] **Do not allow bypassing the above settings**
     (管理者も含めて全員がルールに従う)

   - [ ] Allow force pushes (無効のまま)
   - [ ] Allow deletions (無効のまま)

7. **「Create」ボタンをクリック**

### GitHub CLI での設定

```bash
# main ブランチの保護を設定
gh api repos/cosara22/mcp-orchestration-server/branches/main/protection \
  --method PUT \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field required_status_checks='{"strict":true,"contexts":["build-and-test","lint"]}' \
  --field enforce_admins=true \
  --field required_conversation_resolution=true \
  --field restrictions=null
```

---

## 🔓 2. `develop` ブランチの保護設定

### Web UI での設定

1. **「Add rule」ボタンをクリック** (再度)

2. **Branch name pattern を設定**
   ```
   develop
   ```

3. **以下のオプションを有効化** (`main` より緩い設定)

   #### ✅ Protect matching branches

   - [x] **Require a pull request before merging**
     - [x] Require approvals: **0** (レビューは推奨だが必須ではない)
     - [ ] Dismiss stale pull request approvals when new commits are pushed

   - [x] **Require status checks to pass before merging**
     - [x] Require branches to be up to date before merging
     - Status checks to require:
       - `build-and-test`

   - [ ] Require conversation resolution before merging (オプション)

   - [ ] Do not allow bypassing the above settings
     (管理者はルールをバイパス可能)

   - [ ] Allow force pushes (無効のまま)
   - [ ] Allow deletions (無効のまま)

4. **「Create」ボタンをクリック**

### GitHub CLI での設定

```bash
# develop ブランチの保護を設定
gh api repos/cosara22/mcp-orchestration-server/branches/develop/protection \
  --method PUT \
  --field required_pull_request_reviews='{"required_approving_review_count":0}' \
  --field required_status_checks='{"strict":true,"contexts":["build-and-test"]}' \
  --field enforce_admins=false \
  --field restrictions=null
```

---

## 🧪 3. ステータスチェックの確認

ブランチ保護で指定したステータスチェック (`build-and-test`, `lint`) は、`.github/workflows/ci.yml` で定義されています。

### 初回 PR 作成後に設定

ステータスチェックは、**最初の PR が作成され CI が実行されるまで選択肢に表示されません**。

以下の手順で設定を完了します:

1. **テスト用のブランチを作成**
   ```bash
   git checkout develop
   git checkout -b test/branch-protection
   echo "# Test" > TEST.md
   git add TEST.md
   git commit -m "test: Verify CI workflow"
   git push -u origin test/branch-protection
   ```

2. **PR を作成**
   ```bash
   gh pr create --base develop --title "test: Verify CI" --body "Testing branch protection"
   ```

3. **CI が実行されるのを待つ**
   - GitHub Actions タブで CI の実行を確認
   - `build-and-test` と `lint` ジョブが完了するまで待つ

4. **ブランチ保護設定を更新**
   - Settings → Branches → `main` のルールを編集
   - "Require status checks to pass before merging" の下に、`build-and-test` と `lint` が表示されるようになる
   - チェックボックスを有効化して保存

5. **テストブランチを削除**
   ```bash
   gh pr close test/branch-protection --delete-branch
   ```

---

## 📊 4. 保護設定の確認

### Web UI で確認

1. Settings → Branches
2. 設定したルールが表示される:
   - `main` - 厳格な保護
   - `develop` - 中程度の保護

### GitHub CLI で確認

```bash
# main ブランチの保護設定を確認
gh api repos/cosara22/mcp-orchestration-server/branches/main/protection | jq

# develop ブランチの保護設定を確認
gh api repos/cosara22/mcp-orchestration-server/branches/develop/protection | jq
```

---

## ✅ 5. 動作テスト

### main ブランチへの直接プッシュを試す (失敗するはず)

```bash
git checkout main
echo "# Test" > DIRECT_PUSH_TEST.md
git add DIRECT_PUSH_TEST.md
git commit -m "test: Direct push to main"
git push origin main
```

**期待される結果**:
```
remote: error: GH006: Protected branch update failed for refs/heads/main.
```

### PR 経由でのマージを試す (成功するはず)

```bash
# develop から feature ブランチを作成
git checkout develop
git checkout -b feature/test-protection

# 変更を加える
echo "# Feature Test" > FEATURE_TEST.md
git add FEATURE_TEST.md
git commit -m "feat: Test branch protection with PR"
git push -u origin feature/test-protection

# PR を作成
gh pr create --base develop --title "feat: Test PR" --body "Testing branch protection"

# CI が通ったら、develop にマージ
gh pr merge --auto --squash
```

---

## 🎯 保護設定のまとめ

| 設定項目 | `main` | `develop` |
|---------|--------|-----------|
| PR 必須 | ✅ Yes | ✅ Yes |
| レビュー承認数 | 1人以上 | 0人 (推奨のみ) |
| CI 必須 | ✅ Yes | ✅ Yes |
| 最新状態必須 | ✅ Yes | ✅ Yes |
| 会話解決必須 | ✅ Yes | ❌ No |
| 管理者もルール適用 | ✅ Yes | ❌ No |
| Force Push | ❌ 禁止 | ❌ 禁止 |
| 削除 | ❌ 禁止 | ❌ 禁止 |

---

## 🔧 トラブルシューティング

### ステータスチェックが表示されない

**原因**: CI ワークフローがまだ一度も実行されていない

**解決策**:
1. テスト PR を作成して CI を実行
2. CI 完了後、ブランチ保護設定を更新

### 承認者がいない (個人プロジェクトの場合)

**原因**: 個人リポジトリでは自分自身の PR を承認できない

**解決策**:
- GitHub Pro または Team プランにアップグレード
- または、`main` の承認数を 0 に設定 (非推奨)

### 緊急時にルールをバイパスしたい

**手順**:
1. Settings → Branches → ルールを編集
2. 一時的に "Do not allow bypassing" を無効化
3. 作業完了後、再度有効化

---

## 📝 今後の拡張

### Code Owners の設定

`.github/CODEOWNERS` ファイルを作成:

```
# CODEOWNERS

# MCP Server コード
/mcp-server/ @cosara22

# ドキュメント
*.md @cosara22

# GitHub Actions
/.github/ @cosara22
```

### 自動マージの設定

```bash
# PR 作成時に自動マージを有効化
gh pr create --base develop --title "..." --body "..." --auto-merge
```

---

## 🎉 完了

これでブランチ保護が設定され、安全な開発フローが確立されました!

次のステップ: 実際に feature ブランチで開発を開始してください。
