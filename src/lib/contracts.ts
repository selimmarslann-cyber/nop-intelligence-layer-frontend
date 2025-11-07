// Token contract and network configuration
export const NOP_TOKEN_CONTRACT = "0x941Fc398d9FAebdd9f311011541045A1d66c748E";
// Cold wallet address (calculated from private key: 9fdab4ff8c36e79d05ff36c1415dda111083e8141877308a3b4aba4012661ada)
export const COLD_WALLET_ADDRESS = "0xC6947c7C7254e022D291D3FC3Acf416d7aD33658";

// zkSync Era network configuration
export const ZKSYNC_ERA = {
  chainId: "0x144", // 324 in hex
  chainName: "zkSync Era Mainnet",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://mainnet.era.zksync.io"],
  blockExplorerUrls: ["https://explorer.zksync.io"],
};

// ERC20 ABI (minimal - just what we need for transfer and balance)
export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
] as const;

