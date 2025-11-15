# 第1部:プロジェクト初期化プロンプト(CLAUDE.md用)

---

## **1. プロジェクト基本情報**

### **1.1 プロジェクト概要**

本プロジェクトは、複数のAIエージェントが協調してWebサービスを開発するための、高度に自動化された開発環境を構築することを目的とします。単一AIエージェントによる開発の待機時間を削減し、開発速度を飛躍的に向上させることを目指します。

### **1.2 目的とスコープ**

- **目的**: 複数のAIエージェント(以下、エージェント)が並列かつ自律的にタスクを遂行できる、スケーラブルな開発基盤を確立する。
- **スコープ**:
    - **対象**: Webアプリケーションの新規開発および継続的改善。
    - **範囲**: 要件定義支援、設計、実装、テスト、ドキュメンテーション、デプロイまでの一連のソフトウェア開発ライフサイクル(SDLC)を対象とする。

### **1.3 想定ユースケース**

- **新規Webサービス開発**: アイデアから本番リリースまでを、数日単位で実現する。
- **既存機能の改修**: ユーザーフィードバックに基づき、特定機能の仕様変更、UI/UX改善、バグ修正を迅速に行う。
- **大規模リファクタリング**: 古いコードベースを最新の技術スタックや設計に刷新する作業を自動化する。

---

## **2. 技術スタック**

### **2.1 コアフレームワーク**

- **2.1.1 マルチエージェントフレームワーク**: **CrewAI** を主軸とし、複雑なワークフローには **LangGraph** を併用するハイブリッドアプローチを採用。
- **2.1.2 開発ツール**: **Claude Code** をCI/CD連携や大規模リファクタリングに、**Cursor** を人間の開発者によるインライン編集やプロトタイピングに用いる。
- **2.1.3 プログラミング言語**: バックエンドは **Python 3.11+**、フロントエンドは **TypeScript 5.0+** を標準とする。

### **2.2 インフラストラクチャ**

- **2.2.1 バージョン管理**: **Git** を採用し、並列開発のために **Worktree戦略** を導入する。
- **2.2.2 CI/CD**: **GitHub Actions** を使用し、**Claude Code Action** を組み込むことで、PRの自動レビューや修正を実現する。
- **2.2.3 コンテナ技術**: **Docker** および **Docker Compose** を用いて、開発環境から本番環境までの一貫性を保証する。

### **2.3 データ管理**

- **2.3.1 データベース**: リレーショナルデータには **PostgreSQL**、ベクトル検索やエージェントの長期記憶には **Qdrant** を使用する。
- **2.3.2 メッセージング**: エージェント間の非同期通信やイベント駆動アーキテクチャの基盤として **Redis (Pub/Sub)** または **RabbitMQ** を採用する。

### **2.4 監視・可観測性**

- **2.4.1 LangSmith**: エージェントの実行トレース、プロンプト、パフォーマンスを詳細に追跡・デバッグするために使用する。
- **2.4.2 OpenTelemetry**: アプリケーション全体から分散トレース、メトリクス、ログを収集するための標準規格として導入する。
- **2.4.3 Prometheus**: システムリソースやアプリケーションのカスタムメトリクスを収集・監視するために使用する。

---

## **3. 開発環境構成**

### **3.1 開発フローの概要**

1.  **タスク定義**: SupervisorAgentがユーザーの要求を解釈し、タスクを定義する。
2.  **計画**: PlanningAgentがタスクをサブタスクに分解し、依存関係を考慮した実行計画を作成する。
3.  **並列開発**: 複数のImplementationAgentが、Git Worktreeを利用して各サブタスクを並列で実装する。
4.  **テスト**: TestingAgentが単体テスト、結合テストを自動生成・実行する。
5.  **レビュー**: ReviewAgent(またはClaude Code Action)がコード品質、規約遵守をチェックし、PRをレビューする。
6.  **統合**: 全てのサブタスクが完了後、`develop`ブランチに統合される。

### **3.2 並列開発戦略**

- **3.2.1 Git Worktree使用方法**: `main`リポジトリとは別に、各機能開発用の作業ディレクトリを`worktrees/`以下に作成する。これにより、依存関係の競合なしに複数のブランチを同時にチェックアウトし、作業できる。
- **3.2.2 セッション管理**: SupervisorAgentは、最大3〜5のImplementationAgentを同時に稼働させ、タスクの性質に応じてリソースを割り当てる。

### **3.3 ツール使い分け**

- **3.3.1 Cursor**: 人間の開発者が介入する際に使用。AIとのペアプログラミングを通じて、直感的なコード編集、デバッグ、小規模なプロトタイピングを行う。
- **3.3.2 Claude Code**: 主に自動化パイプラインで使用。CI/CDプロセスに組み込み、大規模なリファクタリング、ドキュメント生成、PRの自動レビューと修正を担当する。

### **3.4 ディレクトリ構造**

- **3.4.1 メインブランチ構成**:
    ```
    /project-root
    ├── .claude/         # CLAUDE.md とエージェントプロンプト
    ├── .github/         # GitHub Actions ワークフロー
    ├── .vscode/         # VSCode/Cursor 設定
    ├── app/             # アプリケーションソースコード
    ├── scripts/         # 補助スクリプト
    ├── tests/           # テストコード
    ├── docker-compose.yml
    ├── Dockerfile
    └── pyproject.toml
    ```
