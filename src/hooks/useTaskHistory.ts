import { useState, useEffect } from 'react';
import { DailyTask } from '../types/Task';
import { taskStorage } from '../services/taskStorage';

export const useTaskHistory = (limit: number = 7) => {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const allTasks = await taskStorage.getHistory();
      // Remove duplicates by keeping only the latest task for each date
      const uniqueTasks = allTasks.reduce((acc: DailyTask[], current) => {
        const exists = acc.find(task => 
          new Date(task.date).toDateString() === new Date(current.date).toDateString()
        );
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);
      setTasks(uniqueTasks.slice(0, limit));
    } catch (error) {
      console.error('Error loading task history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return {
    tasks,
    loading,
    refreshHistory: loadHistory,
  };
}; 