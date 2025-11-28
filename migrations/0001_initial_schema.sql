-- KINTSUGI MIND Database Schema
-- User authentication and profile data

-- Users table (Google OAuth)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  google_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  picture TEXT,
  vessel_type TEXT DEFAULT 'chawan',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User profiles (synced with localStorage)
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_repairs INTEGER DEFAULT 0,
  last_visit DATETIME,
  stats_total_visits INTEGER DEFAULT 0,
  stats_current_streak INTEGER DEFAULT 0,
  stats_longest_streak INTEGER DEFAULT 0,
  stats_garden_actions INTEGER DEFAULT 0,
  stats_study_sessions INTEGER DEFAULT 0,
  stats_tatami_sessions INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cracks (kintsugi repair history)
CREATE TABLE IF NOT EXISTS cracks (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'absence', 'struggle', etc.
  repaired INTEGER DEFAULT 0, -- 0 = not repaired, 1 = repaired with gold
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  repaired_at DATETIME
);

-- Activities log
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'garden', 'study', 'tatami', 'checkin'
  data TEXT, -- JSON data for activity details
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Check-in history (for calendar view)
CREATE TABLE IF NOT EXISTS checkins (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  weather TEXT NOT NULL, -- 'sunny', 'cloudy', 'rainy', 'stormy'
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sessions for auth
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_cracks_profile_id ON cracks(profile_id);
CREATE INDEX IF NOT EXISTS idx_activities_profile_id ON activities(profile_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);
CREATE INDEX IF NOT EXISTS idx_checkins_profile_id ON checkins(profile_id);
CREATE INDEX IF NOT EXISTS idx_checkins_created_at ON checkins(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
