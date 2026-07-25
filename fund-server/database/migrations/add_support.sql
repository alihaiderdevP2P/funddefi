-- Support tickets and help articles for FundFlow Support Center
-- Run: npm run db:migrate:support

DO $$ BEGIN
  CREATE TYPE support_ticket_category AS ENUM ('general', 'technical', 'campaign', 'payment', 'bug', 'feature');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE support_ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE support_ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE help_article_category AS ENUM ('general', 'technical', 'campaigns', 'payments');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE help_article_status AS ENUM ('published', 'draft');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(100) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  category support_ticket_category NOT NULL,
  priority support_ticket_priority NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status support_ticket_status DEFAULT 'open',
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_to VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS help_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  category help_article_category NOT NULL,
  status help_article_status DEFAULT 'published',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_ticket_number ON support_tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_help_articles_category ON help_articles(category);
CREATE INDEX IF NOT EXISTS idx_help_articles_status ON help_articles(status);
CREATE INDEX IF NOT EXISTS idx_help_articles_slug ON help_articles(slug);

-- Seed default help articles (idempotent)
INSERT INTO help_articles (slug, title, content, summary, category, status, sort_order)
VALUES
  ('how-do-i-create-an-account', 'How do I create an account?', 'To create a FundFlow account:\n\n1. Click **Sign Up** in the top navigation\n2. Enter your email, name, and password\n3. Optionally connect your wallet during registration\n4. Verify your email if prompted\n\nOnce registered, you can browse campaigns, back projects, or launch your own campaign.', 'Step-by-step guide to creating your FundFlow account', 'general', 'published', 1),
  ('what-is-fundflow', 'What is FundFlow?', 'FundFlow is a blockchain-based crowdfunding platform that combines the transparency of smart contracts with AI-powered features.\n\nKey benefits:\n- **Transparent funding** via on-chain smart contracts\n- **Automatic refunds** if campaigns don''t reach their goal\n- **AI fraud detection** to protect backers\n- **Global reach** with cryptocurrency payments', 'Overview of the FundFlow platform and its core features', 'general', 'published', 2),
  ('how-do-i-get-started', 'How do I get started?', 'Getting started with FundFlow is easy:\n\n1. **Create an account** and connect your wallet\n2. **Browse campaigns** to find projects you want to support\n3. **Back a campaign** by selecting a reward tier\n4. Or **launch your own campaign** at /create\n\nVisit our How It Works page for a detailed walkthrough.', 'Quick start guide for new FundFlow users', 'general', 'published', 3),
  ('platform-fees', 'What are the platform fees?', 'FundFlow charges a **5% platform fee** on successfully funded campaigns. This covers:\n- Payment processing and blockchain transaction costs\n- Platform maintenance and security\n- Customer support\n\nThere are **no fees** for failed campaigns. Backers receive automatic refunds.', 'Details about FundFlow platform fees and pricing', 'general', 'published', 4),
  ('wallet-connection-failed', 'Wallet connection failed', 'If your wallet connection fails, try these steps:\n\n1. Ensure MetaMask (or your wallet) is installed and unlocked\n2. Refresh the page and click **Connect Wallet** again\n3. Check you''re on the correct network (Ethereum mainnet or testnet)\n4. Clear browser cache and disable conflicting extensions\n5. Try a different browser\n\nIf the issue persists, submit a support ticket with your wallet type and browser details.', 'Troubleshooting wallet connection issues', 'technical', 'published', 1),
  ('transaction-stuck-or-failed', 'Transaction stuck or failed', 'If your transaction is stuck or failed:\n\n1. Check the transaction on Etherscan using the tx hash\n2. If pending, wait for network congestion to clear or speed up with higher gas\n3. If failed, ensure you have sufficient ETH for gas fees\n4. Verify the campaign is still active and accepting funding\n5. Do not retry immediately — wait for the first transaction to confirm or fail\n\nContact support with your transaction hash for assistance.', 'How to resolve stuck or failed blockchain transactions', 'technical', 'published', 2),
  ('smart-contract-error', 'Smart contract error', 'Smart contract errors can occur due to:\n\n- **Insufficient gas** — increase gas limit in your wallet\n- **Campaign ended** — the funding deadline has passed\n- **Goal already reached** — some campaigns close early\n- **Network mismatch** — ensure your wallet is on the correct chain\n\nCopy the error message and submit a support ticket for detailed help.', 'Understanding and resolving smart contract errors', 'technical', 'published', 3),
  ('gas-fee-issues', 'Gas fee issues', 'Gas fees vary based on network congestion. To minimize costs:\n\n- Fund during off-peak hours (weekends, late night UTC)\n- Use recommended gas settings in MetaMask\n- Consider Layer 2 networks when supported\n\nFundFlow does not control gas fees — they are set by the Ethereum network.', 'Tips for managing Ethereum gas fees on FundFlow', 'technical', 'published', 4),
  ('how-to-create-a-campaign', 'How to create a campaign', 'To launch a campaign on FundFlow:\n\n1. Go to **Start Campaign** (/create)\n2. Fill in title, description, funding goal, and deadline\n3. Add reward tiers for backers\n4. Upload images and video\n5. Connect your wallet and deploy the smart contract\n6. Submit for review and share once live\n\nCampaigns are reviewed within 24-48 hours.', 'Complete guide to creating a crowdfunding campaign', 'campaigns', 'published', 1),
  ('setting-up-rewards', 'Setting up rewards', 'Reward tiers encourage backers to support your campaign:\n\n1. Define tiers at different price points ($5, $25, $100+)\n2. Include clear descriptions of what backers receive\n3. Set realistic delivery dates\n4. Limit quantities for exclusive tiers\n5. Add images to make rewards appealing\n\nWell-designed rewards can increase funding by up to 40%.', 'Best practices for campaign reward tiers', 'campaigns', 'published', 2),
  ('campaign-promotion-tips', 'Campaign promotion tips', 'Promote your campaign effectively:\n\n- Share on Twitter, Discord, and LinkedIn\n- Email your existing network\n- Create a launch video\n- Engage with the FundFlow community\n- Post regular campaign updates\n- Use our built-in sharing tools\n\nConsistent promotion in the first 48 hours is critical for momentum.', 'Strategies to promote and grow your campaign', 'campaigns', 'published', 3),
  ('managing-backers', 'Managing backers', 'Keep backers engaged throughout your campaign:\n\n- Send regular updates (weekly recommended)\n- Respond to comments promptly\n- Share milestones and stretch goals\n- Be transparent about delays\n- Thank backers publicly\n\nUse the Campaign Dashboard to view and communicate with all backers.', 'How to manage and communicate with your backers', 'campaigns', 'published', 4),
  ('payment-methods-accepted', 'Payment methods accepted', 'FundFlow accepts cryptocurrency payments via connected wallets:\n\n- **ETH** (Ethereum)\n- **USDC** and other ERC-20 tokens (where supported)\n\nPayments are processed on-chain through smart contracts. Traditional credit cards are not currently supported.', 'Accepted payment methods on FundFlow', 'payments', 'published', 1),
  ('how-to-request-a-refund', 'How to request a refund', 'Refund eligibility depends on campaign status:\n\n- **Before campaign ends**: Cancel your backing from your dashboard\n- **Failed campaign**: Automatic refund via smart contract\n- **Successful campaign**: Refunds are at creator discretion unless otherwise stated\n\nFor payment issues, submit a support ticket with your transaction details.', 'How to request a refund for your backing', 'payments', 'published', 2),
  ('funding-not-received', 'Funding not received', 'If you haven''t received expected funds:\n\n1. Verify the campaign reached its funding goal\n2. Check your wallet address is correct in campaign settings\n3. Allow 24-48 hours for post-campaign fund distribution\n4. Check Etherscan for incoming transactions\n5. Ensure your wallet is connected to the correct network\n\nCreators: contact support with your campaign ID if funds are delayed beyond 48 hours.', 'Troubleshooting missing or delayed funding', 'payments', 'published', 3),
  ('tax-implications', 'Tax implications', 'Tax treatment of crowdfunding varies by jurisdiction:\n\n- **Backers**: Contributions may not be tax-deductible unless the campaign is a registered charity\n- **Creators**: Funds received may be taxable income\n\nConsult a tax professional in your country. FundFlow does not provide tax advice.', 'General information about tax considerations', 'payments', 'published', 4)
ON CONFLICT (slug) DO NOTHING;
