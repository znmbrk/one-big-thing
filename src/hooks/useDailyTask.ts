import { useState, useEffect } from 'react';
import { DailyTask } from '../types/Task';
import { taskStorage, STORAGE_KEYS } from '../services/taskStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useDailyTask = () => {
  const [currentTask, setCurrentTask] = useState<DailyTask | null>(null);
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    loadTask();
    loadStreak();
  }, []);

  const loadTask = async () => {
    try {
      const task = await taskStorage.getCurrentTask();
      setCurrentTask(task);
    } catch (error) {
      console.error('Error loading task:', error);
    }
  };

  const loadStreak = async () => {
    try {
      const currentStreak = await taskStorage.getStreak();
      setStreak(currentStreak);
    } catch (error) {
      console.error('Error loading streak:', error);
    }
  };

  const saveTask = async (task: DailyTask | null) => {
    try {
      if (task === null) {
        await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_TASK);
      } else {
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_TASK, JSON.stringify(task));
      }
      setCurrentTask(task);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const completeTask = async (completed: boolean) => {
    if (!currentTask) return;

    const updatedTask = { ...currentTask, completed };
    await saveTask(updatedTask);
    
    if (completed) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      await taskStorage.saveStreak(newStreak);
      await taskStorage.addToHistory(updatedTask);
    }
  };

  return {
    currentTask,
    setCurrentTask: saveTask,
    completeTask,
    streak,
  };
};

const isToday = (date: Date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}; 