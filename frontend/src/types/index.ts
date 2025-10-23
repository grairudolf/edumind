// Type definitions for the EduMind application

export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  role: 'student' | 'teacher' | 'admin';
  language_preference: string;
  learning_style: 'visual' | 'auditory' | 'kinesthetic';
  is_active: boolean;
  is_verified: boolean;
  school?: string;
  grade_level?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: number;
  user_id: number;
  title: string;
  subject?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  is_active: boolean;
  started_at: string;
  ended_at?: string;
  message_count: number;
}

export interface Message {
  id: number;
  session_id: number;
  user_id: number;
  content: string;
  message_type: 'text' | 'voice' | 'image';
  is_user: boolean;
  sentiment?: string;
  confidence?: number;
  language: string;
  response_time?: number;
  created_at: string;
}

export interface LearningProgress {
  id: number;
  user_id: number;
  subject: string;
  topic: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  progress_percentage: number;
  time_spent: number;
  correct_answers: number;
  total_questions: number;
  last_practiced: string;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  badge_type: 'achievement' | 'streak' | 'subject' | 'special';
  points_required: number;
  criteria: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

export interface UserBadge {
  id: number;
  user_id: number;
  badge_id: number;
  earned_at: string;
  is_displayed: boolean;
}

export interface GamificationStats {
  id: number;
  user_id: number;
  level: number;
  total_points: number;
  current_streak: number;
  longest_streak: number;
  xp_to_next_level: number;
  total_sessions: number;
  total_questions_answered: number;
  total_correct_answers: number;
  average_response_time: number;
  favorite_subject?: string;
  last_activity: string;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsEvent {
  id: number;
  user_id: number;
  event_type: string;
  event_data: Record<string, any>;
  session_id?: number;
  timestamp: string;
}

export interface LearningAnalytics {
  id: number;
  user_id: number;
  subject: string;
  total_sessions: number;
  total_time_spent: number;
  average_session_length: number;
  average_accuracy: number;
  improvement_rate: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  last_updated: string;
}

export interface TeacherReport {
  id: number;
  teacher_id: number;
  report_type: 'weekly' | 'monthly' | 'quarterly';
  period_start: string;
  period_end: string;
  total_students: number;
  active_students: number;
  total_sessions: number;
  average_engagement: number;
  top_performing_subjects: string[];
  students_needing_attention: number[];
  insights: string[];
  recommendations: string[];
  created_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Chat types
export interface ChatResponse {
  response: string;
  sentiment: string;
  confidence: number;
  language: string;
  response_time: number;
  timestamp: string;
}

// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  full_name?: string;
  role?: string;
}

export interface RegisterResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Gamification types
export interface LeaderboardEntry {
  rank: number;
  user: {
    id: number;
    username: string;
    full_name: string;
  };
  stats: {
    level: number;
    total_points: number;
    current_streak: number;
    badges_count: number;
  };
  is_current_user: boolean;
}

export interface LeaderboardResponse {
  user_rank: number;
  leaderboard: LeaderboardEntry[];
}

// Error types
export interface ApiError {
  detail: string;
  code?: string;
  field?: string;
}
