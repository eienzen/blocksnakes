require('dotenv').config();

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded, initializing game...");

    let account = null;
    let contract = null;
    let animationFrameId = null;
    const TARGET_NETWORK_ID = "97";
    let WITHDRAWAL_FEE_BNB = process.env.WITHDRAWAL_FEE_BNB || "0.0002";
    let isGameRunning = false;

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
        walletAddress: null,
        isRewardSubmitted: false
    };

    const urlParams = new URLSearchParams(window.location.search);
    const referrerAddress = urlParams.get("ref");
    if (referrerAddress && !playerData.pendingReferral && ethers.isAddress(referrerAddress)) {
        playerData.pendingReferral = referrerAddress;
    }

    const contractAddress = process.env.CONTRACT_ADDRESS;
    const contractABI = [
	{
		"inputs": [],
		"name": "ECDSAInvalidSignature",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "length",
				"type": "uint256"
			}
		],
		"name": "ECDSAInvalidSignatureLength",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "s",
				"type": "bytes32"
			}
		],
		"name": "ECDSAInvalidSignatureS",
		"type": "error"
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
				"name": "boxesEaten",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "reward",
				"type": "uint256"
			}
		],
		"name": "GamePlayed",
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
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "reward",
				"type": "uint256"
			}
		],
		"name": "ReferralReward",
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
		"name": "RewardClaimed",
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
			},
			{
				"internalType": "bytes32",
				"name": "messageHash",
				"type": "bytes32"
			},
			{
				"internalType": "bytes",
				"name": "signature",
				"type": "bytes"
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
				"name": "rewardAmount",
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
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "bytes32",
				"name": "messageHash",
				"type": "bytes32"
			},
			{
				"internalType": "bytes",
				"name": "signature",
				"type": "bytes"
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
				"internalType": "address",
				"name": "_newOracle",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "messageHash",
				"type": "bytes32"
			},
			{
				"internalType": "bytes",
				"name": "signature",
				"type": "bytes"
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
			},
			{
				"internalType": "bytes32",
				"name": "messageHash",
				"type": "bytes32"
			},
			{
				"internalType": "bytes",
				"name": "signature",
				"type": "bytes"
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
				"name": "_newOwner",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "messageHash",
				"type": "bytes32"
			},
			{
				"internalType": "bytes",
				"name": "signature",
				"type": "bytes"
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
				"name": "_newFee",
				"type": "uint256"
			},
			{
				"internalType": "bytes32",
				"name": "messageHash",
				"type": "bytes32"
			},
			{
				"internalType": "bytes",
				"name": "signature",
				"type": "bytes"
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
				"name": "initialOracle",
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
				"name": "",
				"type": "address"
			}
		],
		"name": "internalBalances",
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
		"name": "withdrawalFee",
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
    const gameOracleAddress = process.env.GAME_ORACLE_ADDRESS;

    let gameOracleProvider;
    try {
        gameOracleProvider = new ethers.JsonRpcProvider(process.env.GAME_ORACLE_RPC_URL, { chainId: 97, name: "BNB Testnet" });
        console.log("Connected to primary JSON-RPC provider.");
    } catch (error) {
        console.error("Failed to connect to primary JSON-RPC URL:", error);
        gameOracleProvider = new ethers.JsonRpcProvider(process.env.GAME_ORACLE_RPC_URL_SECONDARY, { chainId: 97, name: "BNB Testnet" });
        console.log("Connected to secondary JSON-RPC provider.");
    }

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas ? canvas.getContext("2d") : null;
    const gridWidth = 30;
    const gridHeight = 20;
    let gridSize;
    let snake = [{ x: 10, y: 10 }];
    let boxes = [];
    let direction = "right";
    let boxesEaten = 0;
    let gameRewards = 0;
    const baseSnakeSpeed = 150;
    let lastMoveTime = 0;

    const eatingSound = document.getElementById("eatingSound");
    const gameOverSound = document.getElementById("gameOverSound");
    const victorySound = document.getElementById("victorySound");

    function showLoading(show) {
        document.getElementById("loadingIndicator").style.display = show ? "block" : "none";
    }

    function updateCanvasSize() {
        if (!canvas) return console.error("Canvas not available!");
        const screenWidth = window.innerWidth * 0.9;
        const screenHeight = window.innerHeight * 0.7;
        gridSize = Math.min(screenWidth / gridWidth, screenHeight / gridHeight);
        canvas.width = gridSize * gridWidth;
        canvas.height = gridSize * gridHeight;
        canvas.style.width = `${canvas.width}px`;
        canvas.style.height = `${canvas.height}px`;
        draw();
    }

    function enterFullscreen() {
        if (document.fullscreenEnabled && canvas) {
            canvas.requestFullscreen().catch(err => {
                console.warn("Fullscreen failed, continuing without fullscreen:", err);
                updateCanvasSize();
            });
        } else {
            updateCanvasSize();
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
        ctx.fillStyle = "#0a0a23";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        snake.forEach((segment, index) => {
            ctx.fillStyle = index === 0 ? "#ffd700" : "#800080";
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);

            if (index === 0) {
                ctx.beginPath();
                ctx.arc(segment.x * gridSize + gridSize * 0.25, segment.y * gridSize + gridSize * 0.3, gridSize * 0.1, 0, Math.PI * 2);
                ctx.fillStyle = "white";
                ctx.fill();
                ctx.beginPath();
                ctx.arc(segment.x * gridSize + gridSize * 0.25, segment.y * gridSize + gridSize * 0.3, gridSize * 0.05, 0, Math.PI * 2);
                ctx.fillStyle = "black";
                ctx.fill();

                ctx.beginPath();
                ctx.arc(segment.x * gridSize + gridSize * 0.75, segment.y * gridSize + gridSize * 0.3, gridSize * 0.1, 0, Math.PI * 2);
                ctx.fillStyle = "white";
                ctx.fill();
                ctx.beginPath();
                ctx.arc(segment.x * gridSize + gridSize * 0.75, segment.y * gridSize + gridSize * 0.3, gridSize * 0.05, 0, Math.PI * 2);
                ctx.fillStyle = "black";
                ctx.fill();
            }
        });

        boxes.forEach(box => {
            ctx.fillStyle = "#ff5555";
            ctx.fillRect(box.x * gridSize, box.y * gridSize, gridSize - 2, gridSize - 2);
        });

        document.getElementById("boxesEaten").textContent = `Boxes Eaten: ${boxesEaten}`;
        document.getElementById("pendingRewards").textContent = `Pending Rewards: ${playerData.pendingRewards.toFixed(2)} BST`;
        document.getElementById("pendingRewardsText").textContent = `Pending Rewards: ${playerData.pendingRewards.toFixed(2)} BST`;
    }

    function gameLoop(currentTime) {
        if (isGameRunning && ctx) {
            try {
                if (currentTime - lastMoveTime >= baseSnakeSpeed) {
                    move();
                    lastMoveTime = currentTime;
                }
                animationFrameId = requestAnimationFrame(gameLoop);
            } catch (error) {
                console.error("Game loop error:", error);
                animationFrameId = requestAnimationFrame(gameLoop);
            }
        }
    }

    async function move() {
        if (!isGameRunning || !ctx) return;

        let head = { x: snake[0].x, y: snake[0].y };
        if (direction === "right") head.x++;
        if (direction === "left") head.x--;
        if (direction === "up") head.y--;
        if (direction === "down") head.y++;

        if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
            gameOverSound.play();
            if (gameRewards > 0 && account && gameOracleContract && !playerData.isRewardSubmitted) {
                await submitGameReward(gameRewards);
                playerData.isRewardSubmitted = true;
            }
            showGameOverPopup();
            return;
        }

        snake.unshift(head);
        const eatenBoxIndex = boxes.findIndex(box => box.x === head.x && box.y === head.y);
        if (eatenBoxIndex !== -1) {
            eatingSound.play();
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
            if (boxesEaten % 10 === 0 || boxesEaten % 20 === 0 || boxesEaten % 30 === 0) victorySound.play();
        } else {
            snake.pop();
        }
        draw();
        updatePlayerHistoryUI();
        localStorage.setItem("playerData", JSON.stringify(playerData));
    }

    function showGameOverPopup() {
        const popup = document.getElementById("gameOverPopup");
        if (!popup) return;
        document.getElementById("finalBoxesEaten").textContent = `Boxes Eaten: ${boxesEaten}`;
        document.getElementById("finalRewards").textContent = `Earned BST: ${gameRewards.toFixed(2)} BST`;
        popup.style.display = "block";
        isGameRunning = false;
        document.getElementById("closePopup").onclick = () => {
            popup.style.display = "none";
        };
    }

    async function resetGame() {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        isGameRunning = false;
        console.log("Resetting game...");
        showLoading(true);

        playerData.gamesPlayed += 1;
        boxesEaten = 0;
        gameRewards = 0;
        snake = [{ x: 10, y: 10 }];
        direction = "right";
        playerData.isRewardSubmitted = false;
        generateBoxes();
        updateCanvasSize();
        draw();
        showLoading(false);
        updatePlayerHistoryUI();
        localStorage.setItem("playerData", JSON.stringify(playerData));
    }

    async function submitGameReward(rewardAmount) {
        if (!account || !gameOracleContract || playerData.isRewardSubmitted) return;
        try {
            showLoading(true);
            const tx = await gameOracleContract.claimAllRewards(
                ethers.parseUnits(rewardAmount.toString(), 18),
                account,
                playerData.pendingReferral || ethers.ZeroAddress,
                { gasLimit: 300000 }
            );
            await tx.wait();
            playerData.totalRewards += rewardAmount;
            playerData.pendingRewards += rewardAmount;
            playerData.pendingReferral = null;
            gameRewards = 0;
            playerData.isRewardSubmitted = true;
            await loadPlayerHistory();
            updatePlayerHistoryUI();
            alert(`${rewardAmount} BST rewards submitted!`);
        } catch (error) {
            console.error("Error submitting rewards:", error);
            document.getElementById("withdrawalStatus").textContent = `Error: ${error.message || error.toString()}`;
            alert("Failed to submit rewards: " + (error.message || error.toString()));
            playerData.isRewardSubmitted = false;
        } finally {
            showLoading(false);
        }
    }

    async function claimPendingRewards() {
        if (!contract || !account) return alert("Connect wallet first!");
        try {
            showLoading(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const balance = await provider.getBalance(account);
            if (balance < ethers.parseUnits(WITHDRAWAL_FEE_BNB, 18)) {
                alert(`Need ${WITHDRAWAL_FEE_BNB} BNB for fee.`);
                return;
            }
            const internalBalance = await contract.getInternalBalance(account);
            if (BigInt(internalBalance) < ethers.parseUnits(playerData.pendingRewards.toString(), 18)) {
                alert("Insufficient internal balance. Please submit game rewards first.");
                return;
            }
            const tx = await contract.withdrawAllTokens({ value: ethers.parseUnits(WITHDRAWAL_FEE_BNB, 18), gasLimit: 300000 });
            await tx.wait();
            playerData.walletBalance = Number(ethers.formatUnits(await contract.balanceOf(account), 18));
            playerData.pendingRewards = 0;
            await loadPlayerHistory();
            updatePlayerHistoryUI();
            alert("Rewards claimed successfully!");
        } catch (error) {
            console.error("Error claiming rewards:", error);
            document.getElementById("withdrawalStatus").textContent = `Error: ${error.message || error.toString()}`;
            alert("Failed to claim rewards: " + (error.message || error.toString()));
        } finally {
            showLoading(false);
        }
    }

    async function claimWelcomeBonus() {
        if (!contract || !account || playerData.hasClaimedWelcomeBonus) {
            alert("Bonus already claimed or connect wallet!");
            return;
        }
        try {
            showLoading(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const balance = await provider.getBalance(account);
            if (balance < ethers.parseUnits(WITHDRAWAL_FEE_BNB, 18)) {
                alert(`Need ${WITHDRAWAL_FEE_BNB} BNB for fee.`);
                return;
            }
            const tx = await contract.claimWelcomeBonus({ value: ethers.parseUnits(WITHDRAWAL_FEE_BNB, 18), gasLimit: 300000 });
            await tx.wait();
            playerData.hasClaimedWelcomeBonus = true;
            playerData.totalRewards += 100;
            playerData.pendingRewards += 100;
            await loadPlayerHistory();
            updatePlayerHistoryUI();
            alert("Welcome bonus of 100 BST claimed!");
        } catch (error) {
            console.error("Error claiming welcome bonus:", error);
            if (error.reason) {
                alert(`Failed to claim bonus: ${error.reason}`);
            } else {
                alert("Failed to claim bonus: Transaction reverted. Check console for details.");
            }
        } finally {
            showLoading(false);
        }
    }

    function generateReferralLink() {
        if (!account) return alert("Connect wallet first!");
        const baseUrl = window.location.origin + window.location.pathname;
        const referralLink = `${baseUrl}?ref=${account}`;
        navigator.clipboard.writeText(referralLink).then(() => {
            alert("Referral link copied to clipboard: " + referralLink);
        }).catch(err => {
            alert("Failed to copy referral link: " + err.message);
        });
    }

    async function connectWallet() {
        if (!window.ethereum) return alert("Please install MetaMask!");
        try {
            showLoading(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const network = await provider.getNetwork();
            if (network.chainId.toString() !== TARGET_NETWORK_ID) {
                try {
                    await window.ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: "0x61" }]
                    });
                } catch (switchError) {
                    if (switchError.code === 4902) {
                        await window.ethereum.request({
                            method: "wallet_addEthereumChain",
                            params: [{
                                chainId: "0x61",
                                chainName: "BNB Smart Chain Testnet",
                                rpcUrls: [process.env.GAME_ORACLE_RPC_URL],
                                nativeCurrency: { symbol: "BNB", decimals: 18 }
                            }]
                        });
                    } else {
                        throw switchError;
                    }
                }
            }
            account = (await provider.send("eth_requestAccounts", []))[0];
            playerData.walletAddress = account;
            contract = new ethers.Contract(contractAddress, contractABI, await provider.getSigner());
            await loadPlayerHistory();
            updatePlayerHistoryUI();
            document.getElementById("connectWallet").style.display = "none";
            document.getElementById("disconnectWallet").style.display = "block";
            document.getElementById("walletAddress").textContent = `Connected: ${account.slice(0, 6)}...`;
            document.getElementById("walletBalance").textContent = `Wallet Balance: ${Number(ethers.formatUnits(await provider.getBalance(account), 18)).toFixed(2)} BNB`;
            alert("Wallet connected!");
        } catch (error) {
            console.error("Wallet connection error:", error);
            alert("Failed to connect wallet: " + (error.message || "Please ensure MetaMask is configured for BNB Testnet."));
        } finally {
            showLoading(false);
        }
    }

    function disconnectWallet() {
        account = null;
        contract = null;
        document.getElementById("connectWallet").style.display = "block";
        document.getElementById("disconnectWallet").style.display = "none";
        document.getElementById("walletAddress").textContent = "";
        document.getElementById("walletBalance").textContent = "";
        document.getElementById("ownerPanel").style.display = "none";
        document.getElementById("ownerFunctions").style.display = "none";
        updatePlayerHistoryUI();
        alert("Wallet disconnected!");
    }

    async function loadPlayerHistory() {
        if (!contract || !account) return updatePlayerHistoryUI();
        try {
            showLoading(true);
            const history = await contract.playerHistory(account);
            playerData.gamesPlayed = Number(history.gamesPlayed);
            playerData.totalRewards = Number(ethers.formatUnits(history.totalRewards, 18));
            playerData.totalReferrals = Number(history.totalReferrals);
            playerData.referralRewards = Number(ethers.formatUnits(history.referralRewards, 18));
            playerData.hasClaimedWelcomeBonus = history.hasClaimedWelcomeBonus;
            playerData.pendingRewards = Number(ethers.formatUnits(await contract.getInternalBalance(account), 18));
            playerData.walletBalance = Number(ethers.formatUnits(await contract.balanceOf(account), 18));
            playerData.rewardHistory = [];
            const events = await contract.queryFilter("RewardClaimed", 0, "latest");
            events.forEach(event => {
                if (event.args.player === account) {
                    playerData.rewardHistory.push({
                        amount: Number(ethers.formatUnits(event.args.amount, 18)),
                        timestamp: Number(event.args.timestamp),
                        rewardType: "Claimed",
                        referee: ethers.ZeroAddress
                    });
                }
            });
            updatePlayerHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
        } catch (error) {
            console.error("History error:", error);
            alert("Failed to load history: " + error.message);
        } finally {
            showLoading(false);
        }
    }

    function updatePlayerHistoryUI() {
        document.getElementById("gamesPlayed").textContent = `Games Played: ${playerData.gamesPlayed}`;
        document.getElementById("totalGameRewards").textContent = `Total Game Rewards: ${playerData.totalRewards.toFixed(2)} BST`;
        document.getElementById("totalReferrals").textContent = `Total Referrals: ${playerData.totalReferrals}`;
        document.getElementById("referralRewards").textContent = `Referral Rewards: ${playerData.referralRewards.toFixed(2)} BST`;
        document.getElementById("pendingRewardsText").textContent = `Pending Rewards: ${playerData.pendingRewards.toFixed(2)} BST`;
        document.getElementById("walletBalance").textContent = `Wallet Balance: ${playerData.walletBalance.toFixed(2)} BST`;
        document.getElementById("walletAddress").textContent = account ? `Connected: ${account.slice(0, 6)}...` : "";
        document.getElementById("rewardHistoryList").innerHTML = playerData.rewardHistory.map(entry =>
            `<li>${entry.rewardType}: ${entry.amount.toFixed(2)} BST on ${new Date(entry.timestamp * 1000).toLocaleString()}${entry.referee !== ethers.ZeroAddress ? ` (Referee: ${entry.referee.slice(0, 6)}...)` : ""}</li>`
        ).join("");
    }

    function verifyOwner() {
        if (!account) return alert("Connect wallet first!");
        const password = document.getElementById("ownerPassword").value;
        if (password === process.env.OWNER_PASSWORD) {
            document.getElementById("ownerPanel").style.display = "block";
            document.getElementById("ownerFunctions").style.display = "block";
            alert("Owner verified successfully!");
        } else {
            alert("Incorrect password!");
        }
    }

    async function updateGameOracle() {
        if (!contract || !account) return alert("Connect wallet first!");
        const newOracleAddress = document.getElementById("newOracleAddress").value;
        if (!ethers.isAddress(newOracleAddress)) return alert("Invalid address!");
        try {
            showLoading(true);
            const tx = await contract.updateGameOracle(newOracleAddress, { gasLimit: 200000 });
            await tx.wait();
            alert("Game oracle updated successfully!");
        } catch (error) {
            console.error("Error updating game oracle:", error);
            alert("Failed to update game oracle: " + error.message);
        } finally {
            showLoading(false);
        }
    }

    async function updateOwnerWallet() {
        if (!contract || !account) return alert("Connect wallet first!");
        const newOwnerWallet = document.getElementById("newOwnerWallet").value;
        if (!ethers.isAddress(newOwnerWallet)) return alert("Invalid address!");
        try {
            showLoading(true);
            const tx = await contract.updateOwnerWallet(newOwnerWallet, { gasLimit: 200000 });
            await tx.wait();
            alert("Owner wallet updated successfully!");
        } catch (error) {
            console.error("Error updating owner wallet:", error);
            alert("Failed to update owner wallet: " + error.message);
        } finally {
            showLoading(false);
        }
    }

    async function updateWithdrawalFee() {
        if (!contract || !account) return alert("Connect wallet first!");
        const newFee = document.getElementById("newWithdrawalFee").value;
        if (newFee <= 0) return alert("Invalid fee!");
        try {
            showLoading(true);
            const tx = await contract.updateWithdrawalFee(newFee, { gasLimit: 200000 });
            await tx.wait();
            WITHDRAWAL_FEE_BNB = ethers.formatUnits(newFee, 18);
            alert("Withdrawal fee updated successfully!");
        } catch (error) {
            console.error("Error updating withdrawal fee:", error);
            alert("Failed to update withdrawal fee: " + error.message);
        } finally {
            showLoading(false);
        }
    }

    async function updateMaxWithdrawalLimit() {
        if (!contract || !account) return alert("Connect wallet first!");
        const newLimit = document.getElementById("newMaxWithdrawalLimit").value;
        if (newLimit <= 0) return alert("Invalid limit!");
        try {
            showLoading(true);
            const tx = await contract.updateMaxWithdrawalLimit(ethers.parseUnits(newLimit, 18), { gasLimit: 200000 });
            await tx.wait();
            alert("Max withdrawal limit updated successfully!");
        } catch (error) {
            console.error("Error updating max withdrawal limit:", error);
            alert("Failed to update max withdrawal limit: " + error.message);
        } finally {
            showLoading(false);
        }
    }

    async function mintTokens() {
        if (!contract || !account) return alert("Connect wallet first!");
        const amount = document.getElementById("mintAmount").value;
        if (amount <= 0) return alert("Invalid amount!");
        try {
            showLoading(true);
            const tx = await contract.mintTokens(ethers.parseUnits(amount, 18), { gasLimit: 300000 });
            await tx.wait();
            alert("Tokens minted successfully!");
        } catch (error) {
            console.error("Error minting tokens:", error);
            alert("Failed to mint tokens: " + error.message);
        } finally {
            showLoading(false);
        }
    }

    async function burnTokens() {
        if (!contract || !account) return alert("Connect wallet first!");
        const amount = document.getElementById("burnAmount").value;
        if (amount <= 0) return alert("Invalid amount!");
        try {
            showLoading(true);
            const tx = await contract.burnTokens(ethers.parseUnits(amount, 18), { gasLimit: 300000 });
            await tx.wait();
            alert("Tokens burned successfully!");
        } catch (error) {
            console.error("Error burning tokens:", error);
            alert("Failed to burn tokens: " + error.message);
        } finally {
            showLoading(false);
        }
    }

    // Event Listeners
    document.getElementById("playGame").addEventListener("click", async () => {
        if (!account) return alert("Connect wallet!");
        showLoading(true);
        enterFullscreen();
        await resetGame();
        isGameRunning = true;
        animationFrameId = requestAnimationFrame(gameLoop);
        showLoading(false);
    });
    document.getElementById("connectWallet").addEventListener("click", connectWallet);
    document.getElementById("disconnectWallet").addEventListener("click", disconnectWallet);
    document.getElementById("claimGameRewards").addEventListener("click", claimPendingRewards);
    document.getElementById("welcomeBonusButton").addEventListener("click", claimWelcomeBonus);
    document.getElementById("getReferralLink").addEventListener("click", generateReferralLink);
    document.getElementById("verifyOwner").addEventListener("click", verifyOwner);

    document.addEventListener("keydown", (event) => {
        if (isGameRunning) {
            if (event.key === "ArrowUp" && direction !== "down") direction = "up";
            if (event.key === "ArrowDown" && direction !== "up") direction = "down";
            if (event.key === "ArrowLeft" && direction !== "right") direction = "left";
            if (event.key === "ArrowRight" && direction !== "left") direction = "right";
        }
    });

    let touchStartX = 0, touchStartY = 0, lastTouchTime = 0;
    if (canvas) {
        canvas.addEventListener("touchstart", (event) => {
            touchStartX = event.touches[0].clientX;
            touchStartY = event.touches[0].clientY;
        });
        canvas.addEventListener("touchmove", (event) => {
            if (!isGameRunning) return;
            const touch = event.touches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            if (Date.now() - lastTouchTime < 150) return;
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0 && direction !== "left") direction = "right";
                else if (deltaX < 0 && direction !== "right") direction = "left";
            } else if (Math.abs(deltaY) > 50) {
                if (deltaY > 0 && direction !== "up") direction = "down";
                else if (deltaY < 0 && direction !== "down") direction = "up";
            }
            lastTouchTime = Date.now();
        });
    }

    window.addEventListener("resize", updateCanvasSize);
    updateCanvasSize();
    generateBoxes();
    draw();
    updatePlayerHistoryUI();
});