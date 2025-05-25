import { useState, useEffect } from 'react';
import { taskStorage } from '../services/taskStorage';
import { DailyTask } from '../types/Task';

export const useStreak = () => {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    loadStreak();
  }, []);

  const loadStreak = async () => {
    try {
      const allTasks = await taskStorage.getHistory();
      // Enforce 7-day limit
      const recentTasks = allTasks.slice(0, 7);
      const currentStreak = calculateStreak(recentTasks);
      setStreak(currentStreak);
    } catch (error) {
      console.error('Error loading streak:', error);
    }
  };

  const calculateStreak = (tasks: DailyTask[]) => {
    let streak = 0;
    for (const task of tasks) {
      if (task.completed) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  return { streak, refreshStreak: loadStreak };
}; 