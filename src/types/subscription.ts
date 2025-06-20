export enum SubscriptionStatus {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
  EXPIRED = 'EXPIRED'
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
  resetToFree: () => Promise<void>;
  refreshSubscriptionStatus: () => Promise<void>;
}

export interface UpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => Promise<void>;
  allTasks?: import('../types/Task').DailyTask[];
}

export interface PremiumBadgeProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

// Utility types for data filtering
export interface DataFilterOptions {
  limitToCurrentWeek: boolean;
  subscriptionStatus: SubscriptionStatus;
}

// Constants
export const SUBSCRIPTION_STORAGE_KEY = '@one_big_thing_subscription_status';
export const FREE_TIER_WEEK_LIMIT = 7; // days 