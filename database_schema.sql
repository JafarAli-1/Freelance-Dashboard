-- Enable required extensions
create extension if not exists pgcrypto;

-- Clients
create table if not exists public.clients (
  id bigserial primary key,
  user_id uuid not null default auth.uid(),
  name text not null,
  email text,
  phone text,
  created_at timestamptz not null default now()
);

-- Projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  name text not null,
  -- Temporary free-text client name to match current UI; will migrate to client_id
  client text,
  client_id bigint references public.clients(id) on delete set null,
  progress int not null default 0 check (progress between 0 and 100),
  due date,
  created_at timestamptz not null default now()
);

-- Invoices
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  invoice_number text unique not null,
  client_id bigint not null references public.clients(id) on delete restrict,
  project_id uuid references public.projects(id) on delete set null,
  amount numeric(12,2) not null default 0,
  tax_rate numeric(5,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  status text not null default 'pending' check (status in ('pending','paid','overdue','cancelled')),
  issue_date date not null default now(),
  due_date date not null,
  notes text,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.invoices enable row level security;

-- Policies: select
create policy if not exists clients_select on public.clients
  for select using (auth.uid() = user_id);
create policy if not exists projects_select on public.projects
  for select using (auth.uid() = user_id);
create policy if not exists invoices_select on public.invoices
  for select using (auth.uid() = user_id);

-- Policies: insert
create policy if not exists clients_insert on public.clients
  for insert with check (auth.uid() = user_id);
create policy if not exists projects_insert on public.projects
  for insert with check (auth.uid() = user_id);
create policy if not exists invoices_insert on public.invoices
  for insert with check (auth.uid() = user_id);

-- Policies: update
create policy if not exists clients_update on public.clients
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists projects_update on public.projects
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists invoices_update on public.invoices
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Policies: delete
create policy if not exists clients_delete on public.clients
  for delete using (auth.uid() = user_id);
create policy if not exists projects_delete on public.projects
  for delete using (auth.uid() = user_id);
create policy if not exists invoices_delete on public.invoices
  for delete using (auth.uid() = user_id);


