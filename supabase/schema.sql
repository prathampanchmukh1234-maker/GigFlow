-- Run this in Supabase SQL editor for project: egwjteknrmfbkgikijha
-- It creates all tables used by the app and enables basic RLS policies.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  role text not null default 'CLIENT',
  avatar_url text,
  bio text,
  created_at timestamptz not null default now()
);

create table if not exists public.gigs (
  id text primary key,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  seller_name text not null,
  title text not null,
  description text not null,
  price numeric not null default 0,
  category text not null,
  images text[] not null default '{}',
  rating numeric not null default 0,
  reviews_count integer not null default 0,
  delivery_time integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  client_id uuid not null references public.profiles(id) on delete cascade,
  gig_id text not null references public.gigs(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'PENDING',
  amount numeric not null default 0,
  gig_title text not null,
  review_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id text primary key,
  gig_id text not null references public.gigs(id) on delete cascade,
  order_id text,
  user_id uuid not null references public.profiles(id) on delete cascade,
  user_name text,
  user_avatar text,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  "timestamp" timestamptz not null default now(),
  is_read boolean not null default false
);

alter table public.profiles enable row level security;
alter table public.gigs enable row level security;
alter table public.orders enable row level security;
alter table public.reviews enable row level security;
alter table public.messages enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update
using (auth.uid() = id);

drop policy if exists "gigs_select_all" on public.gigs;
create policy "gigs_select_all" on public.gigs for select using (true);

drop policy if exists "gigs_insert_owner" on public.gigs;
create policy "gigs_insert_owner" on public.gigs for insert
with check (auth.uid() = seller_id);

drop policy if exists "gigs_update_owner" on public.gigs;
create policy "gigs_update_owner" on public.gigs for update
using (auth.uid() = seller_id);

drop policy if exists "gigs_delete_owner" on public.gigs;
create policy "gigs_delete_owner" on public.gigs for delete
using (auth.uid() = seller_id);

drop policy if exists "orders_select_participant" on public.orders;
create policy "orders_select_participant" on public.orders for select
using (auth.uid() = client_id or auth.uid() = seller_id);

drop policy if exists "orders_insert_client" on public.orders;
create policy "orders_insert_client" on public.orders for insert
with check (auth.uid() = client_id);

drop policy if exists "orders_update_participant" on public.orders;
create policy "orders_update_participant" on public.orders for update
using (auth.uid() = client_id or auth.uid() = seller_id);

drop policy if exists "reviews_select_all" on public.reviews;
create policy "reviews_select_all" on public.reviews for select using (true);

drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own" on public.reviews for insert
with check (auth.uid() = user_id);

drop policy if exists "messages_select_participant" on public.messages;
create policy "messages_select_participant" on public.messages for select
using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "messages_insert_sender" on public.messages;
create policy "messages_insert_sender" on public.messages for insert
with check (auth.uid() = sender_id);

drop policy if exists "messages_update_receiver" on public.messages;
create policy "messages_update_receiver" on public.messages for update
using (auth.uid() = receiver_id);
