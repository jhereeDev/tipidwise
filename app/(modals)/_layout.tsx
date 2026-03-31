import { Stack } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

export default function ModalsLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="add-expense" />
      <Stack.Screen name="add-income" />
      <Stack.Screen name="add-subscription" />
      <Stack.Screen name="expense-detail/[id]" />
      <Stack.Screen name="income-detail/[id]" />
      <Stack.Screen name="subscription-detail/[id]" />
      <Stack.Screen name="budgets" />
      <Stack.Screen name="savings-goals" />
      <Stack.Screen name="group-detail/[id]" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
