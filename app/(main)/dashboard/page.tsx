"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Stack,
  Title,
  Grid,
  Card,
  Text,
  Group,
  Badge,
  RingProgress,
  Table,
  ScrollArea,
} from "@mantine/core";
import {
  IconUsers,
  IconBriefcase,
  IconFileInvoice,
  IconCurrencyDollar,
  IconTrendingUp,
  IconAlertCircle,
} from "@tabler/icons-react";
import { supabase } from "@/lib/supabaseClient";

interface DashboardStats {
  totalClients: number;
  totalProjects: number;
  totalInvoices: number;
  totalRevenue: number;
  pendingInvoices: number;
  overdueInvoices: number;
  activeProjects: number;
  completedProjects: number;
}

interface RecentInvoice {
  id: string;
  invoice_number: string;
  client_name: string;
  amount: number;
  status: string;
  due_date: string;
}

interface RecentProject {
  id: string;
  name: string;
  progress: number;
  due_date: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalProjects: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    activeProjects: 0,
    completedProjects: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([]);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return;

    try {
      // إحصائيات العملاء
      const { count: clientsCount } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      // إحصائيات المشاريع
      const { data: projects } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId);

      const activeProjects =
        projects?.filter((p) => p.progress < 100).length || 0;
      const completedProjects =
        projects?.filter((p) => p.progress >= 100).length || 0;

      // إحصائيات الفواتير
      const { data: invoices } = await supabase
        .from("invoices")
        .select("*")
        .eq("user_id", userId);

      const totalRevenue =
        invoices?.reduce(
          (sum, inv) => (inv.status === "paid" ? sum + inv.total_amount : sum),
          0
        ) || 0;

      const pendingInvoices =
        invoices?.filter((inv) => inv.status === "pending").length || 0;
      const overdueInvoices =
        invoices?.filter((inv) => {
          if (inv.status === "pending") {
            const dueDate = new Date(inv.due_date);
            const today = new Date();
            return dueDate < today;
          }
          return false;
        }).length || 0;

