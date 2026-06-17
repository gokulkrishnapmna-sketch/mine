-- ============================================================================
-- Gokul's Workspace — PostgreSQL / Supabase schema
-- ============================================================================
-- Apply with: supabase db push   (or paste into the Supabase SQL editor)
-- ----------------------------------------------------------------------------

create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
create type user_role as enum ('requester', 'admin');

create type task_status as enum (
  'backlog', 'todo', 'in_progress', 'waiting_inputs',
  'review', 'approved', 'completed', 'archived'
);

create type task_priority as enum ('critical', 'high', 'medium', 'low');

create type deliverable_type as enum (
  'social_media_post', 'linkedin_creative', 'presentation', 'video',
  'motion_graphic', 'event_collateral', 'website_asset', 'poster',
  'brochure', 'branding', 'print_design', 'other'
);

create type effort_estimate as enum ('small', 'medium', 'large', 'xl');

create type reference_provider as enum (
  'google_drive', 'figma', 'youtube', 'dropbox', 'onedrive', 'link'
);

create type activity_type as enum (
  'created', 'status_changed', 'priority_changed', 'deadline_changed',
  'comment_added', 'question_asked', 'question_answered',
  'file_uploaded', 'assigned', 'completed'
);

create type notification_type as enum (
  'task_assigned', 'task_updated', 'comment_added', 'question_asked',
  'question_answered', 'deadline_changed', 'priority_changed', 'task_completed'
);

-- ----------------------------------------------------------------------------
-- Profiles  (1:1 with auth.users — populated on Google SSO sign-in)
-- ----------------------------------------------------------------------------
create table profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  name         text not null,
  email        text not null unique,
  avatar_color text not null default '#6366f1',
  role         user_role not null default 'requester',
  department   text,
  created_at   timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Tasks
-- ----------------------------------------------------------------------------
create sequence if not exists task_ref_seq start 100;

