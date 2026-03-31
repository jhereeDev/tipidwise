import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { CurrencyProvider } from '../context/CurrencyContext';
import { useDatabase } from '../hooks/useDatabase';
import { requestNotificationPermissions } from '../lib/notifications/permissions';
import { setupNotificationHandler } from '../lib/notifications/scheduler';
import { View, Text, ActivityIndicator } from 'react-native';

function AppContent() {
  const theme = useTheme();
  const { ready, error } = useDatabase();

  useEffect(() => {
    setupNotificationHandler();
    requestNotificationPermissions();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }}>
        {error ? (
          <Text style={[theme.typography.bodyMd, { color: theme.colors.danger[500], textAlign: 'center', padding: 24 }]}>
            Failed to initialize database:{'\n'}{error}
          </Text>
        ) : (
          <ActivityIndicator color={theme.colors.primary[500]} size="large" />
        )}
      </View>
    );
  }

  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(modals)" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#0D9488" size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <CurrencyProvider>
            <AppContent />
          </CurrencyProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
