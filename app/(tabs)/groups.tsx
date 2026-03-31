import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, Modal, Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useGroups } from '../../hooks/useGroups';
import { useResponsive } from '../../hooks/useResponsive';
import { formatCurrency } from '../../lib/formatting';
import { useCurrency } from '../../context/CurrencyContext';

export default function GroupsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const currency = useCurrency();
  const { user, isGuest } = useAuth();
  const { groups, isLoading, fetchGroups, createGroup, joinGroup } = useGroups();
  const { hp, sp, contentWidth, safeEdges, landscapeHp, columns } = useResponsive();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupEmoji, setGroupEmoji] = useState('👥');
  const [inviteCode, setInviteCode] = useState('');
  const [creating, setCreating] = useState(false);

  useFocusEffect(useCallback(() => { if (user) fetchGroups(); }, [user]));

  const handleCreate = async () => {
    if (!groupName.trim()) { Alert.alert('Missing name', 'Please enter a group name.'); return; }
    setCreating(true);
    try {
      const id = await createGroup(groupName.trim(), groupEmoji);
      setShowCreateModal(false);
      setGroupName('');
      if (id) router.push(`/(modals)/group-detail/${id}` as any);
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to create group.');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) { Alert.alert('Missing code', 'Please enter an invite code.'); return; }
    try {
      await joinGroup(inviteCode.trim());
      setShowJoinModal(false);
      setInviteCode('');
      Alert.alert('Joined!', 'You have joined the group.');
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to join group.');
    }
  };

  if (!user || isGuest) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={safeEdges}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: hp + landscapeHp }}>
          <Text style={{ fontSize: 64, marginBottom: theme.spacing.lg }}>👥</Text>
          <Text style={[theme.typography.headingLg, { color: theme.colors.textPrimary, textAlign: 'center', marginBottom: theme.spacing.sm }]}>
            Group Expense Splitting
          </Text>
          <Text style={[theme.typography.bodyMd, { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.xl, maxWidth: 300 }]}>
            Split bills with friends, track who owes whom, and settle up — all in real time. Sign in to get started.
          </Text>
          <Button
            label="Sign In to Use Groups"
            onPress={() => router.push('/(modals)/settings' as any)}
            size="lg"
          />
        </View>
      </SafeAreaView>
    );
  }

  const EMOJI_OPTIONS = ['👥', '🏠', '✈️', '🍽️', '🎉', '💼', '🎓', '❤️'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={safeEdges}>
      {/* Header */}
      <View style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingHorizontal: hp + landscapeHp }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', maxWidth: contentWidth, width: '100%', alignSelf: 'center', paddingTop: sp, paddingBottom: sp * 0.75 }}>
          <View>
            <Text style={[theme.typography.headingLg, { color: theme.colors.textPrimary }]}>Groups</Text>
            <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
              {groups.length} group{groups.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <TouchableOpacity
              onPress={() => setShowJoinModal(true)}
              style={{
                paddingHorizontal: theme.spacing.lg, paddingVertical: 10,
                borderRadius: theme.radii.full,
                backgroundColor: `${theme.colors.primary[500]}12`,
                borderWidth: 1, borderColor: `${theme.colors.primary[500]}30`,
                minWidth: 80,
                alignItems: 'center', justifyContent: 'center',
              }}
              activeOpacity={0.75}
            >
              <Text style={[theme.typography.labelLg, { color: theme.colors.primary[500] }]}>Join</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowCreateModal(true)}
              style={{
                backgroundColor: theme.colors.primary[500],
                borderRadius: theme.radii.full,
                width: 44, height: 44,
                alignItems: 'center', justifyContent: 'center',
              }}
              activeOpacity={0.8}
            >
              <Text style={{ color: '#fff', fontSize: 24, lineHeight: 28, fontWeight: '300' }}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Groups list */}
      <View style={{ flex: 1, maxWidth: contentWidth, alignSelf: 'center', width: '100%', paddingHorizontal: landscapeHp }}>
        {groups.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No groups yet"
            description="Create a group to start splitting expenses with friends."
            actionLabel="Create Group"
            onAction={() => setShowCreateModal(true)}
          />
        ) : (
          <FlatList
            data={groups}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push(`/(modals)/group-detail/${item.id}` as any)}
                activeOpacity={0.7}
              >
                <Card style={{ marginBottom: theme.spacing.sm }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
                    <View style={{
                      width: 52, height: 52, borderRadius: theme.radii.lg,
                      backgroundColor: `${theme.colors.primary[500]}15`,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[theme.typography.labelLg, { color: theme.colors.textPrimary }]}>
                        {item.name}
                      </Text>
                      <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
                        {item.memberCount} member{item.memberCount !== 1 ? 's' : ''}
                      </Text>
                    </View>
                    <Text style={[theme.typography.bodyMd, { color: theme.colors.textSecondary }]}>›</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingTop: theme.spacing.sm, paddingBottom: theme.spacing.xl, paddingHorizontal: hp }}
            refreshing={isLoading}
            onRefresh={fetchGroups}
          />
        )}
      </View>

      {/* Create Group Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent onRequestClose={() => setShowCreateModal(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} activeOpacity={1} onPress={() => setShowCreateModal(false)} />
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: theme.radii.xl, borderTopRightRadius: theme.radii.xl,
          padding: hp + landscapeHp, paddingBottom: 40, gap: theme.spacing.md,
        }}>
          <Text style={[theme.typography.headingMd, { color: theme.colors.textPrimary }]}>Create Group</Text>

          {/* Emoji picker */}
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
            {EMOJI_OPTIONS.map((e) => (
              <TouchableOpacity
                key={e}
                onPress={() => setGroupEmoji(e)}
                style={{
                  width: 44, height: 44, borderRadius: theme.radii.lg,
                  backgroundColor: groupEmoji === e ? `${theme.colors.primary[500]}20` : theme.colors.background,
                  borderWidth: 2, borderColor: groupEmoji === e ? theme.colors.primary[500] : theme.colors.border,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 22 }}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{
            borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radii.lg,
            backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.md, height: 52,
            justifyContent: 'center',
          }}>
            <TextInput
              style={[theme.typography.bodyMd, { color: theme.colors.textPrimary }]}
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Group name (e.g. Roommates)"
              placeholderTextColor={theme.colors.textDisabled}
              autoFocus
            />
          </View>

          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <TouchableOpacity
              onPress={() => setShowCreateModal(false)}
              style={{ flex: 1, height: 52, borderRadius: theme.radii.lg, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={[theme.typography.labelLg, { color: theme.colors.textPrimary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCreate}
              style={{ flex: 2, height: 52, borderRadius: theme.radii.lg, backgroundColor: theme.colors.primary[500], alignItems: 'center', justifyContent: 'center', opacity: creating ? 0.6 : 1 }}
              disabled={creating}
            >
              <Text style={[theme.typography.labelLg, { color: '#fff' }]}>{creating ? 'Creating...' : 'Create'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Join Group Modal */}
      <Modal visible={showJoinModal} animationType="slide" transparent onRequestClose={() => setShowJoinModal(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} activeOpacity={1} onPress={() => setShowJoinModal(false)} />
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: theme.radii.xl, borderTopRightRadius: theme.radii.xl,
          padding: hp + landscapeHp, paddingBottom: 40, gap: theme.spacing.md,
        }}>
          <Text style={[theme.typography.headingMd, { color: theme.colors.textPrimary }]}>Join Group</Text>
          <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
            Enter the invite code shared by the group admin.
          </Text>
          <View style={{
            borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radii.lg,
            backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.md, height: 52,
            justifyContent: 'center',
          }}>
            <TextInput
              style={[theme.typography.headingSm, { color: theme.colors.textPrimary, textAlign: 'center', letterSpacing: 2 }]}
              value={inviteCode}
              onChangeText={setInviteCode}
              placeholder="Enter invite code"
              placeholderTextColor={theme.colors.textDisabled}
              autoCapitalize="none"
              autoFocus
            />
          </View>
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <TouchableOpacity
              onPress={() => setShowJoinModal(false)}
              style={{ flex: 1, height: 52, borderRadius: theme.radii.lg, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={[theme.typography.labelLg, { color: theme.colors.textPrimary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleJoin}
              style={{ flex: 2, height: 52, borderRadius: theme.radii.lg, backgroundColor: theme.colors.primary[500], alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={[theme.typography.labelLg, { color: '#fff' }]}>Join</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
