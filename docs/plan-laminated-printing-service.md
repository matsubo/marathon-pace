# ラミネート印刷配送サービス - 実装計画

## 概要

マラソンペース表を印刷・ラミネート加工し、ユーザーの自宅へ郵送するサービス。
レース当日に腕に巻いたり、ポケットに入れて使えるペースカードを想定。
**すべての工程をAPI連携で完全自動化する。手動オペレーションは一切行わない。**

---

## 1. コスト試算と価格設定

### 原価内訳 (Gelato API 完全自動化)

| 項目 | 最小 | 最大 |
|------|------|------|
| 印刷+ラミネート (カード1枚) | 225円 | 400円 |
| 国内配送 | 185円 | 385円 |
| Stripe手数料 (3.6% + 40円) | ― | ― |
| **原価合計 (手数料前)** | **410円** | **785円** |

### 価格設定

| 項目 | 金額 |
|------|------|
| **販売価格** | **980円 (税込)** |
| 原価 (印刷+配送) | 410〜785円 |
| Stripe手数料 (3.6% + 40円) | 75円 |
| **粗利** | **120〜495円** |

- 2枚目以降は +500円/枚 (配送はまとめて1回)
- ラミネート種類による価格差はなし (シンプルに保つ)

---

## 2. アーキテクチャ

```
[既存 React SPA]  →  [Cloudflare Workers API]  →  [Stripe]  決済
  (GitHub Pages)           (D1 + R2)             [Gelato]  印刷+配送
                                                  [Resend]  メール通知
```

### 完全自動フロー

```
ユーザー          フロントエンド       Workers API        Stripe         Gelato        Resend
  |                   |                  |                 |               |              |
  |-- ペース設定 ---->|                  |                 |               |              |
  |-- 注文入力 ------>|                  |                 |               |              |
  |                   |-- POST /checkout->|                |               |              |
  |                   |                  |-- Create PDF -->| (R2保存)      |              |
  |                   |                  |-- Session ----->|               |              |
  |                   |<-- redirect -----|                 |               |              |
  |-- カード入力 ---->|                  |                 |               |              |
  |                   |                  |<-- Webhook -----|               |              |
  |                   |                  |   (payment OK)  |               |              |
  |                   |                  |-- POST order ---|-------------->|              |
  |                   |                  |-- 注文確認 ------|---------------|------------->|
  |<-- 完了画面 ------|                  |                 |               |              |
  |                   |                  |                 |               |              |
  |                   |                  |<-- Webhook -----|-- shipped --->|              |
  |                   |                  |-- 発送通知 ------|---------------|------------->|
  |<-- メール --------|-----------------|-----------------|---------------|--------------|
```

**人間の介入ポイント: ゼロ**

---

## 3. 印刷・配送: Gelato API

全工程をAPI1本で完結できるサービス。

- **公式API**: https://dashboard.gelato.com/docs/
- **対応プロダクト**: ポストカード、グリーティングカード、各種カード
- **ラミネート**: `glossy-lamination`, `matt-lamination`, `soft-touch-lamination`
- **日本国内印刷**: 現地パートナー工場で印刷 → 国内配送
- **配送**: 注文から3〜5営業日
- **テスト注文**: サポートあり

### API フロー
```
1. POST /v3/orders    → 注文作成 (商品、アートワークURL、配送先)
2. Webhook            → 注文ステータス更新通知 (printing → shipped → delivered)
3. GET /v3/orders/{id} → ステータス確認
```

### フォールバック: Cloudprinter API

Gelatoが日本向けカード商品に対応していなかった場合の代替。

- **公式API**: https://docs.cloudprinter.com/
- **日本国内パートナー**: あり
- **ラミネート**: マット、グロス、ソフトタッチ
- **価格API**: `price/lookup` エンドポイントで動的見積もり

---

## 4. 機能詳細設計

### 4.1 注文フォーム (フロントエンド)

既存のシェアモーダルと同様のモーダルUIで実装。

**入力項目:**

| フィールド | 型 | バリデーション | 備考 |
|-----------|-----|--------------|------|
| 氏名 | text | 必須 | |
| 郵便番号 | text | 7桁 | 入力で住所自動補完 (zipcloud API) |
| 都道府県 | auto | 郵便番号から自動入力 | |
| 市区町村 | auto | 郵便番号から自動入力 | |
| 番地・建物名 | text | 必須 | |
| 電話番号 | tel | 必須 | 配送用 |
| メールアドレス | email | 必須 | 確認・発送通知メール |
| 枚数 | number | 1〜10 | |
| ラミネート | select | 必須 | マット / グロス / ソフトタッチ |
| フォントサイズ | select | 必須 | S / M / L |
| ターゲットタイム | auto | ― | 現在のスライダー値を自動反映 |
| 単位 (km/mi) | auto | ― | 現在選択中を自動反映 |

