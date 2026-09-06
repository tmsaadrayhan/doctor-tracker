"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { useAuth } from "../../lib/auth";

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) return <div className="loading-screen">Checking authentication...</div>;

  return (
    <div className="dashboard-shell">
      <Sidebar />
      <div className="main-shell">
        <Topbar pathname={pathname} user={user} />
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
