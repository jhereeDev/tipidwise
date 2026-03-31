import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useResponsive } from '../hooks/useResponsive';

export default function IndexScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { isSignedIn, isLoading, isGuest, setGuest } = useAuth();
  const { hp, contentWidth, safeEdges, landscapeHp } = useResponsive();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.colors.primary[500]} size="large" />
      </View>
    );
  }

  if (isSignedIn || isGuest) {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={[...safeEdges, 'bottom']}>
      <View style={{
        flex: 1, maxWidth: contentWidth, width: '100%', alignSelf: 'center',
        paddingHorizontal: hp + landscapeHp, justifyContent: 'center', alignItems: 'center',
      }}>
        <View style={{ alignItems: 'center', marginBottom: theme.spacing.xxl }}>
          <View style={{
            width: 96, height: 96, borderRadius: theme.radii.xl,
            backgroundColor: `${theme.colors.primary[500]}15`,
            alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.lg,
          }}>
            <Text style={{ fontSize: 48 }}>💰</Text>
          </View>
          <Text style={[theme.typography.displayLg, { color: theme.colors.primary[500], textAlign: 'center', marginBottom: theme.spacing.sm }]}>
            TipidWise
          </Text>
          <Text style={[theme.typography.bodyLg, { color: theme.colors.textSecondary, textAlign: 'center', maxWidth: 320 }]}>
            Smart budget tracking, group expense splitting, and savings goals — all in one app.
          </Text>
        </View>

        <View style={{ gap: theme.spacing.md, marginBottom: theme.spacing.xxl, width: '100%', maxWidth: 360 }}>
          {[
            { icon: '📊', title: 'Track Expenses & Income', desc: 'Know exactly where your money goes' },
            { icon: '👥', title: 'Split with Friends', desc: 'Splitwise-style group expense splitting' },
            { icon: '🎯', title: 'Savings Goals & Streaks', desc: 'Build better money habits daily' },
          ].map((f) => (
            <View key={f.title} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
              <View style={{
                width: 48, height: 48, borderRadius: theme.radii.lg,
                backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 22 }}>{f.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[theme.typography.labelLg, { color: theme.colors.textPrimary }]}>{f.title}</Text>
                <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ gap: theme.spacing.sm, width: '100%', maxWidth: 360 }}>
          <Button label="Create Account" onPress={() => router.push('/sign-up' as any)} fullWidth size="lg" />
          <Button label="Sign In" onPress={() => router.push('/sign-in' as any)} variant="secondary" fullWidth size="lg" />
          <Button label="Continue without account" onPress={() => setGuest(true)} variant="ghost" fullWidth />
        </View>
      </View>
    </SafeAreaView>
  );
}
