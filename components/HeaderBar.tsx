"use client";

import { useEffect, useState } from "react";
import {
  Group,
  Burger,
  Title,
  Button,
  Avatar,
  Text,
  Menu,
  Box,
} from "@mantine/core";
import { IconLogout, IconUser } from "@tabler/icons-react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export function HeaderBar({
  opened,
  onBurger,
}: {
  opened: boolean;
  onBurger: () => void;
}) {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <Group h="100%" px="md" justify="space-between">
      <Group>
        <Burger opened={opened} onClick={onBurger} hiddenFrom="lg" size="sm" />
        <Title order={4} fw={800}>
          لوحة الفريلانسر
        </Title>
      </Group>

      <Group gap="sm">
        <Menu shadow="md" width={220} position="bottom-end">
          <Menu.Target>
            <Group gap="xs" style={{ cursor: "pointer" }}>
              <Avatar radius="xl" />
              <Box visibleFrom="sm">
                <Text size="sm" fw={600}>
                  {email ?? "مستخدم"}
                </Text>
                <Text size="xs" c="dimmed">
                  {email ? "مسجّل دخول" : "غير معروف"}
                </Text>
              </Box>
            </Group>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>الحساب</Menu.Label>
            <Menu.Item leftSection={<IconUser size={16} />}>
              الملف الشخصي
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              color="red"
              leftSection={<IconLogout size={16} />}
              onClick={handleLogout}
            >
              تسجيل الخروج
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
}
