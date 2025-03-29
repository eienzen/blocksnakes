document.addEventListener("DOMContentLoaded", () => {
    let account = null;
    let contract = null;
    let isConnecting = false;
    let transactionQueue = [];
    let isProcessingTransaction = false;

    // प्लेयर डेटा
    let playerData = JSON.parse(localStorage.getItem("playerData")) || {
        gamesPlayed: 0,
        totalRewards: 0,
        score: 0,
        rewards: 0,
        pendingRewards: 0,
        pendingLevels: [],
        lastGameScore: 0,
        lastGameRewards: 0,
        totalReferrals: 0,
        referralRewards: 0,
        pendingReferral: null,
        pendingReferrerReward: 0,
        pendingRefereeReward: 0,
        rewardHistory: []
    };
    playerData.pendingLevels = playerData.pendingLevels || [];
    playerData.rewardHistory = playerData.rewardHistory || [];

    // रेफरल लिंक से रेफरर का पता निकालें
    const urlParams = new URLSearchParams(window.location.search);
    const referrerAddress = urlParams.get("ref");
    if (referrerAddress && !playerData.pendingReferral) {
        playerData.pendingReferral = referrerAddress;
        localStorage.setItem("playerData", JSON.stringify(playerData));
    }

    // कॉन्ट्रैक्ट एड्रेस और ABI
    const contractAddress = "0x1c64c7245bfa04816332c71a5220a40c190c4e73"; // यहाँ डिप्लॉय किया हुआ कॉन्ट्रैक्ट एड्रेस डालें
    const contractABI = [
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
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "GameContinued",
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
		"name": "ReferralAdded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
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
				"internalType": "string",
				"name": "rewardType",
				"type": "string"
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
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "totalReward",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "rewardType",
				"type": "string"
			}
		],
		"name": "RewardsAdded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Staked",
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
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Unstaked",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "totalReward",
				"type": "uint256"
			}
		],
		"name": "addRewards",
		"outputs": [],
		"stateMutability": "nonpayable",
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
				"name": "amount",
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
				"name": "user",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "totalReward",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "referrer",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "referee",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "referrerReward",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "refereeReward",
				"type": "uint256"
			}
		],
		"name": "claimAllRewards",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "claimStakingReward",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "incrementGamesPlayed",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "payToContinue",
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
		"name": "stakeTokens",
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
				"name": "amount",
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
				"name": "amount",
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
		"inputs": [],
		"name": "unstakeTokens",
		"outputs": [],
		"stateMutability": "nonpayable",
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
				"name": "",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "",
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
				"name": "",
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
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "calculateStakingReward",
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
				"name": "user",
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
				"internalType": "struct BlockSnakesToken.RewardEntry[]",
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
		"name": "hasBeenReferred",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
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
		"name": "referredBy",
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
		"name": "stakes",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "startTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "lastClaimTime",
				"type": "uint256"
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
	}
];

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    const gridWidth = 30;
    const gridHeight = 20;
    let gridSize;
    let gameInterval;
    let snake = [{ x: 10, y: 10 }];
    let box = { x: 15, y: 15 };
    let direction = 'right';
    let score = 0;
    let gameRewards = 0;
    const SNAKE_SPEED = 300;
    let lastSnakeState = null; // स्नेक की आखिरी स्थिति स्टोर करने के लिए

    function updateCanvasSize() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        gridSize = Math.min(screenWidth / gridWidth, screenHeight / gridHeight);
        const canvasWidth = gridSize * gridWidth;
        const canvasHeight = gridSize * gridHeight;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.width = `${canvasWidth}px`;
        canvas.style.height = `${canvasHeight}px`;
    }

    function enterFullscreen() {
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen();
        } else if (canvas.mozRequestFullScreen) {
            canvas.mozRequestFullScreen();
        } else if (canvas.webkitRequestFullscreen) {
            canvas.webkitRequestFullscreen();
        } else if (canvas.msRequestFullscreen) {
            canvas.msRequestFullscreen();
        }
    }

    function generateBox() {
        box.x = Math.floor(Math.random() * gridWidth);
        box.y = Math.floor(Math.random() * gridHeight);
    }

    function draw() {
        // कैनवस को साफ करें
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "#0a0a23");
        gradient.addColorStop(1, "#1f2a44");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // स्नेक को ड्रॉ करें
        snake.forEach((segment, index) => {
            const segmentGradient = ctx.createLinearGradient(segment.x * gridSize, segment.y * gridSize, (segment.x + 1) * gridSize, (segment.y + 1) * gridSize);
            segmentGradient.addColorStop(0, index === 0 ? "#ff00ff" : "#00ffcc");
            segmentGradient.addColorStop(1, index === 0 ? "#ff66cc" : "#66ffcc");
            ctx.fillStyle = segmentGradient;
            ctx.shadowColor = "rgba(255, 0, 255, 0.5)";
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;
            ctx.beginPath();
            ctx.roundRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2, 5);
            ctx.fill();
            ctx.strokeStyle = "#000";
            ctx.stroke();

            // स्नेक का सिर (आंखें और जीभ)
            if (index === 0) {
                ctx.fillStyle = "#fff";
                ctx.shadowColor = "rgba(255, 255, 0, 0.5)";
                ctx.shadowBlur = 5;
                ctx.beginPath();
                ctx.arc(segment.x * gridSize + 5, segment.y * gridSize + 5, 5, 0, Math.PI * 2);
                ctx.arc(segment.x * gridSize + (gridSize - 5), segment.y * gridSize + 5, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#000";
                ctx.shadowBlur = 0;
                ctx.beginPath();
                ctx.arc(segment.x * gridSize + 5, segment.y * gridSize + 5, 2, 0, Math.PI * 2);
                ctx.arc(segment.x * gridSize + (gridSize - 5), segment.y * gridSize + 5, 2, 0, Math.PI * 2);
                ctx.fill();

                // जीभ ड्रॉ करना
                ctx.fillStyle = "#ff4040";
                ctx.beginPath();
                if (direction === 'right') {
                    ctx.moveTo(segment.x * gridSize + gridSize, segment.y * gridSize + gridSize / 2);
                    ctx.lineTo(segment.x * gridSize + gridSize + 10, segment.y * gridSize + gridSize / 2 - 5);
                    ctx.lineTo(segment.x * gridSize + gridSize + 10, segment.y * gridSize + gridSize / 2 + 5);
                } else if (direction === 'left') {
                    ctx.moveTo(segment.x * gridSize, segment.y * gridSize + gridSize / 2);
                    ctx.lineTo(segment.x * gridSize - 10, segment.y * gridSize + gridSize / 2 - 5);
                    ctx.lineTo(segment.x * gridSize - 10, segment.y * gridSize + gridSize / 2 + 5);
                } else if (direction === 'up') {
                    ctx.moveTo(segment.x * gridSize + gridSize / 2, segment.y * gridSize);
                    ctx.lineTo(segment.x * gridSize + gridSize / 2 - 5, segment.y * gridSize - 10);
                    ctx.lineTo(segment.x * gridSize + gridSize / 2 + 5, segment.y * gridSize - 10);
                } else if (direction === 'down') {
                    ctx.moveTo(segment.x * gridSize + gridSize / 2, segment.y * gridSize + gridSize);
                    ctx.lineTo(segment.x * gridSize + gridSize / 2 - 5, segment.y * gridSize + gridSize + 10);
                    ctx.lineTo(segment.x * gridSize + gridSize / 2 + 5, segment.y * gridSize + gridSize + 10);
                }
                ctx.closePath();
                ctx.fill();
            }
        });

        // बॉक्स (खाना) को ड्रॉ करें
        const boxGradient = ctx.createLinearGradient(box.x * gridSize, box.y * gridSize, (box.x + 1) * gridSize, (box.y + 1) * gridSize);
        boxGradient.addColorStop(0, "#ff5555");
        boxGradient.addColorStop(1, "#ffaa00");
        ctx.fillStyle = boxGradient;
        ctx.shadowColor = "rgba(255, 85, 85, 0.5)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        ctx.fillRect(box.x * gridSize, box.y * gridSize, gridSize - 2, gridSize - 2);
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        ctx.strokeRect(box.x * gridSize, box.y * gridSize, gridSize - 2, gridSize - 2);

        // स्कोर अपडेट करें
        document.getElementById('score').textContent = `Score: ${score}`;
        document.getElementById('gameRewards').textContent = `Game Rewards: ${gameRewards} BST`;
    }

    let hasReceivedWelcomeReward = false;
    let hasReceivedExtraReferralReward = false;

    async function checkReferralRewards() {
        if (!account || !contract) return;

        if (score >= 50 && !hasReceivedWelcomeReward && playerData.pendingReferral) {
            hasReceivedWelcomeReward = true;
            const referrerAmount = 3; // 3 BST
            const refereeAmount = 5; // 5 BST

            playerData.pendingRefereeReward = (playerData.pendingRefereeReward || 0) + refereeAmount;
            playerData.pendingReferrerReward = (playerData.pendingReferrerReward || 0) + referrerAmount;
            playerData.referralRewards = (playerData.referralRewards || 0) + referrerAmount;
            playerData.totalReferrals = (playerData.totalReferrals || 0) + 1;
            playerData.pendingRewards = (playerData.pendingRewards || 0) + refereeAmount;

            playerData.rewardHistory.push({
                amount: refereeAmount,
                timestamp: Date.now(),
                rewardType: "Referral (Welcome - Referee)",
                referee: "N/A"
            });

            playerData.rewardHistory.push({
                amount: referrerAmount,
                timestamp: Date.now(),
                rewardType: "Referral (Welcome - Referrer)",
                referee: playerData.pendingReferral
            });

            try {
                // रेफरल सेट करना
                await contract.referUser(playerData.pendingReferral, account);
                // रेफरल रिवॉर्ड जोड़ना
                await contract.addReferralReward(playerData.pendingReferral, account, referrerAmount, refereeAmount);
            } catch (error) {
                console.error("Error adding referral reward:", error);
            }

            updatePlayerHistoryUI();
            updateRewardHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
        }

        if (score >= 100 && !hasReceivedExtraReferralReward && playerData.pendingReferral) {
            hasReceivedExtraReferralReward = true;
            const referrerAmount = 2; // 2 BST

            playerData.pendingReferrerReward = (playerData.pendingReferrerReward || 0) + referrerAmount;
            playerData.referralRewards = (playerData.referralRewards || 0) + referrerAmount;

            playerData.rewardHistory.push({
                amount: referrerAmount,
                timestamp: Date.now(),
                rewardType: "Referral (Extra - Referrer)",
                referee: playerData.pendingReferral
            });

            try {
                // एक्स्ट्रा रेफरल रिवॉर्ड जोड़ना
                await contract.addReferralReward(playerData.pendingReferral, account, referrerAmount, 0);
            } catch (error) {
                console.error("Error adding extra referral reward:", error);
            }

            updatePlayerHistoryUI();
            updateRewardHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
        }
    }

    async function move() {
        let head = { x: snake[0].x, y: snake[0].y };
        if (direction === 'right') head.x++;
        if (direction === 'left') head.x--;
        if (direction === 'up') head.y--;
        if (direction === 'down') head.y++;

        lastSnakeState = {
            snake: [...snake],
            direction: direction,
            score: score,
            gameRewards: gameRewards
        };

        if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
            clearInterval(gameInterval);
            gameInterval = null;
            showGameOverPopup();
            return;
        }

        for (let segment of snake) {
            if (head.x === segment.x && head.y === segment.y) {
                clearInterval(gameInterval);
                gameInterval = null;
                showGameOverPopup();
                return;
            }
        }

        snake.unshift(head);
        if (head.x === box.x && head.y === box.y) {
            score += 10;
            gameRewards += 2;
            if (score > 0 && score % 100 === 0) {
                const reward = 5;
                playerData.pendingRewards = (playerData.pendingRewards || 0) + reward;
                playerData.pendingLevels.push({ score, reward });

                playerData.rewardHistory.push({
                    amount: reward,
                    timestamp: Date.now(),
                    rewardType: "Game",
                    referee: "N/A"
                });

                try {
                    await contract.addRewards(account, reward);
                } catch (error) {
                    console.error("Error adding game reward:", error);
                }

                const levelMessage = document.getElementById("levelMessage");
                levelMessage.innerText = `Milestone Reached! Score: ${score}, Reward: ${reward} BST`;
                levelMessage.style.display = "block";
                setTimeout(() => {
                    levelMessage.style.display = "none";
                }, 3000);
            }
            await checkReferralRewards();
            generateBox();
        } else {
            snake.pop();
        }
        draw();
        updatePlayerHistoryUI();
    }

    function showGameOverPopup() {
        const popup = document.getElementById("gameOverPopup");
        document.getElementById("finalScore").textContent = `Score: ${score}`;
        document.getElementById("finalRewards").textContent = `Rewards: ${gameRewards} BST`;
        popup.style.display = "block";
    }

    async function continueWithTokens() {
        if (!contract || !account) {
            alert("Please connect your wallet to continue!");
            return;
        }
        try {
            await contract.payToContinue();
            playerData.rewardHistory.push({
                amount: 5,
                timestamp: Date.now(),
                rewardType: "Continue Game",
                referee: "N/A"
            });

            snake = [...lastSnakeState.snake];
            direction = lastSnakeState.direction;
            score = lastSnakeState.score;
            gameRewards = lastSnakeState.gameRewards;

            document.getElementById("gameOverPopup").style.display = "none";
            gameInterval = setInterval(move, SNAKE_SPEED);
        } catch (error) {
            console.error("Error continuing game:", error);
            alert("Failed to continue game: " + error.message);
        }
    }

    async function resetGame() {
        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = null;
        }
        playerData.lastGameScore = score;
        playerData.lastGameRewards = gameRewards;
        playerData.gamesPlayed = (playerData.gamesPlayed || 0) + 1;
        score = 0;
        gameRewards = 0;
        hasReceivedWelcomeReward = false;
        hasReceivedExtraReferralReward = false;
        snake = [{ x: 10, y: 10 }];
        box = { x: 15, y: 15 };
        direction = 'right';
        lastSnakeState = null;
        updatePlayerHistoryUI();
        localStorage.setItem("playerData", JSON.stringify(playerData));
        draw();
        document.getElementById("gameOverPopup").style.display = "none";
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowUp' && direction !== 'down') direction = 'up';
        if (event.key === 'ArrowDown' && direction !== 'up') direction = 'down';
        if (event.key === 'ArrowLeft' && direction !== 'right') direction = 'left';
        if (event.key === 'ArrowRight' && direction !== 'left') direction = 'right';
    });

    let touchStartX = 0, touchStartY = 0;
    canvas.addEventListener("touchstart", (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });
    canvas.addEventListener("touchmove", (e) => {
        e.preventDefault();
        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0 && direction !== 'left') direction = 'right';
            else if (direction !== 'right') direction = 'left';
        } else {
            if (diffY > 0 && direction !== 'up') direction = 'down';
            else if (direction !== 'down') direction = 'up';
        }
        touchStartX = touchEndX;
        touchStartY = touchEndY;
    });

    window.addEventListener('resize', updateCanvasSize);

    updateCanvasSize();
    draw();

    document.getElementById('playGame').addEventListener('click', () => {
        if (!account) {
            alert("Please connect your wallet to play the game!");
            return;
        }
        enterFullscreen();
        resetGame();
        if (!gameInterval) {
            gameInterval = setInterval(move, SNAKE_SPEED);
        }
    });

    document.getElementById('continueWithTokens').addEventListener('click', continueWithTokens);
    document.getElementById('startNewGame').addEventListener('click', resetGame);

    function generateReferralLink() {
        if (!account) return alert("Connect your wallet first!");
        const referralLink = `${window.location.origin}${window.location.pathname}?ref=${account}`;
        navigator.clipboard.writeText(referralLink).then(() => {
            alert("Referral link copied to clipboard: " + referralLink);
        });
    }

    async function connectWallet() {
        if (isConnecting) return alert("Wallet connection in progress. Please wait.");
        if (account) return alert("Wallet already connected!");

        if (!window.ethereum && !window.web3) {
            alert("No Web3 wallet detected. Please install MetaMask or another Web3 wallet.");
            return;
        }

        let provider = window.ethereum || (window.web3 && window.web3.currentProvider);

        try {
            isConnecting = true;
            const accounts = await provider.request({ method: "eth_requestAccounts" });
            if (!accounts || accounts.length === 0) {
                throw new Error("No accounts found. Please ensure your wallet is unlocked.");
            }
            account = accounts[0];
            document.getElementById("connectWallet").style.display = "none";
            document.getElementById("disconnectWallet").style.display = "inline-block";
            document.getElementById("disconnectWallet").innerText = `Connected: ${account.substring(0, 6)}...`;

            const ethersProvider = new ethers.BrowserProvider(provider);
            const signer = await ethersProvider.getSigner();
            contract = new ethers.Contract(contractAddress, contractABI, signer);

            await loadPlayerHistory();
            updateRewardHistoryUI();
        } catch (error) {
            if (error.code === 4001) {
                alert("User rejected the request. Please connect your wallet to continue.");
            } else if (error.code === -32002) {
                alert("A wallet connection request is already pending. Please check your wallet.");
            } else {
                alert("Error connecting wallet: " + error.message);
            }
        } finally {
            isConnecting = false;
        }
    }

    function disconnectWallet() {
        account = null;
        contract = null;
        document.getElementById("connectWallet").style.display = "inline-block";
        document.getElementById("disconnectWallet").style.display = "none";
        document.getElementById("connectWallet").innerText = "Connect Wallet";
        alert("Wallet disconnected successfully!");
    }

    async function loadPlayerHistory() {
        if (!contract || !account) return;
        try {
            const history = await contract.playerHistory(account);
            playerData.gamesPlayed = Number(history.gamesPlayed);
            playerData.totalRewards = Number(history.totalRewards) / 10 ** 18;
            playerData.totalReferrals = Number(history.totalReferrals);
            playerData.referralRewards = Number(history.referralRewards) / 10 ** 18;

            const rewardHistory = await contract.getRewardHistory(account);
            playerData.rewardHistory = rewardHistory.map(entry => ({
                amount: Number(entry.amount) / 10 ** 18,
                timestamp: Number(entry.timestamp) * 1000,
                rewardType: entry.rewardType,
                referee: entry.referee === "0x0000000000000000000000000000000000000000" ? "N/A" : entry.referee
            }));

            updatePlayerHistoryUI();
            updateRewardHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
        } catch (error) {
            console.error("Error loading player history:", error);
        }
    }

    function updatePlayerHistoryUI() {
        document.getElementById("gamesPlayed").innerText = `Games Played: ${playerData.gamesPlayed || 0}`;
        document.getElementById("totalGameRewards").innerText = `Total Game Rewards: ${playerData.totalRewards || 0} BST`;
        document.getElementById("lastGameScore").innerText = `Last Game Score: ${playerData.lastGameScore || 0}`;
        document.getElementById("lastGameRewards").innerText = `Last Game Rewards: ${playerData.lastGameRewards || 0} BST`;
        document.getElementById("totalReferrals").innerText = `Total Referrals: ${playerData.totalReferrals || 0}`;
        document.getElementById("referralRewards").innerText = `Referral Rewards: ${playerData.referralRewards || 0} BST`;
        document.getElementById("pendingRewardsText").innerText = `Pending Rewards: ${playerData.pendingRewards || 0} BST`;
        document.getElementById("pendingLevelsText").innerText = `Pending Milestones: ${playerData.pendingLevels?.length || 0}`;
    }

    function updateRewardHistoryUI() {
        const historyList = document.getElementById("rewardHistoryList");
        historyList.innerHTML = "";
        playerData.rewardHistory.forEach(entry => {
            const date = new Date(entry.timestamp).toLocaleString();
            const li = document.createElement("li");
            li.innerText = `${entry.rewardType}: ${entry.amount} BST on ${date} ${entry.referee !== "N/A" ? `(Referee: ${entry.referee})` : ""}`;
            historyList.appendChild(li);
        });
    }

    async function claimPendingRewards() {
        if (!contract) return alert("Connect your wallet first!");
        if (playerData.pendingRewards < 50) return alert("Minimum withdrawal is 50 BST!");

        const totalReward = playerData.pendingRewards;
        const referrer = playerData.pendingReferral || "0x0000000000000000000000000000000000000000";
        const referee = account;
        const referrerReward = playerData.pendingReferrerReward;
        const refereeReward = playerData.pendingRefereeReward;

        try {
            await contract.claimAllRewards(
                account,
                totalReward,
                referrer,
                referee,
                referrerReward,
                refereeReward
            );
            playerData.rewards = (playerData.rewards || 0) + playerData.pendingRewards;
            playerData.totalRewards = (playerData.totalRewards || 0) + playerData.pendingRewards;
            playerData.pendingRewards = 0;
            playerData.pendingLevels = [];
            playerData.pendingReferral = null;
            playerData.pendingReferrerReward = 0;
            playerData.pendingRefereeReward = 0;
            updatePlayerHistoryUI();
            updateRewardHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
        } catch (error) {
            console.error("Error claiming rewards:", error);
            alert("Failed to claim rewards: " + error.message);
        }
    }

    document.getElementById("connectWallet").addEventListener("click", connectWallet);
    document.getElementById("disconnectWallet").addEventListener("click", disconnectWallet);
    document.getElementById("getReferralLink").addEventListener("click", generateReferralLink);
    document.getElementById("claimGameRewards").addEventListener("click", claimPendingRewards);
    document.getElementById("stakeTokens").addEventListener("click", async () => {
        if (!contract) return alert("Connect your wallet first!");
        const amount = document.getElementById("stakeInput").value;
        if (!amount || amount <= 0) return alert("Enter a valid amount to stake!");
        try {
            await contract.stakeTokens(amount);
            alert("Tokens staked successfully!");
        } catch (error) {
            console.error("Error staking tokens:", error);
            alert("Failed to stake tokens: " + error.message);
        }
    });
    document.getElementById("claimStakingReward").addEventListener("click", async () => {
        if (!contract) return alert("Connect your wallet first!");
        try {
            await contract.claimStakingReward();
            alert("Staking reward claimed successfully!");
        } catch (error) {
            console.error("Error claiming staking reward:", error);
            alert("Failed to claim staking reward: " + error.message);
        }
    });
    document.getElementById("unstakeTokens").addEventListener("click", async () => {
        if (!contract) return alert("Connect your wallet first!");
        try {
            await contract.unstakeTokens();
            alert("Tokens unstaked successfully!");
        } catch (error) {
            console.error("Error unstaking tokens:", error);
            alert("Failed to unstake tokens: " + error.message);
        }
    });
});
