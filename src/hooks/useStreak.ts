import { useState, useEffect, useCallback } from 'react';
import { taskStorage } from '../services/taskStorage';
import {format, startOfWeek, isSameWeek } from 'date-fns';

export const getWeekdayIndex = (date: Date) => {
  const day = format(date, 'E');
  return ['M', 'T', 'W', 'T', 'F', 'S', 'S'].findIndex(d => d === day[0]);
};

export const useStreak = () => {
  const [streak, setStreak] = useState(0);
  const [weeklyCompletion, setWeeklyCompletion] = useState<number[]>(Array(7).fill(0));
  const [lastWeekStart, setLastWeekStart] = useState<Date>(startOfWeek(new Date()));

  const loadStreak = async () => {
    try {
      const allTasks = await taskStorage.getHistory();
      const today = new Date();
      const currentWeekStart = startOfWeek(today);

      // Check if we need to reset for a new week
      if (!isSameWeek(lastWeekStart, today)) {
        setWeeklyCompletion(Array(7).fill(0));
        setStreak(0);
        setLastWeekStart(currentWeekStart);
        return;
      }

      const weekStatus = Array(7).fill(0);
      
      // Process tasks and update weekStatus
      allTasks.forEach(task => {
        const taskDate = new Date(task.date);
        if (isSameWeek(taskDate, today) && task.completed) {
          const weekdayIndex = getWeekdayIndex(taskDate);
          console.log('Found completed task for day:', weekdayIndex); // Debug log
          weekStatus[weekdayIndex] = 1;
        }
      });

      console.log('Week status after loading:', weekStatus); // Debug log
      setWeeklyCompletion(weekStatus);
      const currentStreak = calculateStreak(weekStatus);
      setStreak(currentStreak);
    } catch (error) {
      console.error('Error loading streak:', error);
    }
  };

  const calculateStreak = (days: number[]) => {
    let streak = 0;
    const todayIndex = getWeekdayIndex(new Date());
    
    // If today isn't completed, no streak
    if (days[todayIndex] !== 1) {
      return 0;
    }
    
    // Count backwards from today
    let currentIndex = todayIndex;
    while (currentIndex >= 0 && days[currentIndex] === 1) {
      streak++;
      currentIndex--;
    }
    
    return streak;
  };

  useEffect(() => {
    loadStreak();
  }, []);

  const updateWeeklyCompletion = useCallback((newCompletion: number[]) => {
    console.log('Updating weekly completion to:', newCompletion);  // Debug log
    setWeeklyCompletion([...newCompletion]);  // Force new array reference
  }, []);

  return { 
    streak, 
    weeklyCompletion,
    refreshStreak: loadStreak,
    updateWeeklyCompletion,
  };
}; 