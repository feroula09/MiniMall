# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概況

Mini Mall：本機執行的微型電商（商品瀏覽、註冊登入、購物車、下單 + 模擬付款、後台管理）。
需求與技術規格是唯一依據，動手前先讀對應章節：
- `specs/PRD.md`：功能 F2–F11 的驗收標準、訂單生命週期、里程碑
- `specs/SPEC.md`：資料模型、狀態機、認證、路由表、Server Actions 清單、關鍵流程

技術棧：Next.js 16.4（App Router，**Cache Components 開啟**）、TypeScript、Prisma 6 + SQLite、TailwindCSS 4、shadcn/ui（base-nova，基於 Base UI）、sonner、zod 4、bcryptjs + jose、vitest。
文件與 UI 文案使用繁體中文；程式碼、指令、變數名、檔案路徑使用英文。

@AGENTS.md

## 常用指令

```bash
npm run dev                         # 開發模式
npm run build && npm start          # 正式模式（驗證上傳圖片必須用這個）
npm run lint
npm run typecheck                   # next typegen + tsc（LayoutProps/PageProps 由 typegen 產生）
npm test                            # vitest run，全部測試
npx vitest run src/lib/__tests__/money.test.ts   # 單一檔案
npx vitest run -t "yuanToCents"     # 依測試名稱篩選
npx prisma migrate dev --name <name>   # 修改 schema 後
npx prisma db seed                  # 重建測試資料（可重複執行）
npx shadcn@4.22.1 add <component>   # 新增 UI 元件到 src/components/ui/
```

Seed 帳號：`admin@minimall.dev` / `admin1234`、`user@minimall.dev` / `user1234`。

## 架構要點

- **Cache Components**：讀資料庫、`cookies()`、`params`/`searchParams` 的元件必須包在 `<Suspense>` 內（或用 `'use cache'`），否則 build 失敗。page/layout 頂層不要直接 await 這些資料，改成「同步外殼 + Suspense 內的非同步子元件」。`'use cache'` 內不能讀 `cookies()`。寫這類程式前先查 `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md` 與 `02-guides/authentication-with-cache-components.md`。
- **路由群組**：根 `layout.tsx` 只放 html/body/Toaster；前台（含登入、註冊）的 Header/Footer 在 `(shop)/layout.tsx`，後台版面在 `admin/layout.tsx`。

- **讀用 Server Components，寫用 Server Actions**，沒有 REST API 層。唯一的 Route Handler 是 `src/app/uploads/[name]/route.ts`。
- **按功能拆模組**：業務邏輯放在 `src/features/<feature>/`（`actions.ts`、`queries.ts`、`schemas.ts`、`components/`），`src/app/` 的 page 只做路由與組裝。不同功能不要寫進同一個檔案；模組之間只透過對方的 `queries`/`actions` 互相呼叫。單檔超過約 200 行就拆分。
- **權限在伺服器端逐一檢查**：`src/proxy.ts` 只做導向，不是安全邊界。每個 Server Action 的固定順序是「`requireUser()`/`requireAdmin()` → zod 驗證 → 資料歸屬檢查 → 業務邏輯 → 更新畫面」。資料目前都沒有 `'use cache'`，更新畫面用 `refresh()`（`next/cache`）；之後若加了快取，改用 `updateTag`/`revalidatePath`。JWT 只存 `userId`，角色一律由 `getCurrentUser()` 查資料庫判斷；proxy 只檢查是否登入。唯一例外是 `logout`（只刪 cookie）。
- **訂單邏輯例外放在 `src/lib/`**：狀態機（`order-status.ts`）與取消回補庫存、衝突判斷（`order-mutations.ts`）由使用者端 `features/orders` 與後台 `features/admin-order` 共用，因此不屬於任一 feature。
- **訂單狀態只能經過 `src/lib/order-status.ts`**，狀態更新用 `updateMany({ where: { id, status: from } })` 做條件更新，`count === 0` 視為衝突。
- **下單與取消必須在 `prisma.$transaction` 內**：條件扣減庫存（`stock: { gte: qty }`）防超賣；取消時回補庫存。總額以伺服器讀到的價格計算。
- **購買數量上限**統一用 `src/lib/purchase-limit.ts` 的 `purchaseLimit(stock)`；累加購物車數量用條件式 `updateMany`（`quantity: { lte: limit - adding }`）避免並發超量。
- **金額一律為 `Int`（分）**，只在顯示時用 `src/lib/money.ts` 格式化。
- **訂單明細存快照**（名稱、圖片、單價），不要從 `Product` 回讀歷史訂單資料。
- **上傳圖片存 `storage/uploads/`，不能放 `public/`**：`next start` 不會服務建置後才新增的 public 檔案。資料庫存 `/uploads/<uuid>.<ext>`，seed 圖片是 `public/seed/*.svg`。
- Server Action 回傳 `ActionResult`（`src/lib/action-result.ts`），表單用 `useActionState` 顯示錯誤。

## 版本陷阱

- Next.js 16：`middleware.ts` 已改名 `proxy.ts`；`params`、`searchParams`、`cookies()`、`headers()` 都要 `await`。
- Prisma 6 + SQLite：可用 `enum`（`Role`、`OrderStatus`）；`contains` 不支援 `mode: 'insensitive'`。
- TailwindCSS 4：沒有 `tailwind.config.js`，主題寫在 `src/app/globals.css` 的 `@theme`；透過 `next.config.ts` 的 `@tailwindcss/turbopack` loader 編譯，沒有 PostCSS 設定。
- shadcn 元件底層是 Base UI：組合元素用 `render` prop（不是 `asChild`）；`render` 成原生 `<button>` 時要加 `nativeButton`。
- shadcn 元件的 `cn` 來自官方 `cn` 套件（取代 clsx + tailwind-merge），`src/lib/utils.ts` 只是轉出。
- npm 11 預設擋安裝腳本，`package.json` 的 `allowScripts` 鎖了版本；升級 Prisma 或 esbuild 後要再執行 `npm install-scripts approve <pkg>`。
- Prisma seed 設定在 `package.json#prisma`，Prisma 6 會提示此寫法在 7 版移除，目前可忽略。

## 開發流程

依 PRD 第 7 節的里程碑一次做一個功能，每個功能：
1. 實作
2. 自檢：`npm run typecheck`、`npm run lint`、`npm test`、`npm run build`
3. 用 `/code-review` 審查本次變更並修正
4. 向使用者展示變更摘要後 `git commit`（簡潔英文 message），再進行下一個功能
5. 不 `git push`
