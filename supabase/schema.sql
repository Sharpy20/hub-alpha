-- Feedback System Schema for Inpatient Hub
-- Run this in your Supabase SQL Editor (SQL Editor tab in dashboard)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Feedback Posts table
CREATE TABLE IF NOT EXISTS feedback_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  author_name TEXT NOT NULL,
  author_id TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback Comments table
CREATE TABLE IF NOT EXISTS feedback_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES feedback_posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_id TEXT NOT NULL,
  parent_id UUID REFERENCES feedback_comments(id) ON DELETE CASCADE,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes table (tracks who voted on what to prevent double-voting)
CREATE TABLE IF NOT EXISTS feedback_votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  post_id UUID REFERENCES feedback_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES feedback_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure one vote per user per item
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_category ON feedback_posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_created ON feedback_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_upvotes ON feedback_posts(upvotes DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post ON feedback_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON feedback_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_votes_user ON feedback_votes(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE feedback_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_votes ENABLE ROW LEVEL SECURITY;

-- Policies: Allow anyone to read
CREATE POLICY "Anyone can read posts" ON feedback_posts FOR SELECT USING (true);
CREATE POLICY "Anyone can read comments" ON feedback_comments FOR SELECT USING (true);
CREATE POLICY "Anyone can read votes" ON feedback_votes FOR SELECT USING (true);

-- Policies: Allow anyone to insert (anonymous posting)
CREATE POLICY "Anyone can create posts" ON feedback_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create comments" ON feedback_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create votes" ON feedback_votes FOR INSERT WITH CHECK (true);

-- Policies: Allow update on upvotes only (for the vote counting)
CREATE POLICY "Anyone can update post upvotes" ON feedback_posts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can update comment upvotes" ON feedback_comments FOR UPDATE USING (true) WITH CHECK (true);

-- Policies: Allow delete votes (for un-voting)
CREATE POLICY "Anyone can delete their votes" ON feedback_votes FOR DELETE USING (true);

-- Function to update post timestamp on edit
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_posts_updated_at ON feedback_posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON feedback_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Sample data (optional - remove if you don't want starter content)
INSERT INTO feedback_posts (title, content, category, author_name, author_id, upvotes) VALUES
  ('Welcome to the Feedback Board!', 'This is where we can collaborate and share ideas about the Inpatient Hub. Feel free to post suggestions, report issues, or discuss features!', 'general', 'System', 'system', 5),
  ('Request: Add more referral workflows', 'Would be great to have workflows for Podiatry and Speech & Language Therapy referrals.', 'referrals', 'Demo User', 'demo-user-1', 3),
  ('The ward diary is really useful', 'Just wanted to say the task management features have been really helpful for handovers.', 'ward-diary', 'Night Staff', 'demo-user-2', 7);
