# Mini Mall 技術規格（SPEC）

> 版本：v1.0 ・ 日期：2026-10-25 ・ 需求見 [PRD.md](./PRD.md)

## 1. 技術棧

| 類別 | 選用 | 說明 |
|---|---|---|
| 框架 | Next.js 16.4（App Router） | Server Components + Server Actions，Turbopack，**Cache Components + Partial Prefetching 開啟** |
| 語言 | TypeScript（strict） | |
| ORM | Prisma 6（≥ 6.2） | 經典 `prisma-client-js` generator，不使用 driver adapter |
| 資料庫 | SQLite | 檔案 `prisma/dev.db`，只在本機執行 |
| 樣式 | TailwindCSS 4 | CSS-first 設定（`@import "tailwindcss"`），由 `@tailwindcss/turbopack` loader 編譯 |
| UI 元件 | shadcn/ui 4（base-nova） | 底層為 Base UI，元件複製進 `src/components/ui/`，圖示用 lucide-react |
| 提示訊息 | sonner | 掛在根 layout |
| 驗證 | zod | 表單與 Server Action 輸入驗證 |
| 認證 | bcryptjs + jose | 自建 session（JWT 存 httpOnly cookie） |
| 測試 | vitest | 純邏輯單元測試 |
| 腳本 | tsx | 執行 seed |

執行環境：Node 24、npm 11、Windows 10。

## 2. 架構

- **讀取**：Server Components 直接呼叫各功能模組的 `queries.ts`（內部使用 Prisma）
- **寫入**：Client 表單呼叫各功能模組的 `actions.ts`（`"use server"`），完成後 `revalidatePath` 或 `redirect`
- **不建立獨立 REST API 層**；唯一的 Route Handler 是上傳圖片的讀取路由 `/uploads/[name]`
- **`proxy.ts` 只負責導向**（提升體驗），**不是安全邊界**；每個 Server Action 與受保護頁面都要自行呼叫 `requireUser()` / `requireAdmin()`
- Client Component 只用在需要互動的地方（表單、數量選擇、上傳預覽等）

### 2.1 Cache Components 規則
- 讀取資料庫、`cookies()`、`params`、`searchParams` 屬於請求期資料，必須在 `<Suspense>` 邊界內讀取，否則 build 失敗
- 頁面寫法固定為「同步外殼 + Suspense 內的非同步子元件」：page 本身不 `await`，把 `params`/`searchParams` 的 Promise 傳給子元件
- layout 頂層不讀 session；Header 的登入狀態、購物車件數各自包在 Suspense 內串流
- 預設**不快取**任何資料，確保庫存、價格即時；若之後要優化商品列表，再對 `catalog/queries.ts` 加 `'use cache'` + `cacheTag`，並在後台異動時 `updateTag`
- `'use cache'` 範圍內不能呼叫 `cookies()` / `headers()`
- GET Route Handler（`/uploads/[name]`）讀檔案時會自動在請求期執行，不需特別處理
- 在 Suspense 內呼叫 `notFound()` 時靜態外殼已送出，HTTP 狀態碼仍是 200；畫面會顯示 not-found 內容，Next 也會加上 `<meta name="robots" content="noindex">`。本機專案接受此行為

## 3. 目錄結構

原則：**按功能拆模組，每個功能的 actions、queries、schemas、components 分開存放，不把多個功能寫進同一個檔案。** `app/` 只放路由與組裝，業務邏輯放在 `features/`。

