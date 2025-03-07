# Project Name

## Overview

This project consists of two main parts: a blockchain component and a web platform component.

### Blockchain

The blockchain component is located in the `blockchain/` directory. It includes smart contracts, deployment scripts, and configuration files for the Hardhat development environment.

#### Directory Structure

- `blockchain/.gitignore`: Git ignore file for the blockchain component.
- `blockchain/hardhat.config.js`: Hardhat configuration file.
- `blockchain/package.json`: Package configuration file for npm.
- `blockchain/test-file.txt`: A test file.
- `blockchain/test-ipfs.js`: A test script for IPFS.
- `blockchain/artifacts/`: Directory containing build artifacts.
- `blockchain/cache/`: Directory containing cache files.
- `blockchain/contracts/`: Directory containing smart contracts.
  - `BountyEscrow.sol`: Smart contract for bounty escrow.
  - `DisputeResolution.sol`: Smart contract for dispute resolution.
  - `LostAndFound.sol`: Smart contract for lost and found.
- `blockchain/scripts/`: Directory containing deployment scripts.
  - `deploy.js`: Script to deploy contracts.
- `blockchain/utils/`: Directory containing utility scripts.

### Web Platform

The web platform component is located in the `reclaim-platform-main/` directory. It includes the frontend code, configuration files, and other resources for the web application.

#### Directory Structure

- `reclaim-platform-main/.gitignore`: Git ignore file for the web platform component.
- `reclaim-platform-main/components.json`: JSON file for components.
- `reclaim-platform-main/next.config.js`: Next.js configuration file.
- `reclaim-platform-main/next.config.mjs`: Next.js configuration file in ES module format.
- `reclaim-platform-main/package.json`: Package configuration file for npm.
- `reclaim-platform-main/postcss.config.mjs`: PostCSS configuration file.
- `reclaim-platform-main/tailwind.config.js`: Tailwind CSS configuration file.
- `reclaim-platform-main/tsconfig.json`: TypeScript configuration file.
- `reclaim-platform-main/app/`: Directory containing application code.
- `reclaim-platform-main/components/`: Directory containing React components.
- `reclaim-platform-main/hooks/`: Directory containing custom hooks.
- `reclaim-platform-main/lib/`: Directory containing library code.
- `reclaim-platform-main/public/`: Directory containing public assets.
- `reclaim-platform-main/src/`: Directory containing source code.
- `reclaim-platform-main/styles/`: Directory containing styles.

## Getting Started

### Prerequisites

- Node.js
- npm or yarn

### Installation

1. Clone the repository:

    ```sh
    git clone <repository-url>
    ```

2. Install dependencies for the blockchain component:

    ```sh
    cd blockchain
    npm install
    ```

3. Install dependencies for the web platform component:

    ```sh
    cd ../reclaim-platform-main
    npm install
    ```

### Running the Project

#### Blockchain

1. Compile the smart contracts:

    ```sh
    cd blockchain
    npx hardhat compile
    ```

2. Deploy the smart contracts:

    ```sh
    npx hardhat run scripts/deploy.js
    ```

#### Web Platform

1. Start the development server:

    ```sh
    cd reclaim-platform-main
    npm run dev
    ```

2. Open your browser and navigate to `http://localhost:3000`.

## License

This project is licensed under the MIT License.