import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
  <ProtectedRoute>
    <div className="text-black flex flex-col">
      <Navbar />
      <div className="w-full flex flex-row">
        <Sidebar/>
        {children}
      </div>
    </div>
  </ProtectedRoute>
  );
}