```
prisma/
  schema.prisma
  seed.ts
  migrations/
public/seed/                       # seed 用的商品佔位圖（建置時就存在，可直接服務）
storage/uploads/                   # 後台上傳的圖片（gitignore）
src/
  app/
    layout.tsx                     # 根 layout：html/body、Toaster
    (shop)/
      layout.tsx                   # 前台版面：Header、Footer
      page.tsx                     # 首頁 = 商品列表
      products/[id]/page.tsx
      cart/page.tsx
      checkout/page.tsx
      orders/page.tsx
      orders/[id]/page.tsx
      orders/[id]/pay/page.tsx
      login/page.tsx               # 登入、註冊也在 (shop) 內，共用前台 Header/Footer
      register/page.tsx
    admin/
      layout.tsx                   # 側邊選單 + requireAdmin()
      page.tsx                     # 概覽
      categories/page.tsx
      products/page.tsx
      products/new/page.tsx
      products/[id]/edit/page.tsx
      orders/page.tsx
      orders/[id]/page.tsx
    uploads/[name]/route.ts        # 讀取 storage/uploads 的圖片
    not-found.tsx
  features/
    catalog/
      queries.ts                   # getProducts / getProductById / getCategories
      components/                  # ProductCard ProductGrid SearchBar CategoryFilter SortSelect
    auth/
      actions.ts                   # register / login / logout
      schemas.ts                   # registerSchema / loginSchema
      components/                  # LoginForm RegisterForm UserMenu
    cart/
      actions.ts                   # addToCart / updateCartItem / removeCartItem
      queries.ts                   # getCart / getCartCount
      components/                  # CartLink CartItemRow CartView（加入購物車由 catalog 的 PurchasePanel 呼叫 addToCart）
    checkout/
      actions.ts                   # placeOrder / payOrder
      schemas.ts                   # checkoutSchema
      components/                  # CheckoutForm PaymentPanel
    orders/
      actions.ts                   # cancelOrder / confirmReceipt
      queries.ts                   # getMyOrders / getMyOrder
      components/                  # OrderList OrderDetail OrderTimeline OrderStatusBadge
    admin-dashboard/
      queries.ts                   # getDashboardStats
      components/                  # StatCard
    admin-category/
      actions.ts  queries.ts  schemas.ts  components/
    admin-product/
      actions.ts  queries.ts  schemas.ts  components/   # ProductForm ImageUpload ProductTable
    admin-order/
      actions.ts  queries.ts  components/
  lib/
    prisma.ts                      # PrismaClient 單例
    session.ts                     # JWT 簽發 / 驗證、cookie 讀寫
    auth-guard.ts                  # getCurrentUser / requireUser / requireAdmin
    money.ts                       # formatPrice、元 ↔ 分 轉換
    order-status.ts                # 訂單狀態機
    upload.ts                      # 圖片儲存與驗證
    action-result.ts               # ActionResult 型別與輔助函式
    utils.ts                       # cn() 等（shadcn）
  components/
    ui/                            # shadcn 產生的元件
    layout/                        # Header Footer AdminSidebar Pagination
  proxy.ts
```

模組規則：
- 功能之間只透過對方匯出的 `queries` / `actions` 互相呼叫，不直接引用對方 `components` 內部實作
- 單一檔案超過約 200 行時繼續拆分
- 測試放在模組旁：`features/*/__tests__/`、`lib/__tests__/`

## 4. 資料模型

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  ADMIN
}

enum OrderStatus {
  PENDING
  PAID
  SHIPPED
  COMPLETED
  CANCELLED
}

model User {
  id           String     @id @default(cuid())
  email        String     @unique
  passwordHash String
  name         String
  role         Role       @default(USER)
  createdAt    DateTime   @default(now())
  cartItems    CartItem[]
  orders       Order[]
}

model Category {
  id        String    @id @default(cuid())
  name      String    @unique
  slug      String    @unique
  sortOrder Int       @default(0)
  products  Product[]
}

