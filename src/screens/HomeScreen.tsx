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
import { useStreak, getWeekdayIndex } from '../hooks/useStreak';
import { StreakBar } from '../components/StreakBar';
import { taskStorage } from '../services/taskStorage';
import * as Haptic from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

type RootStackParamList = {
  Home: undefined;
  History: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen = () => {
  const { currentTask, setCurrentTask, completeTask } = useDailyTask();
  const checkboxScale = new Animated.Value(1);
  const streakAnimation = new Animated.Value(1);
  const navigation = useNavigation<NavigationProp>();
  const { streak, weeklyCompletion, refreshStreak, updateWeeklyCompletion } = useStreak();
  const { theme } = useTheme();

  const handleSetTask = async (text: string) => {
    const task = {
      id: Date.now().toString(),
      text: text,
      completed: false,
      date: new Date().toISOString(),
    };

    await setCurrentTask(task);
  };

  const handleToggleComplete = async () => {
    if (!currentTask) return;

    console.log('1. Starting task completion');

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

    await completeTask(!currentTask.completed);
    console.log('2. Task completed');
    await refreshStreak();
    console.log('3. Streak refreshed');
    
    // Force immediate update of the streak bar
    const todayIndex = getWeekdayIndex(new Date());
    const newCompletion = [...weeklyCompletion];
    newCompletion[todayIndex] = 1;
    updateWeeklyCompletion(newCompletion);
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

  console.log('Rendering StreakBar with completion:', weeklyCompletion);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <View style={styles.streakContainer}>
          <Animated.Text 
            style={[
              styles.streakText,
              { 
                transform: [{ scale: streakAnimation }],      
                color: theme.text
              }
            ]}
          >
            🔥 {streak}-day streak
          </Animated.Text>
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