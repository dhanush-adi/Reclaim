# Reclaim

## Overview

This project consists of two main parts: a blockchain component and a web platform component.

### Blockchain

The blockchain component includes smart contracts, deployment scripts, and configuration files for the Hardhat development environment.

### Web Platform

The web platform component includes the frontend code, configuration files, and other resources for the web application.

## Getting Started

### Prerequisites

- Node.js
- npm or yarn

### Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/dhanush-adi/Reclaim.git
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