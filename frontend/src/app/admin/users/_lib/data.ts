export interface UserData {
  id: number;
  fullName: string;
  email: string;
  role: string;
  isSuperAdmin: boolean;
  isActive: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
}

export const USERS_STORE_KEY = 'staff-users';

export const DEFAULT_USERS: UserData[] = [
  {
    id: 1,
    fullName: 'Super Administrator',
    email: 'admin@bargorya.com',
    role: 'Administrator',
    isSuperAdmin: true,
    isActive: true,
    twoFactorEnabled: true,
    createdAt: 'Oct 01, 2026',
  },
  {
    id: 2,
    fullName: 'Marcus Vance',
    email: 'marcus@bargorya.com',
    role: 'Staff Editor',
    isSuperAdmin: false,
    isActive: true,
    twoFactorEnabled: true,
    createdAt: 'Oct 10, 2026',
  },
  {
    id: 3,
    fullName: 'Sarah Jenkins',
    email: 'sarah@bargorya.com',
    role: 'Staff Editor',
    isSuperAdmin: false,
    isActive: true,
    twoFactorEnabled: false,
    createdAt: 'Oct 12, 2026',
  },
];
