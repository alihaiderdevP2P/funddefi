export const CONTACT_FAQS = [
  {
    question: "How do I create a campaign?",
    answer:
      "Creating a campaign is easy! Click Start Campaign and follow our step-by-step guide. You'll need to provide project details, set funding goals, and create rewards for backers.",
  },
  {
    question: "What are the platform fees?",
    answer:
      "FundFlow charges a 5% platform fee on successfully funded campaigns. This covers payment processing, platform maintenance, and customer support.",
  },
  {
    question: "How do I connect my wallet?",
    answer:
      "Click Connect Wallet in the top navigation. We support MetaMask, WalletConnect, and Coinbase Wallet. Make sure you have one of these wallets installed.",
  },
  {
    question: "Is my payment secure?",
    answer:
      "Yes! All transactions are secured by blockchain technology and smart contracts. Your funds are held in escrow until campaign goals are met.",
  },
  {
    question: "Can I cancel my backing?",
    answer:
      "You can cancel your backing before the campaign ends. However, once a campaign is successfully funded, cancellations are not possible due to smart contract execution.",
  },
  {
    question: "How do I get my rewards?",
    answer:
      "Campaign creators will contact you directly to fulfill rewards once the campaign is successfully funded. Make sure to provide accurate contact information when backing.",
  },
] as const;

export const CONTACT_SUBJECT_OPTIONS = [
  { value: "general_inquiry", label: "General inquiry" },
  { value: "campaign_support", label: "Campaign support" },
  { value: "billing_payments", label: "Billing & payments" },
  { value: "technical_issue", label: "Technical issue" },
  { value: "partnership", label: "Partnership opportunity" },
  { value: "feedback", label: "Feedback" },
  { value: "other", label: "Other" },
] as const;

export const CONTACT_CATEGORY_OPTIONS = [
  { value: "general", label: "General inquiry", icon: "message" },
  { value: "support", label: "Technical support", icon: "help" },
  { value: "bug", label: "Bug report", icon: "bug" },
  { value: "feature", label: "Feature request", icon: "lightbulb" },
  { value: "partnership", label: "Partnership", icon: "users" },
] as const;