create table tasks (
  id                    uuid primary key default uuid_generate_v4(),
  reference             text not null unique default ('GW-' || nextval('task_ref_seq')),
  title                 text not null,
  description           text not null default '',
  business_objective    text not null default '',
  status                task_status not null default 'backlog',
  priority              task_priority not null default 'medium',
  deliverable_type      deliverable_type not null default 'other',
  department            text not null,
  requester_id          uuid not null references profiles (id) on delete restrict,
  contact_name          text not null,
  contact_email         text not null,
  contact_phone         text,
  deadline              date,
  estimated_completion  date,
  effort                effort_estimate,
  tags                  text[] not null default '{}',
  pending_info          text[] not null default '{}',
  additional_notes      text,
  intake_score          int not null default 50 check (intake_score between 1 and 100),
  queue_rank            int,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index tasks_status_idx     on tasks (status);
create index tasks_priority_idx   on tasks (priority);
create index tasks_requester_idx  on tasks (requester_id);
create index tasks_deadline_idx   on tasks (deadline);
create index tasks_department_idx on tasks (department);

-- ----------------------------------------------------------------------------
-- Attachments  (metadata; bytes live in Supabase Storage bucket `task-files`)
-- ----------------------------------------------------------------------------
create table attachments (
  id          uuid primary key default uuid_generate_v4(),
  task_id     uuid not null references tasks (id) on delete cascade,
  name        text not null,
  kind        text not null,
  size_bytes  bigint,
  storage_path text not null,
  uploaded_by uuid references profiles (id),
  created_at  timestamptz not null default now()
);
create index attachments_task_idx on attachments (task_id);

-- ----------------------------------------------------------------------------
-- Reference links
-- ----------------------------------------------------------------------------
create table reference_links (
  id        uuid primary key default uuid_generate_v4(),
  task_id   uuid not null references tasks (id) on delete cascade,
  label     text not null,
  url       text not null,
  provider  reference_provider not null default 'link',
  created_at timestamptz not null default now()
);
create index reference_links_task_idx on reference_links (task_id);

-- ----------------------------------------------------------------------------
-- Comments  (threaded via parent_id; mentions are profile ids)
-- ----------------------------------------------------------------------------
create table comments (
  id          uuid primary key default uuid_generate_v4(),
  task_id     uuid not null references tasks (id) on delete cascade,
  author_id   uuid not null references profiles (id),
  body        text not null,
  mentions    uuid[] not null default '{}',
  parent_id   uuid references comments (id) on delete cascade,
  is_question boolean not null default false,
  created_at  timestamptz not null default now()
);
create index comments_task_idx on comments (task_id);

-- ----------------------------------------------------------------------------
-- Activity log
-- ----------------------------------------------------------------------------
create table activity_events (
  id         uuid primary key default uuid_generate_v4(),
  task_id    uuid not null references tasks (id) on delete cascade,
  type       activity_type not null,
  actor_id   uuid references profiles (id),
  message    text not null,
  created_at timestamptz not null default now()
);
create index activity_task_idx on activity_events (task_id);

-- ----------------------------------------------------------------------------
-- Notifications
-- ----------------------------------------------------------------------------
create table notifications (
  id           uuid primary key default uuid_generate_v4(),
  type         notification_type not null,
  title        text not null,
  body         text not null default '',
  task_id      uuid references tasks (id) on delete cascade,
  recipient_id uuid not null references profiles (id) on delete cascade,
  read         boolean not null default false,
  created_at   timestamptz not null default now()
);
create index notifications_recipient_idx on notifications (recipient_id, read);

-- ----------------------------------------------------------------------------
-- updated_at trigger
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

create trigger tasks_updated_at
  before update on tasks
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- Auto-create a profile when a new auth user signs in via Google SSO
-- ----------------------------------------------------------------------------
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table profiles        enable row level security;
alter table tasks           enable row level security;
alter table attachments     enable row level security;
alter table reference_links enable row level security;
alter table comments        enable row level security;
alter table activity_events enable row level security;
alter table notifications   enable row level security;

create or replace function is_admin()
returns boolean language sql stable security definer as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- Profiles: everyone in the org can read; you can update your own.
create policy "profiles readable" on profiles for select using (auth.role() = 'authenticated');
create policy "profiles self update" on profiles for update using (id = auth.uid());

-- Tasks: full transparency — all authenticated users can read every task.
create policy "tasks readable" on tasks for select using (auth.role() = 'authenticated');
-- Requesters can create tasks; admin can create on anyone's behalf.
create policy "tasks insert" on tasks for insert with check (requester_id = auth.uid() or is_admin());
-- Requesters can edit their own briefs; admin can edit anything.
create policy "tasks update" on tasks for update using (requester_id = auth.uid() or is_admin());
create policy "tasks delete" on tasks for delete using (is_admin());

-- Child tables: readable by all; writable by the task requester or admin.
create policy "attachments readable" on attachments for select using (auth.role() = 'authenticated');
create policy "attachments write" on attachments for all using (
  is_admin() or exists (select 1 from tasks t where t.id = task_id and t.requester_id = auth.uid())
);

create policy "references readable" on reference_links for select using (auth.role() = 'authenticated');
create policy "references write" on reference_links for all using (
  is_admin() or exists (select 1 from tasks t where t.id = task_id and t.requester_id = auth.uid())
);

create policy "comments readable" on comments for select using (auth.role() = 'authenticated');
create policy "comments insert" on comments for insert with check (author_id = auth.uid());

create policy "activity readable" on activity_events for select using (auth.role() = 'authenticated');
create policy "activity insert" on activity_events for insert with check (auth.role() = 'authenticated');

-- Notifications: you only see your own.
create policy "notifications own" on notifications for select using (recipient_id = auth.uid());
create policy "notifications update own" on notifications for update using (recipient_id = auth.uid());

-- ----------------------------------------------------------------------------
-- Realtime: broadcast task / comment / notification changes
-- ----------------------------------------------------------------------------
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table comments;
alter publication supabase_realtime add table activity_events;
alter publication supabase_realtime add table notifications;
