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
  sub_category: string | null;
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
  { id: 'feature-request', label: 'Request a Feature', icon: '✨', color: 'amber' },
  { id: 'referrals', label: 'Referral Workflows', icon: '📋', color: 'indigo' },
  { id: 'guides', label: 'How-To Guides', icon: '📖', color: 'emerald' },
  { id: 'ward-diary', label: 'Ward Diary', icon: '📅', color: 'purple' },
  { id: 'patients', label: 'Patient Features', icon: '👤', color: 'blue' },
  { id: 'bugs', label: 'Bug Reports', icon: '🐛', color: 'red' },
  { id: 'general', label: 'General', icon: '💬', color: 'gray' },
] as const;

export type FeedbackCategory = typeof FEEDBACK_CATEGORIES[number]['id'];

// Sub-categories for specific feedback areas
export const FEEDBACK_SUB_CATEGORIES: Record<string, { id: string; label: string }[]> = {
  'feature-request': [
    { id: 'general-feature', label: 'General / Not specific' },
    { id: 'related-referrals', label: 'Related to: Referral Workflows' },
    { id: 'related-guides', label: 'Related to: How-To Guides' },
    { id: 'related-diary', label: 'Related to: Ward Diary' },
    { id: 'related-patients', label: 'Related to: Patient Features' },
    { id: 'related-bookmarks', label: 'Related to: Bookmarks' },
    { id: 'related-admin', label: 'Related to: Admin / Settings' },
    { id: 'related-login', label: 'Related to: Login / User Profiles' },
    { id: 'related-mobile', label: 'Related to: Mobile Experience' },
  ],
  referrals: [
    { id: 'general-referrals', label: 'General / All Referrals' },
    { id: 'imha-advocacy', label: 'IMHA / Advocacy' },
    { id: 'picu', label: 'PICU Referral' },
    { id: 'safeguarding', label: 'Safeguarding Adults' },
    { id: 'dietitian', label: 'Dietitian' },
    { id: 'social-care', label: 'Social Care' },
    { id: 'homeless-discharge', label: 'Homeless Discharge / DTR' },
    { id: 'dental', label: 'Dental Referral' },
    { id: 'physio', label: 'Physiotherapy' },
    { id: 'ot', label: 'Occupational Therapy' },
    { id: 'speech-language', label: 'Speech & Language' },
    { id: 'podiatry', label: 'Podiatry' },
  ],
  guides: [
    { id: 'general-guides', label: 'General / All Guides' },
    { id: 'news2', label: 'NEWS2 Observations' },
    { id: 'seizure', label: 'Seizure Management' },
    { id: 'capacity', label: 'Capacity Assessment' },
    { id: 'dols', label: 'DoLS' },
    { id: 'section-17', label: 'Section 17 Leave' },
    { id: 'rapid-tranq', label: 'Rapid Tranquillisation' },
    { id: 'seclusion', label: 'Seclusion' },
    { id: 'refeeding', label: 'Refeeding Syndrome' },
    { id: 'discharge-planning', label: 'Discharge Planning' },
    { id: 'care-planning', label: 'Care Planning' },
  ],
  'ward-diary': [
    { id: 'general-diary', label: 'General / Ward Diary' },
    { id: 'ward-tasks', label: 'Ward Tasks' },
    { id: 'patient-tasks', label: 'Patient Tasks' },
    { id: 'appointments', label: 'Appointments' },
    { id: 'my-tasks', label: 'My Tasks View' },
    { id: 'repeating-tasks', label: 'Repeating Tasks' },
  ],
  patients: [
    { id: 'general-patients', label: 'General / Patient Features' },
    { id: 'patient-list', label: 'Patient List' },
    { id: 'discharge', label: 'Discharge Process' },
    { id: 'transfer', label: 'Patient Transfer' },
    { id: 'patient-tasks', label: 'Patient Tasks' },
  ],
};
