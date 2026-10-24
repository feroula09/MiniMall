import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { buttonVariants } from "@/components/ui/button";

// 根層級的 404 不在 (shop) layout 內，需自行帶上 Header/Footer
export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
        <p className="text-sm font-medium text-muted-foreground">404</p>
        <h1 className="text-2xl font-semibold">找不到這個頁面</h1>
        <p className="text-muted-foreground">頁面可能已移除，或網址輸入有誤。</p>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          回到首頁
        </Link>
      </main>
      <Footer />
    </>
  );
}
