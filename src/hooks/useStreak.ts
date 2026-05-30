import { useState, useEffect, useCallback } from 'react';
import { taskStorage } from '../services/taskStorage';
import { startOfWeek, isSameWeek } from 'date-fns';
import { DailyTask } from '../types/Task';
import { getWeekdayIndex } from '../utils/date';

// Re-export for backward compatibility with HomeScreen
export { getWeekdayIndex } from '../utils/date';

export const useStreak = () => {
  const [streak, setStreak] = useState(0);
  const [weeklyCompletion, setWeeklyCompletion] = useState<number[]>(Array(7).fill(0));
  const [error, setError] = useState<string | null>(null);

  const calculateStreak = (days: number[]): number => {
    const todayIndex = getWeekdayIndex(new Date());
    if (days[todayIndex] !== 1) return 0;
    let count = 0;
    let currentIndex = todayIndex;
    while (currentIndex >= 0 && days[currentIndex] === 1) {
      count++;
      currentIndex--;
    }
    return count;
  };

  const buildWeekStatus = (tasks: DailyTask[], today: Date): number[] => {
    const status = Array(7).fill(0);
    tasks.forEach(task => {
      const taskDate = new Date(task.date);
      if (isSameWeek(taskDate, today, { weekStartsOn: 1 }) && task.completed) {
        const idx = getWeekdayIndex(taskDate);
        if (idx >= 0) status[idx] = 1;
      }
    });
    return status;
  };

  const loadStreak = useCallback(async () => {
    try {
      const today = new Date();
      const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
      const persistedLastWeekStartIso = await taskStorage.getLastWeekStart();

      const isNewWeek =
        persistedLastWeekStartIso === null ||
        !isSameWeek(new Date(persistedLastWeekStartIso), today, { weekStartsOn: 1 });

      const allTasks = await taskStorage.getHistory();
      const weekStatus = buildWeekStatus(allTasks, today);
      const currentStreak = calculateStreak(weekStatus);

      setWeeklyCompletion(weekStatus);
      setStreak(currentStreak);

      const writes: Promise<void>[] = [];
      if (currentStreak !== streak) {
        writes.push(taskStorage.saveStreak(currentStreak));
      }
      if (isNewWeek) {
        writes.push(taskStorage.saveLastWeekStart(currentWeekStart.toISOString()));
      }
      if (writes.length > 0) {
        await Promise.all(writes);
      }
    } catch (error) {
      console.error('Error loading streak:', error);
      setError('Failed to load streak data.');
    }
  }, []);

  useEffect(() => {
    loadStreak();
  }, [loadStreak]);

  const updateWeeklyCompletion = useCallback(async (newCompletion: number[]) => {
    const updatedCompletion = [...newCompletion];
    const newStreak = calculateStreak(updatedCompletion);
    setWeeklyCompletion(updatedCompletion);
    setStreak(newStreak);
    try {
      await taskStorage.saveStreak(newStreak);
    } catch (error) {
      console.error('Error persisting weekly completion:', error);
      setError('Failed to save progress. Please try again.');
    }
  }, []);

  const clearError = () => setError(null);

  return {
    streak,
    weeklyCompletion,
    refreshStreak: loadStreak,
    updateWeeklyCompletion,
    error,
    clearError,
  };
};