- **3.4.2 Worktreeディレクトリ構成**:
    ```
    /project-root
    ├── worktrees/
    │   ├── feat-user-auth/  # worktree for feature 'user-auth'
    │   └── bugfix-login-issue/ # worktree for bugfix 'login-issue'
    └── ... (main repository files)
    ```

---

## **4. アーキテクチャ原則**

### **4.1 マルチエージェント組織パターン**

- **4.1.1 階層型オーケストレーション(Hierarchical)**: SupervisorAgentを頂点とし、各専門エージェントがその指示に従って動作する階層構造を採用する。これにより、明確な指揮命令系統を確立し、システム全体の予測可能性を高める。
- **4.1.2 エージェント構成図**:
    - **SupervisorAgent (Orchestrator)**: 全体の司令塔。タスクの受付、エージェントへの指示、進捗管理、最終的な成果物の統合を行う。
    - **PlanningAgent**: タスクを具体的なサブタスクに分解し、依存関係グラフと実行計画を作成する。
    - **ResearchAgent**: 実装に必要な情報(ライブラリ、API仕様など)を調査する。
    - **ImplementationAgent**: 実際にコードを記述する。フロントエンド、バックエンドなどのサブエージェントを持つことができる。
    - **TestingAgent**: 生成されたコードに対するテストを設計・実行する。
    - **DocumentationAgent**: コードやAPI仕様に関するドキュメントを自動生成する。

### **4.2 エージェント間通信プロトコル**

- **4.2.1 メッセージ形式**: 全ての通信は、ヘッダー(送信者、受信者、メッセージIDなど)とペイロード(具体的な指示やデータ)を持つ **JSON構造化メッセージ** で行う。
- **4.2.2 状態管理**: **Redis** を共有ステートストアとして使用し、各エージェントはタスクの進捗や中間生成物を記録する。これにより、他のエージェントが現在の状態を非同期に参照できる。
- **4.2.3 イベント駆動**: RedisのPub/Sub機能を利用したイベント駆動アーキテクチャを採用。「タスク完了」「エラー発生」などのイベントを発行し、関心のあるエージェントがそれを購読して次のアクションをトリガーする。
- **4.2.4 エラーハンドリング**: ツール実行の失敗やAPIエラーが発生した場合、指数バックオフ付きのリトライ戦略を実装する。3回失敗した場合は、SupervisorAgentにエスカレーションする。

---

## **5. コード品質基準**

### **5.1 Python規約**

- **5.1.1 Type hints**: `mypy --strict` モードをパスすることを必須とする。
- **5.1.2 Docstrings**: `Google Style` に準拠し、全ての公開モジュール、クラス、関数に記述する。
- **5.1.3 テストカバレッジ基準**: `pytest-cov` を使用し、コードカバレッジ80%以上を維持する。
- **5.1.4 リンター・フォーマッター**: `ruff` と `black` を使用し、pre-commitフックで自動的に適用する。
- **5.1.5 Import順序規則**: `isort` 互換の `ruff` のルールに従い、自動で整理する。

### **5.2 TypeScript規約**

- **5.2.1 strict mode設定**: `tsconfig.json` で `"strict": true` を必須とする。
- **5.2.2 ESLint + Prettier**: 標準的なルールセットを適用し、pre-commitフックで自動整形・チェックを行う。
- **5.2.3 関数型プログラミングアプローチ**: 不変性(Immutability)を重視し、純粋関数を積極的に利用する。
- **5.2.4 React実装規約**: コンポーネントはFunctional Componentとし、Hooksを適切に使用する。カスタムフックによるロジックの再利用を推奨する。
- **5.2.5 状態管理戦略**: コンポーネントのローカルな状態は `useState`、`useReducer` を使用。グローバルな状態管理が必要な場合は `Zustand` または `Jotai` を採用する。

### **5.3 CrewAI/LangGraph実装規約**

- **5.3.1 Agent定義規則**: `role`, `goal`, `backstory` を明確に定義し、エージェントの専門性と目的を限定する。
- **5.3.2 ツール定義原則**: ツールは単一責任の原則に従い、シンプルで再利用可能な関数として定義する。関数のDocstringがツールの説明として利用されるため、引数と戻り値を明確に記述する。
- **5.3.3 Task定義要件**: `description` には期待する成果物(`expected_output`)を具体的に記述する。必要に応じて `context` を与え、他のタスクとの依存関係を明示する。
- **5.3.4 ログ記録規約**: `verbose=True` を有効にし、LangSmithと連携させることで、エージェントの思考プロセスを常に追跡可能にする。

---

## **6. Gitワークフロー**

### **6.1 ブランチ戦略**

- **6.1.1 `main`**: 本番環境にデプロイされる安定バージョン。直接のコミットは禁止。
- **6.2.2 `develop`**: 開発の統合ブランチ。機能開発が完了したブランチがマージされる。
- **6.1.3 `feature/[description]`**: 新機能開発用ブランチ。
- **6.1.4 `bugfix/[description]`**: バグ修正用ブランチ。
- **6.1.5 `refactor/[description]`**: リファクタリング用ブランチ。

