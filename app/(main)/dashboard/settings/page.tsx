"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Stack,
  Title,
  Card,
  Text,
  Group,
  Button,
  TextInput,
  PasswordInput,
  Divider,
  Alert,
} from "@mantine/core";
import {
  IconUser,
  IconLock,
  IconCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import { supabase } from "@/lib/supabaseClient";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // جلب بيانات المستخدم الحالي
  useEffect(() => {
    const fetchUserProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setProfileForm({
          fullName:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            "المستخدم",
          email: user.email || "",
        });
      }
    };

    fetchUserProfile();
  }, []);

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("لم يتم العثور على المستخدم");

      // تحديث بيانات المستخدم في Supabase Auth
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profileForm.fullName,
          name: profileForm.fullName,
        },
      });

      if (error) throw error;

      setMessage("تم تحديث الملف الشخصي بنجاح");
      setMessageType("success");
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("حدث خطأ أثناء تحديث الملف الشخصي");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage("كلمة المرور الجديدة غير متطابقة");
      setMessageType("error");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل");
      setMessageType("error");
      return;
    }

    setLoading(true);
    try {
      // تغيير كلمة المرور في Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      setMessage("تم تغيير كلمة المرور بنجاح");
      setMessageType("success");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      setMessage("حدث خطأ أثناء تغيير كلمة المرور");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Error signing out:", error);
        setMessage("حدث خطأ أثناء تسجيل الخروج");
        setMessageType("error");
        return;
      }

      router.replace("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      setMessage("حدث خطأ أثناء تسجيل الخروج");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Title order={2}>الإعدادات</Title>

        {message && (
          <Alert
            icon={
              messageType === "success" ? (
                <IconCheck size={16} />
              ) : (
                <IconAlertCircle size={16} />
              )
            }
            color={messageType === "success" ? "green" : "red"}
            onClose={() => setMessage("")}
            withCloseButton
          >
            {message}
          </Alert>
        )}

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group mb="md">
            <IconUser size={20} />
            <Title order={4}>الملف الشخصي</Title>
          </Group>

          <Stack gap="md">
            <TextInput
              label="الاسم الكامل"
              value={profileForm.fullName}
              onChange={(e) =>
                setProfileForm({
                  ...profileForm,
                  fullName: e.currentTarget.value,
                })
              }
              placeholder="أدخل اسمك الكامل"
            />

            <TextInput
              label="البريد الإلكتروني"
              value={profileForm.email}
              disabled
              description="لا يمكن تغيير البريد الإلكتروني"
            />

            <Button onClick={handleProfileUpdate} loading={loading}>
              حفظ التغييرات
            </Button>
          </Stack>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group mb="md">
            <IconLock size={20} />
            <Title order={4}>تغيير كلمة المرور</Title>
          </Group>

          <Stack gap="md">
            <PasswordInput
              label="كلمة المرور الجديدة"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  newPassword: e.currentTarget.value,
                })
              }
              placeholder="أدخل كلمة المرور الجديدة"
              required
            />

            <PasswordInput
              label="تأكيد كلمة المرور الجديدة"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  confirmPassword: e.currentTarget.value,
                })
              }
              placeholder="أعد إدخال كلمة المرور الجديدة"
              required
            />

            <Text size="sm" c="dimmed">
              ملاحظة: كلمة المرور الجديدة ستطبق على جميع جلساتك في التطبيق
            </Text>

            <Button onClick={handlePasswordChange} loading={loading}>
              تغيير كلمة المرور
            </Button>
          </Stack>
        </Card>

        <Divider />

        <Group justify="center">
          <Button
            color="red"
            variant="outline"
            onClick={handleLogout}
            loading={loading}
            size="lg"
          >
            تسجيل الخروج
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}
