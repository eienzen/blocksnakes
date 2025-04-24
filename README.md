BlockSnakes
A blockchain-based snake game where players can earn BST tokens by playing and referring friends.
Setup

Clone the repository:
git clone https://github.com/eienzen/blocksnakes.git
cd blocksnakes


Deploy the smart contract (contracts/BlockSnakesGame.sol) on BNB Testnet using Remix or Hardhat.

Update environment variables in Netlify:

VITE_CONTRACT_ADDRESS: Deployed contract address
VITE_GAME_ORACLE_ADDRESS: Your oracle address
VITE_GAME_ORACLE_RPC_URL: Primary RPC URL (e.g., https://data-seed-prebsc-1-s1.binance.org:8545/)
VITE_GAME_ORACLE_RPC_URL_SECONDARY: Secondary RPC URL
VITE_WITHDRAWAL_FEE_BNB: Withdrawal fee (e.g., 0.0002)


Push changes to GitHub and deploy on Netlify.


Usage

Open the deployed site (e.g., https://blocksnakes.netlify.app/).
Connect your MetaMask wallet (set to BNB Testnet).
Play the game, claim rewards, and use referral links to earn more BST tokens.

