-- Blog posts for FundFlow CMS
-- Run: npm run db:migrate:blog

DO $$ BEGIN
  CREATE TYPE blog_post_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL DEFAULT 'Technology',
  tags TEXT[] DEFAULT '{}',
  image_url VARCHAR(500),
  status blog_post_status DEFAULT 'draft',
  featured BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  read_time_minutes INTEGER DEFAULT 5,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
