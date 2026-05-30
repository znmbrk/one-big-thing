import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useDailyTask } from '../hooks/useDailyTask';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { TaskInput } from '../components/TaskInput';
import { TaskCard } from '../components/TaskCard';
import { useStreak, getWeekdayIndex } from '../hooks/useStreak';
import { StreakBar } from '../components/StreakBar';
import { taskStorage } from '../services/taskStorage';
import * as Haptic from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';
import { SafeAreaView } from 'react-native-safe-area-context';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen = () => {
  const { currentTask, setCurrentTask, completeTask, error: taskError, clearError: clearTaskError } = useDailyTask();
  const checkboxScale = useRef(new Animated.Value(1)).current;
  const navigation = useNavigation<NavigationProp>();
  const { streak, weeklyCompletion, refreshStreak, updateWeeklyCompletion, error: streakError, clearError: clearStreakError } = useStreak();

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
    const task = {
      id: Date.now().toString(),
      text,
      completed: false,
      date: new Date().toISOString(),
    };
    await setCurrentTask(task);
  };

  const handleToggleComplete = async () => {
    if (!currentTask) return;

    Animated.sequence([
      Animated.timing(checkboxScale, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(checkboxScale, {
        toValue: 1.5,
        tension: 40,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(checkboxScale, {
        toValue: 1,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    Haptic.notificationAsync(Haptic.NotificationFeedbackType.Success);

    const newCompleted = !currentTask.completed;
    await completeTask(newCompleted);
    await refreshStreak();

    const todayIndex = getWeekdayIndex(new Date());
    const newCompletion = [...weeklyCompletion];
    newCompletion[todayIndex] = newCompleted ? 1 : 0;
    updateWeeklyCompletion(newCompletion);
  };

  const handleDevReset = async () => {
    try {
      await taskStorage.clearAll();
      setCurrentTask(null);
      refreshStreak?.();
    } catch (error) {
      console.error('Error resetting:', error);
    }
  };

  const devPremiumText = isPremium ? '✨ Premium Active' : '🆓 Free User';

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
          <Text style={[styles.streakText, { color: theme.text }]}>
            🔥 {streak}-day streak
          </Text>
          <StreakBar
            completedDays={weeklyCompletion}
            onUpdate={updateWeeklyCompletion}
          />
        </View>

        {!currentTask ? (
          <TaskInput onSubmit={handleSetTask} />
        ) : (
          <TaskCard
            task={currentTask}
            onToggleComplete={handleToggleComplete}
            checkboxScale={checkboxScale}
          />
        )}

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
              style={[styles.devResetButton, { backgroundColor: '#FF3B30' }]}
              onPress={handleDevReset}
            >
              <Text style={[styles.devResetText, { color: '#FFFFFF' }]}>🔄 Reset</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
    paddingTop: 40,
  },
  streakContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  streakText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  historyButton: {
    padding: 15,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyButtonText: {
    fontSize: 18,
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
