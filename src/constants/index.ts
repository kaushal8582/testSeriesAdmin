// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

// Exam Categories
export const EXAM_CATEGORIES = [
  { label: 'SSC', value: 'SSC' },
  { label: 'Banking', value: 'Banking' },
  { label: 'Railway', value: 'Railway' },
  { label: 'UPSC', value: 'UPSC' },
  { label: 'CAT', value: 'CAT' },
  { label: 'GATE', value: 'GATE' },
  { label: 'Other', value: 'Other' },
];

// Exam Languages
export const EXAM_LANGUAGES = [
  { label: 'Hindi', value: 'Hindi' },
  { label: 'English', value: 'English' },
  { label: 'Both', value: 'Both' },
];

// Exam Status
export const EXAM_STATUS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
];

// Routes
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  EXAMS: '/exams',
  TESTS: '/tests',
  QUESTIONS: '/questions',
  ANALYTICS: '/analytics',
  CATEGORIES: '/categories',
  USERS: '/users',
  SUBSCRIPTIONS: '/subscriptions',
  PROMO_CODES: '/promo-codes',
  REFERRALS: '/referrals',
  PAYMENTS: '/payments',
  NOTIFICATIONS: '/notifications',
  DAILY_CHALLENGES: '/daily-challenges',
};

// Cookie Keys
export const COOKIE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
};

