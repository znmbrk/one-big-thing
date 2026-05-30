import { useState, useEffect } from 'react';
import { DailyTask } from '../types/Task';
import { taskStorage, STORAGE_KEYS } from '../services/taskStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useDailyTask = () => {
  const [currentTask, setCurrentTask] = useState<DailyTask | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTask();
  }, []);

  const loadTask = async () => {
    try {
      const task = await taskStorage.getCurrentTask();
      setCurrentTask(task);
    } catch (error) {
      console.error('Error loading task:', error);
      setError('Failed to load task. Please restart the app.');
    }
  };

  const saveTask = async (task: DailyTask | null) => {
    try {
      if (task === null) {
        await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_TASK);
      } else {
        await taskStorage.saveCurrentTask(task);
      }
      setCurrentTask(task);
    } catch (error) {
      console.error('Error saving task:', error);
      setError('Failed to save task. Please try again.');
    }
  };

  const completeTask = async (completed: boolean) => {
    if (!currentTask) return;
    const updatedTask = { ...currentTask, completed };
    try {
      await saveTask(updatedTask);
      if (completed) {
        await taskStorage.addToHistory(updatedTask);
      }
    } catch (error) {
      console.error('Error completing task:', error);
      setError('Failed to save completion. Please try again.');
    }
  };

  const clearError = () => setError(null);

  return {
    currentTask,
    setCurrentTask: saveTask,
    completeTask,
    error,
    clearError,
  };
};