### **6.2 Worktree作業手順**

1.  **新規機能開発開始**: `git worktree add ./worktrees/feature-new-feature develop` コマンドで、`develop`ブランチから新しい作業ディレクトリを作成する。
2.  **定期的な同期方法**: `cd ./worktrees/feature-new-feature && git pull origin develop` で、定期的に`develop`ブランチの最新の変更を取り込む。
3.  **コンフリクト解決戦略**: コンフリクトはWorktree内のブランチで解決してから、PRを作成する。AIエージェントがコンフリクトを解決できない場合は、人間の開発者に通知する。
4.  **完了後のクリーンアップ**: PRがマージされた後、`git worktree remove ./worktrees/feature-new-feature` と `git branch -d feature-new-feature` で作業ディレクトリとブランチを削除する。

### **6.3 コミットメッセージ規約**

- **6.3.1 Conventional Commits準拠**: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:` のプレフィックスを使用する。
- **6.3.2 具体的な例**:
    - `feat: Add user authentication endpoint`
    - `fix: Correct password hashing algorithm`
    - `docs: Update API documentation for user endpoints`

---

## **7. タスク実行ガイドライン**

### **7.1 並列開発時の注意事項**

- **7.1.1 禁止事項リスト**:
    - 共有モジュール(例: `utils.py`)のインターフェースを、他のエージェントと調整なく変更すること。
    - データベーススキーマを、マイグレーション計画なしに変更すること。
    - `develop`ブランチへの直接のプッシュ。
- **7.1.2 推奨事項リスト**:
    - 依存関係が少ないコンポーネントから実装を開始する。
    - スタブやモックを積極的に利用し、他のエージェントの作業完了をブロックしない。
    - 定期的に`develop`ブランチと同期を取り、コンフリクトを早期に発見する。

### **7.2 Claude Code使用パターン**

- **7.2.1 大規模変更**: プロジェクト全体にまたがる変数名の変更や、ライブラリのバージョンアップに伴う修正など。
- **7.2.2 自動テスト生成**: 既存のコードに基づいて、カバレッジを向上させるための単体テストを自動生成する。
- **7.2.3 ドキュメント自動生成**: コード内のDocstringからMarkdown形式のAPIドキュメントを生成する。
- **7.2.4 PRレビュー**: GitHub Actionsと連携し、PRに対してコーディング規約や潜在的なバグに関するコメントを自動で行う。

### **7.3 Cursor使用パターン**

- **7.3.1 Command+K(クイック補完)**: 「ここに〇〇を実装して」といった自然言語での指示で、コードを生成・編集する。
- **7.3.2 Tab補完**: グレーアウトされたコード補完候補をTabキーで受け入れる。
- **7.3.3 Chat機能**: コードベース全体を認識した状態で、リファクタリングの相談やエラーの解決策を質問する。
- **7.3.4 Composer機能**: テストの自動生成やDocstringの追記など、定型的なタスクを実行する。

---

## **8. マルチエージェント固有の規約**

### **8.1 エージェント定義テンプレート(CrewAI)**

- **8.1.1 必須属性一覧**: `role`, `goal`, `backstory`, `tools`, `allow_delegation`
- **8.1.2 コード例**:
    ```python
    from crewai import Agent

    implementation_agent = Agent(
        role='Senior Python Developer',
        goal='Write clean, efficient, and tested Python code based on specifications.',
        backstory='An experienced developer specializing in FastAPI and SQLAlchemy.',
        tools=[file_read_tool, file_write_tool, python_repl],
        allow_delegation=False, # This agent focuses on coding and does not delegate
        verbose=True
    )
    ```
- **8.1.3 Task定義方法**: Taskの`description`には、達成すべきゴールと、インプットとなる情報(例: ファイルパス)を明確に記述する。`expected_output`には、成果物の形式(例: 「指定されたパスに生成されたPythonコード」)を記述する。

### **8.2 オーケストレーション実装パターン**

- **8.2.1 Crew設定**: `PlanningAgent`, `ImplementationAgent`, `TestingAgent`など、タスクに必要なエージェント群でCrewを構成する。
- **8.2.2 Process選択**: `Process.sequential`(順次実行)を基本とし、PlanningAgentが並列実行可能と判断したタスク群に対しては、動的に複数のCrewを生成して並列実行する。
- **8.2.3 パフォーマンス設定**: `max_rpm`(分間最大リクエスト数)を設定し、APIのレート制限を超えないように調整する。
- **8.2.4 実行方法**: `crew.kickoff(inputs={'initial_task': '...'})` でタスクを開始する。

---

## **9. 監視・デバッグ戦略**

### **9.1 ログ構造**

- **9.1.1 `structlog`設定**: 全てのログをJSON形式で出力するように`structlog`を設定する。ログにはタイムスタンプ、ログレベル、エージェント名、タスクIDなどの共通フィールドを含める。
- **9.1.2 エージェント実行ログ**: エージェントの思考プロセス(`Thought:`)、ツール呼び出し、実行結果を詳細に記録する。
- **9.1.3 エラーログ**: エラー発生時には、スタックトレースに加えて、その時点でのエージェントの内部状態や入力データを記録する。

### **9.2 メトリクス収集**

- **9.2.1 パフォーマンス指標**: タスク完了までの時間、エージェントごとの処理時間、ツール実行のレイテンシ。
- **9.2.2 品質指標**: テストカバレッジ、静的解析違反数、PRの修正回数。
- **9.2.3 コスト指標**: LLMのトークン消費量、API呼び出し回数。
- **9.2.4 リソース指標**: CPU使用率、メモリ使用量。

---

## **10. セキュリティ・プライバシー**

### **10.1 認証・認可**

- **10.1.1 APIキー管理**: APIキーは環境変数として設定し、コードにハードコーディングしない。
- **10.1.2 Secrets管理**: 本番環境では、AWS Secrets ManagerやHashiCorp Vaultなどの専用サービスを利用する。
- **10.1.3 エージェント間通信セキュリティ**: 内部ネットワークでの通信であっても、mTLSなどで通信を暗号化することを検討する。

### **10.2 データ保護**

- **10.2.1 個人情報取り扱い**: エージェントが個人情報を扱う場合は、マスキングや匿名化を行うツールを必ず通す。
- **10.2.2 DB接続文字列暗号化**: データベースの接続情報は暗号化して保存・管理する。
- **10.2.3 プロンプトインジェクション対策**: 外部からの入力をプロンプトに含める際は、明確にデータ領域として区切り、指示として解釈されないように設計する。

### **10.3 レート制限**

- **10.3.1 OpenAI設定**: `max_retries`や`request_timeout`を適切に設定する。
- **10.3.2 Anthropic設定**: 公式ライブラリのレート制限ハンドリング機能を利用する。
- **10.3.3 内部API設定**: 自作のツールやAPIにもレート制限を設け、特定のエージェントによるリソースの独占を防ぐ。

---

## **11. ドキュメント要件**

### **11.1 必須ドキュメント一覧**

DocumentationAgentは、以下のドキュメントを`docs/`ディレクトリ以下に自動生成・更新する。

- **11.1.1 `architecture/`**: システム全体のアーキテクチャ図、C4モデルなど。
- **11.1.2 `agents/`**: 各エージェントの役割、能力、プロンプトを記述したMarkdownファイル。
- **11.1.3 `api/`**: OpenAPI (Swagger) 仕様書。
- **11.1.4 `deployment/`**: 本番環境へのデプロイ手順書。
- **11.1.5 `troubleshooting/`**: 運用時に発生した問題とその解決策を記録するナレッジベース。

---

## **12. 実行時の期待動作**

### **12.1 Claude Codeへの指示例**

- **明確かつ具体的**: 「`app/services/user_service.py`の`create_user`関数をリファクタリングして、パスワードハッシュ化のロジックを`app/utils/security.py`に切り出してください。」
- **思考プロセスの要求**: 「まず、変更計画をステップバイステップで説明してください。次に、計画に従ってコードを修正してください。」

### **12.2 Cursorへの指示例**

- **対話的**: Chatパネルで「このコンポーネントのパフォーマンスを改善するにはどうすればいい?」と相談する。
- **範囲指定**: コードを選択し、Command+Kで「この部分をtry-catchで囲んでエラーハンドリングを追加して」と指示する。

---

## **13. トラブルシューティング**

### **13.1 よくある問題と解決策**

- **13.1.1 エージェント無限ループ**: SupervisorAgentが同一タスクの繰り返しを検知した場合、最大試行回数(デフォルト3回)を超えたら処理を停止し、人間に通知する。
- **13.1.2 メモリ不足**: コンテキストウィンドウの肥大化が原因。要約ツールを用いて、タスクに関連する情報のみをエージェントに渡すようにする。
- **13.1.3 API制限超過**: 指数バックオフとリトライを実装。SupervisorAgentが全体のリクエスト数を監視し、必要に応じてスリープを挿入する。
- **13.1.4 Worktreeコンフリクト**: `develop`ブランチとのコンフリクトが発生した場合、エージェントは自動解決を試みる。失敗した場合は、差分ファイルを提示して人間に判断を仰ぐ。

---

## **14. 成功基準**

### **14.1 Phase 1(1ヶ月目)**

- 基本的な開発環境(Git, Docker, CI)が構築され、エージェントが簡単なコード生成とテストを実行できる。
- 開発リードタイムが20%短縮される。

### **14.2 Phase 2(2ヶ月目)**

- 階層型オーケストレーションが機能し、複数のエージェントが並列でタスクを処理できる。
- AIエージェントの自律実行率が50%に到達する。

### **14.3 Phase 3(3ヶ月目)**

- 監視・デバッグ基盤が整備され、安定した運用が可能になる。
- 開発リードタイムが50%短縮され、人間の介入がレビューと承認のみに限定されるケースが生まれる。

---

## **15. 重要な注意事項**

### **15.1 絶対にやってはいけないこと(5項目)**

1.  `main`ブランチへの直接コミット。
2.  監視・ロギング設定なしでの本番デプロイ。
3.  プロンプトやAPIキーのハードコーディング。
4.  エージェントに無制限のファイルシステムアクセスやシェル実行権限を与えること。
5.  AIの生成物をレビューなしでマージすること。

### **15.2 常に心がけること(5項目)**

1.  **AIは協力者**: ツールではなく、チームの一員として扱う。
2.  **実験と計測**: 新しい手法を試し、結果をデータで評価する。
3.  **シンプルさの追求**: 複雑な設計は避ける。
4.  **徹底的な自動化**: 人間は創造的な作業に集中する。
5.  **可逆性の確保**: いつでも以前の状態に戻せるように設計する。
# 第2部:専門エージェント用プロンプトテンプレート

---

## **1. Planning Agent(計画立案エージェント)**

### **1.1 役割定義**

あなたは、大規模なソフトウェア開発プロジェクトを管理する経験豊富なプロジェクトマネージャー兼システムアーキテクトです。あなたの主な責務は、曖昧なユーザー要求を、実行可能で具体的なサブタスクの集合に分解し、最適な実行計画を策定することです。

### **1.2 専門知識領域**

- **1.2.1 タスク分解手法**: Work Breakdown Structure (WBS) の原則に基づき、タスクを階層的に分解する。
- **1.2.2 依存関係グラフ理論**: タスク間の依存関係を分析し、クリティカルパスを特定する。
- **1.2.3 リソース最適化**: 各タスクに必要なスキルセットを特定し、適切なエージェントを割り当てる。
- **1.2.4 アジャイル開発手法**: スプリント計画やバックログ管理の概念を理解し、反復的な開発プロセスを設計する。
- **1.2.5 ワークフロー設計**: 順次実行、並列実行を組み合わせた効率的なワークフローを構築する。

### **1.3 利用可能ツール**

- `task_decomposer`: 自然言語のタスク説明を、構造化されたサブタスクのリストに変換する。
- `dependency_analyzer`: サブタスク間の依存関係を検出し、有向非巡回グラフ(DAG)を生成する。
- `resource_estimator`: 各タスクの工数と必要なリソース(例: `ImplementationAgent-Frontend`)を見積もる。
- `priority_calculator`: 依存関係と見積もり工数に基づき、タスクの優先順位を計算する。

### **1.4 入力形式仕様**

- SupervisorAgentから渡される、以下のJSONオブジェクト:
    ```json
    {
      "main_goal": "ユーザー認証機能を備えたWebアプリケーションを開発する",
      "constraints": [
        "使用言語はPythonとTypeScript",
        "フレームワークはFastAPIとReact",
        "納期は3週間"
      ]
    }
    ```

### **1.5 期待される出力形式**

- **1.5.1 `execution_plan`構造**: 以下の形式のJSONオブジェクト:
    ```json
    {
      "plan_id": "plan-12345",
      "tasks": [
        {
          "task_id": "task-001",
          "description": "データベーススキーマの設計 (Userテーブル)",
          "dependencies": [],
          "assigned_agent": "ImplementationAgent-Backend",
          "estimated_time": "2h"
        },
        {
          "task_id": "task-002",
          "description": "認証APIエンドポイントの実装 (/login, /register)",
          "dependencies": ["task-001"],
          "assigned_agent": "ImplementationAgent-Backend",
          "estimated_time": "4h"
        }
      ],
      "execution_flow": "sequential" or "parallel"
    }
    ```
- **1.5.2 `risk_assessment`**: 潜在的なリスク(技術的負債、スケジュールの遅延など)とその対策を記述したMarkdownテキスト。
- **1.5.3 `recommendations`**: より効率的な実装方法や代替アーキテクチャに関する提案。

### **1.6 実行プロトコル(6ステップ)**

1.  **要求理解**: 入力された`main_goal`と`constraints`を分析する。
2.  **タスク分解**: `task_decomposer`ツールを使用し、主要なエピックとユーザーストーリーを洗い出す。
3.  **依存関係分析**: `dependency_analyzer`ツールでタスク間の依存関係を特定し、実行順序を決定する。
4.  **リソース割り当て**: `resource_estimator`ツールで各タスクの担当エージェントを決定する。
5.  **計画策定**: 上記情報を統合し、最終的な`execution_plan`を生成する。
6.  **リスク評価**: 計画全体をレビューし、`risk_assessment`と`recommendations`を作成する。

### **1.7 品質基準**

- **網羅性**: ユーザー要求の全ての側面がタスクに反映されていること。
- **具体性**: 各タスクが、単一のエージェントが1回の実行で完了できるレベルまで具体化されていること。
- **実現可能性**: 計画が、与えられた制約(時間、技術スタック)の範囲内で実行可能であること。

### **1.8 エラーハンドリング**

- ツール実行に失敗した場合は、最大2回までリトライする。
- 依存関係に循環が検出された場合は、計画を破棄し、SupervisorAgentに報告する。

---

## **2. Implementation Agent(実装エージェント)**

### **2.1 役割定義**

あなたは、特定の技術領域に特化した熟練のソフトウェアエンジニアです。あなたの責務は、PlanningAgentによって作成されたタスク仕様書に基づき、高品質で保守性の高いコードを記述することです。

### **2.2 専門知識領域**

- **2.2.1 Python技術スタック**: FastAPI, SQLAlchemy, Pydantic, Pytest
- **2.2.2 TypeScript/JavaScript技術スタック**: React, Next.js, Zustand, Vitest, Testing Library
- **2.2.3 データベース技術**: PostgreSQL, Qdrant, SQL, ベクトル検索
- **2.2.4 API設計**: RESTful API, GraphQL
- **2.2.5 デザインパターン**: GoFデザインパターン, MVC, MVVM
- **2.2.6 SOLID原則**: 単一責任、オープン/クローズド、リスコフの置換、インターフェース分離、依存性逆転

### **2.3 コーディング規約**

- **2.3.1 Python実装例**:
    ```python
    # CLAUDE.mdの規約に従う
    from typing import List
    from pydantic import BaseModel

    class User(BaseModel):
        """Represents a user in the system."""
        id: int
        name: str

    def get_all_users() -> List[User]:
        """Retrieves all users from the database."""
        # ... implementation
        pass
    ```
- **2.3.2 TypeScript実装例**:
    ```typescript
    // CLAUDE.mdの規約に従う
    type User = {
      id: number;
      name: string;
    };

    const fetchUsers = async (): Promise<User[]> => {
      // ... implementation
    };
    ```

### **2.4 入力形式仕様**

- PlanningAgentが作成した`execution_plan`内の単一のタスクオブジェクト:
    ```json
    {
      "task_id": "task-002",
      "description": "認証APIエンドポイントの実装 (/login, /register)",
      "dependencies": ["task-001"],
      "specifications": {
        "input_schema": "...",
        "output_schema": "..."
      }
    }
    ```

### **2.5 実装プロトコル(6ステップ)**

1.  **仕様確認**: タスクの`description`と`specifications`を読み込み、要件を完全に理解する。
2.  **テスト先行**: `TestingAgent`に依頼するか、自身で単体テストの雛形を作成する。
3.  **実装**: テストをパスするように、`CLAUDE.md`のコーディング規約に従ってコードを記述する。
4.  **自己レビュー**: SOLID原則やデザインパターンに照らして、コードの品質を自己評価し、リファクタリングを行う。
5.  **テスト実行**: 作成したテストを実行し、全てパスすることを確認する。
6.  **成果物提出**: 生成したコードとテストコードを、指定されたファイルパスに出力する。

### **2.6 出力形式**

- 以下のJSONオブジェクト:
    ```json
    {
      "task_id": "task-002",
      "status": "completed",
      "artifacts": [
        {
          "file_path": "app/api/endpoints/auth.py",
          "content": "... (python code) ..."
        },
        {
          "file_path": "tests/api/endpoints/test_auth.py",
          "content": "... (python test code) ..."
        }
      ]
    }
    ```

### **2.7 品質チェックリスト(8項目)**

- [ ] コーディング規約を遵守しているか?
- [ ] 型ヒントは適切か?
- [ ] Docstringは記述されているか?
- [ ] テストは書かれているか?
- [ ] SOLID原則に違反していないか?
- [ ] ハードコーディングされた値はないか?
- [ ] エラーハンドリングは適切か?
- [ ] セキュリティ脆弱性はないか?

---

## **3. Orchestrator Agent(統括エージェント) / SupervisorAgent**

### **3.1 役割定義**

あなたは、AI開発チーム全体を監督する最高技術責任者(CTO)です。あなたの責務は、ユーザーからの要求を受け取り、それを専門エージェントに適切に委任し、プロジェクト全体の進捗を管理し、最終的な成果物を統合してユーザーに提供することです。

### **3.2 管理対象エージェント一覧**

- **3.2.1 PlanningAgent**: プロジェクトの計画担当。
- **3.2.2 ResearchAgent**: 技術調査担当。
- **3.2.3 ImplementationAgent**: 実装担当(複数の専門分野に分かれる)。
- **3.2.4 TestingAgent**: 品質保証担当。
- **3.2.5 DocumentationAgent**: ドキュメント作成担当。
- **3.2.6 ReviewAgent**: コードレビュー担当。

### **3.3 オーケストレーション戦略**

- **3.3.1 タスク受領時の処理**: ユーザーからの要求を受け取り、まずは`PlanningAgent`に委任して実行計画を策定させる。
- **3.3.2 実行監視**: Redisの共有ステートストアを定期的にポーリングし、各タスクの進捗状況を監視する。
- **3.3.3 コンフリクト解決**: `ImplementationAgent`間でコードのコンフリクトが発生した場合、関連するエージェントに通知し、解決を指示する。解決できない場合は人間にエスカレーションする。

### **3.4 意思決定フレームワーク**

- **3.4.1 優先順位マトリクス**: 緊急度と重要度に基づき、タスクの優先順位を決定する。クリティカルパス上のタスクを最優先する。

### **3.5 コミュニケーションプロトコル**

- **3.5.1 エージェント間メッセージフォーマット**: 全てのエージェントとの通信は、標準化されたJSONメッセージ形式で行う。メッセージには`correlation_id`を含め、一連のタスクを追跡可能にする。

### **3.6 メトリクス監視**

- **3.6.1 リアルタイムダッシュボード**: LangSmithやPrometheusと連携し、プロジェクト全体の進捗状況を可視化する。
- **3.6.2 監視項目詳細**: 全体のタスク完了率、コスト消費状況、エージェントごとのエラーレートを重点的に監視する。

### **3.7 エスカレーションルール**

- **3.7.1 判定ロジック**: 以下のいずれかの条件を満たした場合、人間の開発者に通知する。
    - 同一タスクで3回以上エラーが発生した場合。
    - 計画された工数を大幅に超過した場合。
    - エージェント間で解決不可能なコンフリクトが発生した場合。
- **3.7.2 人間への通知方法**: SlackやMicrosoft TeamsのWebhookを呼び出し、問題の概要と関連ログへのリンクを送信する。

### **3.8 成功基準(プロジェクト完了条件)**

- `PlanningAgent`が作成した全てのタスクが`completed`ステータスになること。
- `TestingAgent`が報告するテストカバレッジが、品質基準(例: 80%)を満たしていること。
- `DocumentationAgent`が必要なドキュメントを全て生成済みであること。
# 第3部:環境構築用シェルスクリプト

---

## **1. セットアップスクリプト概要**

### **1.1 スクリプトの目的**

この `setup_environment.sh` スクリプトは、マルチエージェント開発環境の初期設定を自動化し、誰が実行しても一貫性のある開発基盤を迅速に構築することを目的とします。

### **1.2 前提条件**

- `git`, `docker`, `docker-compose` がインストールされていること。
- Python 3.11以上が利用可能であること。
- `pip` と `venv` が利用可能であること。

### **1.3 実行方法**

プロジェクトのルートディレクトリで以下のコマンドを実行します。

```bash
bash scripts/setup_environment.sh
```

---

## **2. セットアップ手順**

以下に、`setup_environment.sh` スクリプトの具体的な処理内容を記述します。

```bash
#!/bin/bash

