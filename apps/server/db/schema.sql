CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE media (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_name TEXT,
  content_type TEXT,
  storage_type TEXT, -- 'local' or 's3'
  s3_key TEXT,
  created_at TIMESTAMP DEFAULT now()
);