      // الفواتير الحديثة
      const { data: invoicesWithClients } = await supabase
        .from("invoices")
        .select(
          `id, invoice_number, amount, status, due_date, client_id, clients:client_id ( name )`
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      const formattedInvoices =
        invoicesWithClients?.map((inv: any) => ({
          id: inv.id,
          invoice_number: inv.invoice_number,
          client_name: inv.clients?.name || "غير محدد",
          amount: inv.amount,
          status: inv.status,
          due_date: inv.due_date,
        })) || [];

      // المشاريع الحديثة
      const recentProjectsData = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      setStats({
        totalClients: clientsCount || 0,
        totalProjects: projects?.length || 0,
        totalInvoices: invoices?.length || 0,
        totalRevenue,
        pendingInvoices,
        overdueInvoices,
        activeProjects,
        completedProjects,
      });

      setRecentInvoices(formattedInvoices);
      setRecentProjects(recentProjectsData.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "green";
      case "pending":
        return "yellow";
      case "overdue":
        return "red";
      case "cancelled":
        return "gray";
      default:
        return "blue";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "مدفوع";
      case "pending":
        return "معلق";
      case "overdue":
        return "متأخر";
      case "cancelled":
        return "ملغي";
      default:
        return status;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "green";
    if (progress >= 50) return "yellow";
    return "red";
  };

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Text>جاري التحميل...</Text>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Title order={2}>نظرة عامة</Title>

        {/* إحصائيات سريعة */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group>
                <IconUsers size={32} color="blue" />
                <div>
                  <Text size="xs" c="dimmed">
                    إجمالي العملاء
                  </Text>
                  <Text size="xl" fw={700}>
                    {stats.totalClients}
                  </Text>
                </div>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group>
                <IconBriefcase size={32} color="green" />
                <div>
                  <Text size="xs" c="dimmed">
                    المشاريع النشطة
                  </Text>
                  <Text size="xl" fw={700}>
                    {stats.activeProjects}
                  </Text>
                </div>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group>
                <IconFileInvoice size={32} color="orange" />
                <div>
                  <Text size="xs" c="dimmed">
                    الفواتير المعلقة
                  </Text>
                  <Text size="xl" fw={700}>
                    {stats.pendingInvoices}
                  </Text>
                </div>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group>
                <IconCurrencyDollar size={32} color="green" />
                <div>
                  <Text size="xs" c="dimmed">
                    إجمالي الإيرادات
                  </Text>
                  <Text size="xl" fw={700}>
                    {stats.totalRevenue.toLocaleString()} دولار
                  </Text>
                </div>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>

        {/* تنبيهات مهمة */}
        {(stats.overdueInvoices > 0 || stats.pendingInvoices > 0) && (
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group>
              <IconAlertCircle size={24} color="orange" />
              <div>
                <Text fw={500} c="orange">
                  تنبيهات مهمة
                </Text>
                {stats.overdueInvoices > 0 && (
                  <Text size="sm" c="red">
                    لديك {stats.overdueInvoices} فاتورة متأخرة
                  </Text>
                )}
                {stats.pendingInvoices > 0 && (
                  <Text size="sm" c="yellow">
                    لديك {stats.pendingInvoices} فاتورة معلقة
                  </Text>
                )}
              </div>
            </Group>
          </Card>
        )}

        <Grid>
          {/* الفواتير الحديثة */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group mb="md">
                <IconFileInvoice size={20} />
                <Title order={4}>آخر الفواتير</Title>
              </Group>
              <ScrollArea h={300}>
                <Table>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "right" }}>رقم الفاتورة</th>
                      <th style={{ textAlign: "right" }}>العميل</th>
                      <th style={{ textAlign: "center" }}>المبلغ</th>
                      <th style={{ textAlign: "center" }}>الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInvoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td style={{ textAlign: "right" }}>
                          <Badge color="blue">{invoice.invoice_number}</Badge>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {invoice.client_name}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {invoice.amount.toLocaleString()} دولار
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <Badge color={getStatusColor(invoice.status)}>
                            {getStatusText(invoice.status)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </ScrollArea>
            </Card>
          </Grid.Col>

          {/* المشاريع الحديثة */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group mb="md">
                <IconBriefcase size={20} />
                <Title order={4}>آخر المشاريع</Title>
              </Group>
              <ScrollArea h={300}>
                <Table>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "right" }}>اسم المشروع</th>
                      <th style={{ textAlign: "center" }}>نسبة الإنجاز</th>
                      <th style={{ textAlign: "center" }}>تاريخ التسليم</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentProjects.map((project) => (
                      <tr key={project.id}>
                        <td style={{ textAlign: "right" }}>{project.name}</td>
                        <td style={{ textAlign: "center" }}>
                          <Badge color={getProgressColor(project.progress)}>
                            {project.progress}%
                          </Badge>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {project.due_date ? (
                            <Badge color="gray">
                              {new Date(project.due_date).toLocaleDateString()}
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </ScrollArea>
            </Card>
          </Grid.Col>
        </Grid>

        {/* إحصائيات المشاريع */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group mb="md">
                <IconTrendingUp size={20} />
                <Title order={4}>تقدم المشاريع</Title>
              </Group>
              <Group justify="center">
                <RingProgress
                  size={120}
                  thickness={12}
                  roundCaps
                  sections={[
                    {
                      value:
                        (stats.completedProjects /
                          Math.max(stats.totalProjects, 1)) *
                        100,
                      color: "green",
                    },
                    {
                      value:
                        (stats.activeProjects /
                          Math.max(stats.totalProjects, 1)) *
                        100,
                      color: "yellow",
                    },
                  ]}
                  label={
                    <Text ta="center" size="lg" fw={700}>
                      {stats.totalProjects}
                    </Text>
                  }
                />
                <div>
                  <Text size="sm" c="dimmed">
                    إجمالي المشاريع
                  </Text>
                  <Text size="sm" c="green">
                    مكتمل: {stats.completedProjects}
                  </Text>
                  <Text size="sm" c="yellow">
                    نشط: {stats.activeProjects}
                  </Text>
                </div>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group mb="md">
                <IconCurrencyDollar size={20} />
                <Title order={4}>ملخص المالية</Title>
              </Group>
              <Stack gap="md">
                <Group justify="space-between">
                  <Text>إجمالي الإيرادات:</Text>
                  <Badge color="green" size="lg">
                    {stats.totalRevenue.toLocaleString()} دولار
                  </Badge>
                </Group>
                <Group justify="space-between">
                  <Text>الفواتير المعلقة:</Text>
                  <Badge color="yellow" size="lg">
                    {stats.pendingInvoices}
                  </Badge>
                </Group>
                <Group justify="space-between">
                  <Text>الفواتير المتأخرة:</Text>
                  <Badge color="red" size="lg">
                    {stats.overdueInvoices}
                  </Badge>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
