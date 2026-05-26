import Sidebar from "../../components/layout/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <div className="fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </div>

      <main className="flex-1 ml-[var(--sidebar-width,16rem)] overflow-y-auto bg-gray-50 p-8">
        {children}
      </main>
    </div>
  );
}