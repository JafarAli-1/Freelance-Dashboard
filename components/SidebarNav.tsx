"use client";

import { usePathname, useRouter } from "next/navigation";
import { ScrollArea, Stack, NavLink, Text } from "@mantine/core";
import {
  IconLayoutDashboard,
  IconUsers,
  IconBriefcase,
  IconFileInvoice,
  IconSettings,
} from "@tabler/icons-react";

const links = [
  { label: "نظرة عامة", href: "/dashboard", icon: IconLayoutDashboard },
  { label: "العملاء", href: "/dashboard/clients", icon: IconUsers },
  { label: "المشاريع", href: "/dashboard/projects", icon: IconBriefcase },
  { label: "الفواتير", href: "/dashboard/invoices", icon: IconFileInvoice },
  { label: "الإعدادات", href: "/dashboard/settings", icon: IconSettings },
];

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    } else {
      return pathname?.startsWith(href);
    }
  };

  return (
    <ScrollArea p="md" style={{ height: "100%" }}>
      <Stack gap="xs">
        <Text size="xs" c="dimmed" px="xs">
          القائمة
        </Text>
        {links.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <NavLink
              key={href}
              label={label}
              leftSection={<Icon size={18} />}
              active={!!active}
              onClick={() => {
                router.push(href);
                onNavigate?.();
              }}
              variant="light"
            />
          );
        })}
      </Stack>
    </ScrollArea>
  );
}