# 色付き出力用
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}--- マルチエージェント開発環境のセットアップを開始します ---${NC}"

# 2.1 ディレクトリ構造作成
echo "[1/8] ディレクトリ構造を作成中..."
mkdir -p .claude .github/workflows app scripts tests docs

# 2.2 CLAUDE.md配置
echo "[2/8] CLAUDE.md を配置中..."
# 第1部の内容をここにヒアドキュメントで挿入
cat > .claude/CLAUDE.md << 'EOF'
# 第1部:プロジェクト初期化プロンプト(CLAUDE.md用)
# ... (第1部の全内容をここにコピー) ...
EOF

# 2.3 エージェント定義ファイル作成
echo "[3/8] エージェント定義ファイルを作成中..."
# 第2部の内容をここにヒアドキュメントで挿入
cat > .claude/planning-agent.md << 'EOF'
# 第2部 - 1. Planning Agent
# ... (Planning Agentのプロンプト内容をここにコピー) ...
EOF
cat > .claude/implementation-agent.md << 'EOF'
# 第2部 - 2. Implementation Agent
# ... (Implementation Agentのプロンプト内容をここにコピー) ...
EOF
cat > .claude/orchestrator-agent.md << 'EOF'
# 第2部 - 3. Orchestrator Agent
# ... (Orchestrator Agentのプロンプト内容をここにコピー) ...
EOF

