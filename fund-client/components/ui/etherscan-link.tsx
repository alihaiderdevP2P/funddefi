"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import {
  getEtherscanTxLink,
  getEtherscanAddressLink,
  getEtherscanTokenLink,
  formatAddress,
  type BlockchainNetwork,
} from "@/lib/utils";
import { cn } from "@/lib/utils";

interface EtherscanLinkProps {
  /**
   * Transaction hash, address, or token address
   */
  value: string;
  /**
   * Type of link (transaction, address, or token)
   */
  type: "tx" | "address" | "token";
  /**
   * Blockchain network
   */
  network?: BlockchainNetwork;
  /**
   * Show formatted address instead of full value
   */
  showFormatted?: boolean;
  /**
   * Custom label (optional)
   */
  label?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Open in new tab (default: true)
   */
  openInNewTab?: boolean;
}

/**
 * EtherscanLink Component
 *
 * Displays a clickable link to view transactions, addresses, or tokens on Etherscan
 *
 * @example
 * ```tsx
 * <EtherscanLink
 *   value="0x1234..."
 *   type="tx"
 *   network="sepolia"
 * />
 * ```
 */

// Transaction link
{
  /* <EtherscanTransactionLink 
  txHash="0x1234..." 
  network="sepolia" 
/>

// Address link (formatted)
<EtherscanAddressLink 
  address="0xabcd..." 
  network="sepolia" 
/>

// Contract address with custom label
<EtherscanLink
  value="0x5678..."
  type="address"
  network="sepolia"
  label="Campaign Contract"
/> */
}
export function EtherscanLink({
  value,
  type,
  network = "sepolia",
  showFormatted = true,
  label,
  className,
  openInNewTab = true,
}: EtherscanLinkProps) {
  if (!value) return null;

  // Get the appropriate Etherscan URL based on type
  let url: string;
  try {
    switch (type) {
      case "tx":
        url = getEtherscanTxLink(value, network);
        break;
      case "address":
        url = getEtherscanAddressLink(value, network);
        break;
      case "token":
        url = getEtherscanTokenLink(value, network);
        break;
      default:
        url = getEtherscanAddressLink(value, network);
    }
  } catch (error) {
    console.error("Error generating Etherscan link:", error);
    return null;
  }

  // Determine display text
  const displayText =
    label || (showFormatted && type !== "tx" ? formatAddress(value) : value);

  return (
    <Link
      href={url}
      target={openInNewTab ? "_blank" : "_self"}
      rel={openInNewTab ? "noopener noreferrer" : undefined}
      className={cn(
        "inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors",
        className
      )}
      title={`View on ${
        network === "mainnet"
          ? "Etherscan"
          : network === "polygon"
            ? "Polygonscan"
            : "Etherscan"
      }: ${value}`}
    >
      <span>{displayText}</span>
      {openInNewTab && <ExternalLink className="w-3 h-3" aria-hidden="true" />}
    </Link>
  );
}

/**
 * EtherscanTransactionLink Component
 *
 * Convenience component for transaction links
 */
export function EtherscanTransactionLink({
  txHash,
  network = "sepolia",
  className,
  label = "View on Etherscan",
}: {
  txHash: string;
  network?: BlockchainNetwork;
  className?: string;
  label?: string;
}) {
  return (
    <EtherscanLink
      value={txHash}
      type="tx"
      network={network}
      showFormatted={false}
      label={label}
      className={className}
    />
  );
}

/**
 * EtherscanAddressLink Component
 *
 * Convenience component for address links (wallets, contracts)
 */
export function EtherscanAddressLink({
  address,
  network = "sepolia",
  className,
  showFormatted = true,
  label,
}: {
  address: string;
  network?: BlockchainNetwork;
  className?: string;
  showFormatted?: boolean;
  label?: string;
}) {
  return (
    <EtherscanLink
      value={address}
      type="address"
      network={network}
      showFormatted={showFormatted}
      label={label}
      className={className}
    />
  );
}

/**
 * EtherscanTokenLink Component
 *
 * Convenience component for token links (ERC-20, ERC-721, etc.)
 */
export function EtherscanTokenLink({
  tokenAddress,
  network = "sepolia",
  className,
  showFormatted = true,
  label,
}: {
  tokenAddress: string;
  network?: BlockchainNetwork;
  className?: string;
  showFormatted?: boolean;
  label?: string;
}) {
  return (
    <EtherscanLink
      value={tokenAddress}
      type="token"
      network={network}
      showFormatted={showFormatted}
      label={label}
      className={className}
    />
  );
}
