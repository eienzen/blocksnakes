document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded, initializing game...");

    let account = null;
    let contract = null;
    let animationFrameId = null;
    const TARGET_NETWORK_ID = "97"; // BNB Testnet Chain ID
    let WITHDRAWAL_FEE_BNB = "0.0002"; // डिफॉल्ट फीस
    let isGameRunning = false;
    let isGamePaused = false;

    let playerData = JSON.parse(localStorage.getItem("playerData")) || {
        gamesPlayed: 0,
        totalRewards: 0,
        boxesEaten: 0,
        pendingRewards: 0,
        totalReferrals: 0,
        referralRewards: 0,
        pendingReferral: null,
        pendingReferrerReward: 0,
        rewardHistory: [],
        hasClaimedWelcomeBonus: false,
        walletBalance: 0,
        walletAddress: null
    };

    const urlParams = new URLSearchParams(window.location.search);
    const referrerAddress = urlParams.get("ref");
    if (referrerAddress && !playerData.pendingReferral && ethers.isAddress(referrerAddress)) {
        playerData.pendingReferral = referrerAddress;
    }

    const contractAddress = "0x5c9c44E717E34DaB1925CE0e48737Fe65F6F85Ad";
    const contractABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "allowance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "needed",
				"type": "uint256"
			}
		],
		"name": "ERC20InsufficientAllowance",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "balance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "needed",
				"type": "uint256"
			}
		],
		"name": "ERC20InsufficientBalance",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "approver",
				"type": "address"
			}
		],
		"name": "ERC20InvalidApprover",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "receiver",
				"type": "address"
			}
		],
		"name": "ERC20InvalidReceiver",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "ERC20InvalidSender",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "ERC20InvalidSpender",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "reason",
				"type": "string"
			}
		],
		"name": "ErrorEvent",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "oldOracle",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOracle",
				"type": "address"
			}
		],
		"name": "GameOracleUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newLimit",
				"type": "uint256"
			}
		],
		"name": "MaxWithdrawalLimitUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "oldWallet",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newWallet",
				"type": "address"
			}
		],
		"name": "OwnerWalletUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "referrer",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "referee",
				"type": "address"
			}
		],
		"name": "ReferralAdded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "totalReward",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "referrer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "referrerReward",
				"type": "uint256"
			}
		],
		"name": "RewardsClaimed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "TokensBurned",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "totalAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "ownerAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "contractAmount",
				"type": "uint256"
			}
		],
		"name": "TokensMinted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "fee",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "success",
				"type": "bool"
			}
		],
		"name": "TokensWithdrawn",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "WelcomeBonusClaimed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newFeeInBnbWei",
				"type": "uint256"
			}
		],
		"name": "WithdrawalFeeUpdated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "burnTokens",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "totalReward",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "referrer",
				"type": "address"
			}
		],
		"name": "claimAllRewards",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "claimWelcomeBonus",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "mintTokens",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_newOracle",
				"type": "address"
			}
		],
		"name": "updateGameOracle",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_newLimit",
				"type": "uint256"
			}
		],
		"name": "updateMaxWithdrawalLimit",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_newWallet",
				"type": "address"
			}
		],
		"name": "updateOwnerWallet",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_newFeeInBnbWei",
				"type": "uint256"
			}
		],
		"name": "updateWithdrawalFee",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "withdrawAllTokens",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_gameOracle",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "contractBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "gameOracle",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "player",
				"type": "address"
			}
		],
		"name": "getInternalBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "player",
				"type": "address"
			}
		],
		"name": "getRewardHistory",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "amount",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "rewardType",
						"type": "string"
					},
					{
						"internalType": "address",
						"name": "referee",
						"type": "address"
					}
				],
				"internalType": "struct BlockSnakesGame.Reward[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "maxWithdrawalLimit",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MINIMUM_WITHDRAWAL",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "ownerWallet",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "playerHistory",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "gamesPlayed",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalRewards",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalReferrals",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "referralRewards",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "hasClaimedWelcomeBonus",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "internalBalance",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "REFERRAL_COMMISSION_RATE",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "referrals",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "rewardHistory",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "rewardType",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "referee",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "WELCOME_BONUS",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "withdrawalFeeInBnb",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
    const gameOracleAddress = "0x1fAC26109AC7f829448c67DF5110bcf37Ffcd4f0";
    const gameOraclePrivateKey = "ce9bfae66ef0d42b84f7e396a06aef134baaa516c356f953583e157d3c431a3c";

    let gameOracleProvider;
    try {
        gameOracleProvider = new ethers.WebSocketProvider("wss://data-seed-prebsc-1-s1.binance.org:8545/", { chainId: 97, name: "BNB Testnet" });
        console.log("Connected to primary WebSocket provider.");
    } catch (error) {
        console.error("Failed to connect to primary WebSocket URL:", error);
        try {
            gameOracleProvider = new ethers.WebSocketProvider("wss://data-seed-prebsc-2-s1.binance.org:8545/", { chainId: 97, name: "BNB Testnet" });
            console.log("Connected to backup WebSocket provider.");
        } catch (backupError) {
            console.error("Failed to connect to backup WebSocket URL:", backupError);
            gameOracleProvider = new ethers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545/", { chainId: 97, name: "BNB Testnet" });
            console.log("Fallback to JSON-RPC provider.");
        }
    }
    const gameOracleWallet = new ethers.Wallet(gameOraclePrivateKey, gameOracleProvider);
    const gameOracleContract = new ethers.Contract(contractAddress, contractABI, gameOracleWallet);

    const canvas = document.getElementById("gameCanvas");
    if (!canvas) console.error("Canvas element not found!");
    const ctx = canvas ? canvas.getContext("2d") : null;
    const gridWidth = 30;
    const gridHeight = 20;
    let gridSize;
    let snake = [{ x: 10, y: 10 }];
    let boxes = [];
    let direction = "right";
    let boxesEaten = 0;
    let gameRewards = 0;
    const baseSnakeSpeed = 100; // 100ms प्रति मूव
    let lastMoveTime = 0;

    const eatingSound = document.getElementById("eatingSound");
    const gameOverSound = document.getElementById("gameOverSound");
    const victorySound = document.getElementById("victorySound");

    function showLoading(show) {
        const loadingIndicator = document.getElementById("loadingIndicator");
        if (loadingIndicator) loadingIndicator.style.display = show ? "block" : "none";
        else console.error("Loading indicator not found!");
    }

    function updateCanvasSize() {
        if (!canvas) return console.error("Canvas not available for resizing!");
        const screenWidth = window.innerWidth * 0.9;
        const screenHeight = window.innerHeight * 0.7;
        gridSize = Math.min(screenWidth / gridWidth, screenHeight / gridHeight);
        canvas.width = gridSize * gridWidth;
        canvas.height = gridSize * gridHeight;
        canvas.style.width = `${canvas.width}px`;
        canvas.style.height = `${canvas.height}px`;
        draw();
    }

    async function enterFullscreen() {
        if (!document.fullscreenEnabled) {
            alert("Fullscreen is not supported or blocked by your browser.");
            return;
        }
        if (!canvas) return console.error("Canvas not available for fullscreen!");
        try {
            showLoading(true);
            await canvas.requestFullscreen({ navigationUI: "hide" });
            updateCanvasSize();
        } catch (error) {
            console.error("Fullscreen request failed:", error);
            alert("Failed to enter fullscreen mode. Please try again.");
        } finally {
            showLoading(false);
        }
    }

    function generateBoxes() {
        boxes = [];
        const numBoxes = 10;
        for (let i = 0; i < numBoxes; i++) {
            let newBox;
            do {
                newBox = { x: Math.floor(Math.random() * gridWidth), y: Math.floor(Math.random() * gridHeight) };
            } while (snake.some(segment => segment.x === newBox.x && segment.y === newBox.y) || boxes.some(b => b.x === newBox.x && b.y === newBox.y));
            boxes.push(newBox);
        }
    }

    function draw() {
        if (!ctx) return console.error("Canvas context not available!");
        ctx.fillStyle = "rgba(10, 10, 35, 0.8)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const gradient = ctx.createLinearGradient(snake[0].x * gridSize, snake[0].y * gridSize, snake[snake.length - 1].x * gridSize, snake[snake.length - 1].y * gridSize);
        gradient.addColorStop(0, "#00ffcc");
        gradient.addColorStop(1, "#00ccaa");
        snake.forEach((segment, index) => {
            ctx.fillStyle = gradient;
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);

            if (index === 0) {
                ctx.fillStyle = "#00ffcc";
                ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);

                ctx.fillStyle = "#ffffff";
                const eyeOffset = gridSize * 0.3;
                const eyeSize = gridSize * 0.25;
                const pupilSize = eyeSize * 0.6;

                if (direction === "right" || direction === "left") {
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + (direction === "right" ? gridSize - eyeOffset : eyeOffset), segment.y * gridSize + eyeOffset, eyeSize, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + (direction === "right" ? gridSize - eyeOffset : eyeOffset), segment.y * gridSize + gridSize - eyeOffset, eyeSize, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + eyeOffset, segment.y * gridSize + (direction === "up" ? eyeOffset : gridSize - eyeOffset), eyeSize, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + gridSize - eyeOffset, segment.y * gridSize + (direction === "up" ? eyeOffset : gridSize - eyeOffset), eyeSize, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.fillStyle = "#000000";
                if (direction === "right" || direction === "left") {
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + (direction === "right" ? gridSize - eyeOffset : eyeOffset), segment.y * gridSize + eyeOffset, pupilSize, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + (direction === "right" ? gridSize - eyeOffset : eyeOffset), segment.y * gridSize + gridSize - eyeOffset, pupilSize, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + eyeOffset, segment.y * gridSize + (direction === "up" ? eyeOffset : gridSize - eyeOffset), pupilSize, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + gridSize - eyeOffset, segment.y * gridSize + (direction === "up" ? eyeOffset : gridSize - eyeOffset), pupilSize, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        });

        boxes.forEach(box => {
            ctx.fillStyle = "#ff5555";
            ctx.fillRect(box.x * gridSize, box.y * gridSize, gridSize - 2, gridSize - 2);
        });

        const boxesEatenElement = document.getElementById("boxesEaten");
        const pendingRewardsElement = document.getElementById("pendingRewards");
        if (boxesEatenElement) boxesEatenElement.textContent = `Boxes Eaten: ${boxesEaten}`;
        if (pendingRewardsElement) pendingRewardsElement.textContent = `Pending Rewards: ${playerData.pendingRewards.toFixed(2)} BST`;
    }

    function gameLoop(currentTime) {
        if (!isGamePaused && isGameRunning) {
            if (currentTime - lastMoveTime >= baseSnakeSpeed) {
                move();
                lastMoveTime = currentTime;
            }
        }
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function move() {
        if (isGamePaused || !isGameRunning || !ctx) return console.error("Game paused or context unavailable!");

        let head = { x: snake[0].x, y: snake[0].y };
        if (direction === "right") head.x++;
        if (direction === "left") head.x--;
        if (direction === "up") head.y--;
        if (direction === "down") head.y++;

        if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight || snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            gameOverSound.play();
            showGameOverPopup();
            return;
        }

        snake.unshift(head);
        const eatenBoxIndex = boxes.findIndex(box => box.x === head.x && box.y === head.y);
        if (eatenBoxIndex !== -1) {
            if (eatingSound) eatingSound.play();
            boxesEaten++;
            const reward = 0.5;
            playerData.pendingRewards += reward;
            gameRewards += reward;
            playerData.totalRewards += reward;
            playerData.rewardHistory.push({ amount: reward, timestamp: Date.now(), rewardType: "Game", referee: "N/A" });
            if (playerData.pendingReferral) {
                const referrerReward = reward * 0.01;
                playerData.pendingReferrerReward += referrerReward;
                playerData.referralRewards += referrerReward;
                playerData.totalReferrals += 1;
                playerData.rewardHistory.push({ amount: referrerReward, timestamp: Date.now(), rewardType: "Referral", referee: playerData.pendingReferral });
            }
            boxes.splice(eatenBoxIndex, 1);
            if (boxes.length < 5) generateBoxes();
            if (boxesEaten % 10 === 0 || boxesEaten % 20 === 0 || boxesEaten % 30 === 0) if (victorySound) victorySound.play();
        } else {
            snake.pop();
        }
        draw();
        updatePlayerHistoryUI();
        localStorage.setItem("playerData", JSON.stringify(playerData));
    }

    function showGameOverPopup() {
        const popup = document.getElementById("gameOverPopup");
        if (!popup) return console.error("Game over popup not found!");
        const finalBoxesEaten = document.getElementById("finalBoxesEaten");
        const finalRewards = document.getElementById("finalRewards");
        if (finalBoxesEaten) finalBoxesEaten.textContent = `Boxes Eaten: ${boxesEaten}`;
        if (finalRewards) finalRewards.textContent = `Earned BST: ${gameRewards.toFixed(2)} BST`;
        popup.style.display = "block";
        isGameRunning = false;
        const closeBtn = document.getElementById("closePopup");
        if (closeBtn) {
            closeBtn.onclick = () => {
                popup.style.display = "none";
                resetGame().catch(err => {
                    console.error("Error resetting game:", err);
                    alert("Failed to reset game. Please try again.");
                });
            };
        } else {
            console.error("Close popup button not found!");
        }
    }

    async function resetGame() {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        if (gameRewards > 0 && account && gameOracleContract) {
            try {
                showLoading(true);
                await submitGameReward(gameRewards);
            } catch (error) {
                console.error("Failed to submit rewards:", error);
                const withdrawalStatus = document.getElementById("withdrawalStatus");
                if (withdrawalStatus) withdrawalStatus.textContent = `Error: ${error.message || "Unknown error submitting rewards."}`;
                alert("Failed to submit rewards: " + (error.message || "Unknown error. Please check network or contract."));
            } finally {
                showLoading(false);
            }
        }
        playerData.gamesPlayed += 1;
        boxesEaten = 0;
        gameRewards = 0;
        snake = [{ x: 10, y: 10 }];
        direction = "right";
        generateBoxes();
        updatePlayerHistoryUI();
        localStorage.setItem("playerData", JSON.stringify(playerData));
        draw();
        isGameRunning = true;
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function generateReferralLink() {
        if (!account) {
            alert("Please connect your wallet first!");
            return;
        }
        const referralLink = `${window.location.origin}${window.location.pathname}?ref=${account}`;
        navigator.clipboard.writeText(referralLink).then(() => alert("Referral link copied: " + referralLink));
    }

    async function fetchWithdrawalFee() {
        if (!contract) return;
        try {
            showLoading(true);
            const feeWei = await contract.withdrawalFeeInBnb();
            WITHDRAWAL_FEE_BNB = ethers.formatUnits(feeWei, 18);
        } catch (error) {
            console.error("Error fetching withdrawal fee:", error);
            WITHDRAWAL_FEE_BNB = "0.0002";
        } finally {
            showLoading(false);
        }
    }

    async function claimWelcomeBonus() {
        if (!contract || !account) {
            alert("Please connect your wallet first!");
            return;
        }
        if (playerData.hasClaimedWelcomeBonus) {
            alert("Welcome bonus already claimed!");
            return;
        }

        try {
            showLoading(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const balance = await provider.getBalance(account);
            const feeWei = ethers.parseUnits(WITHDRAWAL_FEE_BNB, 18);
            if (balance < feeWei) {
                alert(`Insufficient BNB balance. You need at least ${WITHDRAWAL_FEE_BNB} BNB for the fee.`);
                return;
            }

            const contractBalance = await contract.contractBalance();
            const welcomeBonusWei = ethers.parseUnits("100", 18);
            if (contractBalance < welcomeBonusWei) {
                alert("Contract does not have enough BST tokens.");
                return;
            }

            const tx = await contract.claimWelcomeBonus({ gasLimit: 300000 });
            await tx.wait();

            playerData.hasClaimedWelcomeBonus = true;
            playerData.totalRewards += 100;
            playerData.pendingRewards += 100;
            playerData.rewardHistory.push({ amount: 100, timestamp: Date.now(), rewardType: "Welcome Bonus", referee: "N/A" });
            playerData.walletBalance = Number(ethers.formatUnits(await contract.balanceOf(account), 18));
            updatePlayerHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
            alert("Welcome bonus of 100 BST claimed!");
        } catch (error) {
            console.error("Error claiming welcome bonus:", error);
            alert("Failed to claim welcome bonus: " + (error.message || "Unknown error."));
        } finally {
            showLoading(false);
        }
    }

    async function submitGameReward(rewardAmount) {
        if (!account || !gameOracleContract) {
            console.error("No account or gameOracleContract available");
            alert("Please ensure network connection and wallet are active!");
            return;
        }
        if (rewardAmount < 0.5) {
            alert("Minimum 0.5 BST required to submit!");
            return;
        }

        try {
            showLoading(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.getNetwork();
            const rewardWei = ethers.parseUnits(rewardAmount.toString(), 18);
            const tx = await gameOracleContract.claimAllRewards(rewardWei, account, playerData.pendingReferral || ethers.ZeroAddress, { gasLimit: 300000 });
            const receipt = await tx.wait();

            if (receipt.status === 1) {
                playerData.totalRewards += rewardAmount;
                if (playerData.pendingReferral) {
                    const referrerReward = rewardAmount * 0.01;
                    playerData.referralRewards += referrerReward;
                    playerData.pendingReferrerReward = 0;
                }
                playerData.pendingRewards += rewardAmount;
                playerData.pendingReferral = null;
                gameRewards = 0;
                updatePlayerHistoryUI();
                localStorage.setItem("playerData", JSON.stringify(playerData));
                alert(`${rewardAmount} BST rewards submitted successfully!`);
            } else {
                throw new Error("Transaction failed on blockchain.");
            }
        } catch (error) {
            console.error("Error submitting game rewards:", error);
            const withdrawalStatus = document.getElementById("withdrawalStatus");
            if (withdrawalStatus) withdrawalStatus.textContent = `Error: ${error.message || "Network issue. Please check connection."}`;
            alert("Failed to submit rewards: " + (error.message || "Network issue. Please check connection."));
        } finally {
            showLoading(false);
        }
    }

    async function claimPendingRewards() {
        if (!contract || !account) {
            alert("Please connect your wallet first!");
            return;
        }

        try {
            showLoading(true);
            await fetchWithdrawalFee();
            const provider = new ethers.BrowserProvider(window.ethereum);
            const balance = await provider.getBalance(account);
            const feeWei = ethers.parseUnits(WITHDRAWAL_FEE_BNB, 18);
            if (balance < feeWei) {
                const withdrawalStatus = document.getElementById("withdrawalStatus");
                if (withdrawalStatus) withdrawalStatus.textContent = "Error: Insufficient BNB for fee.";
                alert(`Insufficient BNB balance. You need at least ${WITHDRAWAL_FEE_BNB} BNB.`);
                return;
            }

            const internalBalance = await contract.getInternalBalance(account);
            const pendingRewardsWei = ethers.parseUnits(playerData.pendingRewards.toString(), 18);
            if (ethers.toBigInt(internalBalance) < ethers.toBigInt(pendingRewardsWei)) {
                const withdrawalStatus = document.getElementById("withdrawalStatus");
                if (withdrawalStatus) withdrawalStatus.textContent = "Error: Insufficient internal balance in contract.";
                alert("Insufficient internal balance. Please contact support.");
                return;
            }

            const contractBalance = await contract.contractBalance();
            if (ethers.toBigInt(contractBalance) < ethers.toBigInt(pendingRewardsWei)) {
                const withdrawalStatus = document.getElementById("withdrawalStatus");
                if (withdrawalStatus) withdrawalStatus.textContent = "Error: Insufficient contract balance.";
                alert("Insufficient contract balance.");
                return;
            }

            const tx = await contract.withdrawAllTokens({ value: feeWei, gasLimit: 300000 });
            const receipt = await tx.wait();
            if (receipt.status === 1) {
                playerData.walletBalance = Number(ethers.formatUnits(await contract.balanceOf(account), 18));
                playerData.pendingRewards = 0;
                playerData.rewardHistory.push({ amount: playerData.pendingRewards, timestamp: Date.now(), rewardType: "Withdrawal", referee: "N/A" });
                updatePlayerHistoryUI();
                const withdrawalStatus = document.getElementById("withdrawalStatus");
                if (withdrawalStatus) withdrawalStatus.textContent = "Success: Rewards withdrawn!";
                localStorage.setItem("playerData", JSON.stringify(playerData));
                alert("Rewards withdrawn successfully!");
            } else {
                throw new Error("Transaction failed on blockchain.");
            }
        } catch (error) {
            console.error("Error claiming rewards:", error);
            const withdrawalStatus = document.getElementById("withdrawalStatus");
            if (withdrawalStatus) withdrawalStatus.textContent = `Error: ${error.message || "Network issue or contract reverted. Please try again."}`;
            alert("Failed to claim rewards: " + (error.message || "Network issue or contract reverted. Please ensure sufficient BNB and try again."));
        } finally {
            showLoading(false);
        }
    }

    async function connectWallet() {
        try {
            showLoading(true);
            if (!window.ethereum) {
                alert("Please install MetaMask or a Web3 wallet!");
                return;
            }
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const network = await provider.getNetwork();
            if (network.chainId !== 97) {
                await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x61" }] });
            }

            const accounts = await provider.send("eth_requestAccounts", []);
            account = accounts[0];
            playerData.walletAddress = account;

            const signer = await provider.getSigner();
            contract = new ethers.Contract(contractAddress, contractABI, signer);

            await loadPlayerHistory();
            await fetchWithdrawalFee();
            updatePlayerHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));

            const connectWalletBtn = document.getElementById("connectWallet");
            const disconnectWalletBtn = document.getElementById("disconnectWallet");
            const walletAddress = document.getElementById("walletAddress");
            if (connectWalletBtn && disconnectWalletBtn && walletAddress) {
                connectWalletBtn.style.display = "none";
                disconnectWalletBtn.style.display = "block";
                walletAddress.textContent = `Connected: ${account.slice(0, 6)}...`;
            } else {
                console.error("Button or wallet address element not found!");
            }
            alert("Wallet connected successfully!");
        } catch (error) {
            console.error("Wallet connection error:", error);
            alert("Failed to connect wallet: " + (error.message || "Unknown error."));
        } finally {
            showLoading(false);
        }
    }

    function disconnectWallet() {
        account = null;
        contract = null;
        const connectWalletBtn = document.getElementById("connectWallet");
        const disconnectWalletBtn = document.getElementById("disconnectWallet");
        const walletAddress = document.getElementById("walletAddress");
        if (connectWalletBtn && disconnectWalletBtn && walletAddress) {
            connectWalletBtn.style.display = "block";
            disconnectWalletBtn.style.display = "none";
            walletAddress.textContent = "";
        } else {
            console.error("Button or wallet address element not found!");
        }
        updatePlayerHistoryUI();
        alert("Wallet disconnected!");
    }

    async function loadPlayerHistory() {
        if (!contract || !account) {
            updatePlayerHistoryUI();
            return;
        }
        try {
            showLoading(true);
            const history = await contract.playerHistory(account);
            playerData.gamesPlayed = Number(history.gamesPlayed);
            playerData.totalRewards = Number(ethers.formatUnits(history.totalRewards, 18));
            playerData.boxesEaten = Number(history.gamesPlayed);
            playerData.totalReferrals = Number(history.totalReferrals);
            playerData.referralRewards = Number(ethers.formatUnits(history.referralRewards, 18));
            playerData.hasClaimedWelcomeBonus = history.hasClaimedWelcomeBonus;
            playerData.pendingRewards = Number(ethers.formatUnits(await contract.getInternalBalance(account), 18));
            playerData.walletBalance = Number(ethers.formatUnits(await contract.balanceOf(account), 18));

            const rewards = await contract.getRewardHistory(account);
            playerData.rewardHistory = rewards.map(r => ({
                amount: Number(ethers.formatUnits(r.amount, 18)),
                timestamp: Number(r.timestamp) * 1000,
                rewardType: r.rewardType,
                referee: r.referee === ethers.ZeroAddress ? "N/A" : r.referee
            }));

            updatePlayerHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
        } catch (error) {
            console.error("Error loading player history:", error);
            alert("Failed to load player history. Please check your network connection.");
        } finally {
            showLoading(false);
        }
    }

    function updatePlayerHistoryUI() {
        const elements = {
            gamesPlayed: `Games Played: ${playerData.gamesPlayed}`,
            totalGameRewards: `Total Game Rewards: ${playerData.totalRewards.toFixed(2)} BST`,
            totalReferrals: `Total Referrals: ${playerData.totalReferrals}`,
            referralRewards: `Referral Rewards: ${playerData.referralRewards.toFixed(2)} BST`,
            pendingRewardsText: `Pending Rewards: ${playerData.pendingRewards.toFixed(2)} BST`,
            walletBalance: `Wallet Balance: ${playerData.walletBalance.toFixed(2)} BST`,
            walletAddress: account ? `Connected: ${account.slice(0, 6)}...` : "",
            boxesEaten: `Boxes Eaten: ${boxesEaten}`
        };

        for (const [id, value] of Object.entries(elements)) {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
            else console.error(`Element with id '${id}' not found!`);
        }

        const historyList = document.getElementById("rewardHistoryList");
        if (historyList) {
            historyList.innerHTML = "";
            playerData.rewardHistory.forEach(entry => {
                const li = document.createElement("li");
                li.textContent = `${entry.rewardType}: ${entry.amount.toFixed(2)} BST on ${new Date(entry.timestamp).toLocaleString()}${entry.referee !== "N/A" ? ` (Referee: ${entry.referee.slice(0, 6)}...)` : ""}`;
                historyList.appendChild(li);
            });
        } else {
            console.error("Reward history list not found!");
        }
    }

    // बटन इवेंट लिसनर्स
    const playGameBtn = document.getElementById("playGame");
    if (playGameBtn) {
        playGameBtn.addEventListener("click", async () => {
            console.log("Play game button clicked.");
            if (!account) {
                alert("Please connect your wallet!");
                return;
            }
            playGameBtn.disabled = true;
            try {
                showLoading(true);
                await enterFullscreen();
                if (!isGameRunning) {
                    await resetGame();
                }
            } catch (err) {
                console.error("Error starting game:", err);
                alert("Failed to start game. Please try again.");
            } finally {
                showLoading(false);
                playGameBtn.disabled = false;
            }
        });
    } else {
        console.error("Play game button not found!");
    }

    const connectWalletBtn = document.getElementById("connectWallet");
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener("click", connectWallet);
    } else {
        console.error("Connect wallet button not found!");
    }

    const disconnectWalletBtn = document.getElementById("disconnectWallet");
    if (disconnectWalletBtn) {
        disconnectWalletBtn.addEventListener("click", disconnectWallet);
    } else {
        console.error("Disconnect wallet button not found!");
    }

    const getReferralLinkBtn = document.getElementById("getReferralLink");
    if (getReferralLinkBtn) {
        getReferralLinkBtn.addEventListener("click", generateReferralLink);
    } else {
        console.error("Get referral link button not found!");
    }

    const claimGameRewardsBtn = document.getElementById("claimGameRewards");
    if (claimGameRewardsBtn) {
        claimGameRewardsBtn.addEventListener("click", claimPendingRewards);
    } else {
        console.error("Claim game rewards button not found!");
    }

    const welcomeBonusBtn = document.getElementById("welcomeBonusButton");
    if (welcomeBonusBtn) {
        welcomeBonusBtn.addEventListener("click", claimWelcomeBonus);
    } else {
        console.error("Welcome bonus button not found!");
    }

    // गेम कंट्रोल
    document.addEventListener("keydown", (event) => {
        if (isGameRunning && !isGamePaused) {
            if (event.key === "ArrowUp" && direction !== "down") direction = "up";
            if (event.key === "ArrowDown" && direction !== "up") direction = "down";
            if (event.key === "ArrowLeft" && direction !== "right") direction = "left";
            if (event.key === "ArrowRight" && direction !== "left") direction = "right";
        }
    });

    let touchStartX = 0;
    let touchStartY = 0;
    const touchThreshold = 20;

    if (canvas) {
        canvas.addEventListener("touchstart", (event) => {
            event.preventDefault();
            const touch = event.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            lastMoveTime = Date.now();
        });

        canvas.addEventListener("touchmove", (event) => {
            event.preventDefault();
            if (!isGameRunning || isGamePaused) return;
            const touch = event.touches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            const now = Date.now();

            if (now - lastMoveTime < 100) return;

            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > touchThreshold) {
                if (deltaX > 0 && direction !== "left") direction = "right";
                else if (deltaX < 0 && direction !== "right") direction = "left";
                lastMoveTime = now;
            } else if (Math.abs(deltaY) > touchThreshold) {
                if (deltaY > 0 && direction !== "up") direction = "down";
                else if (deltaY < 0 && direction !== "down") direction = "up";
                lastMoveTime = now;
            }
        });
    } else {
        console.error("Canvas not found for touch events!");
    }

    window.addEventListener("resize", updateCanvasSize);
    window.addEventListener("orientationchange", updateCanvasSize);

    updateCanvasSize();
    generateBoxes();
    draw();
    animationFrameId = requestAnimationFrame(gameLoop);
    updatePlayerHistoryUI();
});
