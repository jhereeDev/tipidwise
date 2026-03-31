import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../../components/ui/EmptyState';
import SubscriptionCard from '../../components/subscriptions/SubscriptionCard';
import { useTheme } from '../../context/ThemeContext';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { useResponsive } from '../../hooks/useResponsive';
import { formatCurrency } from '../../lib/formatting';
import { useCurrency } from '../../context/CurrencyContext';
import { getTotalMonthlySubscriptionCost } from '../../lib/db/subscriptions';

export default function SubscriptionsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const currency = useCurrency();
  const { hp, sp, columns, contentWidth, width } = useResponsive();
  const { subscriptions, isLoading, toggleActive, markPaid, refresh } = useSubscriptions();
  const monthlyTotal = getTotalMonthlySubscriptionCost();
  const activeCount = subscriptions.filter((s) => s.isActive).length;

  useFocusEffect(useCallback(() => { refresh(); }, []));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      {/* Header */}
      <View style={{
        paddingHorizontal: hp, paddingTop: sp, paddingBottom: sp * 0.75,
        borderBottomWidth: 1, borderBottomColor: theme.colors.border,
        maxWidth: contentWidth, alignSelf: width >= 768 ? 'center' : 'stretch', width: '100%',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={[theme.typography.headingLg, { color: theme.colors.textPrimary }]}>Subscriptions</Text>
            <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
              {activeCount} active · {formatCurrency(monthlyTotal, currency)}/mo
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(modals)/add-subscription' as any)}
            style={{
              backgroundColor: theme.colors.warning[500],
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

      {/* Content */}
      <View style={{ flex: 1, maxWidth: contentWidth, alignSelf: width >= 768 ? 'center' : 'stretch', width: '100%' }}>
        {subscriptions.length === 0 ? (
          <EmptyState
            icon="🔄"
            title="No subscriptions"
            description="Track recurring bills and get notified before they're due."
            actionLabel="Add Subscription"
            onAction={() => router.push('/(modals)/add-subscription' as any)}
          />
        ) : (
          <FlatList
            data={subscriptions}
            keyExtractor={(item) => String(item.id)}
            numColumns={columns}
            key={String(columns)}
            columnWrapperStyle={columns > 1 ? { gap: theme.spacing.sm, paddingHorizontal: hp } : undefined}
            renderItem={({ item }) => (
              <View style={{ flex: 1 }}>
                <SubscriptionCard
                  subscription={item}
                  onPress={() => router.push(`/(modals)/subscription-detail/${item.id}` as any)}
                  onToggleActive={(isActive) => toggleActive(item.id, isActive)}
                  onMarkPaid={() => markPaid(item.id)}
                />
              </View>
            )}
            showsVerticalScrollIndicator={false}
            refreshing={isLoading}
            onRefresh={refresh}
            contentContainerStyle={{
              paddingTop: theme.spacing.sm,
              paddingBottom: theme.spacing.xl,
              paddingHorizontal: columns === 1 ? hp : 0,
            }}
            ItemSeparatorComponent={() => <View style={{ height: theme.spacing.xs }} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
