-- Create RLS policies for all tables

-- Profiles policies
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

-- Income entries policies
create policy "income_entries_select_own" on public.income_entries for select using (auth.uid() = user_id);
create policy "income_entries_insert_own" on public.income_entries for insert with check (auth.uid() = user_id);
create policy "income_entries_update_own" on public.income_entries for update using (auth.uid() = user_id);
create policy "income_entries_delete_own" on public.income_entries for delete using (auth.uid() = user_id);

-- Expense entries policies
create policy "expense_entries_select_own" on public.expense_entries for select using (auth.uid() = user_id);
create policy "expense_entries_insert_own" on public.expense_entries for insert with check (auth.uid() = user_id);
create policy "expense_entries_update_own" on public.expense_entries for update using (auth.uid() = user_id);
create policy "expense_entries_delete_own" on public.expense_entries for delete using (auth.uid() = user_id);

-- Emergency funds policies
create policy "emergency_funds_select_own" on public.emergency_funds for select using (auth.uid() = user_id);
create policy "emergency_funds_insert_own" on public.emergency_funds for insert with check (auth.uid() = user_id);
create policy "emergency_funds_update_own" on public.emergency_funds for update using (auth.uid() = user_id);
create policy "emergency_funds_delete_own" on public.emergency_funds for delete using (auth.uid() = user_id);

-- Emergency fund transactions policies
create policy "emergency_fund_transactions_select_own" on public.emergency_fund_transactions for select using (auth.uid() = user_id);
create policy "emergency_fund_transactions_insert_own" on public.emergency_fund_transactions for insert with check (auth.uid() = user_id);
create policy "emergency_fund_transactions_update_own" on public.emergency_fund_transactions for update using (auth.uid() = user_id);
create policy "emergency_fund_transactions_delete_own" on public.emergency_fund_transactions for delete using (auth.uid() = user_id);

-- Debt entries policies
create policy "debt_entries_select_own" on public.debt_entries for select using (auth.uid() = user_id);
create policy "debt_entries_insert_own" on public.debt_entries for insert with check (auth.uid() = user_id);
create policy "debt_entries_update_own" on public.debt_entries for update using (auth.uid() = user_id);
create policy "debt_entries_delete_own" on public.debt_entries for delete using (auth.uid() = user_id);

-- Savings goals policies
create policy "savings_goals_select_own" on public.savings_goals for select using (auth.uid() = user_id);
create policy "savings_goals_insert_own" on public.savings_goals for insert with check (auth.uid() = user_id);
create policy "savings_goals_update_own" on public.savings_goals for update using (auth.uid() = user_id);
create policy "savings_goals_delete_own" on public.savings_goals for delete using (auth.uid() = user_id);

-- Savings contributions policies
create policy "savings_contributions_select_own" on public.savings_contributions for select using (auth.uid() = user_id);
create policy "savings_contributions_insert_own" on public.savings_contributions for insert with check (auth.uid() = user_id);
create policy "savings_contributions_update_own" on public.savings_contributions for update using (auth.uid() = user_id);
create policy "savings_contributions_delete_own" on public.savings_contributions for delete using (auth.uid() = user_id);

-- Vision goals policies
create policy "vision_goals_select_own" on public.vision_goals for select using (auth.uid() = user_id);
create policy "vision_goals_insert_own" on public.vision_goals for insert with check (auth.uid() = user_id);
create policy "vision_goals_update_own" on public.vision_goals for update using (auth.uid() = user_id);
create policy "vision_goals_delete_own" on public.vision_goals for delete using (auth.uid() = user_id);

-- Habits policies
create policy "habits_select_own" on public.habits for select using (auth.uid() = user_id);
create policy "habits_insert_own" on public.habits for insert with check (auth.uid() = user_id);
create policy "habits_update_own" on public.habits for update using (auth.uid() = user_id);
create policy "habits_delete_own" on public.habits for delete using (auth.uid() = user_id);

-- Transactions policies
create policy "transactions_select_own" on public.transactions for select using (auth.uid() = user_id);
create policy "transactions_insert_own" on public.transactions for insert with check (auth.uid() = user_id);
create policy "transactions_update_own" on public.transactions for update using (auth.uid() = user_id);
create policy "transactions_delete_own" on public.transactions for delete using (auth.uid() = user_id);
