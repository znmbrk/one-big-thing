import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSubscription as useSubscriptionContext } from '../context/SubscriptionContext';
import { DailyTask } from '../types/Task';
import { filterTasksBySubscription, getHistoricalDataPreview } from '../utils/subscriptionUtils';
import { SubscriptionStatus } from '../types/subscription';

interface UseSubscriptionOptions {
  enableCaching?: boolean;
  cacheSize?: number;
  enableLazyLoading?: boolean;
  batchSize?: number;
}

interface CachedData {
  tasks: DailyTask[];
  timestamp: number;
  subscriptionStatus: SubscriptionStatus;
}

export const useSubscription = (options: UseSubscriptionOptions = {}) => {
  const {
    enableCaching = true,
    cacheSize = 100,
    enableLazyLoading = true,
    batchSize = 20,
  } = options;

  const subscription = useSubscriptionContext();
  const [cachedTasks, setCachedTasks] = useState<Map<string, CachedData>>(new Map());
  const [loadedTasks, setLoadedTasks] = useState<DailyTask[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);

  // Cache key generator
  const getCacheKey = useCallback((tasks: DailyTask[], status: SubscriptionStatus) => {
    return `${status}_${tasks.length}_${tasks[0]?.date || 'empty'}`;
  }, []);

  // Cache management
  const addToCache = useCallback((tasks: DailyTask[], status: SubscriptionStatus) => {
    if (!enableCaching) return;

    const key = getCacheKey(tasks, status);
    const cachedData: CachedData = {
      tasks,
      timestamp: Date.now(),
      subscriptionStatus: status,
    };

    setCachedTasks(prev => {
      const newCache = new Map(prev);
      
      // Remove oldest entries if cache is full
      if (newCache.size >= cacheSize) {
        const entries = Array.from(newCache.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        entries.slice(0, entries.length - cacheSize + 1).forEach(([key]) => {
          newCache.delete(key);
        });
      }
      
      newCache.set(key, cachedData);
      return newCache;
    });
  }, [enableCaching, getCacheKey, cacheSize]);

  // Get from cache
  const getFromCache = useCallback((tasks: DailyTask[], status: SubscriptionStatus) => {
    if (!enableCaching) return null;

    const key = getCacheKey(tasks, status);
    const cached = cachedTasks.get(key);
    
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 minutes
      return cached.tasks;
    }
    
    return null;
  }, [enableCaching, getCacheKey, cachedTasks]);

  // Filter tasks with caching
  const filterTasksWithCache = useCallback((allTasks: DailyTask[]) => {
    const cached = getFromCache(allTasks, subscription.subscription.status);
    if (cached) {
      return cached;
    }

    const filtered = filterTasksBySubscription(allTasks, subscription.subscription.status);
    addToCache(filtered, subscription.subscription.status);
    return filtered;
  }, [subscription.subscription.status, getFromCache, addToCache]);

  // Lazy loading for large datasets
  const loadMoreTasks = useCallback(async (currentTasks: DailyTask[], allTasks: DailyTask[]) => {
    if (!enableLazyLoading || isLoadingMore || !hasMoreData) return;

    setIsLoadingMore(true);
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const currentLength = currentTasks.length;
    const nextBatch = allTasks.slice(currentLength, currentLength + batchSize);
    
    if (nextBatch.length === 0) {
      setHasMoreData(false);
    } else {
      setLoadedTasks(prev => [...prev, ...nextBatch]);
    }
    
    setIsLoadingMore(false);
  }, [enableLazyLoading, isLoadingMore, hasMoreData, batchSize]);

  // Reset lazy loading state
  const resetLazyLoading = useCallback(() => {
    setLoadedTasks([]);
    setIsLoadingMore(false);
    setHasMoreData(true);
  }, []);

  // Memoized historical data preview
  const historicalData = useMemo(() => {
    return getHistoricalDataPreview(loadedTasks);
  }, [loadedTasks]);

  // Performance monitoring
  const performanceMetrics = useMemo(() => {
    return {
      cacheSize: cachedTasks.size,
      loadedTasksCount: loadedTasks.length,
      cacheHitRate: 0, // TODO: Implement cache hit rate tracking
    };
  }, [cachedTasks.size, loadedTasks.length]);

  // Clear cache
  const clearCache = useCallback(() => {
    setCachedTasks(new Map());
  }, []);

  // Preload data for premium users
  const preloadData = useCallback(async (allTasks: DailyTask[]) => {
    if (subscription.isPremium && enableLazyLoading) {
      const initialBatch = allTasks.slice(0, batchSize);
      setLoadedTasks(initialBatch);
      setHasMoreData(allTasks.length > batchSize);
    }
  }, [subscription.isPremium, enableLazyLoading, batchSize]);

  return {
    // Subscription state
    ...subscription,
    
    // Task management
    filterTasksWithCache,
    loadMoreTasks,
    resetLazyLoading,
    preloadData,
    
    // Lazy loading state
    loadedTasks,
    isLoadingMore,
    hasMoreData,
    
    // Historical data
    historicalData,
    
    // Performance
    performanceMetrics,
    clearCache,
    
    // Cache management
    cachedTasks: Array.from(cachedTasks.values()),
  };
}; 