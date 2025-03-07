import { ethers } from "ethers";
import {
  LOST_AND_FOUND_ADDRESS,
  BOUNTY_ESCROW_ADDRESS,
  DISPUTE_RESOLUTION_ADDRESS,
} from "../config";
import LostAndFoundABI from "../../../blockchain/artifacts/contracts/LostAndFound.sol/LostAndFound.json";
import BountyEscrowABI from "../../../blockchain/artifacts/contracts/BountyEscrow.sol/BountyEscrow.json";
import DisputeResolutionABI from "../../../blockchain/artifacts/contracts/DisputeResolution.sol/DisputeResolution.json";

// TypeScript Interface for Blockchain Contract
interface BlockchainContract {
  submitLostItem: (
    name: string,
    description: string,
    location: string
  ) => Promise<void>;
  submitFoundItem: (
    name: string,
    description: string,
    location: string,
    photo: string
  ) => Promise<void>;
  claimBounty: (itemId: string) => Promise<void>;
}

// Extend TypeScript's Window interface to include Ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Connect to Ethereum Provider
export const getEthereumContract = async (
  contractAddress: string,
  contractABI: any
): Promise<ethers.Contract | null> => {
  try {
    if (typeof window.ethereum !== "undefined") {
      console.log("Connecting to Ethereum provider...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      console.log("Getting signer...");
      const signer = await provider.getSigner();
      console.log("Creating contract instance...");
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      // Verify contract deployment
      console.log("Verifying contract deployment...");
      const code = await provider.getCode(contractAddress);
      if (code === "0x") {
        console.error("Contract not deployed at address:", contractAddress);
        return null;
      }

      console.log("Contract connected successfully");
      return contract;
    } else {
      console.error("Please install MetaMask!");
      return null;
    }
  } catch (error) {
    console.error("Error connecting to contract:", error);
    return null;
  }
};

// Function to create IPFS-like hash from item data
const createItemHash = (
  name: string,
  description: string,
  location: string
) => {
  // For now, we'll create a simple concatenated string as a mock IPFS hash
  // In a real implementation, this would upload to IPFS and return a hash
  return Buffer.from(`${name}::${description}::${location}`).toString("base64");
};

// Function to Submit a Lost Item
export const submitLostItem = async (
  name: string,
  description: string,
  location: string,
  updateState: Function
) => {
  try {
    console.log("Submitting lost item...");
    console.log("Item details:", { name, description, location });

    const contract = await getEthereumContract(
      LOST_AND_FOUND_ADDRESS,
      LostAndFoundABI.abi
    );
    if (!contract) {
      console.error("Failed to connect to contract");
      return;
    }

    // Create a hash of the item data
    const ipfsHash = createItemHash(name, description, location);
    console.log("Created IPFS hash:", ipfsHash);

    // Call the contract with just the hash
    console.log("Sending transaction to contract...");
    const tx = await contract.submitLostItem(ipfsHash);
    console.log("Transaction sent:", tx.hash);

    console.log("Waiting for transaction confirmation...");
    const receipt = await tx.wait();
    console.log("Transaction receipt:", receipt);

    if (receipt.status === 1) {
      console.log("Lost item submitted successfully!");
      // Get the itemId from the event logs
      const event = receipt.logs.find(
        (log: any) => log.eventName === "ItemSubmitted"
      );
      if (event) {
        const itemId = event.args[0];
        console.log("New item ID:", itemId.toString());
      }
      alert("Lost item submitted successfully!");
      window.location.href = "/dashboard";
    } else {
      console.error("Transaction failed");
      alert("Failed to submit lost item.");
    }
  } catch (error) {
    console.error("Error submitting lost item:", error);
    alert("An error occurred while submitting the lost item.");
  }
};

// Function to Submit a Found Item
export const submitFoundItem = async (
  description: string,
  location: string,
  contactInfo: string,
  itemId: string
) => {
  try {
    console.log("Submitting found item...");
    console.log("Item details:", {
      description,
      location,
      contactInfo,
      itemId,
    });

    const contract = await getEthereumContract(
      LOST_AND_FOUND_ADDRESS,
      LostAndFoundABI.abi
    );
    if (!contract) {
      console.error("Failed to connect to contract");
      return;
    }

    // Get the item details first to get the owner
    const item = await contract.items(itemId);
    if (!item || !item.owner) {
      throw new Error("Item not found");
    }

    // Get the signer's address
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();

    // Create notification data
    const notificationData = {
      type: "FOUND_ITEM",
      itemId,
      finder: signerAddress,
      owner: item.owner,
      details: {
        description,
        location,
        contactInfo,
      },
      timestamp: new Date().toISOString(),
      status: "pending",
    };

    // Store the notification in localStorage
    const notifications = JSON.parse(
      localStorage.getItem("notifications") || "[]"
    );

    // Check if notification already exists
    const existingNotificationIndex = notifications.findIndex(
      (n: any) => n.itemId === itemId && n.finder === notificationData.finder
    );

    if (existingNotificationIndex === -1) {
      // Add new notification
      notifications.push(notificationData);
    } else {
      // Update existing notification
      notifications[existingNotificationIndex] = {
        ...notifications[existingNotificationIndex],
        ...notificationData,
      };
    }

    localStorage.setItem("notifications", JSON.stringify(notifications));
    console.log("Notification stored successfully");

    return true;
  } catch (error) {
    console.error("Error submitting found item:", error);
    throw error;
  }
};

// Function to Claim Bounty
export const claimBounty = async (itemId: string) => {
  try {
    const contract = await getEthereumContract(
      BOUNTY_ESCROW_ADDRESS,
      BountyEscrowABI.abi
    );
    if (!contract) return;

    const tx = await contract.claimBounty(itemId);
    const receipt = await tx.wait(); // Wait for confirmation

    if (receipt.status === 1) {
      console.log("Bounty claimed successfully!");
      alert("Bounty claimed successfully!");
      window.location.href = "/dashboard"; // Redirect to dashboard or update UI
    } else {
      console.error("Transaction failed");
      alert("Failed to claim bounty.");
    }
  } catch (error) {
    console.error("Error claiming bounty:", error);
    alert("An error occurred while claiming the bounty.");
  }
};

// Function to parse item hash back into data
const parseItemHash = (ipfsHash: string) => {
  try {
    const decoded = Buffer.from(ipfsHash, "base64").toString();
    const [name, description, location] = decoded.split("::");
    return { name, description, location };
  } catch (error) {
    console.error("Error parsing item hash:", error);
    return {
      name: "Unknown",
      description: "Error parsing data",
      location: "Unknown",
    };
  }
};

// Function to Fetch Lost Items
export const fetchLostItems = async (): Promise<any[]> => {
  try {
    const contract = await getEthereumContract(
      LOST_AND_FOUND_ADDRESS,
      LostAndFoundABI.abi
    );
    if (!contract) return [];

    // Get all items for the current user
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    const userItems = await contract.getUserItems(userAddress);

    // Get details for each item
    const items = await Promise.all(
      userItems.map(async (itemId: number) => {
        const item = await contract.items(itemId);
        const { name, description, location } = parseItemHash(item.ipfsHash);

        return {
          id: itemId.toString(),
          name,
          description,
          location,
          date: new Date().toISOString().split("T")[0], // For now using current date
          status: item.isFound ? "found" : "active",
          owner: item.owner,
          finder: item.finder,
        };
      })
    );

    return items;
  } catch (error) {
    console.error("Error fetching lost items:", error);
    return [];
  }
};

// Function to Fetch Found Items
export const fetchFoundItems = async (): Promise<any[]> => {
  try {
    const contract = await getEthereumContract(
      LOST_AND_FOUND_ADDRESS,
      LostAndFoundABI.abi
    );
    if (!contract) return [];

    const items = await contract.getFoundItems();
    return items.map((item: any) => ({
      id: item.id.toString(),
      name: item.name,
      description: item.description,
      location: item.location,
      date: new Date(item.timestamp * 1000).toISOString().split("T")[0],
      status: item.status,
      photo: item.photo,
    }));
  } catch (error) {
    console.error("Error fetching found items:", error);
    return [];
  }
};

// Function to Fetch All Lost Items (from all users)
export const fetchAllLostItems = async (): Promise<any[]> => {
  try {
    console.log("Connecting to contract...");
    const contract = await getEthereumContract(
      LOST_AND_FOUND_ADDRESS,
      LostAndFoundABI.abi
    );
    if (!contract) {
      console.error("Failed to connect to contract");
      return [];
    }

    // Get all lost item IDs using the contract's getAllLostItems function
    console.log("Getting all lost items...");
    const lostItemIds = await contract.getAllLostItems();
    console.log("Total lost items:", lostItemIds.length);

    // Fetch all items in parallel
    const items = await Promise.all(
      lostItemIds.map(async (itemId: bigint) => {
        try {
          console.log(`Fetching item ${itemId}...`);
          const item = await contract.items(itemId);
          console.log(`Raw item ${itemId} data:`, item);

          // Skip items with empty owner
          if (
            !item ||
            item.owner === "0x0000000000000000000000000000000000000000"
          ) {
            console.log(`Item ${itemId} has no owner, skipping`);
            return null;
          }

          // Get item metadata from IPFS hash
          const ipfsHash = item.ipfsHash;
          if (!ipfsHash) {
            console.log(`Item ${itemId} has no IPFS hash, skipping`);
            return null;
          }

          // Try to parse the IPFS hash as base64 first
          let metadata;
          try {
            const decoded = Buffer.from(ipfsHash, "base64").toString();
            const [name, description, location] = decoded.split("::");
            metadata = { name, description, location };
          } catch (error) {
            console.log(`Item ${itemId} using direct IPFS hash`);
            metadata = {
              name: `Item #${itemId}`,
              description: "Description not available",
              location: "Location not specified",
            };
          }

          // Get bounty amount if available
          let reward = "0";
          try {
            const bountyContract = await getEthereumContract(
              BOUNTY_ESCROW_ADDRESS,
              BountyEscrowABI.abi
            );
            if (bountyContract) {
              const bounty = await bountyContract.bounties(itemId);
              if (bounty && bounty.amount) {
                reward = ethers.formatEther(bounty.amount);
              }
            }
          } catch (error) {
            console.log(`No bounty found for item ${itemId}`);
          }

          return {
            id: itemId.toString(),
            name: metadata.name,
            description: metadata.description,
            location: metadata.location,
            date: new Date().toISOString().split("T")[0], // Current date as fallback
            status: item.isFound ? "found" : "active",
            owner: item.owner,
            finder: item.finder,
            reward,
            ipfsHash,
          };
        } catch (error) {
          console.error(`Error fetching item ${itemId}:`, error);
          return null;
        }
      })
    );

    // Filter out null items and sort by ID in descending order (newest first)
    const validItems = items.filter((item) => item !== null);
    console.log("Successfully fetched items:", validItems.length);
    return validItems.sort((a, b) => Number(b.id) - Number(a.id));
  } catch (error) {
    console.error("Error in fetchAllLostItems:", error);
    return [];
  }
};
