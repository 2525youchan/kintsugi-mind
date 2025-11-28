-- KINTSUGI MIND Subscription Schema
-- Premium subscription management

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free', -- 'free', 'premium_monthly', 'premium_yearly'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'past_due'
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start DATETIME,
  current_period_end DATETIME,
  cancel_at_period_end INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Usage tracking for rate limiting
CREATE TABLE IF NOT EXISTS usage (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL, -- 'ai_chat', 'checkin', etc.
  count INTEGER DEFAULT 0,
  reset_date DATE NOT NULL, -- Date when count resets
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Premium vessel designs
CREATE TABLE IF NOT EXISTS premium_vessels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ja TEXT NOT NULL,
  emoji TEXT NOT NULL,
  description TEXT,
  description_ja TEXT,
  svg_path TEXT NOT NULL, -- SVG path data for the vessel shape
  is_premium INTEGER DEFAULT 1, -- 1 = premium only, 0 = free
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert premium vessel designs
INSERT OR IGNORE INTO premium_vessels (id, name, name_ja, emoji, description, description_ja, svg_path, is_premium, sort_order) VALUES
  ('mizusashi', 'Water Jar', '水指', '🫖', 'Holds clarity and depth', '清らかさと深みを湛える', 'M50 40 Q50 20 100 20 Q150 20 150 40 L145 180 Q145 200 100 200 Q55 200 55 180 Z', 1, 1),
  ('koro', 'Incense Burner', '香炉', '🪔', 'Carries sacred essence', '神聖な香りを運ぶ', 'M60 60 Q60 30 100 30 Q140 30 140 60 L135 160 Q100 180 65 160 Z', 1, 2),
  ('hanaire', 'Flower Vase', '花入', '🌺', 'Embraces natural beauty', '自然の美を抱く', 'M70 30 Q70 10 100 10 Q130 10 130 30 L125 200 Q125 220 100 220 Q75 220 75 200 Z', 1, 3),
  ('chaire', 'Tea Caddy', '茶入', '🍃', 'Guards precious moments', '大切な瞬間を守る', 'M65 50 Q65 25 100 25 Q135 25 135 50 L130 150 Q130 170 100 170 Q70 170 70 150 Z', 1, 4),
  ('kensui', 'Waste Water Bowl', '建水', '💧', 'Accepts with grace', '優雅に受け入れる', 'M40 80 Q40 50 100 50 Q160 50 160 80 L150 150 Q150 180 100 180 Q50 180 50 150 Z', 1, 5),
  ('futaoki', 'Lid Rest', '蓋置', '🔘', 'Small but essential', '小さくも欠かせない', 'M60 60 Q60 40 100 40 Q140 40 140 60 L135 120 Q135 140 100 140 Q65 140 65 120 Z', 1, 6),
  ('natsume', 'Tea Container', '棗', '🥜', 'Simple elegance', '簡素な優雅さ', 'M55 45 Q55 20 100 20 Q145 20 145 45 L140 155 Q140 180 100 180 Q60 180 60 155 Z', 1, 7),
  ('chasen', 'Tea Whisk Stand', '茶筅', '🎋', 'Supports the craft', '技を支える', 'M70 30 Q70 15 100 15 Q130 15 130 30 L125 190 Q125 210 100 210 Q75 210 75 190 Z', 1, 8),
  ('yunomi', 'Tea Cup', '湯呑', '🍵', 'Daily comfort', '日々の安らぎ', 'M55 50 Q55 30 100 30 Q145 30 145 50 L140 170 Q140 190 100 190 Q60 190 60 170 Z', 1, 9),
  ('guinomi', 'Sake Cup', '盃', '🍶', 'Celebrates life', '人生を祝う', 'M50 70 Q50 50 100 50 Q150 50 150 70 L140 140 Q140 160 100 160 Q60 160 60 140 Z', 1, 10);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_usage_user_feature ON usage(user_id, feature);
CREATE INDEX IF NOT EXISTS idx_usage_reset_date ON usage(reset_date);
