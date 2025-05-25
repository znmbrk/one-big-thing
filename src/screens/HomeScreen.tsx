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

type RootStackParamList = {
  Home: undefined;
  History: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen = () => {
  const { currentTask, setCurrentTask, completeTask } = useDailyTask();
  const [newTaskText, setNewTaskText] = useState('');
  const checkboxScale = new Animated.Value(1);
  const navigation = useNavigation<NavigationProp>();
  const { streak } = useStreak();

  const handleSetTask = () => {
    if (!newTaskText.trim()) return;

    const task = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false,
      date: new Date().toISOString(),
    };

    setCurrentTask(task);
    setNewTaskText('');
  };

  const handleToggleComplete = () => {
    if (!currentTask) return;

    Animated.sequence([
      Animated.spring(checkboxScale, {
        toValue: 1.2,
        useNativeDriver: true,
      }),
      Animated.spring(checkboxScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    completeTask(!currentTask.completed);
  };

  return (
    <View style={styles.container}>
      <View style={styles.streakContainer}>
        <Text style={styles.streakText}>
          🔥 {streak}-day streak
        </Text>
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
}); 