"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@mantine/core";
import { SidebarNav } from "@/components/SidebarNav";
import { HeaderBar } from "@/components/HeaderBar";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [opened, setOpened] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const verifySession = async () => {
      const { data } = await supabase.auth.getSession();
      const hasSession = Boolean(data.session);
      if (!hasSession) {
        router.replace("/login");
      }
      if (isMounted) {
        setIsAuthenticated(hasSession);
        setAuthChecked(true);
      }
    };
    verifySession();
    return () => {
      isMounted = false;
    };
  }, [router]);

  if (!authChecked) return null;
  if (!isAuthenticated) return null;

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{
        width: 280,
        breakpoint: "lg",
        collapsed: { mobile: !opened, desktop: false },
      }}
      padding="md"
    >
      <AppShell.Header>
        <HeaderBar opened={opened} onBurger={() => setOpened((o) => !o)} />
      </AppShell.Header>

      <AppShell.Navbar>
        <SidebarNav onNavigate={() => setOpened(false)} />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
