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
import { CURRENCIES } from '../../constants/config';
import Constants from 'expo-constants';
import { getDatabase } from '../../lib/db/client';

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { themeMode, setThemeMode } = useThemeContext();
  const { currency, setCurrency } = useCurrencyContext();

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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top', 'bottom']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[theme.typography.bodyLg, { color: theme.colors.primary[500] }]}>Done</Text>
        </TouchableOpacity>
        <Text style={[theme.typography.headingMd, { color: theme.colors.textPrimary, flex: 1, textAlign: 'center' }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.spacing.md }} showsVerticalScrollIndicator={false}>
        <ResponsiveContainer>
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
                <Text style={[theme.typography.bodyMd, { color: theme.colors.textPrimary }]}>Local (on-device)</Text>
              </View>
            </View>
          </Card>
        </ResponsiveContainer>
      </ScrollView>
    </SafeAreaView>
  );
}
