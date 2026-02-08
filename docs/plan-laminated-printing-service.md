# ラミネート印刷配送サービス - 実装計画

## 概要

マラソンペース表を印刷・ラミネート加工し、ユーザーの自宅へ郵送するサービス。
レース当日に腕に巻いたり、ポケットに入れて使えるペースカードを想定。

---

## 1. 結論: API完全自動化は可能だが、500円では赤字

### コスト試算

| 項目 | API自動化 (Gelato) | セルフ運用 |
|------|-------------------|-----------|
| 印刷+ラミネート | 225〜400円 | 100〜200円 (バルク発注) |
| 国内配送 | 185〜385円 | 84円 (普通郵便) |
| Stripe手数料 (3.6%) | 18円 | 18円 |
| **合計** | **428〜803円** | **202〜302円** |

**推奨価格: 800〜1,000円** (API完全自動化の場合)

500円で収めるなら、自前で在庫を持ち普通郵便で送る半手動運用になる。
あるいは、500円は印刷+ラミネート費用で、送料別途とする方法もある。

---

## 2. 推奨アーキテクチャ

```
[既存フロントエンド]  →  [新規バックエンド]  →  [外部サービス]

 注文フォーム             Stripe決済処理          Stripe (決済)
 ペース表PDF生成          注文管理                Gelato API (印刷+配送)
 Stripe Checkout          Gelato API連携
                          Webhook受信
```

### フロントエンド (既存アプリに追加)

現在の SPA に注文フローを追加する。

### バックエンド (新規)

現在は静的サイト (GitHub Pages) のため、サーバーサイドが必要。
選択肢:

| 方式 | メリット | デメリット |
|------|---------|-----------|
| **Cloudflare Workers** | 無料枠大、エッジ実行、KVストレージ | Workerランタイムの制約 |
| **Vercel Serverless Functions** | Next.js親和性、デプロイ簡単 | フロントをVercelに移す必要あり |
| **Supabase Edge Functions + DB** | DB付き、認証付き | やや過剰 |
| **独立Express/Hono サーバー** | 自由度高い | インフラ管理が必要 |

**推奨: Cloudflare Workers + D1 (SQLite)**
- 無料枠で十分 (10万リクエスト/日)
- D1でシンプルな注文管理DB
- Stripe Webhook受信が容易
- Gelato API呼び出しもfetch()で可能

---

## 3. 印刷・配送サービス選定

### 第1候補: Gelato API

全工程をAPI1本で完結できる唯一のサービス。

- **公式API**: https://dashboard.gelato.com/docs/
- **対応プロダクト**: ポストカード、グリーティングカード、各種カード
- **ラミネート**: `glossy-lamination`, `matt-lamination`, `soft-touch-lamination`
- **日本国内印刷**: 現地パートナー工場で印刷→国内配送
- **配送**: 注文から3〜5営業日
- **テスト注文**: サポートあり (実際に配送されるテストモード)

#### API フロー
```
1. POST /v3/orders  → 注文作成 (商品、アートワークURL、配送先)
2. Webhook          → 注文ステータス更新通知
3. GET /v3/orders/{id} → ステータス確認
```

#### アートワーク (PDF) の準備
- フロントエンドでCanvas → PDF変換 (jsPDF ライブラリ)
- または、バックエンドでPDF生成 (puppeteer, @react-pdf/renderer)
- Gelato の要求フォーマットに合わせたテンプレートが必要

### 第2候補: Cloudprinter API

Gelatoと同様の統合サービス。

- **公式API**: https://docs.cloudprinter.com/
- **日本国内パートナー**: あり
- **ラミネート**: マット、グロス、ソフトタッチ
- **価格API**: `price/lookup` エンドポイントで動的見積もり

### 印刷サービスが使えない場合のフォールバック

日本国内のネット印刷 (ラクスル、グラフィック等) はAPIを公開していない。
この場合は以下の半自動フローになる:

```
Stripe決済 → 注文データをDBに保存 → 管理画面で確認
→ 手動でPDF入稿 → 印刷所から自宅へ納品 → 手動で発送
```

---

## 4. 機能詳細設計

### 4.1 注文フォーム (フロントエンド)

既存のシェアモーダルと同様のモーダルUIで実装。

**入力項目:**

| フィールド | 型 | バリデーション |
|-----------|-----|--------------|
| 氏名 | text | 必須 |
| 郵便番号 | text | 7桁、ハイフンなし可 |
| 都道府県 | select | 47都道府県 |
| 市区町村 | text | 必須 |
| 番地・建物名 | text | 必須 |
| 電話番号 | tel | 必須 (配送用) |
| メールアドレス | email | 必須 (確認メール) |
| 枚数 | number | 1〜10 |
| ラミネート | select | マット / グロス / ソフトタッチ |
| フォントサイズ | select | S (レース中に見やすい最小) / M (標準) / L (大きめ) |
| 単位 | auto | 現在選択中のkm/miを自動反映 |
| ターゲットタイム | auto | 現在のスライダー値を自動反映 |

**フォントサイズとカードサイズの対応:**

| サイズ | カード寸法 | フォントサイズ | 用途 |
|--------|-----------|--------------|------|
| S | 名刺サイズ (91×55mm) | 8pt | 腕バンドに入る |
| M | ハガキサイズ (148×100mm) | 12pt | ポケットに入る |
| L | A5 (210×148mm) | 16pt | 見やすさ重視 |

### 4.2 PDF生成

ペース表をPDFとして生成する。既存のCanvas画像生成ロジック (`generatePaceCardImage()`) を拡張。

