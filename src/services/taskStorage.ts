import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyTask } from '../types/Task';

const STORAGE_KEYS = {
  CURRENT_TASK: 'currentTask',
  TASK_HISTORY: 'taskHistory',
  STREAK: 'streak',
} as const;

/**
 * Abstraction layer for all task-related storage operations.
 * Centralizes AsyncStorage calls and handles type safety.
 */
export const taskStorage = {
  /**
   * Saves the current day's task
   */
  saveCurrentTask: async (task: DailyTask): Promise<void> => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_TASK,
        JSON.stringify(task)
      );
    } catch (error) {
      console.error('Error saving current task:', error);
      throw error;
    }
  },

  /**
   * Retrieves today's task if it exists
   */
  getCurrentTask: async (): Promise<DailyTask | null> => {
    try {
      const taskJson = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_TASK);
      if (!taskJson) return null;
      
      const task = JSON.parse(taskJson) as DailyTask;
      // Only return if task is from today
      return isToday(new Date(task.date)) ? task : null;
    } catch (error) {
      console.error('Error getting current task:', error);
      throw error;
    }
  },

  /**
   * Saves the current streak count
   */
  saveStreak: async (count: number): Promise<void> => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.STREAK,
        count.toString()
      );
    } catch (error) {
      console.error('Error saving streak:', error);
      throw error;
    }
  },

  /**
   * Gets the current streak count
   */
  getStreak: async (): Promise<number> => {
    try {
      const streak = await AsyncStorage.getItem(STORAGE_KEYS.STREAK);
      return streak ? parseInt(streak, 10) : 0;
    } catch (error) {
      console.error('Error getting streak:', error);
      throw error;
    }
  },

  /**
   * Adds a task to history and maintains only last 30 days
   */
  addToHistory: async (task: DailyTask): Promise<void> => {
    try {
      const history = await taskStorage.getHistory();
      const updatedHistory = [task, ...history].slice(0, 30); // Keep last 30 days
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.TASK_HISTORY,
        JSON.stringify(updatedHistory)
      );
    } catch (error) {
      console.error('Error adding to history:', error);
      throw error;
    }
  },

  /**
   * Gets task history (returns up to 30 days)
   */
  getHistory: async (): Promise<DailyTask[]> => {
    try {
      const historyJson = await AsyncStorage.getItem(STORAGE_KEYS.TASK_HISTORY);
      return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
      console.error('Error getting history:', error);
      throw error;
    }
  },

  /**
   * Clears all stored data (useful for testing/logout)
   */
  clearAll: async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.CURRENT_TASK,
        STORAGE_KEYS.TASK_HISTORY,
        STORAGE_KEYS.STREAK,
      ]);
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },
};

// Helper function to check if a date is today
const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}; 