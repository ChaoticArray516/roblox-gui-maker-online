-- Migration: 0002_generations
-- Roblox GUI Maker — AI 生成记录表（SOP-3X-02）
-- 来源: cvr_fbk/codes/activation_zero_threshold_plan.md §3 任务 M（审查修订版 2026-10-04）
-- 用途: 激活率精确度量（status='completed' 口径）+ 首免认领制持久化 + 退款幂等凭证
--
-- 执行方式: 在 Supabase Dashboard → SQL Editor 整段粘贴 → Run（同 0001，先于代码部署）
-- 幂等: create if not exists / drop policy if exists

-- ── 1. generations 表 ─────────────────────────────────
create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt text not null,
  gui_type text,
  style text,
  device text,
  status text not null default 'streaming'
    check (status in ('streaming','completed','cancelled','failed','refunded')),
  charged boolean not null default false,
  is_free_first boolean not null default false,
  project_id uuid references public.projects(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 并发双首次幂等：部分唯一索引，首免名额每用户全局只有一个（认领制，非查再判）
create unique index if not exists generations_free_first_once
  on public.generations(user_id) where is_free_first;

create index if not exists idx_generations_user
  on public.generations(user_id, created_at desc);

-- ── 2. RLS：用户只读自己的；写只走 service role（平台级绕过 RLS）──
alter table public.generations enable row level security;

drop policy if exists "Users can read own generations" on public.generations;
create policy "Users can read own generations"
  on public.generations for select
  using (auth.uid() = user_id);

-- service role 平台级绕过 RLS，写路径无需 policy
--（0001 各表的 "Service role full access" policy 为双保险先例，此处省略不影响写入）

-- ── 验收 ─────────────────────────────────
-- 1. Table Editor 可见 generations
-- 2. 唯一索引手工实测：同 user_id 手工插两行 is_free_first=true，第二行报 23505
--    insert into public.generations (user_id, prompt, is_free_first)
--    values ('<uuid>', 't1', true), ('<uuid>', 't2', true);  -- 第二行应冲突
