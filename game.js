document.addEventListener("DOMContentLoaded", () => {
    let account = null;
    let contract = null;
    let gameInterval = null;
    const TARGET_NETWORK_ID = "97"; // BNB Testnet Chain ID
    let WITHDRAWAL_FEE_BNB = "0.0002"; // Default withdrawal fee

    let playerData = JSON.parse(localStorage.getItem("playerData")) || {
        gamesPlayed: 0,
        totalRewards: 0,
        score: 0,
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
    if (referrerAddress && !playerData.pendingReferral) {
        playerData.pendingReferral = referrerAddress;
    }

    const contractAddress = "0xBeddAF819A94374e461eefa36865dF5CaB659fef"; // Replace with your contract address
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
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "BnbRewardDistributed",
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
		"name": "CustomAmountWithdrawn",
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
				"name": "totalBnbToDistribute",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "numberOfPlayers",
				"type": "uint256"
			}
		],
		"name": "distributeBnbRewards",
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
		"inputs": [],
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
		"name": "contractBnbBalance",
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
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "internalBalance",
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
		"name": "playerIndex",
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
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "topPlayers",
		"outputs": [
			{
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "totalRewards",
				"type": "uint256"
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

    // Game Logic
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const gridWidth = 30;
    const gridHeight = 20;
    let gridSize;
    let snake = [{ x: 10, y: 10 }];
    let boxes = [];
    let direction = 'right';
    let score = 0;
    let gameRewards = 0;
    let baseSnakeSpeed = 300;
    let currentSnakeSpeed = baseSnakeSpeed;

    function updateCanvasSize() {
        const screenWidth = window.innerWidth * 0.9;
        const screenHeight = window.innerHeight * 0.5;
        gridSize = Math.min(screenWidth / gridWidth, screenHeight / gridHeight);
        canvas.width = gridSize * gridWidth;
        canvas.height = gridSize * gridHeight;
    }

    function enterFullscreen() {
        if (canvas.requestFullscreen) canvas.requestFullscreen();
    }

    function generateBoxes() {
        boxes = [];
        const numBoxes = 5;
        for (let i = 0; i < numBoxes; i++) {
            let newBox;
            do {
                newBox = { x: Math.floor(Math.random() * gridWidth), y: Math.floor(Math.random() * gridHeight) };
            } while (snake.some(segment => segment.x === newBox.x && segment.y === newBox.y) || boxes.some(b => b.x === newBox.x && b.y === newBox.y));
            boxes.push(newBox);
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#0a0a23";
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
                const eyeSize = gridSize / 3;
                const pupilSize = eyeSize / 2;
                if (direction === 'right') {
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + gridSize - eyeSize, segment.y * gridSize + eyeSize, eyeSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + gridSize - eyeSize, segment.y * gridSize + gridSize - eyeSize, eyeSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#000000";
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + gridSize - eyeSize, segment.y * gridSize + eyeSize, pupilSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + gridSize - eyeSize, segment.y * gridSize + gridSize - eyeSize, pupilSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                } else if (direction === 'left') {
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + eyeSize, segment.y * gridSize + eyeSize, eyeSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + eyeSize, segment.y * gridSize + gridSize - eyeSize, eyeSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#000000";
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + eyeSize, segment.y * gridSize + eyeSize, pupilSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + eyeSize, segment.y * gridSize + gridSize - eyeSize, pupilSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                } else if (direction === 'up') {
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + eyeSize, segment.y * gridSize + eyeSize, eyeSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + gridSize - eyeSize, segment.y * gridSize + eyeSize, eyeSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#000000";
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + eyeSize, segment.y * gridSize + eyeSize, pupilSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + gridSize - eyeSize, segment.y * gridSize + eyeSize, pupilSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                } else if (direction === 'down') {
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + eyeSize, segment.y * gridSize + gridSize - eyeSize, eyeSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + gridSize - eyeSize, segment.y * gridSize + gridSize - eyeSize, eyeSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#000000";
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + eyeSize, segment.y * gridSize + gridSize - eyeSize, pupilSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + gridSize - eyeSize, segment.y * gridSize + gridSize - eyeSize, pupilSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        });

        boxes.forEach(box => {
            ctx.fillStyle = "#ff5555";
            ctx.fillRect(box.x * gridSize, box.y * gridSize, gridSize - 2, gridSize - 2);
        });

        document.getElementById('score').textContent = `Score: ${score}`;
        document.getElementById('potentialBST').textContent = `Potential BST: ${(score / 100 * 5).toFixed(2)}`;
        document.getElementById('gameRewards').textContent = `Game Rewards: ${gameRewards} BST`;
    }

    async function move() {
        let head = { x: snake[0].x, y: snake[0].y };
        if (direction === 'right') head.x++;
        if (direction === 'left') head.x--;
        if (direction === 'up') head.y--;
        if (direction === 'down') head.y++;

        if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight || snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            clearInterval(gameInterval);
            gameInterval = null;
            showGameOverPopup();
            return;
        }

        snake.unshift(head);
        const eatenBoxIndex = boxes.findIndex(box => box.x === head.x && box.y === head.y);
        if (eatenBoxIndex !== -1) {
            score += 10;
            boxes.splice(eatenBoxIndex, 1);
            if (score % 100 === 0) {
                const reward = 5;
                const referrerReward = reward * 0.01;
                playerData.pendingRewards += reward;
                gameRewards += reward;
                playerData.totalRewards += reward;

                playerData.rewardHistory.push({ amount: reward, timestamp: Date.now(), rewardType: "Game", referee: "N/A" });
                if (playerData.pendingReferral) {
                    playerData.pendingReferrerReward += referrerReward;
                    playerData.referralRewards += referrerReward;
                    playerData.totalReferrals += 1;
                    playerData.totalRewards += referrerReward;
                    playerData.rewardHistory.push({ amount: referrerReward, timestamp: Date.now(), rewardType: "Referral", referee: playerData.pendingReferral });
                }

                currentSnakeSpeed = Math.max(50, currentSnakeSpeed * 0.995);
                clearInterval(gameInterval);
                gameInterval = setInterval(move, currentSnakeSpeed);
            }
            if (boxes.length < 3) generateBoxes();
        } else {
            snake.pop();
        }
        draw();
        updatePlayerHistoryUI();
        localStorage.setItem("playerData", JSON.stringify(playerData));
    }

    function showGameOverPopup() {
        let popup = document.getElementById("gameOverPopup");
        if (!popup) {
            popup = document.createElement("div");
            popup.id = "gameOverPopup";
            popup.innerHTML = `
                <h2>Game Over!</h2>
                <p>Score: ${score}</p>
                <p>Potential BST: ${(score / 100 * 5).toFixed(2)}</p>
                <p>Rewards: ${gameRewards} BST</p>
                <button id="startNewGame">Start New Game</button>
            `;
            document.body.appendChild(popup);
        }
        popup.style.display = "block";
        document.getElementById("startNewGame").addEventListener("click", resetGame);
    }

    async function resetGame() {
        if (gameInterval) clearInterval(gameInterval);
        playerData.gamesPlayed += 1;
        score = 0;
        gameRewards = 0;
        snake = [{ x: 10, y: 10 }];
        direction = 'right';
        currentSnakeSpeed = baseSnakeSpeed;
        generateBoxes();
        updatePlayerHistoryUI();
        localStorage.setItem("playerData", JSON.stringify(playerData));
        draw();
        const popup = document.getElementById("gameOverPopup");
        if (popup) popup.style.display = "none";
        gameInterval = setInterval(move, currentSnakeSpeed);
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowUp' && direction !== 'down') direction = 'up';
        if (event.key === 'ArrowDown' && direction !== 'up') direction = 'down';
        if (event.key === 'ArrowLeft' && direction !== 'right') direction = 'left';
        if (event.key === 'ArrowRight' && direction !== 'left') direction = 'right';
    });

    window.addEventListener('resize', updateCanvasSize);

    // Blockchain Functions
    async function fetchWithdrawalFee() {
        if (!contract) return;
        try {
            const feeWei = await contract.withdrawalFeeInBnb();
            WITHDRAWAL_FEE_BNB = ethers.formatUnits(feeWei, 18);
        } catch (error) {
            console.error("Error fetching withdrawal fee:", error);
        }
    }

    async function connectWallet() {
        if (!window.ethereum) return updateStatus("Please install MetaMask!");
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const network = await provider.getNetwork();
            if (network.chainId.toString() !== TARGET_NETWORK_ID) {
                await window.ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: `0x${parseInt(TARGET_NETWORK_ID).toString(16)}` }],
                });
            }

            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            account = accounts[0];
            const signer = await provider.getSigner();
            contract = new ethers.Contract(contractAddress, contractABI, signer);

            document.getElementById("connectWallet").style.display = "none";
            document.getElementById("disconnectWallet").style.display = "block";
            document.getElementById("walletAddress").textContent = `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`;

            await loadPlayerHistory();
            await fetchWithdrawalFee();
            updatePlayerHistoryUI();
            updateStatus("Wallet connected successfully!");
        } catch (error) {
            updateStatus("Failed to connect wallet: " + error.message);
        }
    }

    function disconnectWallet() {
        account = null;
        contract = null;
        document.getElementById("connectWallet").style.display = "block";
        document.getElementById("disconnectWallet").style.display = "none";
        document.getElementById("walletAddress").textContent = "";
        updatePlayerHistoryUI();
        updateStatus("Wallet disconnected!");
    }

    async function claimWelcomeBonus() {
        if (!contract || !account) return updateStatus("Connect wallet first!");
        if (playerData.hasClaimedWelcomeBonus) return updateStatus("Welcome bonus already claimed!");

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const balance = await provider.getBalance(account);
            const feeWei = ethers.parseUnits(WITHDRAWAL_FEE_BNB, 18);
            if (balance < feeWei) return updateStatus(`Insufficient BNB. Need ${WITHDRAWAL_FEE_BNB} BNB for fee.`);

            const tx = await contract.claimWelcomeBonus({ value: feeWei, gasLimit: 300000 });
            await tx.wait();

            playerData.hasClaimedWelcomeBonus = true;
            playerData.totalRewards += 100;
            playerData.rewardHistory.push({ amount: 100, timestamp: Date.now(), rewardType: "Welcome Bonus", referee: "N/A" });
            playerData.walletBalance = Number(ethers.formatUnits(await contract.balanceOf(account), 18));
            updatePlayerHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
            updateStatus("Welcome bonus of 100 BST claimed!");
        } catch (error) {
            updateStatus("Error claiming welcome bonus: " + error.message);
        }
    }

    async function claimPendingRewards() {
        if (!contract || !account) return updateStatus("Connect wallet first!");
        if (playerData.pendingRewards < 10) return updateStatus("Minimum 10 BST required to claim!");

        try {
            await fetchWithdrawalFee();
            const feeWei = ethers.parseUnits(WITHDRAWAL_FEE_BNB, 18);
            const tx = await contract.claimAllRewards(
                ethers.parseUnits(playerData.pendingRewards.toString(), 18),
                playerData.pendingReferral || "0x0000000000000000000000000000000000000000",
                { value: feeWei, gasLimit: 300000 }
            );
            await tx.wait();

            playerData.totalRewards += playerData.pendingRewards;
            playerData.referralRewards += playerData.pendingReferrerReward;
            playerData.pendingRewards = 0;
            playerData.pendingReferrerReward = 0;
            playerData.pendingReferral = null;
            playerData.walletBalance = Number(ethers.formatUnits(await contract.balanceOf(account), 18));
            updatePlayerHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
            updateStatus("Rewards claimed successfully!");
        } catch (error) {
            updateStatus("Error claiming rewards: " + error.message);
        }
    }

    async function withdrawCustomAmount() {
        if (!contract || !account) return updateStatus("Connect wallet first!");
        const amount = Number(document.getElementById("withdrawAmount").value);
        if (!amount || amount < 10) return updateStatus("Enter at least 10 BST!");
        if (amount > 1000) return updateStatus("Maximum withdrawal limit is 1000 BST!");
        if (amount > playerData.pendingRewards) return updateStatus("Insufficient pending rewards!");

        try {
            await fetchWithdrawalFee();
            const provider = new ethers.BrowserProvider(window.ethereum);
            const balance = await provider.getBalance(account);
            const feeWei = ethers.parseUnits(WITHDRAWAL_FEE_BNB, 18);
            if (balance < feeWei) return updateStatus(`Insufficient BNB. Need ${WITHDRAWAL_FEE_BNB} BNB for fee.`);

            const tx = await contract.withdrawAllTokens({ value: feeWei, gasLimit: 300000 });
            await tx.wait();

            playerData.pendingRewards -= amount;
            playerData.walletBalance = Number(ethers.formatUnits(await contract.balanceOf(account), 18));
            playerData.rewardHistory.push({ amount: amount, timestamp: Date.now(), rewardType: "Withdrawal", referee: "N/A" });
            updatePlayerHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
            document.getElementById("withdrawAmount").value = "";
            updateStatus(`${amount} BST withdrawn successfully!`);
        } catch (error) {
            updateStatus("Error withdrawing amount: " + error.message);
        }
    }

    function generateReferralLink() {
        if (!account) return updateStatus("Connect wallet first!");
        const referralLink = `${window.location.origin}${window.location.pathname}?ref=${account}`;
        navigator.clipboard.writeText(referralLink).then(() => updateStatus("Referral link copied: " + referralLink));
    }

    async function loadPlayerHistory() {
        if (!contract || !account) return;
        try {
            const history = await contract.playerHistory(account);
            playerData.gamesPlayed = Number(history.gamesPlayed);
            playerData.totalRewards = Number(ethers.formatUnits(history.totalRewards, 18));
            playerData.totalReferrals = Number(history.totalReferrals);
            playerData.referralRewards = Number(ethers.formatUnits(history.referralRewards, 18));
            playerData.hasClaimedWelcomeBonus = history.hasClaimedWelcomeBonus;
            playerData.walletBalance = Number(ethers.formatUnits(await contract.balanceOf(account), 18));

            const rewards = await contract.getRewardHistory(account);
            playerData.rewardHistory = rewards.map(r => ({
                amount: Number(ethers.formatUnits(r.amount, 18)),
                timestamp: Number(r.timestamp) * 1000,
                rewardType: r.rewardType,
                referee: r.referee === "0x0000000000000000000000000000000000000000" ? "N/A" : r.referee
            }));

            updatePlayerHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
        } catch (error) {
            updateStatus("Error loading player history: " + error.message);
        }
    }

    function updatePlayerHistoryUI() {
        const elements = {
            gamesPlayed: `Games Played: ${playerData.gamesPlayed}`,
            totalGameRewards: `Total Game Rewards: ${playerData.totalRewards.toFixed(2)} BST`,
            totalReferrals: `Total Referrals: ${playerData.totalReferrals}`,
            referralRewards: `Referral Rewards: ${playerData.referralRewards.toFixed(2)} BST`,
            pendingRewardsText: `Pending Rewards: ${playerData.pendingRewards.toFixed(2)} BST`,
            walletBalance: `Wallet Balance: ${account ? playerData.walletBalance.toFixed(2) : "0"} BST`,
            walletAddress: account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : ""
        };

        for (const [id, value] of Object.entries(elements)) {
            document.getElementById(id).textContent = value;
        }

        const historyList = document.getElementById("rewardHistoryList");
        historyList.innerHTML = "";
        if (account) {
            playerData.rewardHistory.forEach(entry => {
                const li = document.createElement("li");
                li.textContent = `${entry.rewardType}: ${entry.amount.toFixed(2)} BST on ${new Date(entry.timestamp).toLocaleString()}`;
                historyList.appendChild(li);
            });
        }
    }

    function updateStatus(message) {
        document.getElementById("status").textContent = message;
    }

    // Event Listeners
    document.getElementById("connectWallet").addEventListener("click", connectWallet);
    document.getElementById("disconnectWallet").addEventListener("click", disconnectWallet);
    document.getElementById("playGame").addEventListener("click", () => {
        if (!account) return updateStatus("Connect wallet first!");
        enterFullscreen();
        resetGame();
    });
    document.getElementById("welcomeBonusButton").addEventListener("click", claimWelcomeBonus);
    document.getElementById("claimGameRewards").addEventListener("click", claimPendingRewards);
    document.getElementById("withdrawButton").addEventListener("click", withdrawCustomAmount);
    document.getElementById("getReferralLink").addEventListener("click", generateReferralLink);

    // Initial Setup
    updateCanvasSize();
    generateBoxes();
    draw();
    updatePlayerHistoryUI();
});
