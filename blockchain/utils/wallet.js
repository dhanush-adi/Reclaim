import { ethers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";

// Wallet Options
const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: "YOUR_INFURA_PROJECT_ID", // Replace with your Infura Project ID
    },
  },
  coinbasewallet: {
    package: CoinbaseWalletSDK,
    options: {
      appName: "Reclaim",
      infuraId: "YOUR_INFURA_PROJECT_ID",
      rpc: "", // Optional RPC URL for custom networks
      chainId: 137, // Polygon Mainnet
    },
  },
  phantom: {
    package: null,
    connector: async () => {
      if ("solana" in window) {
        await window.solana.connect();
        return window.solana;
      } else {
        window.open("https://phantom.app/", "_blank");
        throw new Error("Phantom Wallet not installed");
      }
    },
  },
};

let web3Modal;
if (typeof window !== "undefined") {
  web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions,
  });
}

export const connectWallet = async () => {
  try {
    const provider = await web3Modal.connect();
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const signer = ethersProvider.getSigner();
    const address = await signer.getAddress();
    return { provider, signer, address };
  } catch (error) {
    console.error("Wallet Connection Error:", error);
    return null;
  }
};

export const disconnectWallet = async () => {
  await web3Modal.clearCachedProvider();
  window.location.reload();
};
