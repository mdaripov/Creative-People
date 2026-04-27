-- Profiles table
create table if not exists public.profiles (
  id uuid not null references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  avatar_url text,
  role text not null default 'smm_specialist',
  updated_at timestamp with time zone not null default now(),
  constraint profiles_pkey primary key (id),
  constraint profiles_role_check check (role in ('smm_specialist', 'manager'))
);

alter table public.profiles enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_select_policy'
  ) then
    create policy profiles_select_policy
    on public.profiles
    for select
    to authenticated
    using (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_insert_policy'
  ) then
    create policy profiles_insert_policy
    on public.profiles
    for insert
    to authenticated
    with check (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_update_policy'
  ) then
    create policy profiles_update_policy
    on public.profiles
    for update
    to authenticated
    using (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_delete_policy'
  ) then
    create policy profiles_delete_policy
    on public.profiles
    for delete
    to authenticated
    using (auth.uid() = id);
  end if;
end $$;

-- Create profile automatically on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, first_name, last_name, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    coalesce(new.raw_user_meta_data ->> 'role', 'smm_specialist')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Specialist clients table
create table if not exists public.specialist_clients (
  id uuid primary key default gen_random_uuid(),
  specialist_id uuid not null references public.profiles(id) on delete cascade,
  client_id text not null,
  created_at timestamp with time zone not null default now(),
  constraint specialist_clients_unique unique (specialist_id, client_id)
);

alter table public.specialist_clients enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'specialist_clients' and policyname = 'specialist_clients_select_policy'
  ) then
    create policy specialist_clients_select_policy
    on public.specialist_clients
    for select
    to authenticated
    using (
      auth.uid() = specialist_id
      or exists (
        select 1
        from public.profiles
        where profiles.id = auth.uid()
          and profiles.role = 'manager'
      )
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'specialist_clients' and policyname = 'specialist_clients_insert_policy'
  ) then
    create policy specialist_clients_insert_policy
    on public.specialist_clients
    for insert
    to authenticated
    with check (
      auth.uid() = specialist_id
      or exists (
        select 1
        from public.profiles
        where profiles.id = auth.uid()
          and profiles.role = 'manager'
      )
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'specialist_clients' and policyname = 'specialist_clients_update_policy'
  ) then
    create policy specialist_clients_update_policy
    on public.specialist_clients
    for update
    to authenticated
    using (
      auth.uid() = specialist_id
      or exists (
        select 1
        from public.profiles
        where profiles.id = auth.uid()
          and profiles.role = 'manager'
      )
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'specialist_clients' and policyname = 'specialist_clients_delete_policy'
  ) then
    create policy specialist_clients_delete_policy
    on public.specialist_clients
    for delete
    to authenticated
    using (
      auth.uid() = specialist_id
      or exists (
        select 1
        from public.profiles
        where profiles.id = auth.uid()
          and profiles.role = 'manager'
      )
    );
  end if;
end $$;

-- Approved SMM items table
create table if not exists public.approved_smm_items (
  id text primary key,
  client_id text not null,
  specialist_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamp with time zone not null default now()
);

alter table public.approved_smm_items enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'approved_smm_items' and policyname = 'approved_smm_items_select_policy'
  ) then
    create policy approved_smm_items_select_policy
    on public.approved_smm_items
    for select
    to authenticated
    using (
      auth.uid() = specialist_id
      or exists (
        select 1
        from public.profiles
        where profiles.id = auth.uid()
          and profiles.role = 'manager'
      )
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'approved_smm_items' and policyname = 'approved_smm_items_insert_policy'
  ) then
    create policy approved_smm_items_insert_policy
    on public.approved_smm_items
    for insert
    to authenticated
    with check (
      auth.uid() = specialist_id
      or exists (
        select 1
        from public.profiles
        where profiles.id = auth.uid()
          and profiles.role = 'manager'
      )
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'approved_smm_items' and policyname = 'approved_smm_items_update_policy'
  ) then
    create policy approved_smm_items_update_policy
    on public.approved_smm_items
    for update
    to authenticated
    using (
      auth.uid() = specialist_id
      or exists (
        select 1
        from public.profiles
        where profiles.id = auth.uid()
          and profiles.role = 'manager'
      )
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'approved_smm_items' and policyname = 'approved_smm_items_delete_policy'
  ) then
    create policy approved_smm_items_delete_policy
    on public.approved_smm_items
    for delete
    to authenticated
    using (
      auth.uid() = specialist_id
      or exists (
        select 1
        from public.profiles
        where profiles.id = auth.uid()
          and profiles.role = 'manager'
      )
    );
  end if;
end $$;

-- Work reports table
create table if not exists public.work_reports (
  id uuid primary key default gen_random_uuid(),
  specialist_id uuid not null references public.profiles(id) on delete cascade,
  client_name text not null,
  date date not null,
  task text not null,
  start_time text not null,
  end_time text not null,
  notes text not null default '',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.work_reports enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'work_reports' and policyname = 'work_reports_select_policy'
  ) then
    create policy work_reports_select_policy
    on public.work_reports
    for select
    to authenticated
    using (
      auth.uid() = specialist_id
      or exists (
        select 1
        from public.profiles
        where profiles.id = auth.uid()
          and profiles.role = 'manager'
      )
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'work_reports' and policyname = 'work_reports_insert_policy'
  ) then
    create policy work_reports_insert_policy
    on public.work_reports
    for insert
    to authenticated
    with check (
      auth.uid() = specialist_id
      or exists (
        select 1
        from public.profiles
        where profiles.id = auth.uid()
          and profiles.role = 'manager'
      )
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'work_reports' and policyname = 'work_reports_update_policy'
  ) then
    create policy work_reports_update_policy
    on public.work_reports
    for update
    to authenticated
    using (
      auth.uid() = specialist_id
      or exists (
        select 1
        from public.profiles
        where profiles.id = auth.uid()
          and profiles.role = 'manager'
      )
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'work_reports' and policyname = 'work_reports_delete_policy'
  ) then
    create policy work_reports_delete_policy
    on public.work_reports
    for delete
    to authenticated
    using (
      auth.uid() = specialist_id
      or exists (
        select 1
        from public.profiles
        where profiles.id = auth.uid()
          and profiles.role = 'manager'
      )
    );
  end if;
end $$;