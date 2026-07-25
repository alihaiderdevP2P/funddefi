-- Job postings and applications for FundFlow Careers CMS
-- Run: npm run db:migrate:careers

DO $$ BEGIN
  CREATE TYPE job_posting_status AS ENUM ('draft', 'published', 'closed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE job_application_status AS ENUM ('new', 'reviewed', 'shortlisted', 'rejected', 'hired');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE career_inquiry_status AS ENUM ('new', 'reviewed', 'resolved');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL DEFAULT 'Engineering',
  location VARCHAR(255) NOT NULL DEFAULT 'Remote',
  job_type VARCHAR(50) NOT NULL DEFAULT 'Full-time',
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  status job_posting_status DEFAULT 'draft',
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  published_at TIMESTAMP,
  closes_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  linkedin VARCHAR(500),
  github VARCHAR(500),
  portfolio VARCHAR(500),
  resume_url VARCHAR(500) NOT NULL,
  cover_letter TEXT NOT NULL,
  status job_application_status DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS career_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  interested_role VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  status career_inquiry_status DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_slug ON job_postings(slug);
CREATE INDEX IF NOT EXISTS idx_job_postings_published_at ON job_postings(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_career_inquiries_status ON career_inquiries(status);
