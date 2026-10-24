import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { yuanToCents } from "../src/lib/money";

const prisma = new PrismaClient();

const categories = [
  { slug: "electronics", name: "3C 電子", sortOrder: 1 },
  { slug: "home", name: "居家生活", sortOrder: 2 },
  { slug: "fashion", name: "服飾配件", sortOrder: 3 },
  { slug: "beauty", name: "美妝保養", sortOrder: 4 },
  { slug: "food", name: "食品飲料", sortOrder: 5 },
] as const;

type CategorySlug = (typeof categories)[number]["slug"];

type SeedProduct = {
  image: string;
  category: CategorySlug;
  name: string;
  description: string;
  /** 單位：元，寫入時以 yuanToCents 轉成分 */
  price: string;
  stock: number;
  isActive?: boolean;
};

const products: SeedProduct[] = [
  { image: "earbuds", category: "electronics", name: "無線藍牙耳機", description: "主動降噪，單次續航 8 小時，附無線充電盒。", price: "1290", stock: 35 },
  { image: "keyboard", category: "electronics", name: "機械式鍵盤（茶軸）", description: "87 鍵精簡配置，Type-C 可拆線，白色背光。", price: "2490", stock: 12 },
  { image: "powerbank", category: "electronics", name: "行動電源 10000mAh", description: "PD 20W 快充，雙孔輸出，輕薄好攜帶。", price: "690", stock: 50 },
  { image: "usb-cable", category: "electronics", name: "USB-C 快充線 1M", description: "60W 快充，編織線材耐彎折。", price: "290", stock: 0 },
  { image: "smart-band", category: "electronics", name: "智慧手環", description: "心率、睡眠、血氧監測，50 公尺防水。", price: "1590", stock: 20 },
  { image: "candle", category: "home", name: "香氛蠟燭（白茶）", description: "大豆蠟手工製作，燃燒時間約 40 小時。", price: "480", stock: 40 },
  { image: "bottle", category: "home", name: "不鏽鋼保溫瓶 750ml", description: "雙層真空，保冷 24 小時、保溫 12 小時。", price: "890", stock: 28 },
  { image: "cutting-board", category: "home", name: "竹製砧板", description: "天然竹材，抗菌耐用，附掛繩孔。", price: "650", stock: 18 },
  { image: "cushion", category: "home", name: "棉麻抱枕套", description: "45x45 公分，隱形拉鍊，可機洗。", price: "390", stock: 60 },
  { image: "tote-bag", category: "fashion", name: "帆布托特包", description: "12 盎司厚帆布，內附拉鍊暗袋。", price: "590", stock: 33 },
  { image: "tshirt", category: "fashion", name: "純棉素T", description: "100% 精梳棉，寬鬆版型，多色可選。", price: "350", stock: 100 },
  { image: "scarf", category: "fashion", name: "羊毛圍巾", description: "美麗諾羊毛，柔軟不刺膚。", price: "990", stock: 15 },
  { image: "card-holder", category: "fashion", name: "皮革卡夾", description: "植鞣牛皮，可放 6 張卡片。", price: "790", stock: 10, isActive: false },
  { image: "serum", category: "beauty", name: "玻尿酸保濕精華液", description: "三重分子玻尿酸，清爽不黏膩。", price: "880", stock: 25 },
  { image: "sunscreen", category: "beauty", name: "清爽防曬乳 SPF50", description: "PA++++，防水防汗，適合戶外活動。", price: "520", stock: 45 },
  { image: "hand-cream", category: "beauty", name: "護手霜禮盒", description: "三種香味各 30ml，送禮自用兩相宜。", price: "450", stock: 0 },
  { image: "oolong-tea", category: "food", name: "阿里山烏龍茶 150g", description: "高山茶區春茶，回甘清香。", price: "600", stock: 30 },
  { image: "nougat", category: "food", name: "手工牛軋糖", description: "使用法國奶油與台灣花生，每包 200g。", price: "320", stock: 80 },
  { image: "drip-coffee", category: "food", name: "掛耳咖啡 10 入", description: "中焙衣索比亞耶加雪菲，花果香氣。", price: "380", stock: 55 },
  { image: "mixed-nuts", category: "food", name: "綜合堅果", description: "無調味低溫烘焙，每包 300g。", price: "420", stock: 42 },
];

function toCents(price: string): number {
  const cents = yuanToCents(price);
  if (cents === null) throw new Error(`Invalid seed price: ${price}`);
  return cents;
}

async function main() {
  // 先在交易外準備好資料：雜湊較慢，價格不合法時也能在清空資料庫前就失敗
  const [adminHash, userHash] = await Promise.all([
    bcrypt.hash("admin1234", 10),
    bcrypt.hash("user1234", 10),
  ]);
  const base = Date.now();
  const productRows = products.map((p, i) => ({
    name: p.name,
    description: p.description,
    price: toCents(p.price),
    stock: p.stock,
    isActive: p.isActive ?? true,
    image: `/seed/${p.image}.svg`,
    category: p.category,
    // 錯開 createdAt，讓「最新」排序穩定
    createdAt: new Date(base - (products.length - i) * 60_000),
  }));

  // 清空與寫入在同一個交易內，中途失敗不會留下半套資料；seed 可重複執行
  await prisma.$transaction(async (tx) => {
    await tx.orderItem.deleteMany();
    await tx.order.deleteMany();
    await tx.cartItem.deleteMany();
    await tx.product.deleteMany();
    await tx.category.deleteMany();
    await tx.user.deleteMany();

    await tx.category.createMany({ data: [...categories] });
    const created = await tx.category.findMany({ select: { id: true, slug: true } });
    const categoryIds = new Map(created.map((c) => [c.slug, c.id]));

    await tx.product.createMany({
      data: productRows.map(({ category, ...row }) => ({
        ...row,
        categoryId: categoryIds.get(category)!,
      })),
    });

    await tx.user.createMany({
      data: [
        { email: "admin@minimall.dev", name: "管理員", passwordHash: adminHash, role: "ADMIN" },
        { email: "user@minimall.dev", name: "測試用戶", passwordHash: userHash, role: "USER" },
      ],
    });
  });

  console.log(`Seeded ${categories.length} categories, ${products.length} products, 2 users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
