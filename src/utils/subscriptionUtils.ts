import { startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
import { SubscriptionStatus, DataFilterOptions } from '../types/subscription';
import { DailyTask } from '../types/Task';

/**
 * Get the current week's start and end dates (Monday to Sunday)
 */
export const getCurrentWeekDates = () => {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Sunday
  
  return { weekStart, weekEnd };
};

/**
 * Check if a task is within the current week
 */
export const isTaskInCurrentWeek = (task: DailyTask): boolean => {
  const { weekStart, weekEnd } = getCurrentWeekDates();
  const taskDate = parseISO(task.date);
  
  return isWithinInterval(taskDate, { start: weekStart, end: weekEnd });
};

/**
 * Filter tasks based on subscription status and options
 */
export const filterTasksBySubscription = (
  tasks: DailyTask[],
  subscriptionStatus: SubscriptionStatus,
  options: Partial<DataFilterOptions> = {}
): DailyTask[] => {
  const { limitToCurrentWeek = true } = options;

  // If user is premium, return all tasks
  if (subscriptionStatus === SubscriptionStatus.PREMIUM) {
    return tasks;
  }

  // For free users, limit to current week if specified
  if (limitToCurrentWeek) {
    return tasks.filter(isTaskInCurrentWeek);
  }

  return tasks;
};

/**
 * Get the number of days in the current week that have tasks
 */
export const getCurrentWeekTaskCount = (tasks: DailyTask[]): number => {
  return tasks.filter(isTaskInCurrentWeek).length;
};

/**
 * Check if a user has reached the free tier limit
 */
export const hasReachedFreeTierLimit = (
  tasks: DailyTask[],
  subscriptionStatus: SubscriptionStatus
): boolean => {
  if (subscriptionStatus === SubscriptionStatus.PREMIUM) {
    return false;
  }

  const currentWeekTasks = tasks.filter(isTaskInCurrentWeek);
  return currentWeekTasks.length >= 7; // Free tier shows current week only
};

/**
 * Get a preview of historical data for upgrade prompts
 */
export const getHistoricalDataPreview = (tasks: DailyTask[]): {
  totalTasks: number;
  completedTasks: number;
  oldestTaskDate?: string;
  newestTaskDate?: string;
} => {
  if (tasks.length === 0) {
    return { totalTasks: 0, completedTasks: 0 };
  }

  const sortedTasks = [...tasks].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(task => task.completed).length,
    oldestTaskDate: sortedTasks[0]?.date,
    newestTaskDate: sortedTasks[sortedTasks.length - 1]?.date,
  };
}; 