# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概況

Mini Mall：本機執行的微型電商（商品瀏覽、註冊登入、購物車、下單 + 模擬付款、後台管理）。
需求與技術規格是唯一依據，動手前先讀對應章節：
- `specs/PRD.md`：功能 F2–F11 的驗收標準、訂單生命週期、里程碑
- `specs/SPEC.md`：資料模型、狀態機、認證、路由表、Server Actions 清單、關鍵流程

技術棧：Next.js 16（App Router）、TypeScript、Prisma 6 + SQLite、TailwindCSS 4、shadcn/ui、sonner、zod、bcryptjs + jose、vitest。
文件與 UI 文案使用繁體中文；程式碼、指令、變數名、檔案路徑使用英文。

> 目前只有 specs，尚未建立腳手架。完成 F1 後須依實際 `package.json` 更新下方指令。

## 常用指令

```bash
npm run dev                         # 開發模式
npm run build && npm start          # 正式模式（驗證上傳圖片必須用這個）
npm run lint
npx tsc --noEmit
npx vitest run                      # 全部測試
npx vitest run src/lib/__tests__/order-status.test.ts   # 單一檔案
npx vitest run -t "cancel"          # 依測試名稱篩選
npx prisma migrate dev --name <name>   # 修改 schema 後
npx prisma db seed                  # 重建測試資料（可重複執行）
```

Seed 帳號：`admin@minimall.dev` / `admin1234`、`user@minimall.dev` / `user1234`。

## 架構要點

- **讀用 Server Components，寫用 Server Actions**，沒有 REST API 層。唯一的 Route Handler 是 `src/app/uploads/[name]/route.ts`。
- **按功能拆模組**：業務邏輯放在 `src/features/<feature>/`（`actions.ts`、`queries.ts`、`schemas.ts`、`components/`），`src/app/` 的 page 只做路由與組裝。不同功能不要寫進同一個檔案；模組之間只透過對方的 `queries`/`actions` 互相呼叫。單檔超過約 200 行就拆分。
- **權限在伺服器端逐一檢查**：`src/proxy.ts` 只做導向，不是安全邊界。每個 Server Action 的固定順序是「`requireUser()`/`requireAdmin()` → zod 驗證 → 資料歸屬檢查 → 業務邏輯 → `revalidatePath`」。角色以資料庫為準，JWT 內的 `role` 只給 proxy 用。
- **訂單狀態只能經過 `src/lib/order-status.ts`**，狀態更新用 `updateMany({ where: { id, status: from } })` 做條件更新，`count === 0` 視為衝突。
- **下單與取消必須在 `prisma.$transaction` 內**：條件扣減庫存（`stock: { gte: qty }`）防超賣；取消時回補庫存。總額以伺服器讀到的價格計算。
- **金額一律為 `Int`（分）**，只在顯示時用 `src/lib/money.ts` 格式化。
- **訂單明細存快照**（名稱、圖片、單價），不要從 `Product` 回讀歷史訂單資料。
- **上傳圖片存 `storage/uploads/`，不能放 `public/`**：`next start` 不會服務建置後才新增的 public 檔案。資料庫存 `/uploads/<uuid>.<ext>`，seed 圖片則在 `public/seed/`。
- Server Action 回傳 `ActionResult`（`src/lib/action-result.ts`），表單用 `useActionState` 顯示錯誤。

## 版本陷阱

- Next.js 16：`middleware.ts` 已改名 `proxy.ts`；`params`、`searchParams`、`cookies()`、`headers()` 都要 `await`。
- Prisma 6 + SQLite：可用 `enum`（`Role`、`OrderStatus`）；`contains` 不支援 `mode: 'insensitive'`。
- TailwindCSS 4：沒有 `tailwind.config.js`，主題寫在 CSS 的 `@theme`。

## 開發流程

依 PRD 第 7 節的里程碑一次做一個功能，每個功能：
1. 實作
2. 自檢：`npx tsc --noEmit`、`npm run lint`、`npx vitest run`、`npm run build`
3. 用 `/code-review` 審查本次變更並修正
4. 向使用者展示變更摘要後 `git commit`（簡潔英文 message），再進行下一個功能
5. 不 `git push`
