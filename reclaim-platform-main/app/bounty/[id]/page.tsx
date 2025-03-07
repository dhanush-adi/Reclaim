"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Clock,
  DollarSign,
  ArrowLeft,
  User,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { fetchAllLostItems, getEthereumContract } from "@/src/utils/blockchain";
import { truncateAddress } from "@/lib/utils";
import { useAccount } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LOST_AND_FOUND_ADDRESS, BOUNTY_ESCROW_ADDRESS } from "@/src/config";
import LostAndFoundABI from "../../../../blockchain/artifacts/contracts/LostAndFound.sol/LostAndFound.json";
import BountyEscrowABI from "../../../../blockchain/artifacts/contracts/BountyEscrow.sol/BountyEscrow.json";

type LostItem = {
  id: string;
  name: string;
  description: string;
  location: string;
  date: string;
  status: string;
  owner: string;
  finder: string;
  reward: string;
  ipfsHash: string;
  isVerified?: boolean;
};

export default function BountyDetailsPage() {
  const params = useParams();
  const [item, setItem] = useState<LostItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFoundDialogOpen, setIsFoundDialogOpen] = useState(false);
  const [foundDetails, setFoundDetails] = useState({
    description: "",
    location: "",
    contactInfo: "",
  });
  const { address } = useAccount();

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        setIsLoading(true);
        const items = await fetchAllLostItems();
        const foundItem = items.find((i) => i.id === params.id);
        if (foundItem) {
          // Check if there are any pending notifications for this item
          const notifications = JSON.parse(
            localStorage.getItem("notifications") || "[]"
          );
          const itemNotification = notifications.find(
            (n: any) => n.itemId === params.id && n.status === "pending"
          );

          setItem({
            ...foundItem,
            status: itemNotification
              ? "pending_verification"
              : foundItem.status,
          });
        }
      } catch (error) {
        console.error("Error fetching item details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchItemDetails();

    // Only set up polling if the item is in pending verification state
    let interval: NodeJS.Timeout | null = null;
    if (item?.status === "pending_verification") {
      interval = setInterval(fetchItemDetails, 5000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [params.id, item?.status]);

  const handleFoundSubmit = async () => {
    if (!item || !address) return;

    try {
      // Create notification data
      const notificationData = {
        type: "FOUND_ITEM",
        itemId: item.id,
        finder: address,
        owner: item.owner,
        details: foundDetails,
        timestamp: new Date().toISOString(),
        status: "pending",
      };

      // Store notification
      const notifications = JSON.parse(
        localStorage.getItem("notifications") || "[]"
      );
      notifications.push(notificationData);
      localStorage.setItem("notifications", JSON.stringify(notifications));

      // Update local state to show pending verification
      setItem((prev) =>
        prev
          ? {
              ...prev,
              status: "pending_verification",
            }
          : null
      );

      alert("Item found notification sent to the owner!");
      setIsFoundDialogOpen(false);
    } catch (error) {
      console.error("Error submitting found item:", error);
      alert("Error submitting found item. Please try again.");
    }
  };

  const isOwner = item
    ? address?.toLowerCase() === item.owner.toLowerCase()
    : false;

  const handleVerify = async () => {
    if (!item || !item.id) return;

    try {
      // Get the notification for this item
      const notifications = JSON.parse(
        localStorage.getItem("notifications") || "[]"
      );
      const notification = notifications.find(
        (n: any) => n.itemId === item.id && n.status === "pending"
      );

      if (!notification) {
        throw new Error("No pending notification found for this item");
      }

      // First verify the finder's claim on the blockchain
      const contract = await getEthereumContract(
        LOST_AND_FOUND_ADDRESS,
        LostAndFoundABI.abi
      );
      if (!contract) {
        throw new Error("Failed to connect to contract");
      }

      // Mark the item as found on the blockchain
      console.log("Marking item as found on blockchain...");
      const tx = await contract.verifyFoundItem(item.id, notification.finder);
      console.log("Transaction sent:", tx.hash);

      const receipt = await tx.wait();
      if (receipt.status !== 1) {
        throw new Error("Failed to verify item on blockchain");
      }

      // If there's a bounty, release it to the finder
      try {
        const bountyContract = await getEthereumContract(
          BOUNTY_ESCROW_ADDRESS,
          BountyEscrowABI.abi
        );
        if (bountyContract) {
          const bountyTx = await bountyContract.releaseBounty(
            item.id,
            notification.finder
          );
          await bountyTx.wait();
        }
      } catch (error) {
        console.error("Error releasing bounty:", error);
      }

      // Update notification status
      const updatedNotifications = notifications.map((n: any) =>
        n.itemId === item.id && n.finder === notification.finder
          ? {
              ...n,
              status: "accepted",
              acceptedAt: new Date().toISOString(),
              bountyReleased: true,
            }
          : n
      );
      localStorage.setItem(
        "notifications",
        JSON.stringify(updatedNotifications)
      );

      // Update item status
      setItem((prev) => (prev ? { ...prev, status: "found" } : null));

      alert(
        "Item verified successfully! Bounty has been released to the finder."
      );
    } catch (error) {
      console.error("Error verifying item:", error);
      alert(error instanceof Error ? error.message : "Error verifying item");
    }
  };

  const handleReject = () => {
    if (!item) return;

    try {
      // Get and update notifications
      const notifications = JSON.parse(
        localStorage.getItem("notifications") || "[]"
      );
      const updatedNotifications = notifications.map((n: any) =>
        n.itemId === item.id && n.status === "pending"
          ? { ...n, status: "rejected", rejectedAt: new Date().toISOString() }
          : n
      );
      localStorage.setItem(
        "notifications",
        JSON.stringify(updatedNotifications)
      );

      // Update item status back to active
      setItem((prev) => (prev ? { ...prev, status: "active" } : null));

      alert("Finder's claim has been rejected.");
    } catch (error) {
      console.error("Error rejecting claim:", error);
      alert("Error rejecting claim");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full mt-16 flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen w-full mt-16 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Item not found</h1>
        <Link href="/bounty">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bounty Board
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full mt-16 bg-gradient-to-b from-background via-background/95 to-background">
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back Button */}
          <Link href="/bounty">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bounty Board
            </Button>
          </Link>

          {/* Main Content */}
          <Card className="border-primary/20 bg-black/40 backdrop-blur-xl">
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold">
                    {item.name}
                  </CardTitle>
                  <p className="text-muted-foreground mt-1">
                    {item.description}
                  </p>
                </div>
                <Badge
                  variant={item.status === "active" ? "default" : "secondary"}
                  className="text-sm"
                >
                  {item.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column - Details */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Item Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <MapPin className="mr-2 h-4 w-4 text-primary" />
                        <span>Location: {item.location}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="mr-2 h-4 w-4 text-primary" />
                        <span>Date Lost: {item.date}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <User className="mr-2 h-4 w-4 text-primary" />
                        <span>Owner: {truncateAddress(item.owner)}</span>
                      </div>
                      {item.finder !==
                        "0x0000000000000000000000000000000000000000" && (
                        <div className="flex items-center text-sm">
                          <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                          <span>Found by: {truncateAddress(item.finder)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {parseFloat(item.reward) > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Reward</h3>
                      <div className="flex items-center text-xl font-bold text-primary">
                        <DollarSign className="mr-2 h-6 w-6" />
                        {item.reward} ETH
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Actions */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Actions</h3>
                    {item.status === "pending_verification" ? (
                      isOwner ? (
                        <div className="space-y-4">
                          <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
                            <div className="flex items-center gap-2 text-yellow-500">
                              <AlertCircle className="h-4 w-4" />
                              <p className="text-sm font-medium">
                                Verification Required
                              </p>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                              Someone has found your item. Please verify their
                              claim to release the bounty.
                            </p>
                          </div>
                          <div className="flex gap-4">
                            <Button
                              className="flex-1 bg-green-500 hover:bg-green-600"
                              onClick={handleVerify}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Verify & Release Bounty
                            </Button>
                            <Button
                              variant="destructive"
                              className="flex-1"
                              onClick={handleReject}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject Claim
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
                          <div className="flex items-center gap-2 text-yellow-500">
                            <AlertCircle className="h-4 w-4" />
                            <p className="text-sm font-medium">
                              Pending Verification
                            </p>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">
                            This item has been reported as found and is awaiting
                            owner verification.
                          </p>
                        </div>
                      )
                    ) : item.status === "active" ? (
                      <div className="space-y-4">
                        {!isOwner ? (
                          <>
                            <p className="text-sm text-muted-foreground">
                              If you have found this item, click the button
                              below to notify the owner.
                            </p>
                            <Button
                              className="w-full"
                              size="lg"
                              onClick={() => setIsFoundDialogOpen(true)}
                            >
                              I Found This Item
                            </Button>
                          </>
                        ) : (
                          <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
                            <div className="flex items-center gap-2 text-yellow-500">
                              <AlertCircle className="h-4 w-4" />
                              <p className="text-sm font-medium">Owner View</p>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                              This is your item. You'll be notified when someone
                              finds it.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        This item has been found and verified by the owner.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Found Item Dialog */}
      <Dialog open={isFoundDialogOpen} onOpenChange={setIsFoundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Found Item</DialogTitle>
            <DialogDescription>
              Provide details about how you found the item. The owner will
              verify your claim.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe where and how you found the item..."
                value={foundDetails.description}
                onChange={(e) =>
                  setFoundDetails((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Current Location</Label>
              <Input
                placeholder="Where is the item now?"
                value={foundDetails.location}
                onChange={(e) =>
                  setFoundDetails((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Information</Label>
              <Input
                placeholder="How can the owner reach you?"
                value={foundDetails.contactInfo}
                onChange={(e) =>
                  setFoundDetails((prev) => ({
                    ...prev,
                    contactInfo: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFoundDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleFoundSubmit}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
