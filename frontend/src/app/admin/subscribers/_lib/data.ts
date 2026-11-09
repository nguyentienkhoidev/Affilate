export type SubscriberStatus = 'active' | 'unsubscribed';

export interface SubscriberItem {
  id: number;
  email: string;
  /** Where the signup happened, e.g. "homepage-dispatch". */
  source: string;
  status: SubscriberStatus;
  /** ISO timestamp. */
  createdAt: string;
}

export const SUBSCRIBERS_STORE_KEY = 'newsletter-subscribers';

export const SUBSCRIBER_SOURCE_LABELS: Record<string, string> = {
  'homepage-dispatch': 'Homepage Dispatch',
  'store-alert': 'Store Deal Alert',
};

export const DEFAULT_SUBSCRIBERS: SubscriberItem[] = [];
