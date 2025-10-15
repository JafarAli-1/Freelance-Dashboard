"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  TextInput,
  PasswordInput,
  Paper,
  Title,
  Text,
  Container,
  Button,
  Stack,
  Alert,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // جلب الجلسة قبل التحويل
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) {
      const redirectTo = search?.get("redirect") || "/dashboard";
      router.replace(redirectTo);
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #1e3c72 100%)",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Container>
        <Title
          ta="center"
          style={{
            fontFamily: "'Cairo', sans-serif",
            color: "white",
            fontWeight: 700,
          }}
        >
          مرحباً بك مجدداً
        </Title>
        <Text
          c="gray.2"
          size="sm"
          ta="center"
          mt={5}
          style={{ fontFamily: "'Cairo', sans-serif" }}
        >
          قم بتسجيل الدخول للوصول إلى لوحة التحكم
        </Text>

        <Paper
          withBorder
          shadow="md"
          p={30}
          radius="md"
          mt="xl"
          w={{ base: 350, md: 600 }}
        >
          <Stack>
            {error && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="خطأ"
                color="red"
                variant="light"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                {error}
              </Alert>
            )}

            <TextInput
              label="البريد الإلكتروني"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              required
              styles={{ label: { fontFamily: "'Cairo', sans-serif" } }}
            />

            <PasswordInput
              label="كلمة المرور"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
              styles={{ label: { fontFamily: "'Cairo', sans-serif" } }}
            />

            <Button
              fullWidth
              mt="md"
              onClick={handleLogin}
              loading={loading}
              style={{
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 600,
                backgroundColor: "#1e3c72",
              }}
            >
              تسجيل الدخول
            </Button>
          </Stack>
        </Paper>
      </Container>
    </div>
  );
}
