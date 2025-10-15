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
  Alert,
  Select,
} from "@mantine/core";
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconAlertCircle,
} from "@tabler/icons-react";
import { supabase } from "@/lib/supabaseClient";

interface ProjectForm {
  name: string;
  client_id: string; // keep as string for Select value; convert on save
  progress: number;
  due: string | null;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [modalOpened, setModalOpened] = useState(false);
  const [editProject, setEditProject] = useState<any | null>(null);
  const [form, setForm] = useState<ProjectForm>({
    name: "",
    client_id: "",
    progress: 0,
    due: null,
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [clientsOptions, setClientsOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [clientIdToName, setClientIdToName] = useState<Record<string, string>>(
    {}
  );

  // جلب المشاريع الخاصة بالمستخدم الحالي
  const fetchProjects = async () => {
    setErrorMsg("");
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return; // سيغطيها الميدلوير

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) setErrorMsg(error.message);
    setProjects(data || []);
  };

  useEffect(() => {
    fetchProjects();
    const fetchClients = async () => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) return;
      const { data, error } = await supabase
        .from("clients")
        .select("id, name")
        .eq("user_id", userId)
        .order("name", { ascending: true });
      if (!error) {
        const options = (data || []).map((c: any) => ({
          value: String(c.id),
          label: c.name,
        }));
        setClientsOptions(options);
        const map: Record<string, string> = {};
        for (const c of data || []) map[String(c.id)] = c.name;
        setClientIdToName(map);
      }
    };
    fetchClients();
  }, []);

  const resetForm = () =>
    setForm({ name: "", client_id: "", progress: 0, due: null });

  // إضافة أو تعديل مشروع
  const saveProject = async () => {
    setSaving(true);
    setErrorMsg("");

    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) {
      setErrorMsg("لم يتم العثور على المستخدم.");
      setSaving(false);
      return;
    }

    if (!form.client_id) {
      setErrorMsg("يجب اختيار عميل للمشروع.");
      setSaving(false);
      return;
    }

    const payload = {
      name: form.name.trim(),
      client_id: Number(form.client_id),
      progress: Number(form.progress) || 0,
      due: form.due || null, // Postgres يقبل نص "YYYY-MM-DD" لحقل date
      user_id: userId,
    } as const;

    let error;
    if (editProject) {
      // لا تمرّر مفاتيح مثل id/created_at
      const { error: e } = await supabase
        .from("projects")
        .update({
          name: payload.name,
          client_id: payload.client_id,
          progress: payload.progress,
          due: payload.due,
        })
        .eq("id", editProject.id)
        .eq("user_id", userId);
      error = e || null;
    } else {
      const { error: e } = await supabase.from("projects").insert([payload]);
      error = e || null;
    }

    setSaving(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setModalOpened(false);
    setEditProject(null);
    resetForm();
    fetchProjects();
  };

  const deleteProject = async (id: string) => {
    setErrorMsg("");
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id)
      .eq("user_id", userId || "");
    if (error) setErrorMsg(error.message);
    else fetchProjects();
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Group>
          <Title order={3}>المشاريع</Title>
          <Button
            leftSection={<IconPlus />}
            onClick={() => {
              setEditProject(null);
              resetForm();
              setModalOpened(true);
            }}
          >
            إضافة مشروع
          </Button>
        </Group>

        {errorMsg && (
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            {errorMsg}
          </Alert>
        )}

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
                <th style={{ textAlign: "right" }}>اسم المشروع</th>
                <th style={{ textAlign: "right" }}>العميل</th>
                <th style={{ textAlign: "center" }}>نسبة الإنجاز</th>
                <th style={{ textAlign: "center" }}>تاريخ التسليم</th>
                <th style={{ textAlign: "center" }}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td style={{ textAlign: "right" }}>{project.name}</td>
                  <td style={{ textAlign: "right" }}>
                    {project.client_id ? (
                      <Badge color="blue">
                        {clientIdToName[String(project.client_id)] ||
                          "غير محدد"}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <Badge
                      color={
                        project.progress >= 100
                          ? "green"
                          : project.progress >= 50
                          ? "yellow"
                          : "red"
                      }
                    >
                      {project.progress}%
                    </Badge>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {project.due ? (
                      <Badge color="gray">
                        {new Date(project.due).toLocaleDateString()}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <Group gap="xs" justify="center">
                      <ActionIcon
                        color="blue"
                        onClick={() => {
                          setEditProject(project);
                          setForm({
                            name: project.name ?? "",
                            client_id: project.client_id
                              ? String(project.client_id)
                              : "",
                            progress: Number(project.progress ?? 0),
                            due: project.due ?? null,
                          });
                          setModalOpened(true);
                        }}
                      >
                        <IconPencil size={16} />
                      </ActionIcon>
                      <ActionIcon
                        color="red"
                        onClick={() => deleteProject(project.id)}
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
            setEditProject(null);
            resetForm();
          }}
          title={editProject ? "تعديل المشروع" : "إضافة مشروع جديد"}
        >
          <Stack>
            <TextInput
              label="اسم المشروع"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.currentTarget.value })
              }
              required
            />
            <Select
              label="العميل"
              placeholder="اختر العميل"
              searchable
              data={clientsOptions}
              value={form.client_id || null}
              onChange={(val) => setForm({ ...form, client_id: val || "" })}
              required
            />
            <NumberInput
              label="نسبة الإنجاز"
              value={form.progress}
              onChange={(val) =>
                setForm({ ...form, progress: Number(val) || 0 })
              }
              min={0}
              max={100}
            />
            <TextInput
              label="تاريخ التسليم"
              type="date"
              value={form.due ?? ""}
              onChange={(e) =>
                setForm({ ...form, due: e.currentTarget.value || null })
              }
            />
            <Button onClick={saveProject} loading={saving}>
              {editProject ? "حفظ التعديل" : "إضافة"}
            </Button>
          </Stack>
        </Modal>
      </Stack>
    </Container>
  );
}