# 2.4 Git設定
echo "[4/8] Git環境を初期化中..."
git init
git branch -M main
# .gitignoreを作成
cat > .gitignore << EOF
# Python
__pycache__/
*.py[cod]
*$py.class

# venv
.venv/
virtualenv/
env/

# IDE
.vscode/
.idea/

# Env
.env

# Worktrees
/worktrees/
EOF

# 2.5 pre-commit hook作成
echo "[5/8] pre-commit hook を設定中..."
# pre-commit の設定ファイルを作成
cat > .pre-commit-config.yaml << EOF
repos:
-   repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
    -   id: trailing-whitespace
    -   id: end-of-file-fixer
    -   id: check-yaml
    -   id: check-added-large-files
-   repo: https://github.com/psf/black
    rev: 23.11.0
    hooks:
    -   id: black
-   repo: https://github.com/charliermarsh/ruff-pre-commit
    rev: 'v0.1.6'
    hooks:
    -   id: ruff
      args: [--fix, --exit-non-zero-on-fix]
EOF

# 2.6 Docker環境構築
echo "[6/8] Docker環境を構築中..."
cat > docker-compose.yml << EOF
version: '3.8'

services:
  redis:
    image: redis:7.2-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: agent_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  qdrant:
    image: qdrant/qdrant:v1.7.0
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage

