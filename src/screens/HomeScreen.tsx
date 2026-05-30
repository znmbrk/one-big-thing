import React, { useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { useDailyTask } from '../hooks/useDailyTask';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { TaskInput } from '../components/TaskInput';
import { TaskCard } from '../components/TaskCard';
import { useStreak, getWeekdayIndex } from '../hooks/useStreak';
import { StreakBar } from '../components/StreakBar';
import { ReminderStatus } from '../components/ReminderStatus';
import { ReminderSettingsModal } from '../components/ReminderSettingsModal';
import { useNotifications } from '../hooks/useNotifications';
import { taskStorage } from '../services/taskStorage';
import * as Haptic from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useQuote } from '../hooks/useQuote';
import { SafeAreaView } from 'react-native-safe-area-context';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen = () => {
  const { currentTask, setCurrentTask, completeTask, error: taskError, clearError: clearTaskError } = useDailyTask();
  const checkboxScale = useRef(new Animated.Value(1)).current;
  const navigation = useNavigation<NavigationProp>();
  const { streak, weeklyCompletion, refreshStreak, updateWeeklyCompletion, error: streakError, clearError: clearStreakError } = useStreak();
  const { scheduleReminders, cancelReminders, requestPermissions, hasPermission, settings, updateSettings } = useNotifications();
  const quote = useQuote();
  const [showReminderSettings, setShowReminderSettings] = useState(false);

  const activeError = taskError || streakError;
  const clearActiveError = () => {
    clearTaskError();
    clearStreakError();
  };

  const errorOpacity = useRef(new Animated.Value(0)).current;
  const errorTranslateY = useRef(new Animated.Value(-8)).current;
  const { theme } = useTheme();
  const { isPremium } = useSubscription();

  useEffect(() => {
    if (activeError) {
      Animated.parallel([
        Animated.timing(errorOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(errorTranslateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
      const timer = setTimeout(clearActiveError, 4000);
      return () => clearTimeout(timer);
    } else {
      Animated.parallel([
        Animated.timing(errorOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(errorTranslateY, { toValue: -8, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [activeError]);

  const handleSetTask = async (text: string) => {
    const createdAt = new Date();
    const task = {
      id: Date.now().toString(),
      text,
      completed: false,
      date: createdAt.toISOString(),
    };
    await setCurrentTask(task);

    // Request permissions on first task set, then schedule reminders
    const permitted = hasPermission || await requestPermissions();
    if (permitted) {
      await scheduleReminders(createdAt, text);
    }
  };

  const handleToggleComplete = async () => {
    if (!currentTask) return;

    Animated.sequence([
      Animated.timing(checkboxScale, { toValue: 0.8, duration: 100, useNativeDriver: true }),
      Animated.spring(checkboxScale, { toValue: 1.12, tension: 60, friction: 5, useNativeDriver: true }),
      Animated.spring(checkboxScale, { toValue: 1, tension: 40, useNativeDriver: true }),
    ]).start();

    Haptic.notificationAsync(Haptic.NotificationFeedbackType.Success);

    const newCompleted = !currentTask.completed;
    await completeTask(newCompleted);
    await refreshStreak();

    // Cancel reminders when task is completed; restore when un-completing
    if (newCompleted) {
      await cancelReminders();
    } else if (currentTask.date) {
      const permitted = hasPermission || await requestPermissions();
      if (permitted) await scheduleReminders(new Date(currentTask.date), currentTask.text);
    }

    const todayIndex = getWeekdayIndex(new Date());
    const newCompletion = [...weeklyCompletion];
    newCompletion[todayIndex] = newCompleted ? 1 : 0;
    updateWeeklyCompletion(newCompletion);
  };

  const handleDevReset = async () => {
    try {
      await taskStorage.clearAll();
      await cancelReminders();
      setCurrentTask(null);
      refreshStreak?.();
    } catch (error) {
      console.error('Error resetting:', error);
    }
  };

  const handleTestNotifications = async () => {
    const permitted = hasPermission || await requestPermissions();
    if (!permitted) {
      Alert.alert('No Permission', 'Notification permission was not granted.');
      return;
    }
    const goalText = currentTask?.text ?? 'Your one big thing';
    const previews: Array<{ title: string; delaySecs: number }> = [
      { title: '1hr check-in', delaySecs: 5 },
      { title: '4hr check-in', delaySecs: 10 },
      { title: 'End of day',    delaySecs: 15 },
    ];
    await Promise.all(
      previews.map(({ title, delaySecs }) =>
        Notifications.scheduleNotificationAsync({
          content: { title, body: goalText },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: delaySecs },
        }),
      ),
    );
    Alert.alert('Test Reminders Sent', '3 notifications arriving in 5s, 10s, and 15s.');
  };

  const devPremiumText = isPremium ? '✨ Premium Active' : '🆓 Free User';

  // ── INPUT MODE — full-screen, no chrome ──────────────────────────────────
  if (!currentTask) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.inputModeContainer}>
          {/* Dots only — no streak count, no labels */}
          <View style={styles.inputModeStreak}>
            <StreakBar completedDays={weeklyCompletion} onUpdate={updateWeeklyCompletion} />
          </View>
          <TaskInput onSubmit={handleSetTask} />
        </View>
        {__DEV__ && (
          <View style={styles.devContainer}>
            <TouchableOpacity
              style={[styles.devResetButton, { backgroundColor: '#FF3B30' }]}
              onPress={handleDevReset}
            >
              <Text style={[styles.devResetText, { color: '#FFFFFF' }]}>🔄 Reset</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // ── GOAL MODE — streak + card + reminders + history ───────────────────────
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {activeError && (
        <Animated.View
          style={[
            styles.errorBanner,
            {
              backgroundColor: theme.errorBackground,
              opacity: errorOpacity,
              transform: [{ translateY: errorTranslateY }],
            },
          ]}
        >
          <Text style={[styles.errorMessage, { color: theme.errorText }]} numberOfLines={2}>
            {activeError}
          </Text>
          <TouchableOpacity
            onPress={clearActiveError}
            style={styles.errorDismiss}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.errorDismissText, { color: theme.errorText }]}>✕</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <View style={styles.container}>
        <View style={styles.streakContainer}>
          {streak > 0 && (
            <Text style={[styles.streakText, { color: theme.secondaryText }]}>
              {streak}-day streak
            </Text>
          )}
          <StreakBar completedDays={weeklyCompletion} onUpdate={updateWeeklyCompletion} />
        </View>

        <View style={styles.taskArea}>
          <TaskCard
            task={currentTask}
            onToggleComplete={handleToggleComplete}
            checkboxScale={checkboxScale}
          />
          {hasPermission && (
            <ReminderStatus
              offsets={settings.offsets}
              hardCapHour={settings.hardCapHour}
              onPress={() => setShowReminderSettings(true)}
            />
          )}
          <Text style={[styles.quote, { color: theme.secondaryText }]}>{quote}</Text>
        </View>

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={[styles.historyButtonText, { color: theme.accent }]}>View History</Text>
        </TouchableOpacity>

        {__DEV__ && (
          <View style={styles.devContainer}>
            <Text style={[styles.devPremiumStatus, { color: theme.secondaryText }]}>
              {devPremiumText}
            </Text>
            <TouchableOpacity
              style={[styles.devResetButton, { backgroundColor: theme.accent }]}
              onPress={handleTestNotifications}
            >
              <Text style={[styles.devResetText, { color: '#FFFFFF' }]}>🔔 Test Reminders</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.devResetButton, { backgroundColor: '#FF3B30' }]}
              onPress={handleDevReset}
            >
              <Text style={[styles.devResetText, { color: '#FFFFFF' }]}>🔄 Reset</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ReminderSettingsModal
        visible={showReminderSettings}
        onClose={() => setShowReminderSettings(false)}
        offsets={settings.offsets}
        hardCapHour={settings.hardCapHour}
        onSave={async (offsets, hardCapHour) => {
          await updateSettings({ offsets, hardCapHour });
          // Reschedule with new settings if task exists and not completed
          if (currentTask && !currentTask.completed && currentTask.date) {
            await scheduleReminders(new Date(currentTask.date), currentTask.text);
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 8,
  },
  streakContainer: {
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 0,
  },
  streakText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },
  inputModeContainer: {
    flex: 1,
  },
  inputModeStreak: {
    paddingTop: 16,
    alignItems: 'center',
  },
  taskArea: {
    flex: 1,
    justifyContent: 'center',
  },
  historyButton: {
    paddingVertical: 16,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyButtonText: {
    fontSize: 16,
  },
  quote: {
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 40,
    marginTop: 2,
  },
  devContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'flex-end',
    gap: 8,
  },
  devPremiumStatus: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.7,
  },
  devResetButton: {
    padding: 8,
    paddingHorizontal: 12,
    minHeight: 44,
    borderRadius: 8,
    opacity: 0.8,
    justifyContent: 'center',
  },
  devResetText: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  errorMessage: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  errorDismiss: {
    paddingLeft: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  errorDismissText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
