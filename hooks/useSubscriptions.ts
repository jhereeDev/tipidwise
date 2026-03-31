import { useState, useEffect, useCallback } from 'react';
import * as SubscriptionsDB from '../lib/db/subscriptions';
import { updateSubscriptionNotificationId, markSubscriptionPaid } from '../lib/db/subscriptions';
import { scheduleSubscriptionNotification, cancelNotification } from '../lib/notifications/scheduler';
import type { Subscription } from '../types/models';
import type { SubscriptionFormState } from '../types/forms';
import { useCurrency } from '../context/CurrencyContext';

interface UseSubscriptionsResult {
  subscriptions: Subscription[];
  isLoading: boolean;
  error: string | null;
  addSubscription: (form: SubscriptionFormState) => Promise<void>;
  updateSubscription: (id: number, form: SubscriptionFormState) => Promise<void>;
  deleteSubscription: (id: number) => Promise<void>;
  toggleActive: (id: number, isActive: boolean) => Promise<void>;
  markPaid: (id: number) => Promise<void>;
  refresh: () => void;
}

export function useSubscriptions(): UseSubscriptionsResult {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currency = useCurrency();

  const load = useCallback(() => {
    try {
      setIsLoading(true);
      const data = SubscriptionsDB.getSubscriptions();
      setSubscriptions(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load subscriptions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addSubscription = async (form: SubscriptionFormState) => {
    const id = SubscriptionsDB.insertSubscription(form);
    const subscription = SubscriptionsDB.getSubscriptionById(id);
    if (subscription?.isActive) {
      const notificationId = await scheduleSubscriptionNotification(subscription, currency);
      if (notificationId) updateSubscriptionNotificationId(id, notificationId);
    }
    load();
  };

  const updateSubscription = async (id: number, form: SubscriptionFormState) => {
    const existing = SubscriptionsDB.getSubscriptionById(id);
    if (existing?.notificationId) {
      await cancelNotification(existing.notificationId);
    }
    SubscriptionsDB.updateSubscription(id, form);
    const updated = SubscriptionsDB.getSubscriptionById(id);
    if (updated?.isActive) {
      const notificationId = await scheduleSubscriptionNotification(updated, currency);
      if (notificationId) updateSubscriptionNotificationId(id, notificationId);
      else updateSubscriptionNotificationId(id, null);
    } else {
      updateSubscriptionNotificationId(id, null);
    }
    load();
  };

  const deleteSubscription = async (id: number) => {
    const existing = SubscriptionsDB.getSubscriptionById(id);
    if (existing?.notificationId) {
      await cancelNotification(existing.notificationId);
    }
    SubscriptionsDB.deleteSubscription(id);
    load();
  };

  const toggleActive = async (id: number, isActive: boolean) => {
    const existing = SubscriptionsDB.getSubscriptionById(id);
    if (existing?.notificationId) {
      await cancelNotification(existing.notificationId);
      updateSubscriptionNotificationId(id, null);
    }
    SubscriptionsDB.toggleSubscriptionActive(id, isActive);
    if (isActive) {
      const updated = SubscriptionsDB.getSubscriptionById(id);
      if (updated) {
        const notificationId = await scheduleSubscriptionNotification(updated, currency);
        if (notificationId) updateSubscriptionNotificationId(id, notificationId);
      }
    }
    load();
  };

  const markPaid = async (id: number) => {
    const newNextDue = markSubscriptionPaid(id);
    // Reschedule notification with updated due date
    if (newNextDue) {
      const updated = SubscriptionsDB.getSubscriptionById(id);
      if (updated?.isActive) {
        if (updated.notificationId) await cancelNotification(updated.notificationId);
        const notificationId = await scheduleSubscriptionNotification(updated, currency);
        updateSubscriptionNotificationId(id, notificationId ?? null);
      }
    }
    load();
  };

  return { subscriptions, isLoading, error, addSubscription, updateSubscription, deleteSubscription, toggleActive, markPaid, refresh: load };
}