volumes:
  redis_data:
  postgres_data:
  qdrant_data:
EOF

# 2.7 Python環境設定
echo "[7/8] Python仮想環境と依存関係を設定中..."
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip

# pyproject.tomlを作成
cat > pyproject.toml << EOF
[tool.poetry]
name = "multi-agent-dev-env"
version = "0.1.0"
description = ""
authors = ["Your Name <you@example.com>"]

[tool.poetry.dependencies]
python = ">=3.11,<3.12"
crewai = "^0.28.8"
langchain-community = "^0.0.34"
duckduckgo-search = "^4.2"
langsmith = "^0.1.31"
python-dotenv = "^1.0.0"
fastapi = "^0.104.1"
uvicorn = "^0.24.0.post1"
sqlalchemy = "^2.0.23"
psycopg2-binary = "^2.9.9"
qdrant-client = "^1.7.0"
redis = "^5.0.1"
structlog = "^23.2.0"

[tool.poetry.dev-dependencies]
pytest = "^7.4.3"
pytest-cov = "^4.1.0"
ruff = "^0.1.6"
black = "^23.11.0"
mypy = "^1.7.0"
pre-commit = "^3.5.0"

[build-system]
requires = ["poetry-core>=1.0.0"]
build-backend = "poetry.core.masonry.api"
EOF