**フォントサイズとカードサイズの対応:**

| サイズ | カード寸法 | フォントサイズ | 用途 |
|--------|-----------|--------------|------|
| S | 名刺サイズ (91×55mm) | 8pt | 腕バンドに入る |
| M | ハガキサイズ (148×100mm) | 12pt | ポケットに入る |
| L | A5 (210×148mm) | 16pt | 見やすさ重視 |

### 4.2 PDF生成 (バックエンド)

印刷品質を担保するため、**サーバーサイドでPDF生成**する。

```
Workers API:
  注文データ (タイム、チェックポイント、単位、フォントサイズ)
    ↓
  @react-pdf/renderer でPDF生成
    ↓
  Cloudflare R2 に保存 (公開URL)
    ↓
  Gelato注文時にアートワークURLとして渡す
```

- フォント: Bebas Neue + DM Sans (既存デザインと統一)
- PDFにフォントを埋め込み
- Gelato の入稿仕様 (裁ち落とし、解像度300dpi) に準拠

### 4.3 Stripe決済

**Stripe Checkout Session** を使用。

```
フロントエンド                    Workers API                  Stripe
    |                               |                          |
    |-- POST /api/checkout -------->|                          |
    |   (注文データ+配送先)          |-- PDF生成 → R2保存       |
    |                               |-- Create Session ------->|
    |                               |<-- Session URL ----------|
    |<-- redirect URL --------------|                          |
    |-- Stripe決済画面 ------------>|                          |
    |                               |                          |
    |   (カード情報入力・決済)                                   |
    |                               |                          |
    |                               |<-- checkout.completed ---|
    |                               |-- Gelato注文 ----------->|  (自動)
    |                               |-- 確認メール送信 -------->|  (自動)
    |<-- /order-complete に戻る -----|                          |
```

- Stripe Checkout の `metadata` に注文情報を埋め込み
- Webhook で決済完了を受け取り、即座にGelato発注
- 冪等性: `stripe_session_id` でGelato注文の重複防止

### 4.4 注文管理DB

**Cloudflare D1 (SQLite):**

```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,              -- UUID
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent TEXT,
  status TEXT DEFAULT 'paid',       -- paid → ordered → printing → shipped → delivered → failed

  -- 注文内容
  target_time_seconds INTEGER,
  unit TEXT,                        -- 'km' | 'mi'
  quantity INTEGER,
  lamination TEXT,                  -- 'matte' | 'glossy' | 'soft-touch'
  card_size TEXT,                   -- 'S' | 'M' | 'L'
  amount INTEGER,                   -- 決済額 (円)

  -- 配送先
  name TEXT,
  postal_code TEXT,
  prefecture TEXT,
  city TEXT,
  address_line TEXT,
  phone TEXT,
  email TEXT,

  -- 外部連携
  gelato_order_id TEXT,
  pdf_url TEXT,
  tracking_number TEXT,
  error_message TEXT,               -- 失敗時のエラー内容

  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

### 4.5 ステータス遷移 (すべて自動)

```
[決済完了] → [印刷発注済] → [印刷中] → [発送済] → [配達完了]
  paid        ordered       printing    shipped     delivered
    ↘
  [失敗] ← (どの段階からも遷移可能。アラート発報)
  failed
