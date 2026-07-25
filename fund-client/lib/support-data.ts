export interface SupportFaq {
  question: string;
  answer: string;
  category: string;
  tag: string;
}

export const SUPPORT_FAQS: SupportFaq[] = [
  {
    question: "How do I connect my wallet to FundFlow?",
    answer:
      "To connect your wallet, click the 'Connect Wallet' button in the top navigation. We support MetaMask, WalletConnect, and Coinbase Wallet. Make sure you have one of these wallets installed in your browser or mobile device.",
    category: "Technical",
    tag: "Wallet",
  },
  {
    question: "What are the platform fees?",
    answer:
      "FundFlow charges a 5% platform fee on successfully funded campaigns. This fee covers payment processing, platform maintenance, customer support, and blockchain transaction costs. There are no fees for failed campaigns.",
    category: "General",
    tag: "Platform",
  },
  {
    question: "How long does it take to receive funds?",
    answer:
      "Once your campaign reaches its funding goal, funds are automatically transferred to your wallet within 24-48 hours. The exact timing depends on blockchain network congestion and gas fees.",
    category: "Payments",
    tag: "Funding",
  },
  {
    question: "Can I cancel my backing?",
    answer:
      "Yes, you can cancel your backing before the campaign ends. However, once a campaign is successfully funded, cancellations are not possible due to smart contract execution. Please review campaigns carefully before backing.",
    category: "Payments",
    tag: "Funding",
  },
  {
    question: "What happens if my campaign doesn't reach its goal?",
    answer:
      "If your campaign doesn't reach its funding goal by the end date, all backers are automatically refunded. This is handled by our smart contracts, ensuring a secure and transparent process.",
    category: "Campaigns",
    tag: "Platform",
  },
  {
    question: "How do I promote my campaign?",
    answer:
      "We recommend sharing your campaign on social media, reaching out to your network, creating engaging content, and using our built-in sharing tools. Check our campaign promotion guide for detailed tips and strategies.",
    category: "Campaigns",
    tag: "Platform",
  },
];

export const CATEGORY_ICONS: Record<
  string,
  { color: string; label: string }
> = {
  general: { color: "bg-blue-500", label: "General Support" },
  technical: { color: "bg-red-500", label: "Technical Issues" },
  campaigns: { color: "bg-green-500", label: "Campaign Management" },
  payments: { color: "bg-purple-500", label: "Payments & Funding" },
};