# 依存関係をインストール (Poetryを使う場合)
# pip install poetry
# poetry install

# (Poetryを使わない場合)
pip install \
    "crewai>=0.28.8" \
    "langchain-community>=0.0.34" \
    "duckduckgo-search>=4.2" \
    "langsmith>=0.1.31" \
    "python-dotenv>=1.0.0" \
    "fastapi>=0.104.1" \
    "uvicorn>=0.24.0.post1" \
    "sqlalchemy>=2.0.23" \
    "psycopg2-binary>=2.9.9" \
    "qdrant-client>=1.7.0" \
    "redis>=5.0.1" \
    "structlog>=23.2.0" \
    "pytest>=7.4.3" \
    "pytest-cov>=4.1.0" \
    "ruff>=0.1.6" \
    "black>=23.11.0" \
    "mypy>=1.7.0" \
    "pre-commit>=3.5.0"

pre-commit install

# 2.8 初期化完了と次のステップ
echo "[8/8] セットアップ完了!"
echo -e "${GREEN}--- 環境構築が正常に完了しました ---${NC}"
echo ""
echo "次のステップ:"
echo "1. '.env' ファイルを作成し、APIキーなどを設定してください。"
echo "2. 'docker-compose up -d' を実行して、外部サービスを起動してください。"
echo "3. 'source .venv/bin/activate' を実行して、仮想環境を有効にしてください。"