```

| イベント | トリガー | アクション |
|---------|---------|-----------|
| 決済完了 | Stripe Webhook `checkout.session.completed` | PDF生成 → R2保存 → Gelato発注 → 確認メール |
| 印刷開始 | Gelato Webhook `order.status.printing` | DB更新 |
| 発送済 | Gelato Webhook `order.status.shipped` | DB更新 → 追跡番号付きメール送信 |
| 配達完了 | Gelato Webhook `order.status.delivered` | DB更新 |
| 失敗 | Gelato Webhook `order.status.failed` | DB更新 → 管理者アラート (Slack/メール) → 自動返金 (Stripe Refund API) |

### 4.6 エラーハンドリング (自動復旧)

| エラー | 自動対応 |
|--------|---------|
| PDF生成失敗 | 3回リトライ → 失敗なら自動返金 + 管理者アラート |
| Gelato API エラー | 3回リトライ (指数バックオフ) → 失敗なら自動返金 |
| Gelato印刷失敗 | Gelato Webhook で検知 → 自動返金 + アラート |
| Stripe Webhook 受信漏れ | Stripe の自動リトライ (最大3日間) |

---

## 5. 実装タスク

**フェーズなし。すべて一括で実装し、初日から完全自動化。**

### バックエンド (Cloudflare Workers)

1. `wrangler` プロジェクト作成 (`api/` ディレクトリ)
2. D1 データベース + マイグレーション
3. R2 バケット (PDF保存用)
4. `POST /api/checkout` — PDF生成 + Stripe Session作成
5. `POST /api/webhooks/stripe` — 決済完了 → Gelato発注
6. `POST /api/webhooks/gelato` — ステータス更新 + メール通知
7. `GET /api/orders/:id` — 注文ステータス確認 (ユーザー向け)
8. PDF生成モジュール (@react-pdf/renderer)
9. Gelato API クライアント
10. メール送信 (Resend API) — 注文確認 + 発送通知
11. エラーハンドリング + 自動返金ロジック

### フロントエンド (既存 React SPA に追加)

12. 注文ボタン (ペース表の下に配置)
13. 注文フォームモーダル
14. 郵便番号 → 住所自動補完 (zipcloud API)
15. 注文確認画面 (プレビュー付き)
16. Stripe Checkout へのリダイレクト
17. 注文完了ページ (`/order-complete`)
18. 注文ステータス確認ページ (`/order/:id`)
19. i18n対応 (translations.ts に注文関連キー追加)

### インフラ・設定

20. Stripe アカウント設定 (商品・価格・Webhook)
21. Gelato アカウント設定 (APIキー・Webhook・商品確認)
22. Cloudflare D1 / R2 / Workers セットアップ
23. 環境変数管理 (Stripe秘密鍵, Gelato APIキー, Resend APIキー)
24. GitHub Actions に Workers デプロイを追加

---

## 6. 技術スタック

| レイヤー | 技術 | 理由 |
|---------|------|------|
| フロントエンド | 既存 React SPA (GitHub Pages) | 注文UIをモーダルで追加するのみ |
| バックエンド | Cloudflare Workers + Hono | 無料枠10万req/日、エッジ実行、fetch()ベース |
| DB | Cloudflare D1 (SQLite) | Workers統合、無料枠5GB |
| ストレージ | Cloudflare R2 | PDF保存、無料枠10GB |
| 決済 | Stripe Checkout | 要件通り。Webhookで後続処理をトリガー |
| 印刷+配送 | Gelato API (第1候補) / Cloudprinter (第2候補) | API完結で完全自動化 |
| メール | Resend | 月3,000通無料、API簡単 |
| PDF生成 | @react-pdf/renderer | React的にPDF構築、フォント埋め込み対応 |
| 住所補完 | zipcloud API | 無料、郵便番号→住所変換 |

---

## 7. リスクと対策

| リスク | 影響 | 対策 |
|--------|------|------|
| Gelato の日本向けカード商品が限定的 | ラミネートカード注文不可 | 事前にAPIカタログを確認。ダメならCloudprinterに切替 |
| Gelato APIの障害・仕様変更 | 注文が通らない | リトライ + 自動返金で顧客影響を最小化。アラートで即時検知 |
| PDF品質が印刷に不適 | 仕上がりが汚い | Gelatoテスト注文で事前検証。300dpi、CMYK対応 |
| 注文数が極端に少ない | 開発コストに見合わない | Cloudflare無料枠で固定費ゼロ。赤字リスクなし |
| 個人情報の取り扱い | 法的リスク | Stripeが決済情報を管理。住所はD1に暗号化保存。プライバシーポリシー必要 |

---

## 8. 次のアクション (優先順)

1. **Gelato APIカタログ確認** — 日本向けラミネートカード商品の有無と正確な価格を確認
2. **Stripe テストモード設定** — Checkout Session の動作確認
3. **Cloudflare Workers プロジェクト作成** — `api/` に `wrangler init`
4. **PDF生成プロトタイプ** — 既存ペース表デザインをPDF化、Gelato入稿仕様に合わせる
5. **フロントエンド注文フォーム実装** — UIから着手
6. **結合テスト** — テスト注文で実際にカードが届くことを確認
