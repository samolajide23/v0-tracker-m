-- Create financial data tables with RLS for cross-device sync

-- User profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Income entries
create table if not exists public.income_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  amount decimal(10,2) not null check (amount > 0),
  frequency text not null check (frequency in ('weekly', 'monthly', 'yearly')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Expense entries
create table if not exists public.expense_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  amount decimal(10,2) not null check (amount > 0),
  category text not null,
  frequency text not null check (frequency in ('weekly', 'monthly', 'yearly')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Emergency fund data
create table if not exists public.emergency_funds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  current_balance decimal(10,2) not null default 0 check (current_balance >= 0),
  target_months integer not null default 6 check (target_months > 0),
  monthly_expenses decimal(10,2) not null default 0 check (monthly_expenses >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Emergency fund transactions
create table if not exists public.emergency_fund_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  emergency_fund_id uuid not null references public.emergency_funds(id) on delete cascade,
  amount decimal(10,2) not null,
  type text not null check (type in ('deposit', 'withdrawal')),
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Debt entries
create table if not exists public.debt_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  balance decimal(10,2) not null check (balance >= 0),
  interest_rate decimal(5,2) not null check (interest_rate >= 0),
  minimum_payment decimal(10,2) not null check (minimum_payment > 0),
  debt_type text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Savings goals
create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount decimal(10,2) not null check (target_amount > 0),
  current_amount decimal(10,2) not null default 0 check (current_amount >= 0),
  target_date date,
  category text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Savings contributions
create table if not exists public.savings_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  savings_goal_id uuid not null references public.savings_goals(id) on delete cascade,
  amount decimal(10,2) not null check (amount > 0),
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Vision board goals
create table if not exists public.vision_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  category text not null,
  target_date date,
  completed boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habits tracking
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  current_streak integer not null default 0,
  best_streak integer not null default 0,
  last_completed date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Transactions log
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  category text not null,
  amount decimal(10,2) not null,
  description text not null,
  date date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.income_entries enable row level security;
alter table public.expense_entries enable row level security;
alter table public.emergency_funds enable row level security;
alter table public.emergency_fund_transactions enable row level security;
alter table public.debt_entries enable row level security;
alter table public.savings_goals enable row level security;
alter table public.savings_contributions enable row level security;
alter table public.vision_goals enable row level security;
alter table public.habits enable row level security;
alter table public.transactions enable row level security;
