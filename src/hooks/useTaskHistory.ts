import { useState, useEffect, useCallback } from 'react';
import { DailyTask } from '../types/Task';
import { taskStorage } from '../services/taskStorage';
import { useSubscription } from '../context/SubscriptionContext';
import { filterTasksBySubscription } from '../utils/subscriptionUtils';

export const useTaskHistory = (limit?: number) => {
  const [allTasks, setAllTasks] = useState<DailyTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { subscription } = useSubscription();

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const tasks = await taskStorage.getHistory();

      // Remove duplicates by keeping only the latest task for each date
      const uniqueTasks = tasks.reduce((acc: DailyTask[], current) => {
        const exists = acc.find(task =>
          new Date(task.date).toDateString() === new Date(current.date).toDateString()
        );
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);

      setAllTasks(uniqueTasks);

      // Apply subscription-based filtering
      const filtered = filterTasksBySubscription(uniqueTasks, subscription.status);

      // Apply limit if specified (mainly for backward compatibility)
      const limitedTasks = limit ? filtered.slice(0, limit) : filtered;
      setFilteredTasks(limitedTasks);
    } catch (error) {
      console.error('Error loading task history:', error);
      setError('Failed to load history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [subscription.status, limit]);

  // Load from storage and filter in one operation when subscription becomes
  // available or its status changes. This replaces the previous two-effect
  // pattern that caused a redundant storage read followed by a re-filter.
  useEffect(() => {
    if (subscription.isLoaded) {
      loadHistory();
    }
  }, [subscription.isLoaded, subscription.status, loadHistory]);

  const clearError = () => setError(null);

  return {
    tasks: filteredTasks,
    allTasks, // Expose all tasks for premium features
    loading,
    refreshHistory: loadHistory,
    error,
    clearError,
  };
}; 