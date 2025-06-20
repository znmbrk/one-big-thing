import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import Purchases, { PurchasesStoreProduct, CustomerInfo, PurchasesOffering } from 'react-native-purchases';
import { 
  SubscriptionContextType, 
  SubscriptionState, 
  SubscriptionStatus,
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
  refreshSubscriptionStatus: async () => {},
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscription, setSubscription] = useState<SubscriptionState>(defaultSubscriptionState);
  const [isLoading, setIsLoading] = useState(true);

  const checkSubscriptionStatus = useCallback(async (customerInfo: CustomerInfo) => {
    const { entitlements } = customerInfo;
    const isPremium = entitlements.active.premium !== undefined;

    const newStatus = isPremium ? SubscriptionStatus.PREMIUM : SubscriptionStatus.FREE;

    setSubscription({
      status: newStatus,
      lastUpdated: new Date(),
      isLoaded: true,
    });
  }, []);

  useEffect(() => {
    const getInitialStatus = async () => {
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        await checkSubscriptionStatus(customerInfo);
      } catch (error) {
        console.error('Error fetching initial customer info:', error);
        setSubscription({
          status: SubscriptionStatus.FREE,
          lastUpdated: new Date(),
          isLoaded: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    getInitialStatus();
    Purchases.addCustomerInfoUpdateListener(checkSubscriptionStatus);

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
        console.log('Purchasing package:', pkg.identifier);
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        await checkSubscriptionStatus(customerInfo);
      } else {
        console.log('No offerings available.');
      }
    } catch (error: any) {
      if (!error.userCancelled) {
        console.error('Error purchasing package:', error);
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

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
}; 