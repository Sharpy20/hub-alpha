import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our feedback system
export interface FeedbackPost {
  id: string;
  title: string;
  content: string;
  category: string;
  author_name: string;
  author_id: string;
  upvotes: number;
  created_at: string;
  updated_at: string;
}

export interface FeedbackComment {
  id: string;
  post_id: string;
  content: string;
  author_name: string;
  author_id: string;
  parent_id: string | null;
  upvotes: number;
  created_at: string;
}

export interface FeedbackVote {
  id: string;
  user_id: string;
  post_id: string | null;
  comment_id: string | null;
  created_at: string;
}

// Categories for feedback
export const FEEDBACK_CATEGORIES = [
  { id: 'referrals', label: 'Referral Workflows', icon: '📋', color: 'indigo' },
  { id: 'guides', label: 'How-To Guides', icon: '📖', color: 'emerald' },
  { id: 'ward-diary', label: 'Ward Diary', icon: '📅', color: 'purple' },
  { id: 'patients', label: 'Patient Features', icon: '👤', color: 'blue' },
  { id: 'feature-ideas', label: 'Feature Ideas', icon: '💡', color: 'amber' },
  { id: 'bugs', label: 'Bug Reports', icon: '🐛', color: 'red' },
  { id: 'general', label: 'General', icon: '💬', color: 'gray' },
] as const;

export type FeedbackCategory = typeof FEEDBACK_CATEGORIES[number]['id'];
