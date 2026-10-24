import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export default function ShopLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
      <Footer />
    </>
  );
}
