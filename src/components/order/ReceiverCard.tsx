import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = { receiverName: string; phone: string; address: string };

/** 收件資訊（前台與後台共用） */
export function ReceiverCard({ receiverName, phone, address }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>收件資訊</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-muted-foreground">收件人</dt>
            <dd>{receiverName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">手機</dt>
            <dd>{phone}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">地址</dt>
            <dd className="break-words">{address}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
