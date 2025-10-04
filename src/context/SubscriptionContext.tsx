import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import Purchases, { PurchasesStoreProduct, CustomerInfo, PurchasesOffering } from 'react-native-purchases';
import {
  SubscriptionContextType,
  SubscriptionState,
  SubscriptionStatus,
} from '../types/subscription';
import { Platform } from 'react-native';

const API_KEYS = {
  apple: 'appl_XnVCDkYrMoNSCnUPthacgEgRrpv',
};

// DEV ONLY: Toggle this to test premium features without purchasing
// Set to true to simulate premium status, false to use actual RevenueCat status
const DEV_FORCE_PREMIUM = false;

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
  const [isConfiguring, setIsConfiguring] = useState(true);

  useEffect(() => {
    const configure = async () => {
      if (Platform.OS === 'ios') {
        await Purchases.configure({ apiKey: API_KEYS.apple });
      }
      setIsConfiguring(false);
    }
    configure();
  }, [])

  const checkSubscriptionStatus = useCallback(async (customerInfo: CustomerInfo) => {
    // DEV ONLY: Override with forced premium status if enabled
    if (__DEV__ && DEV_FORCE_PREMIUM) {
      console.log('🔧 DEV MODE: Forcing premium status');
      setSubscription({
        status: SubscriptionStatus.PREMIUM,
        lastUpdated: new Date(),
        isLoaded: true,
      });
      return;
    }

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
    if(isConfiguring) return;

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
  }, [checkSubscriptionStatus, isConfiguring]);

  const upgradeToPremium = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Fetching offerings from RevenueCat...');
      const offerings = await Purchases.getOfferings();
      console.log('📦 Offerings received:', offerings);
      console.log('📦 Current offering:', offerings.current);

      if (offerings.current && offerings.current.availablePackages.length > 0) {
        const pkg = offerings.current.availablePackages[0];
        console.log('✅ Purchasing package:', pkg.identifier);
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        await checkSubscriptionStatus(customerInfo);
      } else {
        console.error('❌ No offerings available. Check RevenueCat dashboard configuration.');
        console.error('Available offerings:', Object.keys(offerings.all));
        alert('Purchase unavailable. Please check RevenueCat configuration.');
      }
    } catch (error: any) {
      if (!error.userCancelled) {
        console.error('❌ Error purchasing package:', error);
        alert(`Purchase error: ${error.message || 'Unknown error'}`);
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
      {!isConfiguring && !isLoading ? children : null}
    </SubscriptionContext.Provider>
  );
}; 