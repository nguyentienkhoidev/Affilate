export interface FeedbackItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const FEEDBACK_STORE_KEY = 'customer-feedback';

export const DEFAULT_FEEDBACKS: FeedbackItem[] = [];
