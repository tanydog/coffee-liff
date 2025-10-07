# Coffee LIFF Platform

エンドユーザーの嗜好診断とログ体験を LINE 上で完結させ、パートナー店舗への送客と定期購買につなげるプロダクトです。2024 年度のリブートでは、事業仮説の整理と合わせてアプリケーション構造を全面的に再設計しました。

## リポジトリ構成
| ディレクトリ | 説明 |
| --- | --- |
| `public/` | LIFF で配信するフロントエンド。ES Modules ベースでページごとに責務を分離し、共通ロジックは `scripts/` 配下に集約しています。 |
| `functions/` | Firebase Functions (Express) のバックエンド。ドメインサービスとリポジトリを分離し、テスタブルな構成に整理しました。 |
| `docs/` | 事業戦略・UX 改修のドキュメント。経営視点の意思決定材料とデザイン原則を収録しています。 |

## 主要ドキュメント
- [プロダクト戦略リニューアル](docs/product_strategy.md)
- [UI/UX オーバーホール計画](docs/ui_ux_overhaul.md)

## 技術ハイライト
- **モジュール型フロントエンド**: `public/scripts` をコア/サービス/UI/ページ層に分割。LIFF 初期化や API クライアントを共通化し、ページ単位の改善や AB テストがしやすい構造にしました。
- **ユースケース指向 API**: Functions 側は `AuthService`・`LogService`・`DiagnosisService` など業務ユースケース単位で構築し、FireStore リポジトリを介してデータ層を抽象化しています。
- **観測性と運用性**: リクエスト単位のコンテキスト（requestId・スコープ付きロガー）を導入し、API エラーは UI にトレース ID を返却。事象の切り分けと SLA 監視を高速化します。
- **経営指標との接続**: 診断スコアやログ情報はマネタイズ施策（リード創出・レコメンド連携）に直結するため、API とフロント双方でバリデーションとテレメトリのポイントを明示しました。

## セットアップ
```bash
npm install --prefix functions
```

### ローカル実行
Firebase Emulator を利用します。
```bash
cd functions
npm run serve
```
（必要に応じて `firebase emulators:start --only functions,hosting` を利用し、`public/config.js` にテスト用 LIFF ID と API Base を指定してください）

## テスト戦略
- バックエンドはサービス単位でユニットテストを追加予定（Mocha + Sinon）。
- フロントエンドは Playwright による主要シナリオ（ログ登録、診断、結果閲覧）の E2E テストを計画中です。

## 今後のロードマップ
1. BigQuery へのイベント連携と Looker Studio ダッシュボードで KPI を可視化。
2. パートナー管理向けの管理画面（Web）を追加し、診断コンテンツをノーコードで更新可能にする。
3. サブスクリプション決済（Stripe）とアフィリエイト連携を段階的に導入。

---
プロダクトの目的・価値仮説・UI/UX の詳細な方針は各ドキュメントを参照してください。
