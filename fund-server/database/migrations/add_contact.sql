-- Contact form messages and live chat for FundFlow Contact page
-- Run: npm run db:migrate:contact

DO $$ BEGIN
  CREATE TYPE contact_message_category AS ENUM ('general', 'support', 'bug', 'feature', 'partnership');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE contact_message_subject AS ENUM (
    'general_inquiry', 'campaign_support', 'billing_payments',
    'technical_issue', 'partnership', 'feedback', 'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE contact_message_status AS ENUM ('new', 'read', 'replied', 'resolved', 'spam');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE contact_chat_session_status AS ENUM ('active', 'closed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE contact_chat_sender AS ENUM ('visitor', 'agent', 'system');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number VARCHAR(100) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject contact_message_subject NOT NULL,
  category contact_message_category NOT NULL DEFAULT 'general',
  message TEXT NOT NULL,
  status contact_message_status DEFAULT 'new',
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  related_campaign_id UUID,
  related_creator_id UUID,
  related_backer_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_name VARCHAR(255),
  visitor_email VARCHAR(255),
  status contact_chat_session_status DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES contact_chat_sessions(id) ON DELETE CASCADE,
  sender contact_chat_sender NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_reference ON contact_messages(reference_number);
CREATE INDEX IF NOT EXISTS idx_contact_chat_messages_session ON contact_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_contact_chat_sessions_status ON contact_chat_sessions(status);
