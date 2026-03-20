CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  location TEXT,
  description TEXT,
  expires_at INTEGER,
  created_at INTEGER DEFAULT (strftime('%s','now'))
);