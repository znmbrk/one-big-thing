import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import Purchases, { CustomerInfo } from 'react-native-purchases';
import {
  SubscriptionContextType,
  SubscriptionState,
  SubscriptionStatus,
} from '../types/subscription';
import { Alert, Platform, ActivityIndicator, View } from 'react-native';
import { REVENUECAT_APPLE_KEY } from '../config/env';
import { useTheme } from './ThemeContext';
import { taskStorage } from '../services/taskStorage';

export const REVENUECAT_ENTITLEMENT = 'premium';

const API_KEYS = {
  apple: REVENUECAT_APPLE_KEY,
};

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
  refreshSubscriptionStatus: async () => {},
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();
  const [subscription, setSubscription] = useState<SubscriptionState>(defaultSubscriptionState);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfiguring, setIsConfiguring] = useState(true);

  const checkSubscriptionStatus = useCallback(async (customerInfo: CustomerInfo) => {
    const { entitlements } = customerInfo;
    const isPremium = entitlements.active[REVENUECAT_ENTITLEMENT] !== undefined;
    const newStatus = isPremium ? SubscriptionStatus.PREMIUM : SubscriptionStatus.FREE;
    setSubscription({
      status: newStatus,
      lastUpdated: new Date(),
      isLoaded: true,
    });
    await taskStorage.saveSubscriptionStatus(newStatus);
  }, []);

  useEffect(() => {
    const init = async () => {
      // Load cached status immediately for optimistic render
      const cachedStatus = await taskStorage.getSubscriptionStatus();
      if (cachedStatus) {
        setSubscription({
          status: cachedStatus as SubscriptionStatus,
          lastUpdated: new Date(),
          isLoaded: true,
        });
        setIsConfiguring(false); // render children immediately with cached data
      }

      // Android: skip RevenueCat, stay on FREE
      if (Platform.OS !== 'ios') {
        if (!cachedStatus) {
          setSubscription({ status: SubscriptionStatus.FREE, lastUpdated: new Date(), isLoaded: true });
          setIsConfiguring(false);
        }
        setIsLoading(false);
        return;
      }

      // iOS: configure RevenueCat
      await Purchases.configure({ apiKey: API_KEYS.apple });
      setIsConfiguring(false);

      // Fetch live status (background update if cache existed, blocking if not)
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        await checkSubscriptionStatus(customerInfo);
      } catch (error) {
        console.error('Error fetching initial customer info:', error);
        if (!cachedStatus) {
          setSubscription({ status: SubscriptionStatus.FREE, lastUpdated: new Date(), isLoaded: true });
        }
      } finally {
        setIsLoading(false);
      }

      Purchases.addCustomerInfoUpdateListener(checkSubscriptionStatus);
    };

    init();

    return () => {
      Purchases.removeCustomerInfoUpdateListener(checkSubscriptionStatus);
    };
  }, [checkSubscriptionStatus]);

  const upgradeToPremium = async () => {
    setIsLoading(true);
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current && offerings.current.availablePackages.length > 0) {
        const pkg = offerings.current.availablePackages[0];
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        await checkSubscriptionStatus(customerInfo);
      } else {
        Alert.alert('Purchase Unavailable', 'No offerings found. Please try again later.');
      }
    } catch (error: any) {
      if (!error.userCancelled) {
        console.error('Error purchasing package:', error);
        Alert.alert('Purchase Failed', error.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSubscriptionStatus = async () => {
    setIsLoading(true);
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      await checkSubscriptionStatus(customerInfo);
    } catch (error) {
      console.error('Error refreshing customer info:', error);
      Alert.alert(
        'Refresh Failed',
        'Unable to refresh your subscription status. Please check your connection and try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: SubscriptionContextType = {
    subscription,
    isPremium: subscription.status === SubscriptionStatus.PREMIUM,
    isFree: subscription.status === SubscriptionStatus.FREE,
    isLoading,
    upgradeToPremium,
    refreshSubscriptionStatus,
  };

  // Only block rendering during the one-time RevenueCat configuration.
  // isLoading changes during purchase/refresh but should not unmount children.
  if (isConfiguring) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
};
