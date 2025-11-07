// utils/eth.js  (ethers v6)
import { BrowserProvider, Contract } from "ethers";

const CONTRACT_ADDRESS = "0xebB1F21063f1A3ca0d259B507f1E0Eb8bA7777DE";
const ABI = [
  { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
  { "inputs": [], "name": "increment", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "decrement", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "getCount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "count", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
];

function assertMM() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask bulunamadı");
  }
}

export async function getProvider() {
  assertMM();
  return new BrowserProvider(window.ethereum);
}

export async function connectWallet() {
  const provider = await getProvider();
  const accounts = await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  return { account: accounts[0], provider, signer };
}

export async function getReadContract() {
  const provider = await getProvider();
  return new Contract(CONTRACT_ADDRESS, ABI, provider);
}

export async function getWriteContract() {
  const { signer } = await connectWallet();
  return new Contract(CONTRACT_ADDRESS, ABI, signer);
}

// ---- convenience helpers ----
export async function fetchCount() {
  const c = await (await getReadContract()).getCount();
  return Number(c);
}

export async function callIncrement() {
  const c = await getWriteContract();
  const tx = await c.increment();
  return tx.wait();
}

export async function callDecrement() {
  const c = await getWriteContract();
  const tx = await c.decrement();
  return tx.wait();
}

