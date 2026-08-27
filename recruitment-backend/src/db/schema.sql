-- Recruitment Management System schema (PostgreSQL)

CREATE TABLE IF NOT EXISTS recruiters (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'recruiter',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidates (
  id SERIAL PRIMARY KEY,
  khmer_name VARCHAR(150),
  english_name VARCHAR(150),
  id_card_number VARCHAR(50),
  id_card_expiration DATE,
  current_address TEXT,
  phone VARCHAR(30),
  telegram_chat_id VARCHAR(50),
  cv_file_url TEXT,
  source VARCHAR(20) DEFAULT 'web_form', -- web_form | qr_code
  created_at TIMESTAMP DEFAULT NOW()
);

DO $$ BEGIN
  CREATE TYPE application_status AS ENUM (
    'submitted', 'shortlisted', 'interview_scheduled', 'interviewed', 'passed', 'hired', 'rejected'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
  position_applied VARCHAR(150),
  status application_status DEFAULT 'submitted',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interviews (
  id SERIAL PRIMARY KEY,
  application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP,
  location VARCHAR(200),
  interviewer_id INTEGER REFERENCES recruiters(id),
  outcome VARCHAR(50),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS status_history (
  id SERIAL PRIMARY KEY,
  application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
  old_status application_status,
  new_status application_status,
  changed_by INTEGER REFERENCES recruiters(id),
  changed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON candidates(created_at);
