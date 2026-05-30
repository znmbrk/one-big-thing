// IMPORTANT: expo-notifications is not yet installed.
// Before using this hook, run: npx expo install expo-notifications
// Then rebuild the native app (npx expo run:ios or eas build).

import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NotificationSettings {
  offsets: number[]; // hours after task creation, e.g. [1, 4, 12]
  hardCapHour: number; // 24-hour wall-clock cap, default 19 (7 pm)
}

const DEFAULT_SETTINGS: NotificationSettings = {
  offsets: [1, 4, 12],
  hardCapHour: 19,
};

// ---------------------------------------------------------------------------
// AsyncStorage keys  (kept in sync with taskStorage.ts naming convention)
// ---------------------------------------------------------------------------

const STORAGE_KEY_SETTINGS = 'notificationSettings';
const STORAGE_KEY_IDS = 'scheduledNotificationIds';

// ---------------------------------------------------------------------------
// Notification content — contextual per reminder
// ---------------------------------------------------------------------------

interface ScheduledReminder {
  triggerDate: Date;
  offsetHours: number;
  isCapped: boolean;
}

function notificationContent(
  reminder: ScheduledReminder,
  goalText: string,
): Notifications.NotificationContentInput {
  const title = reminder.isCapped
    ? 'End of day'
    : `${reminder.offsetHours}hr check-in`;
  return { title, body: goalText };
}

// ---------------------------------------------------------------------------
// Helper: compute the final set of trigger times from a creation timestamp
// ---------------------------------------------------------------------------

function computeTriggerTimes(
  taskCreatedAt: Date,
  settings: NotificationSettings,
): ScheduledReminder[] {
  const { offsets, hardCapHour } = settings;
  const now = new Date();

  // Step 1 – build raw candidates with metadata
  const candidates: ScheduledReminder[] = offsets.map((offsetHours) => {
    const t = new Date(taskCreatedAt);
    t.setTime(t.getTime() + offsetHours * 60 * 60 * 1000);
    return { triggerDate: t, offsetHours, isCapped: false };
  });

  // Step 2 – apply hard cap
  const capped: ScheduledReminder[] = [];
  for (const r of candidates) {
    if (r.triggerDate.getHours() >= hardCapHour) {
      const capTime = new Date(r.triggerDate);
      capTime.setHours(hardCapHour, 0, 0, 0);
      const capKey = capTime.toDateString() + capTime.getTime();
      const alreadyHasCap = capped.some(
        (existing) => existing.triggerDate.toDateString() + existing.triggerDate.getTime() === capKey,
      );
      if (!alreadyHasCap) {
        capped.push({ triggerDate: capTime, offsetHours: r.offsetHours, isCapped: true });
      }
    } else {
      capped.push(r);
    }
  }

  // Step 3 – sort ascending
  capped.sort((a, b) => a.triggerDate.getTime() - b.triggerDate.getTime());

  // Step 4 – collapse: within 30 min, keep the later one
  const THIRTY_MINUTES_MS = 30 * 60 * 1000;
  const collapsed: ScheduledReminder[] = [];
  for (const r of capped) {
    if (collapsed.length === 0) {
      collapsed.push(r);
      continue;
    }
    const prev = collapsed[collapsed.length - 1];
    if (r.triggerDate.getTime() - prev.triggerDate.getTime() < THIRTY_MINUTES_MS) {
      collapsed[collapsed.length - 1] = r;
    } else {
      collapsed.push(r);
    }
  }

  // Step 5 – drop past times
  return collapsed.filter((r) => r.triggerDate.getTime() > now.getTime());
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useNotifications() {
  const [hasPermission, setHasPermission] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [scheduledTimes, setScheduledTimes] = useState<Date[]>([]);

  // Identifiers of notifications scheduled in the current session / loaded from storage
  const identifierRef = useRef<string[]>([]);

  // -------------------------------------------------------------------------
  // Mount: load persisted settings and permission state
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    const bootstrap = async () => {
      // Load settings
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY_SETTINGS);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<NotificationSettings>;
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        }
      } catch {
        // Fall back to defaults — no-op
      }

      // Load previously scheduled IDs
      try {
        const rawIds = await AsyncStorage.getItem(STORAGE_KEY_IDS);
        if (rawIds) {
          identifierRef.current = JSON.parse(rawIds) as string[];
        }
      } catch {
        // No-op
      }

      // Check current permission status without prompting
      try {
        const { status } = await Notifications.getPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch {
        // expo-notifications may not be linked yet during development
      }
    };

    bootstrap();
  }, []);

  // -------------------------------------------------------------------------
  // requestPermissions
  // -------------------------------------------------------------------------

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'ios') return false;

    try {
      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);
      return granted;
    } catch {
      return false;
    }
  }, []);

  // -------------------------------------------------------------------------
  // cancelReminders
  // -------------------------------------------------------------------------

  const cancelReminders = useCallback(async (): Promise<void> => {
    if (Platform.OS !== 'ios') return;

    const ids = identifierRef.current;
    if (ids.length === 0) return;

    try {
      await Promise.all(
        ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)),
      );
    } catch {
      // Partial cancellation is acceptable; identifiers may have already fired
    }

    identifierRef.current = [];
    setScheduledTimes([]);

    try {
      await AsyncStorage.removeItem(STORAGE_KEY_IDS);
    } catch {
      // No-op
    }
  }, []);

  // -------------------------------------------------------------------------
  // scheduleReminders
  // -------------------------------------------------------------------------

  const scheduleReminders = useCallback(
    async (taskCreatedAt: Date, goalText: string): Promise<void> => {
      if (Platform.OS !== 'ios') return;
      if (!hasPermission) return;

      await cancelReminders();

      const reminders = computeTriggerTimes(taskCreatedAt, settings);
      if (reminders.length === 0) return;

      const newIds: string[] = [];

      for (const reminder of reminders) {
        try {
          const id = await Notifications.scheduleNotificationAsync({
            content: notificationContent(reminder, goalText),
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: reminder.triggerDate,
            },
          });
          newIds.push(id);
        } catch {
          // Individual failure should not abort remaining
        }
      }

      identifierRef.current = newIds;
      setScheduledTimes(reminders.map((r) => r.triggerDate));

      try {
        await AsyncStorage.setItem(STORAGE_KEY_IDS, JSON.stringify(newIds));
      } catch {}
    },
    [hasPermission, settings, cancelReminders],
  );

  // -------------------------------------------------------------------------
  // rescheduleReminders (cancel + schedule)
  // -------------------------------------------------------------------------

  const rescheduleReminders = useCallback(
    async (taskCreatedAt: Date, goalText: string): Promise<void> => {
      if (Platform.OS !== 'ios') return;
      await cancelReminders();
      await scheduleReminders(taskCreatedAt, goalText);
    },
    [cancelReminders, scheduleReminders],
  );

  // -------------------------------------------------------------------------
  // updateSettings
  // -------------------------------------------------------------------------

  const updateSettings = useCallback(
    async (newSettings: NotificationSettings): Promise<void> => {
      setSettings(newSettings);
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY_SETTINGS,
          JSON.stringify(newSettings),
        );
      } catch {
        // No-op
      }
    },
    [],
  );

  // -------------------------------------------------------------------------
  // Return value
  // -------------------------------------------------------------------------

  return {
    scheduleReminders,
    cancelReminders,
    rescheduleReminders,
    requestPermissions,
    hasPermission,
    settings,
    updateSettings,
    scheduledTimes,
  };
}