model Product {
  id          String      @id @default(cuid())
  name        String
  description String
  price       Int                         // 單位：分
  stock       Int         @default(0)
  image       String?                     // /seed/xxx.svg 或 /uploads/<uuid>.webp
  isActive    Boolean     @default(true)
  categoryId  String
  category    Category    @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  cartItems   CartItem[]
  orderItems  OrderItem[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([categoryId])
  @@index([isActive, createdAt])
}

model CartItem {
  id        String  @id @default(cuid())
  userId    String
  productId String
  quantity  Int
  createdAt DateTime @default(now())        // 購物車依加入順序顯示
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([userId, productId])
}

model Order {
  id           String      @id @default(cuid())
  orderNo      String      @unique          // MM + yyyyMMddHHmmss + 4 位亂數
  userId       String
  user         User        @relation(fields: [userId], references: [id])
  status       OrderStatus @default(PENDING)
  totalAmount  Int                          // 單位：分
  receiverName String
  phone        String
  address      String
  paidAt       DateTime?
  shippedAt    DateTime?
  completedAt  DateTime?
  cancelledAt  DateTime?
  createdAt    DateTime    @default(now())
  items        OrderItem[]

  @@index([userId, createdAt])
  @@index([status])
}

model OrderItem {
  id           String   @id @default(cuid())
  orderId      String
  order        Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId    String?
  product      Product? @relation(fields: [productId], references: [id], onDelete: SetNull)
  productName  String                       // 快照
  productImage String?                      // 快照
  price        Int                          // 快照單價，單位：分
  quantity     Int
}
```

刪除策略：
| 刪除對象 | 影響 |
|---|---|
| Category | `Restrict`：有商品時資料庫拒絕；action 先檢查並回傳友善錯誤 |
| Product | 購物車項目 `Cascade` 刪除；訂單明細 `productId` 設為 `null`，快照保留 |
| User | 不提供刪除功能 |

## 5. 訂單狀態機

集中定義在 `src/lib/order-status.ts`。改狀態一律用 `transitionUpdate(action, actor)` 產生條件式更新（actor 無權限時直接拋錯）；`canTransition` 只用於決定 UI 要顯示哪些按鈕。

| 動作 | 操作者 | 前置狀態 | 結果狀態 | 副作用 |
|---|---|---|---|---|
| `place` | 使用者 | — | `PENDING` | 扣減庫存、清空購物車 |
| `pay` | 使用者（本人） | `PENDING` | `PAID` | 寫入 `paidAt` |
| `ship` | 管理員 | `PAID` | `SHIPPED` | 寫入 `shippedAt` |
| `confirm` | 使用者（本人） | `SHIPPED` | `COMPLETED` | 寫入 `completedAt` |
| `cancel` | 使用者（本人）或管理員 | `PENDING`、`PAID` | `CANCELLED` | 回補庫存、寫入 `cancelledAt` |

狀態更新一律用條件更新避免競態：`updateMany({ where: { id, status: from }, data: {...} })`，回傳 `count === 0` 時視為狀態已變更並回傳錯誤。

## 6. 認證與 Session

- 密碼：`bcryptjs`，cost 10
- Token：`jose` `SignJWT`，演算法 HS256，金鑰為 `SESSION_SECRET`
  - payload 只有 `{ sub: userId }`，有效期 7 天。不放角色等會變動的資料，升降權立即生效
  - 簽發與驗證在 `src/lib/session-token.ts`（不依賴 `cookies()`，proxy 與單元測試共用）
- Cookie：名稱 `session`；`httpOnly`、`sameSite=lax`、`path=/`、`secure` 僅在 production 開啟、`maxAge` 7 天
- `src/lib/session.ts`：`createSession(user)`、`readSession()`、`deleteSession()`（`cookies()` 需 `await`）
- `src/lib/auth-guard.ts`：
  - `getCurrentUser()`：驗證 token 後**從資料庫讀取**使用者（`id, name, email, role`），以 React `cache()` 包裝，同一請求只查一次
  - `requireUser()`：未登入則 `redirect('/login?next=...')`
  - `requireAdmin()`：非 `ADMIN` 則 `redirect('/')`
  - 權限一律以資料庫中的 `role` 為準
- `src/proxy.ts`：
  - matcher：`/cart`、`/checkout`、`/orders/:path*`、`/admin/:path*`
  - 只驗 token：無效 → 導向 `/login?next=<原路徑>`；不判斷角色（由 `requireAdmin` 查資料庫）
- 登入：帳號不存在時仍以假雜湊執行一次 `bcrypt.compare`，回應時間與密碼錯誤相同
- 登出：選單外的隱藏 `<form action={logout}>`，選單按鈕以 `form` 屬性送出，沒有 JS 也能運作
- `next` 參數只接受以 `/` 開頭且非 `//` 開頭的站內路徑，避免開放式重導

## 7. 路由表

| 路徑 | 權限 | 說明 / 參數 |
|---|---|---|
| `/` | 公開 | 商品列表；`?q=`、`?category=<slug>`、`?sort=newest\|price_asc\|price_desc`、`?page=` |
| `/products/[id]` | 公開 | 商品詳情；下架或不存在 → 顯示 not-found 內容（狀態碼見 2.1） |
| `/login`、`/register` | 公開（已登入直接導向 `next`，預設 `/`） | `?next=` 登入後回跳 |
| `/cart` | 使用者 | 購物車 |
| `/checkout` | 使用者 | 結帳；購物車空或有無效項目 → 導回 `/cart` |
| `/orders` | 使用者 | 我的訂單；`?status=` |
| `/orders/[id]` | 使用者（本人） | 訂單詳情 |
| `/orders/[id]/pay` | 使用者（本人） | 模擬付款；付款後同頁顯示「付款成功」，其他狀態顯示目前狀態與「查看訂單」連結 |
| `/admin` | 管理員 | 概覽 |
| `/admin/categories` | 管理員 | 分類列表 + 新增 / 編輯對話框 |
| `/admin/products` | 管理員 | `?q=`、`?category=`、`?active=true\|false`、`?page=` |
| `/admin/products/new`、`/admin/products/[id]/edit` | 管理員 | 商品表單 |
| `/admin/orders` | 管理員 | `?status=`、`?q=<orderNo>`、`?page=` |
| `/admin/orders/[id]` | 管理員 | 訂單詳情、出貨、取消 |
| `/uploads/[name]` | 公開 | 回傳上傳的圖片 |

Next 16 注意：`params`、`searchParams` 都是 Promise，頁面中需 `await`。

## 8. Server Actions

統一回傳型別（`src/lib/action-result.ts`）：

```ts
type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }
```

表單使用 `useActionState` 顯示錯誤；成功時以 sonner 提示或 `redirect`。

| 模組 | Action | 權限 | 輸入（zod） | 主要檢查 / 錯誤 |
|---|---|---|---|---|
| auth | `register` | 公開 | `name` 1–30、`email`、`password` ≥ 8、`confirmPassword` 相符 | Email 已存在 |
| auth | `login` | 公開 | `email`、`password`、`next?` | 統一錯誤「Email 或密碼錯誤」 |
| auth | `logout` | 任何人 | — | 只刪除 cookie，未登入時等同無動作，因此不呼叫 `requireUser` |
| cart | `addToCart` | 使用者 | `productId`、`quantity` int 1–99 | 商品下架；累加後超過 `purchaseLimit(stock)`（條件式更新，並發安全） |
| cart | `updateCartItem` | 使用者 | `itemId`、`quantity` int 1–99 | 項目歸屬；超過 `purchaseLimit(stock)` |
| cart | `removeCartItem` | 使用者 | `itemId` | 項目歸屬 |
| checkout | `placeOrder` | 使用者 | `receiverName` 1–30、`phone` `^09\d{8}$`、`address` 5–200 | 見 9.1 |
| checkout | `payOrder` | 使用者（本人） | `orderId` | 狀態機 `pay` |
| orders | `cancelOrder` | 使用者（本人） | `orderId` | 狀態機 `cancel`，見 9.2 |
| orders | `confirmReceipt` | 使用者（本人） | `orderId` | 狀態機 `confirm` |
| admin-category | `createCategory` / `updateCategory` | 管理員 | `name` 1–20、`slug` `^[a-z0-9-]+$`、`sortOrder` int | 名稱 / slug 重複 |
| admin-category | `deleteCategory` | 管理員 | `id` | 分類下仍有商品 |
| admin-product | `createProduct` / `updateProduct` | 管理員 | `name` 1–100、`description` ≤ 2000、`price` 以元輸入轉為分（> 0）、`stock` int ≥ 0、`categoryId`、`isActive`、`image?: File` | 分類不存在；圖片驗證見 9.3 |
| admin-product | `toggleProductActive` | 管理員 | `id` | — |
| admin-product | `deleteProduct` | 管理員 | `id` | — |
| admin-order | `shipOrder` | 管理員 | `orderId` | 狀態機 `ship` |
| admin-order | `adminCancelOrder` | 管理員 | `orderId` | 狀態機 `cancel`，見 9.2 |

每個 action 的順序固定：**權限檢查 → zod 驗證 → 資料歸屬檢查 → 業務邏輯 → 更新畫面**。資料沒有快取，更新畫面用 `refresh()`；資料庫錯誤回傳「系統忙碌中」而不是讓例外拋到前端。

## 9. 關鍵流程

### 9.1 下單（`placeOrder`）
在單一 `prisma.$transaction(async (tx) => { ... })` 內：
1. 讀取該使用者的購物車與商品
2. 購物車為空 → 錯誤
3. 逐項檢查 `isActive` 與 `stock >= quantity`，不符則回傳是哪個商品有問題
4. 逐項條件扣減：`tx.product.updateMany({ where: { id, stock: { gte: qty } }, data: { stock: { decrement: qty } } })`，`count === 0` → 拋錯讓整筆交易回滾（防超賣）
5. 以**伺服器端讀到的價格**計算總額（不信任前端），並與表單帶上的 `expectedTotal`（使用者在結帳頁看到的合計）比對；不一致時回滾並重新渲染結帳頁顯示新金額
6. 建立 `Order` 與 `OrderItem`（寫入名稱、圖片、單價快照）
7. 刪除該使用者的購物車項目
8. 交易完成後 `refresh()`（頁首角標）再 `redirect('/orders/<id>/pay')`

### 9.2 取消訂單
在交易內：條件更新狀態（`where: { id, status: { in: ['PENDING', 'PAID'] } }`）→ 成功後逐項回補庫存（`productId` 為 `null` 的明細略過）。

### 9.3 圖片上傳
- 由 `admin-product` 的 action 接收 `FormData` 中的 `File`
- `src/lib/upload.ts`：
  - 檢查 MIME 為 `image/jpeg`、`image/png`、`image/webp`，並檢查檔頭 magic bytes
  - 大小 ≤ 2MB
  - 檔名 `crypto.randomUUID() + 副檔名`，不使用使用者提供的檔名
  - 寫入 `storage/uploads/`，資料庫存 `/uploads/<檔名>`
  - 更換圖片時刪除舊的上傳檔（`/seed/` 開頭的不刪）
- `src/app/uploads/[name]/route.ts`：以正規表示式 `^[0-9a-f-]{36}\.(jpg|png|webp)$` 驗證檔名，讀檔並回傳正確 `Content-Type` 與快取標頭；不符或不存在回 404
- 不放在 `public/` 的原因：`next build && next start` 只服務建置當下已存在的 `public` 檔案，執行期間上傳的檔案會 404

### 9.4 商品搜尋
- `q`：`OR: [{ name: { contains: q } }, { description: { contains: q } }]`（SQLite 的 `LIKE` 對 ASCII 不分大小寫，Prisma 在 SQLite 不支援 `mode: 'insensitive'`）
- `category`：以 slug 篩選
- 分頁：`skip = (page - 1) * 12`、`take = 12`，同時 `count` 計算總頁數；`page` 超出範圍時夾到合法值

## 10. 環境變數

`.env`（不進 git）與 `.env.example`（進 git）：

```
DATABASE_URL="file:./dev.db"
SESSION_SECRET="<至少 32 字元的隨機字串>"
```

`src/lib/env.ts` 以 zod 驗證上述變數（`SESSION_SECRET` 至少 32 字元），在 F4 實作 session 時加入；`lib/session.ts` 只透過它取得金鑰，未設定時直接拋錯而不是用空金鑰簽 JWT。

## 11. Seed 資料

`prisma/seed.ts`，透過 `package.json` 的 `prisma.seed` 設定為 `tsx prisma/seed.ts`：
- 分類 5 個：3C 電子、居家生活、服飾配件、美妝保養、食品飲料
- 商品約 20 個，平均分佈於各分類，圖片使用 `public/seed/*.svg` 佔位圖（依分類配色），含 1–2 個庫存為 0、1 個下架的商品供測試
- 帳號：
  - 管理員 `admin@minimall.dev` / `admin1234`
  - 一般使用者 `user@minimall.dev` / `user1234`
- seed 可重複執行（先清空資料再寫入）

## 12. 測試策略

- **vitest 單元測試**（純邏輯，不連資料庫）：
  - `lib/money.ts`：格式化、元 ↔ 分 轉換與邊界值
  - `lib/order-status.ts`：所有合法與非法狀態轉換
  - 各模組 `schemas.ts`：合法與非法輸入
- **每個功能 commit 前的自檢**：`npm run typecheck`、`npm run lint`、`npm test`、`npm run build`，並以 `/code-review` 審查本次變更
- **手動 / 瀏覽器走查**：依 PRD 第 7 節各里程碑的驗收重點

## 13. 常用指令

```bash
npm install
npx prisma migrate dev          # 建立 / 更新資料庫
npx prisma db seed              # 寫入測試資料
npm run dev                     # 開發模式
npm run build && npm start      # 正式模式（驗證上傳圖片）
npm run lint
npm run typecheck               # next typegen + tsc
npm test                        # vitest run
npx prisma studio               # 檢視資料
```

## 14. 版本相關注意事項

**Next.js 16**
- `middleware.ts` 已改名為 `proxy.ts`
- `params`、`searchParams`、`cookies()`、`headers()` 皆為非同步，需 `await`
- 預設使用 Turbopack
- 預設開啟 Cache Components，規則見 2.1；版本專屬文件在 `node_modules/next/dist/docs/`
- `LayoutProps` / `PageProps` 為 `next typegen` 產生的全域型別

**Prisma 6**
- 6.2 起 SQLite 支援 `enum`，`Role`、`OrderStatus` 直接使用 Prisma 產生的型別
- `PrismaClient` 在開發模式需掛在 `globalThis` 避免熱更新時重複建立連線

**TailwindCSS 4**
- 不使用 `tailwind.config.js`，主題設定寫在 CSS 的 `@theme`
- 不使用 PostCSS，改由 `next.config.ts` 的 `turbopack.rules` 掛 `@tailwindcss/turbopack` loader

**SQLite**
- 金額使用 `Int`（分），不使用 `Float`
- 寫入時整個資料庫加鎖，本機單人使用不成問題
