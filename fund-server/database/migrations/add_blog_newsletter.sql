-- Blog newsletter subscribers
-- Run: npm run db:migrate:newsletter

DO $$ BEGIN
  CREATE TYPE newsletter_status AS ENUM ('active', 'unsubscribed', 'bounced');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS blog_newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  status newsletter_status DEFAULT 'active',
  unsubscribe_token UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  source VARCHAR(50) DEFAULT 'blog',
  ip_address VARCHAR(45),
  user_agent TEXT,
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  unsubscribed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_newsletter_status ON blog_newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed_at ON blog_newsletter_subscribers(subscribed_at DESC);
