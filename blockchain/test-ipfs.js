require("dotenv").config();
const fs = require("fs");
const path = require("path");
import { uploadToIPFS } from "./utils/ipfs.js";

async function testUpload() {
  const filePath = "test-file.txt"; // Ensure this file exists in your project
  try {
    const ipfsUrl = await uploadToIPFS(filePath);
    console.log("✅ File uploaded to IPFS:", ipfsUrl);
  } catch (error) {
    console.error("❌ IPFS Upload Failed:", error);
  }
}

testUpload();

