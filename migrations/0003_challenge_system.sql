-- 0003_challenge_system.sql
-- Add challenge tracking to users table

-- Add challenge_data column to users table
ALTER TABLE users ADD COLUMN challenge_data TEXT;

-- Create user_unlocks table for tracking unlocked content
CREATE TABLE IF NOT EXISTS user_unlocks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  unlock_type TEXT NOT NULL,  -- 'vessel', 'badge', 'feature'
  unlock_id TEXT NOT NULL,
  unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, unlock_type, unlock_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_unlocks_user ON user_unlocks(user_id);

-- Add kintsugiBowl as a premium vessel reward
INSERT OR IGNORE INTO premium_vessels (id, name, name_ja, emoji, description, description_ja, is_premium, sort_order)
VALUES (
  'kintsugiBowl',
  'Golden Kintsugi Bowl',
  '黄金の金継ぎ椀',
  '🥇',
  'A vessel beautifully repaired with gold. Unlocked by completing the 7-Day Challenge.',
  '金で美しく修復された器。7日間チャレンジ完走で解放。',
  1,
  100
);
