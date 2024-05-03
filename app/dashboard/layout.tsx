import Header from "@/components/header";
import Footer from "@/components/footer";
import { Sidebar } from "@/components/sidebar";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col w-full h-full overflow-hidden">
      <Header />
      <div className="flex h-full">
        <Sidebar />
        <div className="m-0 p-0 w-full h-full">{children}</div>
      </div>
      <Footer />
    </section>
  );
}
