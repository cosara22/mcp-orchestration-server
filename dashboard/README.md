# MCP Orchestration Dashboard

可視化ダッシュボードアプリケーション for MCP Orchestration Server

## 機能

- **ダッシュボード**: システムの全体的な健全性、主要メトリクス、リアルタイムグラフ
- **メトリクス**: 詳細なパフォーマンスメトリクス、エージェント分布、タスク処理状況
- **ログ**: ログの検索、フィルタリング、リアルタイム表示
- **トレース**: タスクのライフサイクル可視化、分散トレーシング

## 技術スタック

- React 19
- TypeScript
- Vite
- Recharts (グラフ描画)
- Tailwind CSS (スタイリング)
- Lucide React (アイコン)

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build
```

## 開発中

現在、モックデータを使用しています。実際のAPIエンドポイントに接続するには、`src/services/api.ts` のTODOコメントを参照してください。

## ポート

- フロントエンド: `http://localhost:3000`
- APIプロキシ: `/api` → `http://localhost:3001`
- メトリクス: `/metrics` → `http://localhost:9090`
