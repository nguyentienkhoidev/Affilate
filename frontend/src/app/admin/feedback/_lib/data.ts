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

export const DEFAULT_FEEDBACKS: FeedbackItem[] = [
  {
    id: 1,
    name: 'David Miller',
    email: 'dmiller@offroadrigs.com',
    phone: '+1 (555) 234-5678',
    message: 'Hi Bargorya Team, we run an automotive accessory eCommerce brand and would like to submit our merchant profile for an affiliate partnership. We are active on PartnerBoost.',
    isRead: false,
    createdAt: 'Today, 2:15 PM',
  },
  {
    id: 2,
    name: 'Jessica Taylor',
    email: 'jtaylor@gmail.com',
    phone: '',
    message: 'Just wanted to report that code NILIGHT15 worked on my 52-inch curved light bar order today and saved me $18.50! Thanks so much for maintaining active codes.',
    isRead: true,
    createdAt: 'Yesterday, 11:30 AM',
  },
  {
    id: 3,
    name: 'Brian Adams',
    email: 'badams@duelinghub.net',
    phone: '+1 (555) 987-6543',
    message: 'Could you please add a review comparing Neo Sabers Xenopixel V3 with the Proffie 2.2 soundboard? Your last comparison guide was super helpful.',
    isRead: true,
    createdAt: 'Oct 17, 2026',
  },
];
