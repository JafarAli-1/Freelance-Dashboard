"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Stack,
  Title,
  Button,
  Table,
  ScrollArea,
  Badge,
  Group,
  ActionIcon,
  Modal,
  TextInput,
  NumberInput,
  Select,
  Textarea,
} from "@mantine/core";
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconDownload,
} from "@tabler/icons-react";
import { supabase } from "@/lib/supabaseClient";

interface Invoice {
  id: string;
  invoice_number: string;
  client_id: number;
  project_id: string;
  amount: number;
  tax_rate: number;
  total_amount: number;
  status: string;
  issue_date: string;
  due_date: string;
  notes: string;
  created_at: string;
}

interface Client {
  id: number;
  name: string;
}

interface Project {
  id: string;
  name: string;
}

interface InvoiceForm {
  client_id: string;
  project_id: string;
  amount: number;
  tax_rate: number;
  total_amount: number;
  issue_date: string;
  due_date: string;
  notes: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [modalOpened, setModalOpened] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [form, setForm] = useState<InvoiceForm>({
    client_id: "",
    project_id: "",
    amount: 0,
    tax_rate: 0,
    total_amount: 0,
    issue_date: new Date().toISOString().split("T")[0],
    due_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const fetchInvoices = async () => {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return;

    const { data } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setInvoices(data || []);
  };

  const fetchClients = async () => {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return;
    const { data } = await supabase
      .from("clients")
      .select("id, name")
      .eq("user_id", userId)
      .order("name");
    setClients(data || []);
  };

  const fetchProjects = async () => {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return;

    const { data } = await supabase
      .from("projects")
      .select("id, name")
      .eq("user_id", userId)
      .order("name");
    setProjects(data || []);
  };

  useEffect(() => {
    fetchInvoices();
    fetchClients();
    fetchProjects();
  }, []);

  const calculateTotal = (amount: number, taxRate: number) => {
    return amount + (amount * taxRate) / 100;
  };

  const handleAmountChange = (amount: number) => {
    const total = calculateTotal(amount, form.tax_rate);
    setForm({ ...form, amount, total_amount: total });
  };

  const handleTaxRateChange = (taxRate: number) => {
    const total = calculateTotal(form.amount, taxRate);
    setForm({ ...form, tax_rate: taxRate, total_amount: total });
  };

  const openEditModal = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setForm({
      client_id: invoice.client_id.toString(),
      project_id: invoice.project_id || "",
      amount: invoice.amount,
      tax_rate: invoice.tax_rate,
      total_amount: invoice.total_amount,
      issue_date: invoice.issue_date,
      due_date: invoice.due_date,
      notes: invoice.notes || "",
    });
    setModalOpened(true);
  };

  const handleSaveInvoice = async () => {
    if (!form.client_id || !form.amount) return;

    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return;

    const payload = {
      client_id: parseInt(form.client_id),
      project_id: form.project_id || null,
      amount: form.amount,
      tax_rate: form.tax_rate,
      total_amount: form.total_amount,
      issue_date: form.issue_date,
      due_date: form.due_date,
      notes: form.notes,
      user_id: userId,
    };

    if (editingInvoice) {
      await supabase
        .from("invoices")
        .update(payload)
        .eq("id", editingInvoice.id)
        .eq("user_id", userId);
    } else {
      // توليد رقم فاتورة تلقائي
      const { data: lastInvoice } = await supabase
        .from("invoices")
        .select("invoice_number")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);

      let nextNumber = 1;
      if (lastInvoice && lastInvoice.length > 0) {
        const match = lastInvoice[0].invoice_number.match(/INV-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      const invoiceNumber = `INV-${nextNumber.toString().padStart(6, "0")}`;

      await supabase.from("invoices").insert([
        {
          ...payload,
          invoice_number: invoiceNumber,
        },
      ]);
    }

    setModalOpened(false);
    setEditingInvoice(null);
    setForm({
      client_id: "",
      project_id: "",
      amount: 0,
      tax_rate: 0,
      total_amount: 0,
      issue_date: new Date().toISOString().split("T")[0],
      due_date: new Date().toISOString().split("T")[0],
      notes: "",
    });
    fetchInvoices();
  };

  const handleDeleteInvoice = async (id: string) => {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return;
    await supabase.from("invoices").delete().eq("id", id).eq("user_id", userId);
    fetchInvoices();
  };

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

  const getClientName = (clientId: number) => {
    const client = clients.find((c) => c.id === clientId);
    return client?.name || "غير محدد";
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    return project?.name || "غير محدد";
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Group>
          <Title order={3}>الفواتير</Title>
          <Button
            leftSection={<IconPlus />}
            onClick={() => setModalOpened(true)}
          >
            إضافة فاتورة
          </Button>
        </Group>

        <ScrollArea>
          <Table
            verticalSpacing="sm"
            striped
            highlightOnHover
            withColumnBorders
            style={{ direction: "rtl" }}
          >
            <thead style={{ marginBottom: 50 }}>
              <tr>
                <th style={{ textAlign: "right" }}>رقم الفاتورة</th>
                <th style={{ textAlign: "right" }}>العميل</th>
                <th style={{ textAlign: "right" }}>المشروع</th>
                <th style={{ textAlign: "center" }}>المبلغ</th>
                <th style={{ textAlign: "center" }}>الإجمالي</th>
                <th style={{ textAlign: "center" }}>الحالة</th>
                <th style={{ textAlign: "center" }}>تاريخ الإصدار</th>
                <th style={{ textAlign: "center" }}>تاريخ الاستحقاق</th>
                <th style={{ textAlign: "center" }}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td style={{ textAlign: "right" }}>
                    <Badge color="blue">{invoice.invoice_number}</Badge>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {getClientName(invoice.client_id)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {getProjectName(invoice.project_id)}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {invoice.amount.toLocaleString()} دولار
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <Badge color="green">
                      {invoice.total_amount.toLocaleString()} دولار
                    </Badge>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <Badge color={getStatusColor(invoice.status)}>
                      {getStatusText(invoice.status)}
                    </Badge>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <Badge color="gray">
                      {new Date(invoice.issue_date).toLocaleDateString()}
                    </Badge>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <Badge color="gray">
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </Badge>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <Group gap="xs" justify="center">
                      <ActionIcon
                        color="blue"
                        onClick={() => openEditModal(invoice)}
                      >
                        <IconPencil size={16} />
                      </ActionIcon>
                      <ActionIcon
                        color="green"
                        onClick={() => {
                          /* TODO: تحميل PDF */
                        }}
                      >
                        <IconDownload size={16} />
                      </ActionIcon>
                      <ActionIcon
                        color="red"
                        onClick={() => handleDeleteInvoice(invoice.id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ScrollArea>

        <Modal
          opened={modalOpened}
          onClose={() => {
            setModalOpened(false);
            setEditingInvoice(null);
            setForm({
              client_id: "",
              project_id: "",
              amount: 0,
              tax_rate: 0,
              total_amount: 0,
              issue_date: new Date().toISOString().split("T")[0],
              due_date: new Date().toISOString().split("T")[0],
              notes: "",
            });
          }}
          title={editingInvoice ? "تعديل الفاتورة" : "إضافة فاتورة جديدة"}
          size="lg"
        >
          <Stack>
            <Group grow>
              <Select
                label="العميل"
                data={clients.map((c) => ({
                  value: c.id.toString(),
                  label: c.name,
                }))}
                value={form.client_id}
                onChange={(value) =>
                  setForm({ ...form, client_id: value || "" })
                }
                required
              />
              <Select
                label="المشروع (اختياري)"
                data={projects.map((p) => ({ value: p.id, label: p.name }))}
                value={form.project_id}
                onChange={(value) =>
                  setForm({ ...form, project_id: value || "" })
                }
                clearable
              />
            </Group>

            <Group grow>
              <NumberInput
                label="المبلغ"
                value={form.amount}
                onChange={(val) => handleAmountChange(Number(val) || 0)}
                min={0}
                required
              />
              <NumberInput
                label="نسبة الضريبة %"
                value={form.tax_rate}
                onChange={(val) => handleTaxRateChange(Number(val) || 0)}
                min={0}
                max={100}
              />
              <NumberInput
                label="الإجمالي"
                value={form.total_amount}
                readOnly
                styles={{ input: { backgroundColor: "#f8f9fa" } }}
              />
            </Group>

            <Group grow>
              <TextInput
                label="تاريخ الإصدار"
                type="date"
                value={form.issue_date}
                onChange={(e) =>
                  setForm({ ...form, issue_date: e.currentTarget.value })
                }
                required
              />
              <TextInput
                label="تاريخ الاستحقاق"
                type="date"
                value={form.due_date}
                onChange={(e) =>
                  setForm({ ...form, due_date: e.currentTarget.value })
                }
                required
              />
            </Group>

            <Textarea
              label="ملاحظات"
              value={form.notes}
              onChange={(e) =>
                setForm({ ...form, notes: e.currentTarget.value })
              }
              rows={3}
            />

            <Button onClick={handleSaveInvoice}>
              {editingInvoice ? "حفظ التعديل" : "إضافة"}
            </Button>
          </Stack>
        </Modal>
      </Stack>
    </Container>
  );
}
