export enum SubscriptionStatus {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
}

export interface SubscriptionState {
  status: SubscriptionStatus;
  lastUpdated: Date;
  isLoaded: boolean;
}

export interface SubscriptionContextType {
  subscription: SubscriptionState;
  isPremium: boolean;
  isFree: boolean;
  isLoading: boolean;
  upgradeToPremium: () => Promise<void>;
  refreshSubscriptionStatus: () => Promise<void>;
}

