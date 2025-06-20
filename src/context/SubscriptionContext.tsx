import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  SubscriptionContextType, 
  SubscriptionState, 
  SubscriptionStatus,
  SUBSCRIPTION_STORAGE_KEY 
} from '../types/subscription';

const defaultSubscriptionState: SubscriptionState = {
  status: SubscriptionStatus.FREE,
  lastUpdated: new Date(),
  isLoaded: false,
};

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: defaultSubscriptionState,
  isPremium: false,
  isFree: true,
  isLoading: true,
  upgradeToPremium: async () => {},
  resetToFree: async () => {},
  refreshSubscriptionStatus: async () => {},
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscription, setSubscription] = useState<SubscriptionState>(defaultSubscriptionState);
  const [isLoading, setIsLoading] = useState(true);
  const [listeners, setListeners] = useState<Set<(status: SubscriptionStatus) => void>>(new Set());

  // Add subscription status change listener
  const addStatusChangeListener = useCallback((listener: (status: SubscriptionStatus) => void) => {
    setListeners(prev => new Set(prev).add(listener));
    
    // Return cleanup function
    return () => {
      setListeners(prev => {
        const newListeners = new Set(prev);
        newListeners.delete(listener);
        return newListeners;
      });
    };
  }, []);

  // Notify all listeners of status change
  const notifyStatusChange = useCallback((newStatus: SubscriptionStatus) => {
    listeners.forEach(listener => {
      try {
        listener(newStatus);
      } catch (error) {
        console.error('Error in subscription status change listener:', error);
      }
    });
  }, [listeners]);

  // Load subscription status from storage on app start
  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      setIsLoading(true);
      const storedStatus = await AsyncStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
      if (storedStatus) {
        const parsedStatus = JSON.parse(storedStatus);
        const newSubscriptionState = {
          ...parsedStatus,
          lastUpdated: new Date(parsedStatus.lastUpdated),
          isLoaded: true,
        };
        setSubscription(newSubscriptionState);
        notifyStatusChange(newSubscriptionState.status);
      } else {
        // Default to free tier for new users
        const newSubscriptionState = {
          status: SubscriptionStatus.FREE,
          lastUpdated: new Date(),
          isLoaded: true,
        };
        setSubscription(newSubscriptionState);
        notifyStatusChange(newSubscriptionState.status);
      }
    } catch (error) {
      console.error('Error loading subscription status:', error);
      // Fallback to free tier on error
      const fallbackState = {
        status: SubscriptionStatus.FREE,
        lastUpdated: new Date(),
        isLoaded: true,
      };
      setSubscription(fallbackState);
      notifyStatusChange(fallbackState.status);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSubscriptionStatus = async (status: SubscriptionStatus) => {
    try {
      const newSubscriptionState: SubscriptionState = {
        status,
        lastUpdated: new Date(),
        isLoaded: true,
      };
      
      await AsyncStorage.setItem(
        SUBSCRIPTION_STORAGE_KEY, 
        JSON.stringify(newSubscriptionState)
      );
      
      setSubscription(newSubscriptionState);
      notifyStatusChange(status);
    } catch (error) {
      console.error('Error saving subscription status:', error);
      throw error;
    }
  };

  const upgradeToPremium = async () => {
    try {
      setIsLoading(true);
      // TODO: Integrate with actual payment system
      // For now, we'll simulate a successful upgrade
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      await saveSubscriptionStatus(SubscriptionStatus.PREMIUM);
    } catch (error) {
      console.error('Error upgrading to premium:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetToFree = async () => {
    try {
      setIsLoading(true);
      await saveSubscriptionStatus(SubscriptionStatus.FREE);
    } catch (error) {
      console.error('Error resetting to free:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSubscriptionStatus = async () => {
    try {
      setIsLoading(true);
      // TODO: Check with backend/subscription service
      // For now, we'll just reload from storage
      await loadSubscriptionStatus();
    } catch (error) {
      console.error('Error refreshing subscription status:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle subscription expiration (future feature)
  const handleSubscriptionExpiration = useCallback(async () => {
    try {
      await saveSubscriptionStatus(SubscriptionStatus.EXPIRED);
    } catch (error) {
      console.error('Error handling subscription expiration:', error);
    }
  }, []);

  // Expose listener functionality in context
  const contextValue: SubscriptionContextType & {
    addStatusChangeListener: typeof addStatusChangeListener;
  } = {
    subscription,
    isPremium: subscription.status === SubscriptionStatus.PREMIUM,
    isFree: subscription.status === SubscriptionStatus.FREE,
    isLoading,
    upgradeToPremium,
    resetToFree,
    refreshSubscriptionStatus,
    addStatusChangeListener,
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
}; 