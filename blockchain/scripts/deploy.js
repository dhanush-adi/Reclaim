const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // ✅ Get contract factory before deploying
    const LostAndFound = await ethers.getContractFactory("LostAndFound");
    const lostAndFound = await LostAndFound.deploy();
    await lostAndFound.waitForDeployment();
    console.log("LostAndFound Contract deployed at:", await lostAndFound.getAddress());

    const BountyEscrow = await ethers.getContractFactory("BountyEscrow");
    const bountyEscrow = await BountyEscrow.deploy();
    await bountyEscrow.waitForDeployment();
    console.log("BountyEscrow Contract deployed at:", await bountyEscrow.getAddress());

    const DisputeResolution = await ethers.getContractFactory("DisputeResolution");
    const disputeResolution = await DisputeResolution.deploy();
    await disputeResolution.waitForDeployment();
    console.log("DisputeResolution Contract deployed at:", await disputeResolution.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
