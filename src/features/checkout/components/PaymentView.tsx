import Link from "next/link";
import { notFound } from "next/navigation";
import { CircleCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { requireUser } from "@/lib/auth-guard";
import { isId } from "@/lib/ids";
import { formatDateTime } from "@/lib/format-date";
import { formatPrice } from "@/lib/money";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";
import { getOrderForPayment, type PaymentOrder } from "../queries";
import { PayButton } from "./PayButton";

type Props = { params: Promise<{ id: string }> };

/** 讀取路由參數、cookies 與資料庫，必須放在 Suspense 內 */
export async function PaymentView({ params }: Props) {
  const { id } = await params;
  if (!isId(id)) notFound();
  const user = await requireUser(`/orders/${id}/pay`);
  const order = await getOrderForPayment(user.id, id);
  if (!order) notFound();

  return (
    <Card className="mx-auto w-full max-w-md">
      {order.status === "PENDING" ? <Pending order={order} /> : order.status === "PAID" ? <Paid order={order} /> : <Other order={order} />}
    </Card>
  );
}

function OrderLines({ order }: { order: PaymentOrder }) {
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between">
        <dt className="text-muted-foreground">訂單編號</dt>
        <dd className="font-mono">{order.orderNo}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-muted-foreground">收件人</dt>
        <dd>{order.receiverName}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-muted-foreground">商品</dt>
        <dd>{order.items.reduce((n, i) => n + i.quantity, 0)} 件</dd>
      </div>
      <div className="flex justify-between border-t pt-3 text-base font-semibold">
        <dt>應付金額</dt>
        <dd>{formatPrice(order.totalAmount)}</dd>
      </div>
    </dl>
  );
}

function Pending({ order }: { order: PaymentOrder }) {
  return (
    <>
      <CardHeader>
        <CardTitle className="text-xl">模擬付款</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <OrderLines order={order} />
        <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          這是練習用的模擬付款，不會產生任何實際扣款。
        </p>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <PayButton orderId={order.id} />
        <Link href={`/orders/${order.id}`} className={buttonVariants({ variant: "ghost", className: "w-full" })}>
          稍後再付款
        </Link>
      </CardFooter>
    </>
  );
}

function Paid({ order }: { order: PaymentOrder }) {
  return (
    <>
      <CardHeader className="items-center text-center">
        <CircleCheck className="mx-auto size-12 text-green-600" aria-hidden />
        <CardTitle className="text-xl">付款成功</CardTitle>
        {order.paidAt ? <p className="text-sm text-muted-foreground">付款時間 {formatDateTime(order.paidAt)}</p> : null}
      </CardHeader>
      <CardContent>
        <OrderLines order={order} />
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Link href={`/orders/${order.id}`} className={buttonVariants({ className: "w-full" })}>
          查看訂單
        </Link>
        <Link href="/" className={buttonVariants({ variant: "ghost", className: "w-full" })}>
          繼續購物
        </Link>
      </CardFooter>
    </>
  );
}

function Other({ order }: { order: PaymentOrder }) {
  return (
    <>
      <CardHeader>
        <CardTitle className="text-xl">此訂單{ORDER_STATUS_LABEL[order.status]}</CardTitle>
      </CardHeader>
      <CardContent>
        <OrderLines order={order} />
      </CardContent>
      <CardFooter>
        <Link href={`/orders/${order.id}`} className={buttonVariants({ variant: "outline", className: "w-full" })}>
          查看訂單
        </Link>
      </CardFooter>
    </>
  );
}

export function PaymentSkeleton() {
  return <Skeleton className="mx-auto h-80 w-full max-w-md" aria-busy="true" aria-label="載入訂單中" />;
}
