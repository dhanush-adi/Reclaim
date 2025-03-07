require("dotenv").config();
const { create } = require("ipfs-http-client");

// Infura IPFS Authentication
const projectId = process.env.INFURA_PROJECT_ID;
const projectSecret = process.env.INFURA_PROJECT_SECRET;
const auth = "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

// Connect to IPFS via Infura
const ipfs = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

// Upload file to IPFS
async function uploadToIPFS(fileBuffer) {
  try {
    const { path } = await ipfs.add(fileBuffer);
    return `https://ipfs.io/ipfs/${path}`;
  } catch (error) {
    console.error("IPFS Upload Error:", error);
    throw new Error("Failed to upload to IPFS");
  }
}

module.exports = { uploadToIPFS };
