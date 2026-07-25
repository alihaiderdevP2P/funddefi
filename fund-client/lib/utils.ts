import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Blockchain Network Types
 */
export type BlockchainNetwork =
  | "mainnet"
  | "sepolia"
  | "polygon"
  | "mumbai"
  | "goerli"
  | "arbitrum"
  | "optimism";

/**
 * Network Configuration for Blockchain Explorers
 */
interface NetworkConfig {
  etherscan: string;
  name: string;
  chainId: number;
}

const NETWORK_CONFIGS: Record<BlockchainNetwork, NetworkConfig> = {
  mainnet: {
    etherscan: "https://etherscan.io",
    name: "Ethereum Mainnet",
    chainId: 1,
  },
  sepolia: {
    etherscan: "https://sepolia.etherscan.io",
    name: "Sepolia Testnet",
    chainId: 11155111,
  },
  goerli: {
    etherscan: "https://goerli.etherscan.io",
    name: "Goerli Testnet",
    chainId: 5,
  },
  polygon: {
    etherscan: "https://polygonscan.com",
    name: "Polygon Mainnet",
    chainId: 137,
  },
  mumbai: {
    etherscan: "https://mumbai.polygonscan.com",
    name: "Mumbai Testnet",
    chainId: 80001,
  },
  arbitrum: {
    etherscan: "https://arbiscan.io",
    name: "Arbitrum One",
    chainId: 42161,
  },
  optimism: {
    etherscan: "https://optimistic.etherscan.io",
    name: "Optimism",
    chainId: 10,
  },
};

/**
 * Get Etherscan transaction link
 * @param txHash Transaction hash (with or without 0x prefix)
 * @param network Blockchain network (defaults to 'sepolia' for development)
 * @returns Full Etherscan transaction URL
 */
export function getEtherscanTxLink(
  txHash: string,
  network: BlockchainNetwork = "sepolia"
): string {
  const config = NETWORK_CONFIGS[network];
  if (!config) {
    throw new Error(`Unsupported network: ${network}`);
  }

  // Ensure hash starts with 0x
  const hash = txHash.startsWith("0x") ? txHash : `0x${txHash}`;
  return `${config.etherscan}/tx/${hash}`;
}

/**
 * Get Etherscan address link (for wallets, contracts)
 * @param address Wallet or contract address (with or without 0x prefix)
 * @param network Blockchain network (defaults to 'sepolia' for development)
 * @returns Full Etherscan address URL
 */
export function getEtherscanAddressLink(
  address: string,
  network: BlockchainNetwork = "sepolia"
): string {
  const config = NETWORK_CONFIGS[network];
  if (!config) {
    throw new Error(`Unsupported network: ${network}`);
  }

  // Ensure address starts with 0x
  const addr = address.startsWith("0x") ? address : `0x${address}`;
  return `${config.etherscan}/address/${addr}`;
}

/**
 * Get Etherscan token link (for ERC-20, ERC-721, etc.)
 * @param tokenAddress Token contract address
 * @param network Blockchain network (defaults to 'sepolia' for development)
 * @returns Full Etherscan token URL
 */
export function getEtherscanTokenLink(
  tokenAddress: string,
  network: BlockchainNetwork = "sepolia"
): string {
  const config = NETWORK_CONFIGS[network];
  if (!config) {
    throw new Error(`Unsupported network: ${network}`);
  }

  // Ensure address starts with 0x
  const addr = tokenAddress.startsWith("0x")
    ? tokenAddress
    : `0x${tokenAddress}`;
  return `${config.etherscan}/token/${addr}`;
}

/**
 * Get network name from chain ID
 * @param chainId Blockchain chain ID
 * @returns Network name or null if not found
 */
export function getNetworkFromChainId(
  chainId: number
): BlockchainNetwork | null {
  const entry = Object.entries(NETWORK_CONFIGS).find(
    ([_, config]) => config.chainId === chainId
  );
  return entry ? (entry[0] as BlockchainNetwork) : null;
}

/**
 * Get network configuration
 * @param network Blockchain network
 * @returns Network configuration object
 */
export function getNetworkConfig(network: BlockchainNetwork): NetworkConfig {
  const config = NETWORK_CONFIGS[network];
  if (!config) {
    throw new Error(`Unsupported network: ${network}`);
  }
  return config;
}

/**
 * Get all supported networks
 * @returns Array of supported network names
 */
export function getSupportedNetworks(): BlockchainNetwork[] {
  return Object.keys(NETWORK_CONFIGS) as BlockchainNetwork[];
}

/**
 * Format address for display (show first 6 and last 4 characters)
 * @param address Full address
 * @param prefixLength Characters to show at start (default: 6)
 * @param suffixLength Characters to show at end (default: 4)
 * @returns Formatted address string
 */
export function formatAddress(
  address: string,
  prefixLength: number = 6,
  suffixLength: number = 4
): string {
  if (!address || address.length < prefixLength + suffixLength) {
    return address;
  }

  const addr = address.startsWith("0x") ? address.slice(2) : address;
  const prefix = address.startsWith("0x") ? "0x" : "";

  if (addr.length <= prefixLength + suffixLength) {
    return `${prefix}${addr}`;
  }

  return `${prefix}${addr.slice(0, prefixLength)}...${addr.slice(
    -suffixLength
  )}`;
}

/**
 * Validate Ethereum address format
 * @param address Address to validate
 * @returns true if valid, false otherwise
 */
export function isValidEthereumAddress(address: string): boolean {
  if (!address) return false;

  // Remove 0x prefix if present for validation
  const addr = address.startsWith("0x") ? address.slice(2) : address;

  // Ethereum addresses are 40 hex characters (20 bytes)
  return /^[0-9a-fA-F]{40}$/.test(addr);
}

/**
 * Validate transaction hash format
 * @param txHash Transaction hash to validate
 * @returns true if valid, false otherwise
 */
export function isValidTransactionHash(txHash: string): boolean {
  if (!txHash) return false;

  // Remove 0x prefix if present for validation
  const hash = txHash.startsWith("0x") ? txHash.slice(2) : txHash;

  // Transaction hashes are 64 hex characters (32 bytes)
  return /^[0-9a-fA-F]{64}$/.test(hash);
}
