import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { supabaseAdmin } from '../lib/supabase/admin';
import { useAuth } from '../context/AuthContext';

export interface Group {
  id: string;
  name: string;
  emoji: string;
  inviteCode: string;
  createdBy: string;
  memberCount: number;
  createdAt: string;
}

export interface GroupMember {
  userId: string;
  displayName: string;
  role: 'admin' | 'member';
  joinedAt: string;
}

export interface GroupExpense {
  id: string;
  groupId: string;
  paidBy: string;
  paidByName: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  splitType: string;
  notes: string | null;
  createdAt: string;
}

export function useGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchGroups = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Use admin client to bypass RLS recursion on group_members
      const { data, error } = await supabaseAdmin
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const groupIds = (data ?? []).map((d: any) => d.group_id);
      if (groupIds.length === 0) { setGroups([]); return; }

      // Fetch group details
      const { data: groupsData } = await supabaseAdmin
        .from('groups')
        .select('id, name, emoji, invite_code, created_by, created_at')
        .in('id', groupIds);

      // Get member counts
      const { data: counts } = await supabaseAdmin
        .from('group_members')
        .select('group_id')
        .in('group_id', groupIds);

      const countMap = new Map<string, number>();
      for (const c of counts ?? []) {
        countMap.set(c.group_id, (countMap.get(c.group_id) ?? 0) + 1);
      }

      setGroups(
        (groupsData ?? []).map((g: any) => ({
          id: g.id,
          name: g.name,
          emoji: g.emoji,
          inviteCode: g.invite_code,
          createdBy: g.created_by,
          memberCount: countMap.get(g.id) ?? 1,
          createdAt: g.created_at,
        }))
      );
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createGroup = useCallback(async (name: string, emoji: string) => {
    if (!user) return null;
    const { data, error } = await supabaseAdmin
      .from('groups')
      .insert({ name, emoji, created_by: user.id })
      .select()
      .single();

    if (error) throw error;

    await supabaseAdmin.from('group_members').insert({
      group_id: data.id,
      user_id: user.id,
      display_name: user.user_metadata?.display_name ?? user.email?.split('@')[0] ?? 'User',
      role: 'admin',
    });

    await fetchGroups();
    return data.id;
  }, [user, fetchGroups]);

  const joinGroup = useCallback(async (inviteCode: string) => {
    if (!user) return;

    const { data: group, error } = await supabaseAdmin
      .from('groups')
      .select('id')
      .eq('invite_code', inviteCode)
      .single();

    if (error || !group) throw new Error('Invalid invite code');

    const { error: joinError } = await supabaseAdmin.from('group_members').insert({
      group_id: group.id,
      user_id: user.id,
      display_name: user.user_metadata?.display_name ?? user.email?.split('@')[0] ?? 'User',
      role: 'member',
    });

    if (joinError) {
      if (joinError.code === '23505') throw new Error('You are already in this group');
      throw joinError;
    }

    await fetchGroups();
  }, [user, fetchGroups]);

  const leaveGroup = useCallback(async (groupId: string) => {
    if (!user) return;
    await supabaseAdmin
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', user.id);
    await fetchGroups();
  }, [user, fetchGroups]);

  return { groups, isLoading, fetchGroups, createGroup, joinGroup, leaveGroup };
}

export function useGroupDetail(groupId: string) {
  const { user } = useAuth();
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [expenses, setExpenses] = useState<GroupExpense[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!user || !groupId) return;
    setIsLoading(true);
    try {
      // Fetch members (use admin to bypass RLS recursion)
      const { data: membersData } = await supabaseAdmin
        .from('group_members')
        .select('user_id, display_name, role, joined_at')
        .eq('group_id', groupId);

      setMembers(
        (membersData ?? []).map((m: any) => ({
          userId: m.user_id,
          displayName: m.display_name,
          role: m.role,
          joinedAt: m.joined_at,
        }))
      );

      // Fetch expenses
      const { data: expensesData } = await supabase
        .from('group_expenses')
        .select('*')
        .eq('group_id', groupId)
        .order('date', { ascending: false });

      const memberMap = new Map(
        (membersData ?? []).map((m: any) => [m.user_id, m.display_name])
      );

      setExpenses(
        (expensesData ?? []).map((e: any) => ({
          id: e.id,
          groupId: e.group_id,
          paidBy: e.paid_by,
          paidByName: memberMap.get(e.paid_by) ?? 'Unknown',
          title: e.title,
          amount: e.amount,
          category: e.category,
          date: e.date,
          splitType: e.split_type,
          notes: e.notes,
          createdAt: e.created_at,
        }))
      );
    } catch (err) {
      console.error('Failed to fetch group detail:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, groupId]);

  const addExpense = useCallback(async (
    title: string,
    amount: number,
    splitType: string,
    splits: { userId: string; amount: number }[],
    category?: string,
    date?: string,
    notes?: string,
  ) => {
    if (!user) return;

    const { data: expense, error } = await supabase
      .from('group_expenses')
      .insert({
        group_id: groupId,
        paid_by: user.id,
        title,
        amount,
        split_type: splitType,
        category: category ?? 'Other',
        date: date ?? new Date().toISOString().split('T')[0],
        notes,
      })
      .select()
      .single();

    if (error) throw error;

    // Insert splits
    const splitRows = splits.map((s) => ({
      group_expense_id: expense.id,
      user_id: s.userId,
      amount: s.amount,
      is_settled: false,
    }));

    await supabase.from('splits').insert(splitRows);
    await fetchDetail();
  }, [user, groupId, fetchDetail]);

  const settleUp = useCallback(async (toUserId: string, amount: number, notes?: string) => {
    if (!user) return;
    await supabase.from('settlements').insert({
      group_id: groupId,
      from_user: user.id,
      to_user: toUserId,
      amount,
      notes,
    });
    await fetchDetail();
  }, [user, groupId, fetchDetail]);

  // Set up realtime subscription
  useEffect(() => {
    if (!groupId) return;

    const channel = supabase
      .channel(`group-${groupId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'group_expenses',
        filter: `group_id=eq.${groupId}`,
      }, () => fetchDetail())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'settlements',
        filter: `group_id=eq.${groupId}`,
      }, () => fetchDetail())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [groupId, fetchDetail]);

  return { members, expenses, isLoading, fetchDetail, addExpense, settleUp };
}
