// Service for sending NOP tokens from cold wallet to users
import { ethers } from "ethers";

const NOP_TOKEN_CONTRACT = "0x941Fc398d9FAebdd9f311011541045A1d66c748E";
const ZKSYNC_RPC = "https://mainnet.era.zksync.io";

// Get cold wallet address from private key (calculated dynamically)
function getColdWalletAddress(): string {
  const privateKey = process.env.COLD_WALLET_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("COLD_WALLET_PRIVATE_KEY not configured");
  }
  // Calculate address from private key
  const wallet = new ethers.Wallet(privateKey);
  return wallet.address;
}

// ERC20 ABI (minimal)
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address owner) view returns (uint256)",
] as const;

/**
 * Send NOP tokens from cold wallet to user address
 * @param toAddress - User's wallet address
 * @param amountPoints - Amount in points (will be converted to tokens)
 * @param pointsPerToken - Conversion rate (points per token, default 1:1)
 * @returns Transaction hash
 */
export async function sendTokensToUser(
  toAddress: string,
  amountPoints: bigint,
  pointsPerToken: bigint = 1n
): Promise<string> {
  const coldWalletPrivateKey = process.env.COLD_WALLET_PRIVATE_KEY;
  
  if (!coldWalletPrivateKey) {
    throw new Error("COLD_WALLET_PRIVATE_KEY not configured in environment");
  }

  // Connect to zkSync Era
  const provider = new ethers.JsonRpcProvider(ZKSYNC_RPC);
  const wallet = new ethers.Wallet(coldWalletPrivateKey, provider);
  const coldWalletAddress = wallet.address;

  // Get token contract
  const tokenContract = new ethers.Contract(NOP_TOKEN_CONTRACT, ERC20_ABI, wallet);

  // Get token decimals
  const decimals = await tokenContract.decimals();

  // Convert points to tokens (if pointsPerToken is not 1:1)
  const amountTokens = (amountPoints * 10n ** BigInt(decimals)) / pointsPerToken;

  // Check cold wallet balance
  const balance = await tokenContract.balanceOf(coldWalletAddress);
  if (balance < amountTokens) {
    throw new Error(`Insufficient cold wallet balance: need ${ethers.formatUnits(amountTokens, decimals)}, have ${ethers.formatUnits(balance, decimals)}`);
  }

  // Send tokens
  const tx = await tokenContract.transfer(toAddress, amountTokens);
  
  // Wait for transaction
  const receipt = await tx.wait();

  if (!receipt || !receipt.hash) {
    throw new Error("Transaction failed: no receipt");
  }

  return receipt.hash;
}

/**
 * Check cold wallet balance
 */
export async function getColdWalletBalance(): Promise<string> {
  const provider = new ethers.JsonRpcProvider(ZKSYNC_RPC);
  const tokenContract = new ethers.Contract(NOP_TOKEN_CONTRACT, ERC20_ABI, provider);
  const decimals = await tokenContract.decimals();
  const coldWalletAddress = getColdWalletAddress();
  const balance = await tokenContract.balanceOf(coldWalletAddress);
  return ethers.formatUnits(balance, decimals);
}

