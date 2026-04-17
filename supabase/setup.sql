-- Schema inicial do projeto para uso no Supabase SQL Editor.
-- Cole este arquivo no SQL Editor do Supabase e execute uma vez.

create table if not exists public.blog_posts (
  id uuid not null default gen_random_uuid(),
  title text not null unique,
  excerpt text not null,
  content text not null default ''::text,
  category text not null default ''::text,
  image_url text not null default ''::text,
  image_alt text,
  likes integer not null default 0,
  views integer not null default 0,
  shares integer not null default 0,
  published boolean not null default false,
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint blog_posts_pkey primary key (id)
);

create table if not exists public.projects (
  id uuid not null default gen_random_uuid(),
  title text not null unique,
  summary text not null,
  stack text not null default ''::text,
  url text not null default ''::text,
  image_url text not null default ''::text,
  image_alt text,
  likes integer not null default 0,
  views integer not null default 0,
  shares integer not null default 0,
  published boolean not null default false,
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint projects_pkey primary key (id)
);

create table if not exists public.stacks (
  id uuid not null default gen_random_uuid(),
  name text not null unique,
  link text not null default ''::text,
  image_url text not null default ''::text,
  image_alt text,
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint stacks_pkey primary key (id)
);

create or replace function public.increment_project_metric(project_id uuid, metric_name text)
returns void
language plpgsql
security definer
as $$
begin
  if metric_name = 'likes' then
    update public.projects
    set likes = likes + 1,
        updated_at = timezone('utc'::text, now())
    where id = project_id;
  elsif metric_name = 'views' then
    update public.projects
    set views = views + 1,
        updated_at = timezone('utc'::text, now())
    where id = project_id;
  elsif metric_name = 'shares' then
    update public.projects
    set shares = shares + 1,
        updated_at = timezone('utc'::text, now())
    where id = project_id;
  else
    raise exception 'Métrica inválida: %', metric_name;
  end if;
end;
$$;

create or replace function public.increment_blog_post_metric(post_id uuid, metric_name text)
returns void
language plpgsql
security definer
as $$
begin
  if metric_name = 'likes' then
    update public.blog_posts
    set likes = likes + 1,
        updated_at = timezone('utc'::text, now())
    where id = post_id;
  elsif metric_name = 'views' then
    update public.blog_posts
    set views = views + 1,
        updated_at = timezone('utc'::text, now())
    where id = post_id;
  elsif metric_name = 'shares' then
    update public.blog_posts
    set shares = shares + 1,
        updated_at = timezone('utc'::text, now())
    where id = post_id;
  else
    raise exception 'Métrica inválida: %', metric_name;
  end if;
end;
$$;

insert into storage.buckets (id, name, public)
values ('assets', 'assets', true)
on conflict (id) do update
set public = excluded.public;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'assets_public_read'
  ) then
    create policy assets_public_read
      on storage.objects
      for select
      to public
      using (bucket_id = 'assets');
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'assets_authenticated_insert'
  ) then
    create policy assets_authenticated_insert
      on storage.objects
      for insert
      to authenticated
      with check (bucket_id = 'assets');
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'assets_authenticated_update'
  ) then
    create policy assets_authenticated_update
      on storage.objects
      for update
      to authenticated
      using (bucket_id = 'assets')
      with check (bucket_id = 'assets');
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'assets_authenticated_delete'
  ) then
    create policy assets_authenticated_delete
      on storage.objects
      for delete
      to authenticated
      using (bucket_id = 'assets');
  end if;
end
$$;
