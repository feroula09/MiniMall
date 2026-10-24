# Mini Mall

本機執行的微型電商練習專案：商品瀏覽、註冊登入、購物車、下單與模擬付款、後台管理。

- 需求：[specs/PRD.md](specs/PRD.md)
- 技術規格：[specs/SPEC.md](specs/SPEC.md)

## 快速開始

需要 Node 24 與 npm 11。

```bash
npm install
cp .env.example .env            # 並填入 SESSION_SECRET
npx prisma migrate dev          # 建立 SQLite 資料庫
npx prisma db seed              # 寫入測試資料
npm run dev                     # http://localhost:3000
```

測試帳號：
- 管理員 `admin@minimall.dev` / `admin1234`
- 一般使用者 `user@minimall.dev` / `user1234`

## 常用指令

| 指令 | 說明 |
|---|---|
| `npm run dev` | 開發模式 |
| `npm run build && npm start` | 正式模式 |
| `npm run typecheck` | 型別檢查 |
| `npm run lint` | ESLint |
| `npm test` | 單元測試 |
| `npx prisma studio` | 檢視資料庫 |
