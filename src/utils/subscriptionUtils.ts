import { subDays } from 'date-fns';
import { SubscriptionStatus } from '../types/subscription';
import { DailyTask } from '../types/Task';

const FREE_TIER_DAYS = 7;

/**
 * Filter tasks based on subscription status.
 * Free users see the rolling last 7 days; premium users see everything.
 */
export const filterTasksBySubscription = (
  tasks: DailyTask[],
  subscriptionStatus: SubscriptionStatus,
  options: { limitToCurrentWeek?: boolean } = {}
): DailyTask[] => {
  const { limitToCurrentWeek = true } = options;

  if (subscriptionStatus === SubscriptionStatus.PREMIUM) {
    return tasks;
  }

  if (limitToCurrentWeek) {
    const cutoff = subDays(new Date(), FREE_TIER_DAYS);
    return tasks.filter(task => new Date(task.date) >= cutoff);
  }

  return tasks;
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
