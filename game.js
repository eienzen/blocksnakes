document.addEventListener("DOMContentLoaded", () => {
    let account = null;
    let contract = null;
    let gameInterval = null;
    const TARGET_NETWORK_ID = "97"; // BNB Testnet Chain ID
    let WITHDRAWAL_FEE_BNB = "0.0002"; // डिफॉल्ट फीस

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

    const contractAddress = "0xb7d71032C473adB99dB417F966B6Cd24BCc5FD40"; // अपने डिप्लॉय्ड कॉन्ट्रैक्ट का पता डालें
    const contractABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
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
				"name": "bnbAmount",
				"type": "uint256"
			}
		],
		"name": "BnbBonusTransferred",
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
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "claimWelcomeBonus",
		"outputs": [],
		"stateMutability": "payable",
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
				"name": "player",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "bnbAmount",
				"type": "uint256"
			}
		],
		"name": "transferBnbBonus",
		"outputs": [],
		"stateMutability": "payable",
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
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "withdrawCustomAmount",
		"outputs": [],
		"stateMutability": "payable",
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

    // कैनवस और गेम लॉजिक
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
        const screenHeight = window.innerHeight * 0.7;
        gridSize = Math.min(screenWidth / gridWidth, screenHeight / gridHeight);
        canvas.width = gridSize * gridWidth;
        canvas.height = gridSize * gridHeight;
        canvas.style.width = `${canvas.width}px`;
        canvas.style.height = `${canvas.height}px`;
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

        if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
            clearInterval(gameInterval);
            gameInterval = null;
            showGameOverPopup();
            return;
        }

        if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
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
                <p id="finalScore">Score: ${score}</p>
                <p id="finalPotentialBST">Potential BST: ${(score / 100 * 5).toFixed(2)}</p>
                <p id="finalRewards">Rewards: ${gameRewards} BST</p>
                <button id="startNewGame">Start New Game</button>
            `;
            popup.style.cssText = "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: #2a2a5d; color: #fff; padding: 20px; border: 2px solid #00ffcc; border-radius: 10px;";
            document.body.appendChild(popup);
            document.getElementById("startNewGame").addEventListener("click", resetGame);
        }
        popup.style.display = "block";
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
    }

    let touchStartX = 0;
    let touchStartY = 0;
    let lastMoveTime = 0;
    const touchThreshold = 20;

    canvas.addEventListener('touchstart', (event) => {
        event.preventDefault();
        const touch = event.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        lastMoveTime = Date.now();
    });

    canvas.addEventListener('touchmove', (event) => {
        event.preventDefault();
        const touch = event.touches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        const now = Date.now();

        if (now - lastMoveTime < 100) return;

        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > touchThreshold) {
            if (deltaX > 0 && direction !== 'left') direction = 'right';
            else if (deltaX < 0 && direction !== 'right') direction = 'left';
            lastMoveTime = now;
        } else if (Math.abs(deltaY) > touchThreshold) {
            if (deltaY > 0 && direction !== 'up') direction = 'down';
            else if (deltaY < 0 && direction !== 'down') direction = 'up';
            lastMoveTime = now;
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowUp' && direction !== 'down') direction = 'up';
        if (event.key === 'ArrowDown' && direction !== 'up') direction = 'down';
        if (event.key === 'ArrowLeft' && direction !== 'right') direction = 'left';
        if (event.key === 'ArrowRight' && direction !== 'left') direction = 'right';
    });

    window.addEventListener('resize', updateCanvasSize);

    updateCanvasSize();
    generateBoxes();
    draw();

    const playGameBtn = document.getElementById('playGame');
    if (playGameBtn) {
        playGameBtn.addEventListener('click', () => {
            if (!account) return alert("Please connect your wallet!");
            enterFullscreen();
            resetGame();
            if (!gameInterval) gameInterval = setInterval(move, currentSnakeSpeed);
        });
    }

    function generateReferralLink() {
        if (!account) return alert("Connect your wallet first!");
        const referralLink = `${window.location.origin}${window.location.pathname}?ref=${account}`;
        navigator.clipboard.writeText(referralLink).then(() => alert("Referral link copied: " + referralLink));
    }

    async function fetchWithdrawalFee() {
        if (!contract) return;
        try {
            const feeWei = await contract.withdrawalFeeInBnb();
            WITHDRAWAL_FEE_BNB = ethers.formatUnits(feeWei, 18);
            console.log("Updated withdrawal fee:", WITHDRAWAL_FEE_BNB, "BNB");
        } catch (error) {
            console.error("Error fetching withdrawal fee:", error);
        }
    }

    async function claimWelcomeBonus() {
        if (!contract || !account) return alert("Connect your wallet first!");
        if (playerData.hasClaimedWelcomeBonus) return alert("Welcome bonus already claimed!");

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const balance = await provider.getBalance(account);
            const feeWei = ethers.parseUnits(WITHDRAWAL_FEE_BNB, 18);
            if (balance < feeWei) {
                return alert(`Insufficient BNB balance. You need at least ${WITHDRAWAL_FEE_BNB} BNB for the fee.`);
            }

            const contractBalance = await contract.contractBalance();
            const welcomeBonusAmount = ethers.parseUnits("100", 18);
            if (contractBalance < welcomeBonusAmount) {
                return alert("Contract does not have enough BST tokens to pay the welcome bonus.");
            }

            console.log("Attempting to claim welcome bonus...");
            const tx = await contract.claimWelcomeBonus({ value: feeWei, gasLimit: 500000 });
            const receipt = await tx.wait();
            console.log("Transaction successful:", receipt);

            playerData.hasClaimedWelcomeBonus = true;
            playerData.totalRewards += 100;
            playerData.rewardHistory.push({ amount: 100, timestamp: Date.now(), rewardType: "Welcome Bonus", referee: "N/A" });
            playerData.walletBalance = Number(ethers.formatUnits(await contract.balanceOf(account), 18));
            updatePlayerHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
            alert("Welcome bonus of 100 BST claimed!");
        } catch (error) {
            console.error("Error claiming welcome bonus:", error);
            alert("Failed to claim welcome bonus: " + (error.message || "Unknown error"));
        }
    }

    async function claimPendingRewards() {
    if (!contract || !account) return alert("Connect your wallet first!");
    if (playerData.pendingRewards < 10) return alert("Minimum 10 BST required to claim!");

    try {
        await fetchWithdrawalFee();
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(account);
        const feeWei = ethers.parseUnits(WITHDRAWAL_FEE_BNB, 18);
        if (balance < feeWei) {
            return alert(`Insufficient BNB balance. You need at least ${WITHDRAWAL_FEE_BNB} BNB for the fee.`);
        }

        const contractBalance = await contract.contractBalance();
        const rewardWei = ethers.parseUnits(playerData.pendingRewards.toString(), 18);
        if (contractBalance < rewardWei) {
            return alert("Contract does not have enough BST tokens. Ask the owner to mint more.");
        }

        const gasPrice = await provider.getGasPrice();
        console.log(`Attempting to claim ${playerData.pendingRewards} BST rewards with referrer: ${playerData.pendingReferral || 'none'}`);
        const tx = await contract.claimAllRewards(
            rewardWei,
            playerData.pendingReferral || "0x0000000000000000000000000000000000000000",
            { value: feeWei, gasLimit: 500000, gasPrice }
        );
        const receipt = await tx.wait();
        if (receipt.status === 0) {
            throw new Error("Transaction failed: reverted by the EVM");
        }
        console.log("Rewards claimed successfully:", receipt.transactionHash);

        playerData.totalRewards += playerData.pendingRewards;
        playerData.referralRewards += playerData.pendingReferrerReward;
        playerData.pendingRewards = 0;
        playerData.pendingReferrerReward = 0;
        playerData.pendingReferral = null;
        playerData.walletBalance = Number(ethers.formatUnits(await contract.balanceOf(account), 18));
        updatePlayerHistoryUI();
        localStorage.setItem("playerData", JSON.stringify(playerData));
        alert("Rewards claimed successfully!");
    } catch (error) {
        console.error("Error claiming rewards:", error);
        alert("Failed to claim rewards: " + (error.reason || error.message || "Transaction reverted. Check contract balance or BNB fee."));
    }
}
            }

            const contractBalance = await contract.contractBalance();
            const rewardWei = ethers.parseUnits(playerData.pendingRewards.toString(), 18);
            if (contractBalance < rewardWei) {
                return alert("Contract does not have enough BST tokens.");
            }

            console.log(`Attempting to claim ${playerData.pendingRewards} BST rewards...`);
            const tx = await contract.claimAllRewards(
                rewardWei,
                playerData.pendingReferral || "0x0000000000000000000000000000000000000000",
                { value: feeWei, gasLimit: 300000 }
            );
            const receipt = await tx.wait();
            console.log("Rewards claimed successfully:", receipt);

            playerData.totalRewards += playerData.pendingRewards;
            playerData.referralRewards += playerData.pendingReferrerReward;
            playerData.pendingRewards = 0;
            playerData.pendingReferrerReward = 0;
            playerData.pendingReferral = null;
            playerData.walletBalance = Number(ethers.formatUnits(await contract.balanceOf(account), 18));
            updatePlayerHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
            alert("Rewards claimed successfully!");
        } catch (error) {
            console.error("Error claiming rewards:", error);
            alert("Failed to claim rewards: " + (error.message || "Unknown error"));
        }
    }

    async function withdrawCustomAmount() {
        if (!contract || !account) return alert("Connect your wallet first!");
        const amount = Number(document.getElementById("withdrawAmount").value);
        if (!amount || amount < 10) return alert("Please enter an amount of at least 10 BST!");
        if (amount > 1000) return alert("Maximum withdrawal limit is 1000 BST!");
        if (amount > playerData.pendingRewards) return alert("Insufficient pending rewards!");

        try {
            await fetchWithdrawalFee();
            const provider = new ethers.BrowserProvider(window.ethereum);
            const balance = await provider.getBalance(account);
            const feeWei = ethers.parseUnits(WITHDRAWAL_FEE_BNB, 18);
            if (balance < feeWei) {
                return alert(`Insufficient BNB balance. You need at least ${WITHDRAWAL_FEE_BNB} BNB for the fee.`);
            }

            const contractBalance = await contract.contractBalance();
            const withdrawWei = ethers.parseUnits(amount.toString(), 18);
            if (contractBalance < withdrawWei) {
                return alert("Contract does not have enough BST tokens.");
            }

            console.log(`Attempting to withdraw ${amount} BST...`);
            const tx = await contract.withdrawCustomAmount(withdrawWei, { value: feeWei, gasLimit: 300000 });
            const receipt = await tx.wait();
            console.log("Withdrawal successful:", receipt);

            playerData.pendingRewards -= amount;
            playerData.totalRewards += amount;
            playerData.walletBalance = Number(ethers.formatUnits(await contract.balanceOf(account), 18));
            playerData.rewardHistory.push({ amount: amount, timestamp: Date.now(), rewardType: "Custom Withdrawal", referee: "N/A" });
            updatePlayerHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
            document.getElementById("withdrawAmount").value = "";
            alert(`${amount} BST withdrawn successfully!`);
        } catch (error) {
            console.error("Error withdrawing amount:", error);
            alert("Failed to withdraw: " + (error.message || "Unknown error"));
        }
    }

    async function mintTokens() {
        if (!contract || !account) return alert("Connect your wallet first!");

        const ownerAddress = "0xYourOwnerAddressHere"; // ओनर का पता अपडेट करें
        if (account.toLowerCase() !== ownerAddress.toLowerCase()) return alert("Only the owner can mint tokens!");

        const amount = Number(document.getElementById("mintAmount").value);
        if (!amount || amount <= 0) return alert("Please enter a valid BST amount greater than 0!");

        try {
            const mintWei = ethers.parseUnits(amount.toString(), 18);
            console.log(`Attempting to mint ${amount} BST...`);
            const tx = await contract.mintTokens(mintWei, { gasLimit: 300000 });
            const receipt = await tx.wait();
            console.log("Tokens minted successfully:", receipt);

            playerData.walletBalance = Number(ethers.formatUnits(await contract.balanceOf(account), 18));
            updatePlayerHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
            document.getElementById("mintAmount").value = "";
            alert(`${amount} BST minted successfully!`);
        } catch (error) {
            console.error("Error minting tokens:", error);
            alert("Failed to mint tokens: " + (error.message || "Unknown error"));
        }
    }

    async function transferBnbBonus() {
        if (!contract || !account) return alert("Connect your wallet first!");

        const ownerAddress = "0xYourOwnerAddressHere"; // ओनर का पता अपडेट करें
        if (account.toLowerCase() !== ownerAddress.toLowerCase()) return alert("Only the owner can transfer BNB bonuses!");

        const playerAddress = document.getElementById("bonusPlayerAddress").value;
        const bnbAmount = Number(document.getElementById("bnbBonusAmount").value);

        if (!ethers.isAddress(playerAddress)) return alert("Please enter a valid player address!");
        if (!bnbAmount || bnbAmount <= 0) return alert("Please enter a valid BNB amount greater than 0!");

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const balance = await provider.getBalance(account);
            const bnbWei = ethers.parseUnits(bnbAmount.toString(), 18);
            if (balance < bnbWei) {
                return alert(`Insufficient BNB balance. You need at least ${bnbAmount} BNB.`);
            }

            console.log(`Attempting to transfer ${bnbAmount} BNB to ${playerAddress}...`);
            const tx = await contract.transferBnbBonus(playerAddress, bnbWei, { value: bnbWei, gasLimit: 300000 });
            const receipt = await tx.wait();
            console.log("BNB Bonus transfer successful:", receipt);

            playerData.rewardHistory.push({ amount: bnbAmount, timestamp: Date.now(), rewardType: "BNB Bonus", referee: playerAddress });

            if (account.toLowerCase() === playerAddress.toLowerCase()) {
                const totalBnbBonus = playerData.rewardHistory
                    .filter(r => r.rewardType === "BNB Bonus")
                    .reduce((sum, r) => sum + r.amount, 0);
                const banner = document.getElementById("bnbBonusBanner");
                document.getElementById("bnbBonusTotal").textContent = totalBnbBonus.toFixed(2);
                banner.style.display = "block";
                setTimeout(() => { banner.style.display = "none"; }, 10000);
            }

            updatePlayerHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
            document.getElementById("bonusPlayerAddress").value = "";
            document.getElementById("bnbBonusAmount").value = "";
            alert(`${bnbAmount} BNB bonus transferred to ${playerAddress} successfully!`);
        } catch (error) {
            console.error("Error transferring BNB bonus:", error);
            alert("Failed to transfer BNB bonus: " + (error.message || "Unknown error"));
        }
    }

    async function connectWallet() {
        if (!window.ethereum) return alert("Please install MetaMask!");
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const network = await provider.getNetwork();
            if (network.chainId.toString() !== TARGET_NETWORK_ID) {
                try {
                    await window.ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: `0x${parseInt(TARGET_NETWORK_ID).toString(16)}` }],
                    });
                } catch (switchError) {
                    if (switchError.code === 4902) {
                        await window.ethereum.request({
                            method: "wallet_addEthereumChain",
                            params: [{
                                chainId: `0x${parseInt(TARGET_NETWORK_ID).toString(16)}`,
                                chainName: "BNB Testnet",
                                nativeCurrency: { name: "BNB", symbol: "tBNB", decimals: 18 },
                                rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545/"],
                                blockExplorerUrls: ["https://testnet.bscscan.com"],
                            }],
                        });
                    } else {
                        throw switchError;
                    }
                }
            }

            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            account = accounts[0];

            if (playerData.walletAddress && playerData.walletAddress !== account) {
                playerData = {
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
                    walletAddress: account
                };
            } else {
                playerData.walletAddress = account;
            }

            const signer = await provider.getSigner();
            contract = new ethers.Contract(contractAddress, contractABI, signer);

            const connectBtn = document.getElementById("connectWallet");
            const disconnectBtn = document.getElementById("disconnectWallet");
            const walletAddr = document.getElementById("walletAddress");
            if (connectBtn) connectBtn.style.display = "none";
            if (disconnectBtn) disconnectBtn.style.display = "block";
            if (walletAddr) walletAddr.textContent = `Connected: ${account.slice(0, 6)}...`;

            const ownerAddress = "0xYourOwnerAddressHere"; // ओनर का पता अपडेट करें
            if (account.toLowerCase() === ownerAddress.toLowerCase()) {
                document.getElementById("ownerControls").style.display = "block";
            }

            await loadPlayerHistory();
            await fetchWithdrawalFee();
            updatePlayerHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
            alert("Wallet connected successfully!");
        } catch (error) {
            console.error("Error connecting wallet:", error);
            alert("Failed to connect wallet: " + (error.message || "Unknown error"));
        }
    }

    function disconnectWallet() {
        account = null;
        contract = null;
        const connectBtn = document.getElementById("connectWallet");
        const disconnectBtn = document.getElementById("disconnectWallet");
        const walletAddr = document.getElementById("walletAddress");
        if (connectBtn) connectBtn.style.display = "block";
        if (disconnectBtn) disconnectBtn.style.display = "none";
        if (walletAddr) walletAddr.textContent = "";
        document.getElementById("ownerControls").style.display = "none";
        updatePlayerHistoryUI();
        alert("Wallet disconnected!");
    }

    async function loadPlayerHistory() {
        if (!contract || !account) {
            updatePlayerHistoryUI();
            return;
        }
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

            const totalBnbBonus = playerData.rewardHistory
                .filter(r => r.rewardType === "BNB Bonus")
                .reduce((sum, r) => sum + r.amount, 0);
            if (totalBnbBonus > 0) {
                const banner = document.getElementById("bnbBonusBanner");
                document.getElementById("bnbBonusTotal").textContent = totalBnbBonus.toFixed(2);
                banner.style.display = "block";
                setTimeout(() => { banner.style.display = "none"; }, 10000);
            }

            updatePlayerHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
        } catch (error) {
            console.error("Error loading player history:", error);
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
            walletAddress: account ? `Connected: ${account.slice(0, 6)}...` : ""
        };

        for (const [id, value] of Object.entries(elements)) {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        }

        const historyList = document.getElementById("rewardHistoryList");
        if (historyList) {
            historyList.innerHTML = "";
            if (account) {
                playerData.rewardHistory.forEach(entry => {
                    const li = document.createElement("li");
                    const amountDisplay = entry.rewardType === "BNB Bonus" ? `${entry.amount} BNB` : `${entry.amount.toFixed(2)} BST`;
                    li.textContent = `${entry.rewardType}: ${amountDisplay} on ${new Date(entry.timestamp).toLocaleString()}${entry.referee !== "N/A" ? ` (Referee: ${entry.referee})` : ""}`;
                    historyList.appendChild(li);
                });
            }
        }
    }

    const connectBtn = document.getElementById("connectWallet");
    const disconnectBtn = document.getElementById("disconnectWallet");
    const referralBtn = document.getElementById("getReferralLink");
    const claimRewardsBtn = document.getElementById("claimGameRewards");
    const welcomeBtn = document.getElementById("welcomeBonusButton");
    const withdrawBtn = document.getElementById("withdrawButton");
    const mintBtn = document.getElementById("mintTokensButton");
    const transferBnbBtn = document.getElementById("transferBnbBonusButton");

    if (connectBtn) connectBtn.addEventListener("click", connectWallet);
    if (disconnectBtn) disconnectBtn.addEventListener("click", disconnectWallet);
    if (referralBtn) referralBtn.addEventListener("click", generateReferralLink);
    if (claimRewardsBtn) claimRewardsBtn.addEventListener("click", claimPendingRewards);
    if (welcomeBtn) welcomeBtn.addEventListener("click", claimWelcomeBonus);
    if (withdrawBtn) withdrawBtn.addEventListener("click", withdrawCustomAmount);
    if (mintBtn) mintBtn.addEventListener("click", mintTokens);
    if (transferBnbBtn) transferBnbBtn.addEventListener("click", transferBnbBonus);

    updatePlayerHistoryUI();
});