**案A: フロントエンドで生成 (jsPDF)**
```
Canvas描画 → jsPDF でPDF化 → Blob URL → バックエンドにアップロード
```
- メリット: サーバー負荷なし
- デメリット: フォント埋め込みが面倒

**案B: バックエンドで生成 (@react-pdf/renderer)**
```
注文データ → React PDFコンポーネント → PDF Buffer → Gelato に渡す
```
- メリット: フォント制御が確実、テンプレート管理しやすい
- デメリット: サーバーリソース必要

**推奨: 案B** — 印刷品質を担保するにはサーバーサイドPDF生成が安定。

### 4.3 Stripe決済

**Stripe Checkout Session (サーバーサイド)** を使用。

```
フロントエンド                    バックエンド                 Stripe
    |                               |                          |
    |-- POST /api/create-checkout -->|                          |
    |                               |-- Create Session -------->|
    |                               |<-- Session URL -----------|
    |<-- redirect URL --------------|                          |
    |-- redirect to Stripe -------->|                          |
    |                               |                          |
    |   (ユーザーがカード情報入力)                               |
    |                               |                          |
    |                               |<-- checkout.completed ----|
    |                               |-- Gelato注文作成 -------->|
    |<-- /order-complete に戻る -----|                          |
```

**価格設定:**
- Stripe上に商品 (Product) と価格 (Price) を事前作成
- 枚数 × 単価 で計算
- ラミネート種類による価格差はメタデータで管理

### 4.4 注文管理

**D1 (SQLite) テーブル設計:**

```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,           -- UUID
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent TEXT,
  status TEXT DEFAULT 'paid',    -- paid → printing → shipped → delivered

  -- 注文内容
  target_time_seconds INTEGER,
  unit TEXT,                     -- 'km' or 'mi'
  quantity INTEGER,
  lamination TEXT,               -- 'matte', 'glossy', 'soft-touch'
  font_size TEXT,                -- 'S', 'M', 'L'

  -- 配送先
  name TEXT,
  postal_code TEXT,
  prefecture TEXT,
  city TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,

  -- 外部連携
  gelato_order_id TEXT,
  pdf_url TEXT,
  tracking_number TEXT,

  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

### 4.5 注文ステータス管理

```
[決済完了] → [PDF生成中] → [印刷発注済] → [印刷中] → [発送済] → [配達完了]
  paid      generating    ordered       printing    shipped     delivered
```

- Stripe Webhook (`checkout.session.completed`) で `paid` に
- PDF生成完了 → Gelato APIで発注 → `ordered` に
- Gelato Webhook で `printing` → `shipped` に更新
- 追跡番号が付いたらメール通知

---

## 5. 実装フェーズ

### Phase 1: MVP (最小構成)

**目標: 注文→決済→手動印刷発送の流れを確立**

1. 注文フォームUI (モーダル)
2. Stripe Checkout 連携 (Cloudflare Workers)
3. 注文データのDB保存 (D1)
4. PDF生成 (フロントエンド jsPDF でまず実装)
5. 管理者向け注文一覧ページ (シンプルなもの)
6. 注文確認メール (Resend API or SendGrid)

この段階では印刷・発送は手動。Gelato連携前に需要を確認する。

### Phase 2: 印刷自動化

7. Gelato API 連携
8. PDF → Gelato アートワークアップロード
9. Gelato Webhook でステータス追跡
10. 発送通知メール (追跡番号付き)

### Phase 3: 改善

11. 注文ステータスページ (ユーザー向け)
12. 複数ターゲットタイムの一括注文
13. カスタムデザイン (色、名前入り)
14. バックエンドPDF生成に移行

---

## 6. 技術スタック (まとめ)

| レイヤー | 技術 | 理由 |
|---------|------|------|
| フロントエンド | 既存 React SPA | 追加モーダルのみ |
| PDF生成 | jsPDF (Phase 1) → @react-pdf (Phase 3) | 段階的に品質向上 |
| バックエンド | Cloudflare Workers | 無料枠、エッジ実行 |
| DB | Cloudflare D1 | Workers と統合、SQLite |
| 決済 | Stripe Checkout | 要件通り |
| 印刷+配送 | Gelato API | 唯一の完全自動化対応 |
| メール | Resend | 安価、API簡単 |
| ホスティング | GitHub Pages (フロント) + Cloudflare (API) | 既存構成を維持 |

---

## 7. リスクと対策

| リスク | 影響 | 対策 |
|--------|------|------|
| Gelato の日本向けカード商品が限定的 | ラミネートカードが注文できない | Phase 1で手動運用しつつ、Gelato/Cloudprinterに問い合わせ |
| 500円では原価割れ | 赤字 | 800〜1,000円に設定、または送料別 |
| Gelato APIの仕様変更 | 連携が壊れる | Webhook監視、フォールバック手動フロー |
| 注文数が少ない | Gelato契約の固定費負け | Phase 1は手動運用で需要を確認してから自動化 |
| PDF品質 (フォント、解像度) | 印刷品質が低い | テスト注文で検証、必要ならバックエンド生成に切替 |

---

## 8. 次のアクション

1. **Gelato に問い合わせ**: 日本国内向けのラミネートカード商品の具体的なラインナップと価格
2. **Stripe アカウント設定**: テストモードでCheckout Sessionの動作確認
3. **Cloudflare Workers プロジェクト作成**: `wrangler init` でAPIプロジェクトを準備
4. **Phase 1 の実装開始**: 注文フォームUIから着手
