// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  profilePicture?: string;
  totalTestsAttempted: number;
  totalTestsCompleted: number;
  averageScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

// Exam Types
export interface Category {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  order: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Exam {
  _id: string;
  title: string;
  description?: string;
  category: string;
  language: string;
  totalMarks: number;
  duration: number;
  status: 'draft' | 'published';
  totalTests: number;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateExamData {
  title: string;
  description?: string;
  category: string;
  language: string;
  totalMarks: number;
  duration: number;
  status?: 'draft' | 'published';
}

// Test Types
export interface Test {
  _id: string;
  testName: string;
  examId: string;
  totalQuestions: number;
  totalMarks: number;
  correctMark: number;
  negativeMark: number;
  duration: number;
  isFree: boolean;
  isActive?: boolean;
  order: number;
  description?: string;
  instructions?: string;
  exam?: {
    _id: string;
    title: string;
    category: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestData {
  testName: string;
  examId: string;
  tabId?: string;
  totalQuestions: number;
  totalMarks: number;
  correctMark: number;
  negativeMark: number;
  duration: number;
  isFree: boolean;
  isActive?: boolean;
  order: number;
  description?: string;
  instructions?: string;
}

// Question Types
export interface Question {
  _id: string;
  questionText: string;
  questionTextHindi?: string;
  questionImage?: string;
  questionType: 'MCQ';
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  optionsHindi?: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  optionImages?: {
    A?: string;
    B?: string;
    C?: string;
    D?: string;
  };
  optionImagesHindi?: {
    A?: string;
    B?: string;
    C?: string;
    D?: string;
  };
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  explanationHindi?: string;
  solution?: {
    english?: string;
    hindi?: string;
  };
  marks: number;
  negativeMarks: number;
  testId: string;
  order: number;
  section?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionData {
  questionText: string;
  questionTextHindi?: string;
  questionImage?: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  optionsHindi?: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  optionImages?: {
    A?: string;
    B?: string;
    C?: string;
    D?: string;
  };
  optionImagesHindi?: {
    A?: string;
    B?: string;
    C?: string;
    D?: string;
  };
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  explanationHindi?: string;
  solution?: {
    english?: string;
    hindi?: string;
  };
  marks: number;
  negativeMarks: number;
  testId: string;
  order: number;
  section?: string;
  reuseEnglishImages?: boolean;
  reuseEnglishResultImages?: boolean;
}

export interface BulkQuestionData {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  marks: number;
  negativeMarks: number;
  order: number;
}

// Test Attempt Types
export interface TestAttempt {
  _id: string;
  userId: string;
  testId: string;
  examId: string;
  status: 'in-progress' | 'completed' | 'abandoned';
  startedAt: string;
  submittedAt?: string;
  timeTaken: number;
  score: number;
  totalMarks: number;
  accuracy: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedAnswers: number;
  rank?: number;
  test?: {
    _id: string;
    testName: string;
  };
  exam?: {
    _id: string;
    title: string;
  };
  user?: {
    _id: string;
    name: string;
    email: string;
  };
}

// Dashboard Stats
export interface DashboardStats {
  totalUsers: number;
  totalExams: number;
  totalTests: number;
  totalQuestions: number;
  recentActivity: Activity[];
}

export interface Activity {
  _id: string;
  type: 'exam_created' | 'test_created' | 'question_added' | 'test_completed';
  description: string;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Analytics Types
export interface TestAnalytics {
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  averageAccuracy: number;
  averageTimeTaken: number;
  scoreDistribution: {
    '0-25': number;
    '26-50': number;
    '51-75': number;
    '76-100': number;
  };
}

export interface ExamAnalytics {
  totalAttempts: number;
  uniqueUsers: number;
  averageScore: number;
  testWiseStats: Array<{
    testId: string;
    totalAttempts: number;
    averageScore: string;
  }>;
}