```

---

# 📚 付録

## **A. 用語集**

- **マルチエージェントオーケストレーション**: 複数の自律的なAIエージェントを協調させ、単一のエージェントでは達成困難な複雑なタスクを遂行させるための技術や仕組み。
- **Git Worktree**: 一つのGitリポジトリ内で、複数のブランチを同時に異なるディレクトリにチェックアウトできる機能。並列開発を効率化する。
- **CrewAI / LangGraph / AutoGen**: マルチエージェントシステムを構築するための代表的なPythonフレームワーク。
- **階層型パターン (Hierarchical Pattern)**: マネージャー(Supervisor)エージェントがワーカーエージェントに指示を出す、中央集権的なエージェント組織構造。
- **CLAUDE.md**: プロジェクトの憲法。技術スタック、規約、アーキテクチャなど、AIエージェントが参照すべき全ての情報を集約したドキュメント。

## **B. 参考リンク**

- **公式ドキュメント**:
    - [CrewAI Documentation](https://docs.crewai.com/)
    - [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
    - [AutoGen Documentation](https://microsoft.github.io/autogen/)
    - [Claude Code](https://www.anthropic.com/news/claude-code)
    - [Cursor Documentation](https://cursor.sh/docs)
- **コミュニティリソース**:
    - [LangChain Discord](https://discord.gg/langchain)
    - [OpenAI Developer Forum](https://community.openai.com/)
- **関連ツール**:
    - [LangSmith](https://www.langchain.com/langsmith)
    - [OpenTelemetry](https://opentelemetry.io/)
    - [Ruff](https://github.com/charliermarsh/ruff)

## **C. よくある質問(FAQ)**

- **開発環境に関する質問**
    - **Q: なぜWorktreeを使うのですか?**
    - A: 複数の機能を並行して開発する際、ブランチの切り替えコストなしに、各機能の環境を分離できるためです。これにより、AIエージェントが複数のタスクを同時に、かつ独立して進めることが可能になります。
- **エージェント設計に関する質問**
    - **Q: エージェントのプロンプトを変更したい場合はどうすれば良いですか?**
    - A: `.claude/` ディレクトリ内の対応するエージェントのMarkdownファイルを編集してください。プロンプトはバージョン管理され、チーム全体で共有されます。
- **トラブルシューティングに関する質問**
    - **Q: APIのレート制限に頻繁に引っかかります。**
    - A: `CLAUDE.md`のレート制限の章を参照し、CrewAIの`max_rpm`設定や、ツール呼び出し時のリトライ戦略を見直してください。また、LangSmithでAPI呼び出しの頻度を監視し、ボトルネックを特定してください。

## **D. 変更履歴**

- **バージョン**: 1.0.0
- **更新日**: 2025-11-15
- **更新内容**: 初版作成。

---

## **🔍 クイックアクセスインデックス**

### **開発者向けクイックリファレンス**
- [ ] 環境セットアップ → 第3部
- [ ] コーディング規約 → 第1部-5章
- [ ] Git Worktree使用方法 → 第1部-6章
- [ ] エージェント実装 → 第2部
- [ ] トラブルシューティング → 第1部-13章

### **アーキテクト向けクイックリファレンス**
- [ ] システム設計 → 第1部-4章
- [ ] オーケストレーション戦略 → 第2部-3章
- [ ] 技術スタック → 第1部-2章
- [ ] セキュリティ → 第1部-10章

### **プロジェクトマネージャー向けクイックリファレンス**
- [ ] プロジェクト概要 → 第1部-1章
- [ ] 成功基準 → 第1部-14章
- [ ] フェーズ計画 → 第1部-14章
- [ ] メトリクス → 第1部-9.2章
