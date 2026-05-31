do $$
begin
  create type public.user_role as enum ('admin', 'student');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.enrollment_status as enum ('active', 'completed', 'cancelled');
exception
  when duplicate_object then null;
end
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role public.user_role not null default 'student',
  created_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  status public.enrollment_status not null default 'active',
  enrolled_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table if not exists public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  unique (course_id, position),
  constraint course_modules_position_nonnegative check (position >= 0)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.course_modules(id) on delete cascade,
  title text not null,
  content text,
  video_url text,
  position integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  unique (module_id, position),
  constraint lessons_position_nonnegative check (position >= 0)
);

create table if not exists public.lesson_materials (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  title text not null,
  material_url text not null,
  material_type text not null default 'link',
  created_at timestamptz not null default now()
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.enrollments enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_materials enable row level security;
alter table public.lesson_progress enable row level security;

create index if not exists idx_course_modules_course_position
on public.course_modules(course_id, position);

create index if not exists idx_lessons_module_position
on public.lessons(module_id, position);

create index if not exists idx_lesson_materials_lesson
on public.lesson_materials(lesson_id);

create index if not exists idx_lesson_progress_user_lesson
on public.lesson_progress(user_id, lesson_id);

grant usage on schema public to authenticated;
grant select on public.profiles to authenticated;
grant select on public.courses to authenticated;
grant select on public.enrollments to authenticated;
grant insert, update on public.courses to authenticated;
grant insert, update on public.enrollments to authenticated;
grant select, insert, update on public.course_modules to authenticated;
grant select, insert, update on public.lessons to authenticated;
grant select, insert, update, delete on public.lesson_materials to authenticated;
grant select, insert, update on public.lesson_progress to authenticated;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    'student'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Admins can read profiles" on public.profiles;
create policy "Admins can read profiles"
on public.profiles
for select
to authenticated
using (public.is_admin());

drop policy if exists "Authenticated users can read published courses" on public.courses;
create policy "Authenticated users can read published courses"
on public.courses
for select
to authenticated
using (is_published = true);

drop policy if exists "Users can read enrolled courses" on public.courses;
create policy "Users can read enrolled courses"
on public.courses
for select
to authenticated
using (
  exists (
    select 1
    from public.enrollments
    where enrollments.course_id = courses.id
      and enrollments.user_id = auth.uid()
  )
);

drop policy if exists "Users can read own enrollments" on public.enrollments;
create policy "Users can read own enrollments"
on public.enrollments
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Admins can manage courses" on public.courses;
create policy "Admins can manage courses"
on public.courses
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage enrollments" on public.enrollments;
create policy "Admins can manage enrollments"
on public.enrollments
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage course modules" on public.course_modules;
create policy "Admins can manage course modules"
on public.course_modules
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage lessons" on public.lessons;
create policy "Admins can manage lessons"
on public.lessons
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage lesson materials" on public.lesson_materials;
create policy "Admins can manage lesson materials"
on public.lesson_materials
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can read lesson progress" on public.lesson_progress;
grant select on public.lesson_progress to authenticated;
create policy "Admins can read lesson progress"
on public.lesson_progress
for select
to authenticated
using (public.is_admin());

drop policy if exists "Students can read enrolled course modules" on public.course_modules;
create policy "Students can read enrolled course modules"
on public.course_modules
for select
to authenticated
using (
  exists (
    select 1
    from public.enrollments
    where enrollments.course_id = course_modules.course_id
      and enrollments.user_id = auth.uid()
      and enrollments.status = 'active'
  )
);

drop policy if exists "Students can read published enrolled lessons" on public.lessons;
create policy "Students can read published enrolled lessons"
on public.lessons
for select
to authenticated
using (
  is_published = true
  and exists (
    select 1
    from public.course_modules
    join public.enrollments on enrollments.course_id = course_modules.course_id
    where course_modules.id = lessons.module_id
      and enrollments.user_id = auth.uid()
      and enrollments.status = 'active'
  )
);

drop policy if exists "Students can read materials for published enrolled lessons" on public.lesson_materials;
create policy "Students can read materials for published enrolled lessons"
on public.lesson_materials
for select
to authenticated
using (
  exists (
    select 1
    from public.lessons
    join public.course_modules on course_modules.id = lessons.module_id
    join public.enrollments on enrollments.course_id = course_modules.course_id
    where lessons.id = lesson_materials.lesson_id
      and lessons.is_published = true
      and enrollments.user_id = auth.uid()
      and enrollments.status = 'active'
  )
);

drop policy if exists "Students can read own lesson progress" on public.lesson_progress;
create policy "Students can read own lesson progress"
on public.lesson_progress
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Students can insert own lesson progress" on public.lesson_progress;
create policy "Students can insert own lesson progress"
on public.lesson_progress
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.lessons
    join public.course_modules on course_modules.id = lessons.module_id
    join public.enrollments on enrollments.course_id = course_modules.course_id
    where lessons.id = lesson_progress.lesson_id
      and lessons.is_published = true
      and enrollments.user_id = auth.uid()
      and enrollments.status = 'active'
  )
);

drop policy if exists "Students can update own lesson progress" on public.lesson_progress;
create policy "Students can update own lesson progress"
on public.lesson_progress
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.lessons
    join public.course_modules on course_modules.id = lessons.module_id
    join public.enrollments on enrollments.course_id = course_modules.course_id
    where lessons.id = lesson_progress.lesson_id
      and lessons.is_published = true
      and enrollments.user_id = auth.uid()
      and enrollments.status = 'active'
  )
);
