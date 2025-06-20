import { useState, useEffect } from 'react';
import { DailyTask } from '../types/Task';
import { taskStorage } from '../services/taskStorage';
import { useSubscription } from '../context/SubscriptionContext';
import { filterTasksBySubscription } from '../utils/subscriptionUtils';

export const useTaskHistory = (limit?: number) => {
  const [allTasks, setAllTasks] = useState<DailyTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const { subscription } = useSubscription();

  const loadHistory = async () => {
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
    } finally {
      setLoading(false);
    }
  };

  // Reload and refilter when subscription status changes
  useEffect(() => {
    if (subscription.isLoaded) {
      loadHistory();
    }
  }, [subscription.status, subscription.isLoaded]);

  // Refilter tasks when subscription changes (without reloading from storage)
  useEffect(() => {
    if (allTasks.length > 0) {
      const filtered = filterTasksBySubscription(allTasks, subscription.status);
      const limitedTasks = limit ? filtered.slice(0, limit) : filtered;
      setFilteredTasks(limitedTasks);
    }
  }, [subscription.status, allTasks, limit]);

  return {
    tasks: filteredTasks,
    allTasks, // Expose all tasks for premium features
    loading,
    refreshHistory: loadHistory,
  };
}; 