require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: process.env.ALCHEMY_SEPOLIA_RPC, // Use Alchemy or Infura RPC
      accounts: [process.env.PRIVATE_KEY], // Add your wallet private key
    },
    polygon: {
      url: process.env.ALCHEMY_POLYGON_RPC,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
