import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import SafeScrollView from '../../components/layout/SafeScrollView';
import SummaryCard from '../../components/dashboard/SummaryCard';
import RecentTransactions from '../../components/dashboard/RecentTransactions';
import UpcomingSubscriptions from '../../components/dashboard/UpcomingSubscriptions';
import StreakCounter from '../../components/dashboard/StreakCounter';
import GoalProgressCard from '../../components/dashboard/GoalProgressCard';
import InsightCard from '../../components/dashboard/InsightCard';
import { useTheme } from '../../context/ThemeContext';
import { useDashboardSummary } from '../../hooks/useDashboardSummary';
import { useEngagement } from '../../hooks/useEngagement';
import { useSavingsGoals } from '../../hooks/useSavingsGoals';
import { useResponsive } from '../../hooks/useResponsive';
import { useCurrency } from '../../context/CurrencyContext';
import { formatCurrency } from '../../lib/formatting';
import { markSubscriptionPaid } from '../../lib/db/subscriptions';

export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { totalIncomeThisMonth, totalExpensesThisMonth, netThisMonth, allTimeBalance, upcomingSubscriptions, recentTransactions, isLoading, refresh } = useDashboardSummary();
  const { streak, healthScore, weeklyAnalysis, refresh: refreshEngagement } = useEngagement();
  const { goals, refresh: refreshGoals } = useSavingsGoals();
  const { isTablet, hp, sp, landscapeHp, contentWidth, safeEdges } = useResponsive();
  const currency = useCurrency();

  useFocusEffect(useCallback(() => { refresh(); refreshEngagement(); refreshGoals(); }, []));

  const quickActions = [
    { label: 'Expense', icon: '🧾', color: theme.colors.danger[500], route: '/(modals)/add-expense' },
    { label: 'Income', icon: '💰', color: theme.colors.success[500], route: '/(modals)/add-income' },
    { label: 'Goals', icon: '🎯', color: theme.colors.primary[500], route: '/(modals)/savings-goals' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={safeEdges}>
      {/* Header */}
      <View style={{
        borderBottomWidth: 1, borderBottomColor: theme.colors.border,
        paddingHorizontal: hp + landscapeHp,
      }}>
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        maxWidth: contentWidth, width: '100%', alignSelf: 'center',
        paddingTop: sp, paddingBottom: sp * 0.75,
      }}>
        <View>
          <Text style={[theme.typography.headingLg, { color: theme.colors.primary[500], letterSpacing: -0.5 }]}>
            TipidWise
          </Text>
          <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
            Smart Budget Tracker
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(modals)/settings' as any)}
          style={{
            width: 40, height: 40, borderRadius: theme.radii.full,
            backgroundColor: theme.colors.surface,
            borderWidth: 1, borderColor: theme.colors.border,
            alignItems: 'center', justifyContent: 'center',
          }}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 18 }}>⚙️</Text>
        </TouchableOpacity>
      </View>
      </View>

      <SafeScrollView
        onRefresh={refresh}
        refreshing={isLoading}
        contentStyle={{ paddingTop: sp }}
      >
        {/* Tablet: side-by-side; Phone: stacked */}
        <View style={{
          flexDirection: isTablet ? 'row' : 'column',
          alignItems: isTablet ? 'flex-start' : 'stretch',
          gap: isTablet ? theme.spacing.md : 0,
          paddingHorizontal: hp + landscapeHp,
          maxWidth: contentWidth,
          alignSelf: 'center',
          width: '100%',
        }}>
          {/* Left / main column */}
          <View style={{ flex: isTablet ? 1 : undefined }}>
            <SummaryCard
              totalIncome={totalIncomeThisMonth}
              totalExpenses={totalExpensesThisMonth}
              net={netThisMonth}
            />

            {/* All-time balance strip */}
            <View style={{
              flexDirection: 'row',
              gap: theme.spacing.sm,
              marginBottom: sp,
              padding: theme.spacing.md,
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radii.xl,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>All-Time Net</Text>
                <Text style={[theme.typography.labelLg, {
                  color: allTimeBalance.net >= 0 ? theme.colors.success[500] : theme.colors.danger[500],
                }]}>
                  {allTimeBalance.net >= 0 ? '+' : ''}{formatCurrency(allTimeBalance.net, currency)}
                </Text>
              </View>
              <View style={{ width: 1, backgroundColor: theme.colors.border }} />
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>Saved</Text>
                <Text style={[theme.typography.labelLg, { color: theme.colors.primary[500] }]}>
                  {formatCurrency(allTimeBalance.totalIncome, currency)}
                </Text>
              </View>
              <View style={{ width: 1, backgroundColor: theme.colors.border }} />
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>Spent</Text>
                <Text style={[theme.typography.labelLg, { color: theme.colors.danger[500] }]}>
                  {formatCurrency(allTimeBalance.totalExpenses, currency)}
                </Text>
              </View>
            </View>

            {/* Quick actions */}
            <Text style={[theme.typography.labelSm, {
              color: theme.colors.textSecondary, marginBottom: theme.spacing.sm,
              textTransform: 'uppercase', letterSpacing: 0.6,
            }]}>
              Quick Add
            </Text>
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginBottom: sp }}>
              {quickActions.map((a) => (
                <TouchableOpacity
                  key={a.label}
                  onPress={() => router.push(a.route as any)}
                  style={{
                    flex: 1,
                    backgroundColor: `${a.color}12`,
                    borderRadius: theme.radii.xl,
                    borderWidth: 1,
                    borderColor: `${a.color}30`,
                    paddingVertical: theme.spacing.md,
                    alignItems: 'center',
                    gap: theme.spacing.xs,
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={{ fontSize: isTablet ? 30 : 26 }}>{a.icon}</Text>
                  <Text style={[theme.typography.labelSm, { color: a.color, textAlign: 'center' }]}>
                    {a.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Right / secondary column (tablet) or continuation (phone) */}
          <View style={{ flex: isTablet ? 1 : undefined }}>
            {/* Engagement Section */}
            <View style={{
              flexDirection: 'row', gap: theme.spacing.sm, marginBottom: sp,
            }}>
              <View style={{ flex: 1 }}>
                <StreakCounter
                  currentStreak={streak.current}
                  longestStreak={streak.longest}
                />
              </View>
              <View style={{ flex: 1 }}>
                <InsightCard
                  healthScore={healthScore.score}
                  grade={healthScore.grade}
                  weeklyChange={weeklyAnalysis.percentChange}
                  weeklyTrend={weeklyAnalysis.trend as 'up' | 'down' | 'stable'}
                  tips={healthScore.tips}
                />
              </View>
            </View>

            {/* Savings Goals */}
            {goals.length > 0 && (
              <View style={{ marginBottom: sp }}>
                <GoalProgressCard goals={goals.slice(0, 3).map((g) => ({
                  id: g.id,
                  title: g.title,
                  targetAmount: g.target_amount,
                  currentAmount: g.current_amount,
                  icon: g.icon ?? '🎯',
                  deadline: g.deadline ?? undefined,
                }))} />
              </View>
            )}

            {upcomingSubscriptions.length > 0 && (
              <UpcomingSubscriptions
                subscriptions={upcomingSubscriptions}
                onMarkPaid={(id) => { markSubscriptionPaid(id); refresh(); }}
              />
            )}
            <RecentTransactions transactions={recentTransactions as any} />
          </View>
        </View>
      </SafeScrollView>
    </SafeAreaView>
  );
}
