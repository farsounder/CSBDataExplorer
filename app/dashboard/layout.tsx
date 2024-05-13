import Header from "@/app/dashboard/_components/header";
import Footer from "@/app/dashboard/_components/footer";


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col w-full h-full overflow-hidden">
      <Header />
      <div className="flex h-full">
        <div className="m-0 p-0 w-full h-full">{children}</div>
      </div>
      <Footer />
    </section>
  );
}
