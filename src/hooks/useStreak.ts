import { useState, useEffect } from 'react';
import { taskStorage } from '../services/taskStorage';
import { DailyTask } from '../types/Task';
import { isToday, subDays, startOfDay } from 'date-fns';

export const useStreak = () => {
  const [streak, setStreak] = useState(0);
  const [weeklyCompletion, setWeeklyCompletion] = useState<number[]>(Array(7).fill(0));

  useEffect(() => {
    loadStreak();
  }, []);

  const loadStreak = async () => {
    try {
      const allTasks = await taskStorage.getHistory();
      
      // Create array for last 7 days
      const weekStatus = Array(7).fill(0);
      const today = startOfDay(new Date());
      
      // Check each of the last 7 days
      for (let i = 0; i < 7; i++) {
        const targetDate = startOfDay(subDays(today, i));
        const task = allTasks.find(t => 
          startOfDay(new Date(t.date)).getTime() === targetDate.getTime()
        );
        if (task?.completed) {
          weekStatus[i] = 1;
        }
      }
      
      setWeeklyCompletion(weekStatus);
      const currentStreak = calculateStreak(allTasks);
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

  return { 
    streak, 
    weeklyCompletion,
    refreshStreak: loadStreak 
  };
}; 