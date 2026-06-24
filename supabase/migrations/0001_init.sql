-- Migration: 0001_init
-- Roblox GUI Maker — Supabase 初始 schema
-- 来源: MASTER_SOP.md §16.4 SOP-3H-01
-- 配套常量: src/lib/constants.ts FREE_PLAN.credits=50, PRO_PLAN
-- 配套支付: src/lib/creem.ts PRODUCTS (Pro Monthly + 3 个付费模板)
--
-- 执行方式: 在 Supabase Dashboard → SQL Editor 整段粘贴 → Run
-- 幂等: 全部 create if not exists / drop trigger if exists / create or replace function

-- ── 1. profiles 表 ─────────────────────────────────
-- 与 auth.users 1:1 映射,新注册自动通过 trigger 建行(默认 50 credits + Free plan)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  credits_remaining integer not null default 50 check (credits_remaining >= 0),
  plan text not null default 'Free' check (plan in ('Free', 'Pro')),
  creem_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_creem_customer on public.profiles(creem_customer_id);

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Service role full access profiles" on public.profiles;
create policy "Service role full access profiles"
  on public.profiles for all
  using (true)
  with check (true);

-- ── 2. subscriptions 表(vendor-neutral, 当前 provider=creem) ───
-- 幂等: provider_event_id 唯一约束,webhook 同一事件不重复写入
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check (plan in ('Free', 'Pro')),
  status text not null check (status in ('active', 'trialing', 'past_due', 'canceled', 'expired', 'unpaid')),
  provider text not null default 'creem',
  provider_subscription_id text,
  provider_customer_id text,
  provider_event_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unique_provider_event unique (provider_event_id),
  constraint unique_provider_sub unique (provider_subscription_id)
);

create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_subscriptions_status on public.subscriptions(status);

alter table public.subscriptions enable row level security;

drop policy if exists "Users can read own subscriptions" on public.subscriptions;
create policy "Users can read own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

drop policy if exists "Service role full access subscriptions" on public.subscriptions;
create policy "Service role full access subscriptions"
  on public.subscriptions for all
  using (true)
  with check (true);

-- ── 3. credits_logs 审计表 ─────────────────────────
-- 每次 deduct/add 写一行,供 Dashboard 显示用量历史 + 调试积分异常
create table if not exists public.credits_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  delta integer not null,
  reason text not null,
  balance_after integer not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_credits_logs_user_id on public.credits_logs(user_id, created_at desc);

alter table public.credits_logs enable row level security;

drop policy if exists "Users can read own credits logs" on public.credits_logs;
create policy "Users can read own credits logs"
  on public.credits_logs for select
  using (auth.uid() = user_id);

drop policy if exists "Service role full access credits_logs" on public.credits_logs;
create policy "Service role full access credits_logs"
  on public.credits_logs for all
  using (true)
  with check (true);

-- ── 4. projects 表 ─────────────────────────────────
-- 用户在 /editor 保存的 GUI 项目;gui_json 存完整元素树 + 元数据
-- 路由 /editor/[project_id] 通过 id 加载
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text,
  name text not null default 'Untitled GUI',
  gui_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_projects_user_id on public.projects(user_id, updated_at desc);
create index if not exists idx_projects_slug on public.projects(slug) where slug is not null;

alter table public.projects enable row level security;

drop policy if exists "Users can read own projects" on public.projects;
create policy "Users can read own projects"
  on public.projects for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own projects" on public.projects;
create policy "Users can insert own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own projects" on public.projects;
create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own projects" on public.projects;
create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

drop policy if exists "Service role full access projects" on public.projects;
create policy "Service role full access projects"
  on public.projects for all
  using (true)
  with check (true);

-- ── 5. purchased_templates 表 ───────────────────────
-- $9.99 模板购买记录;UNIQUE(user_id, template_slug) 防重复扣费
-- template_slug 与 src/lib/templates.ts 的 slug 同源(fps-hud / pet-shop / dialogue-system)
create table if not exists public.purchased_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_slug text not null,
  creem_order_id text,
  purchased_at timestamptz not null default now(),
  constraint unique_user_template unique (user_id, template_slug)
);

