import * as Notifications from 'expo-notifications';
import type { Subscription } from '../../types/models';
import { NOTIFICATION_HOUR } from '../../constants/config';

export function setupNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function scheduleSubscriptionNotification(
  subscription: Subscription,
  currencySymbol = '₱'
): Promise<string | null> {
  const [year, month, day] = subscription.nextDueDate.split('-').map(Number);
  const dueDate = new Date(year, month - 1, day);
  const notifyDate = new Date(dueDate);
  notifyDate.setDate(notifyDate.getDate() - subscription.reminderDaysBefore);
  notifyDate.setHours(NOTIFICATION_HOUR, 0, 0, 0);

  // Don't schedule if notification date is in the past
  if (notifyDate <= new Date()) return null;

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `${subscription.name} subscription due soon`,
        body: `${currencySymbol}${subscription.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })} due on ${subscription.nextDueDate} (${subscription.billingCycle})`,
        data: { subscriptionId: subscription.id, screen: 'subscription-detail' },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: notifyDate },
    });
    return id;
  } catch {
    return null;
  }
}

export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // Silently ignore if already cancelled
  }
}

export async function getScheduledNotificationIds(): Promise<Set<string>> {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  return new Set(notifications.map((n) => n.identifier));
}
