import { Tabs } from 'expo-router';
import { Text, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';

function TabIcon({ icon, focused, color }: { icon: string; focused: boolean; color: string }) {
  return <Text style={{ fontSize: focused ? 24 : 22, opacity: focused ? 1 : 0.7 }}>{icon}</Text>;
}

export default function TabsLayout() {
  const theme = useTheme();
  const { isTablet, isLandscape, landscapeHp } = useResponsive();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.tabBarActive,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBar,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 0 : 8,
          paddingTop: 8,
          height: isLandscape ? 52 : isTablet ? 72 : 60,
          paddingHorizontal: landscapeHp,
        },
        tabBarLabelStyle: {
          ...theme.typography.labelSm,
          marginTop: 2,
        },
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused, color }) => <TabIcon icon="🏠" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'Expenses',
          tabBarIcon: ({ focused, color }) => <TabIcon icon="🧾" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="income"
        options={{
          title: 'Income',
          tabBarIcon: ({ focused, color }) => <TabIcon icon="💰" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Groups',
          tabBarIcon: ({ focused, color }) => <TabIcon icon="👥" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="subscriptions"
        options={{
          title: 'Subs',
          tabBarIcon: ({ focused, color }) => <TabIcon icon="🔄" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ focused, color }) => <TabIcon icon="📊" focused={focused} color={color} />,
        }}
      />
    </Tabs>
  );
}
