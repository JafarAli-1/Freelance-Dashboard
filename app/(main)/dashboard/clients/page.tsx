"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
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
} from "@mantine/core";
import { IconPlus, IconPencil, IconTrash } from "@tabler/icons-react";

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const fetchClients = async () => {
    setLoading(true);
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) {
      setClients([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setClients(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setNewClient({
      name: client.name,
      email: client.email,
      phone: client.phone,
    });
    setModalOpened(true);
  };

  const handleSaveClient = async () => {
    if (!newClient.name || !newClient.email) return;

    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return;

    if (editingClient) {
      await supabase
        .from("clients")
        .update({ ...newClient })
        .eq("id", editingClient.id)
        .eq("user_id", userId);
    } else {
      await supabase
        .from("clients")
        .insert([{ ...newClient, user_id: userId }]);
    }

    setModalOpened(false);
    setNewClient({ name: "", email: "", phone: "" });
    setEditingClient(null);
    fetchClients();
  };

  const handleDeleteClient = async (id: number) => {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return;
    await supabase.from("clients").delete().eq("id", id).eq("user_id", userId);
    fetchClients();
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Group>
          <Title order={3}>العملاء</Title>
          <Button
            leftSection={<IconPlus />}
            onClick={() => setModalOpened(true)}
          >
            إضافة عميل
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
                <th style={{ textAlign: "right" }}>الاسم</th>
                <th style={{ textAlign: "right" }}>البريد الإلكتروني</th>
                <th style={{ textAlign: "right" }}>الهاتف</th>
                <th style={{ textAlign: "center" }}>تاريخ الإنشاء</th>
                <th style={{ textAlign: "center" }}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td style={{ textAlign: "right" }}>{client.name}</td>
                  <td style={{ textAlign: "right" }}>{client.email}</td>
                  <td style={{ textAlign: "right" }}>{client.phone}</td>
                  <td style={{ textAlign: "center" }}>
                    <Badge color="gray">
                      {new Date(client.created_at).toLocaleDateString()}
                    </Badge>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <Group gap="xs" justify="center">
                      <ActionIcon
                        color="blue"
                        onClick={() => openEditModal(client)}
                      >
                        <IconPencil size={16} />
                      </ActionIcon>
                      <ActionIcon
                        color="red"
                        onClick={() => handleDeleteClient(client.id)}
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
            setEditingClient(null);
            setNewClient({ name: "", email: "", phone: "" });
          }}
          title={editingClient ? "تعديل العميل" : "إضافة عميل جديد"}
        >
          <Stack>
            <TextInput
              label="الاسم"
              value={newClient.name}
              onChange={(e) =>
                setNewClient({ ...newClient, name: e.currentTarget.value })
              }
            />
            <TextInput
              label="البريد الإلكتروني"
              value={newClient.email}
              onChange={(e) =>
                setNewClient({ ...newClient, email: e.currentTarget.value })
              }
            />
            <TextInput
              label="الهاتف"
              value={newClient.phone}
              onChange={(e) =>
                setNewClient({ ...newClient, phone: e.currentTarget.value })
              }
            />
            <Button onClick={handleSaveClient}>
              {editingClient ? "حفظ التعديل" : "إضافة"}
            </Button>
          </Stack>
        </Modal>
      </Stack>
    </Container>
  );
}
