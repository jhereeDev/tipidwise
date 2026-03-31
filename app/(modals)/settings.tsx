import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import ResponsiveContainer from '../../components/layout/ResponsiveContainer';
import { useTheme } from '../../context/ThemeContext';
import { useThemeContext } from '../../context/ThemeContext';
import { useCurrencyContext } from '../../context/CurrencyContext';
import { useAuth } from '../../context/AuthContext';
import { useResponsive } from '../../hooks/useResponsive';
import { CURRENCIES } from '../../constants/config';
import Constants from 'expo-constants';
import { getDatabase } from '../../lib/db/client';

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { themeMode, setThemeMode } = useThemeContext();
  const { currency, setCurrency } = useCurrencyContext();
  const { user, isGuest, signOut: doSignOut } = useAuth();
  const { hp, landscapeHp, contentWidth, isLandscape } = useResponsive();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await doSignOut(); router.dismissAll(); router.replace('/' as any); } },
    ]);
  };

  const themeOptions = [
    { value: 'system', label: 'System default' },
    { value: 'light', label: '☀️ Light' },
    { value: 'dark', label: '🌙 Dark' },
  ];

  const currencyOptions = CURRENCIES.map((c) => ({ value: c.value, label: c.label }));
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your expenses, income, and subscriptions. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything',
          style: 'destructive',
          onPress: () => {
            const db = getDatabase();
            db.execSync('DELETE FROM expenses');
            db.execSync('DELETE FROM income');
            db.execSync('DELETE FROM subscriptions');
            Alert.alert('Done', 'All data has been cleared.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={isLandscape ? ['top', 'bottom', 'left', 'right'] : ['top', 'bottom']}>
      <View style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingHorizontal: hp + landscapeHp }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', maxWidth: contentWidth, width: '100%', alignSelf: 'center', paddingVertical: theme.spacing.md }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[theme.typography.bodyLg, { color: theme.colors.primary[500] }]}>Done</Text>
        </TouchableOpacity>
        <Text style={[theme.typography.headingMd, { color: theme.colors.textPrimary, flex: 1, textAlign: 'center' }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.spacing.md }} showsVerticalScrollIndicator={false}>
        <ResponsiveContainer>
          {/* Account Section */}
          <Text style={[theme.typography.labelSm, { color: theme.colors.textSecondary, marginBottom: theme.spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 }]}>
            Account
          </Text>
          <Card style={{ marginBottom: theme.spacing.md }}>
            {user ? (
              <View style={{ gap: theme.spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
                  <View style={{
                    width: 48, height: 48, borderRadius: theme.radii.full,
                    backgroundColor: `${theme.colors.primary[500]}20`,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ fontSize: 22 }}>👤</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[theme.typography.labelLg, { color: theme.colors.textPrimary }]}>
                      {user.user_metadata?.display_name ?? 'User'}
                    </Text>
                    <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
                      {user.email}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={handleSignOut}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 18 }}>🚪</Text>
                  <Text style={[theme.typography.labelLg, { color: theme.colors.danger[500] }]}>Sign Out</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ gap: theme.spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
                  <View style={{
                    width: 48, height: 48, borderRadius: theme.radii.full,
                    backgroundColor: theme.colors.surface,
                    borderWidth: 1, borderColor: theme.colors.border,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ fontSize: 22 }}>👤</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[theme.typography.labelLg, { color: theme.colors.textPrimary }]}>
                      {isGuest ? 'Guest Mode' : 'Not signed in'}
                    </Text>
                    <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>
                      Data saved locally on this device
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                  <TouchableOpacity
                    onPress={() => { router.back(); setTimeout(() => router.push('/sign-in' as any), 300); }}
                    style={{
                      flex: 1, height: 44, borderRadius: theme.radii.lg,
                      backgroundColor: theme.colors.primary[500],
                      alignItems: 'center', justifyContent: 'center',
                    }}
                    activeOpacity={0.75}
                  >
                    <Text style={[theme.typography.labelLg, { color: '#fff' }]}>Sign In</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => { router.back(); setTimeout(() => router.push('/sign-up' as any), 300); }}
                    style={{
                      flex: 1, height: 44, borderRadius: theme.radii.lg,
                      backgroundColor: theme.colors.surface,
                      borderWidth: 1, borderColor: theme.colors.border,
                      alignItems: 'center', justifyContent: 'center',
                    }}
                    activeOpacity={0.75}
                  >
                    <Text style={[theme.typography.labelLg, { color: theme.colors.textPrimary }]}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Card>

          <Text style={[theme.typography.labelSm, { color: theme.colors.textSecondary, marginBottom: theme.spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 }]}>
            Appearance
          </Text>
          <Card style={{ marginBottom: theme.spacing.md, gap: theme.spacing.md }}>
            <Select
              label="Theme"
              options={themeOptions}
              value={themeMode}
              onChange={(v) => setThemeMode(v as any)}
            />
          </Card>

          <Text style={[theme.typography.labelSm, { color: theme.colors.textSecondary, marginBottom: theme.spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 }]}>
            Currency
          </Text>
          <Card style={{ marginBottom: theme.spacing.md }}>
            <Select
              label="Currency"
              options={currencyOptions}
              value={currency}
              onChange={setCurrency}
            />
          </Card>

          <Text style={[theme.typography.labelSm, { color: theme.colors.textSecondary, marginBottom: theme.spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 }]}>
            Data
          </Text>
          <Card style={{ marginBottom: theme.spacing.md }}>
            <TouchableOpacity
              onPress={handleClearData}
              style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 20 }}>🗑️</Text>
              <View style={{ flex: 1 }}>
                <Text style={[theme.typography.labelLg, { color: theme.colors.danger[500] }]}>Clear All Data</Text>
                <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>Permanently delete all records</Text>
              </View>
            </TouchableOpacity>
          </Card>

          <Text style={[theme.typography.labelSm, { color: theme.colors.textSecondary, marginBottom: theme.spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 }]}>
            About
          </Text>
          <Card>
            <View style={{ gap: theme.spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[theme.typography.bodyMd, { color: theme.colors.textSecondary }]}>App Name</Text>
                <Text style={[theme.typography.bodyMd, { color: theme.colors.textPrimary }]}>TipidWise</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[theme.typography.bodyMd, { color: theme.colors.textSecondary }]}>Version</Text>
                <Text style={[theme.typography.bodyMd, { color: theme.colors.textPrimary }]}>{appVersion}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[theme.typography.bodyMd, { color: theme.colors.textSecondary }]}>Storage</Text>
                <Text style={[theme.typography.bodyMd, { color: theme.colors.textPrimary }]}>
                  {user ? 'Local + Cloud Sync' : 'Local (on-device)'}
                </Text>
              </View>
            </View>
          </Card>
        </ResponsiveContainer>
      </ScrollView>
    </SafeAreaView>
  );
}
