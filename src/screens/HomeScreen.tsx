import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useDailyTask } from '../hooks/useDailyTask';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TaskInput } from '../components/TaskInput';
import { TaskCard } from '../components/TaskCard';
import { useStreak } from '../hooks/useStreak';
import { StreakBar } from '../components/StreakBar';
import { taskStorage } from '../services/taskStorage';
import * as Haptic from 'expo-haptics';

type RootStackParamList = {
  Home: undefined;
  History: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen = () => {
  const { currentTask, setCurrentTask, completeTask } = useDailyTask();
  const checkboxScale = new Animated.Value(1);
  const navigation = useNavigation<NavigationProp>();
  const { streak, weeklyCompletion, refreshStreak } = useStreak();

  const handleSetTask = async (text: string) => {
    const task = {
      id: Date.now().toString(),
      text: text,
      completed: false,
      date: new Date().toISOString(),
    };

    await setCurrentTask(task);
  };

  const handleToggleComplete = () => {
    if (!currentTask) return;

    // More dramatic animation sequence
    Animated.sequence([
      // Quick shrink
      Animated.timing(checkboxScale, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      // Big bounce
      Animated.spring(checkboxScale, {
        toValue: 1.5,
        tension: 40,
        friction: 3,
        useNativeDriver: true,
      }),
      // Settle back to normal
      Animated.spring(checkboxScale, {
        toValue: 1,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Add haptic feedback
    Haptic.notificationAsync(Haptic.NotificationFeedbackType.Success);

    completeTask(!currentTask.completed);
  };

  // DEV ONLY - Reset functionality
  const handleDevReset = async () => {
    try {
      await taskStorage.clearAll();
      setCurrentTask(null);
      refreshStreak?.();
    } catch (error) {
      console.error('Error resetting:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.streakContainer}>
        <Text style={styles.streakText}>
          🔥 {streak}-day streak
        </Text>
        <StreakBar completedDays={weeklyCompletion} />
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
        <Text style={styles.historyButtonText}>View History</Text>
      </TouchableOpacity>

      {/* DEV ONLY - Will be removed before production */}
      {__DEV__ && (
        <TouchableOpacity
          style={styles.devResetButton}
          onPress={handleDevReset}
        >
          <Text style={styles.devResetText}>🔄 Reset (Dev Only)</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  streakContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  streakText: {
    fontSize: 18,
    fontWeight: '600',
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  taskContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskText: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 30,
  },
  checkboxContainer: {
    padding: 10,
  },
  checkbox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  checkboxCompleted: {
    backgroundColor: '#007AFF',
  },
  historyButton: {
    padding: 15,
    alignItems: 'center',
  },
  historyButtonText: {
    color: '#007AFF',
    fontSize: 18,
  },
  // DEV ONLY - Will be removed before production
  devResetButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 8,
    opacity: 0.8,
  },
  devResetText: {
    color: '#fff',
    fontSize: 12,
  },
}); 