create index if not exists idx_purchased_templates_user_id on public.purchased_templates(user_id);

alter table public.purchased_templates enable row level security;

drop policy if exists "Users can read own purchased templates" on public.purchased_templates;
create policy "Users can read own purchased templates"
  on public.purchased_templates for select
  using (auth.uid() = user_id);

drop policy if exists "Service role full access purchased_templates" on public.purchased_templates;
create policy "Service role full access purchased_templates"
  on public.purchased_templates for all
  using (true)
  with check (true);

-- ── 6. Trigger: 新用户注册自动建 profile ─────────────
-- search_path = '' 是 Supabase 安全建议(防 schema 注入)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, credits_remaining, plan)
  values (new.id, new.email, 50, 'Free')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── 7. Function: 自动维护 updated_at ─────────────────
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = '';

drop trigger if exists set_updated_at_profiles on public.profiles;
create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

drop trigger if exists set_updated_at_subscriptions on public.subscriptions;
create trigger set_updated_at_subscriptions
  before update on public.subscriptions
  for each row execute function public.update_updated_at_column();

drop trigger if exists set_updated_at_projects on public.projects;
create trigger set_updated_at_projects
  before update on public.projects
  for each row execute function public.update_updated_at_column();

-- ── 8. RPC: deduct_credit(原子扣减,避免先查后更竞态) ─
-- 用法: select * from public.deduct_credit(p_user_id => '...', p_amount => 1, p_reason => 'ai_generate');
-- 失败抛 insufficient_credits 异常;成功返回扣减后的 balance
-- Pro 用户在调用前由业务层判断 plan='Pro' 旁路(不调本 RPC)
create or replace function public.deduct_credit(
  p_user_id uuid,
  p_amount integer,
  p_reason text
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_new_balance integer;
begin
  if p_amount <= 0 then
    raise exception 'amount must be positive' using errcode = '22023';
  end if;

  update public.profiles
     set credits_remaining = credits_remaining - p_amount
   where id = p_user_id
     and credits_remaining >= p_amount
   returning credits_remaining into v_new_balance;

  if v_new_balance is null then
    raise exception 'insufficient_credits' using errcode = 'P0001';
  end if;

  insert into public.credits_logs (user_id, delta, reason, balance_after)
  values (p_user_id, -p_amount, p_reason, v_new_balance);

  return v_new_balance;
end;
$$;

-- ── 9. RPC: add_credits(回滚 / 充值) ────────────────
create or replace function public.add_credits(
  p_user_id uuid,
  p_amount integer,
  p_reason text
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_new_balance integer;
begin
  if p_amount <= 0 then
    raise exception 'amount must be positive' using errcode = '22023';
  end if;

  update public.profiles
     set credits_remaining = credits_remaining + p_amount
   where id = p_user_id
   returning credits_remaining into v_new_balance;

  if v_new_balance is null then
    raise exception 'profile_not_found' using errcode = 'P0002';
  end if;

  insert into public.credits_logs (user_id, delta, reason, balance_after)
  values (p_user_id, p_amount, p_reason, v_new_balance);

  return v_new_balance;
end;
$$;

-- ── 10. 验证 Snippet(执行完后人工跑确认) ───────────────
-- select count(*) from public.profiles;            -- 0(尚无用户)
-- select count(*) from public.subscriptions;       -- 0
-- select count(*) from public.credits_logs;        -- 0
-- select count(*) from public.projects;            -- 0
-- select count(*) from public.purchased_templates; -- 0
-- 在 Supabase Auth 创建一个测试用户后:
--   select credits_remaining, plan from public.profiles where email='test@example.com';
--   → 期望: 50 / Free
-- 扣减测试(需手动获取 user_id):
--   select public.deduct_credit('<uuid>'::uuid, 1, 'manual_test');
--   → 期望返回 49
