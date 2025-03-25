document.addEventListener("DOMContentLoaded", () => {
    let account;
    let contract;
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

    // कॉन्ट्रैक्ट एड्रेस और ABI (रीमिक्स से डालें)
    const contractAddress = "0xe9f9b82bfa2f58bd10f061b2f7e4312700f2ef2c"; // यहाँ सही कॉन्ट्रैक्ट एड्रेस डालें
    const contractABI = [
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
		"inputs": [],
		"name": "incrementGamesPlayed",
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
		"name": "rewards",
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
		"name": "stakedBalance",
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
]; // यहाँ रीमिक्स से कॉन्ट्रैक्ट ABI डालें

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

        // बैकग्राउंड ग्रेडिएंट
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "#0a0a23");
        gradient.addColorStop(1, "#1f2a44");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // स्नेक को ड्रा करें
        snake.forEach((segment, index) => {
            const segmentGradient = ctx.createLinearGradient(segment.x * gridSize, segment.y * gridSize, (segment.x + 1) * gridSize, (segment.y + 1) * gridSize);
            segmentGradient.addColorStop(0, index === 0 ? "#ff00ff" : "#00ffcc");
            segmentGradient.addColorStop(1, "#ff66cc");
            ctx.fillStyle = segmentGradient;
            ctx.shadowColor = "rgba(255, 0, 255, 0.5)";
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;
            ctx.beginPath();
            ctx.roundRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2, 5);
            ctx.fill();
            ctx.strokeStyle = "#000";
            ctx.stroke();
            if (index === 0) {
                // स्नेक की आँखें ड्रा करें
                ctx.fillStyle = "#fff";
                ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
                ctx.shadowBlur = 5;
                ctx.beginPath();
                ctx.arc(segment.x * gridSize + 5, segment.y * gridSize + 5, 3, 0, Math.PI * 2);
                ctx.arc(segment.x * gridSize + (gridSize - 5), segment.y * gridSize + 5, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#000";
                ctx.shadowBlur = 0;
                ctx.beginPath();
                ctx.arc(segment.x * gridSize + 5, segment.y * gridSize + 5, 1, 0, Math.PI * 2);
                ctx.arc(segment.x * gridSize + (gridSize - 5), segment.y * gridSize + 5, 1, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // बॉक्स (फूड) को ड्रा करें
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
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.moveTo(box.x * gridSize, box.y * gridSize);
        ctx.lineTo(box.x * gridSize + 5, box.y * gridSize + 5);
        ctx.moveTo(box.x * gridSize + (gridSize - 2), box.y * gridSize);
        ctx.lineTo(box.x * gridSize + (gridSize - 7), box.y * gridSize + 5);
        ctx.moveTo(box.x * gridSize + (gridSize - 2), box.y * gridSize + (gridSize - 2));
        ctx.lineTo(box.x * gridSize + (gridSize - 7), box.y * gridSize + (gridSize - 7));
        ctx.moveTo(box.x * gridSize, box.y * gridSize + (gridSize - 2));
        ctx.lineTo(box.x * gridSize + 5, box.y * gridSize + (gridSize - 7));
        ctx.stroke();

        // स्कोर और रिवॉर्ड्स अपडेट करें
        document.getElementById('score').textContent = `Score: ${score}`;
        document.getElementById('gameRewards').textContent = `Game Rewards: ${gameRewards} BST`;
    }

    let hasReceivedWelcomeReward = false;
    let hasReceivedExtraReferralReward = false;

    function checkReferralRewards() {
        if (!account) return;

        if (score >= 50 && !hasReceivedWelcomeReward && playerData.pendingReferral) {
            hasReceivedWelcomeReward = true;
            playerData.pendingRefereeReward += 5;
            playerData.pendingReferrerReward += 3;
            playerData.referralRewards += 3;
            playerData.totalReferrals += 1;
            playerData.pendingRewards += 5;

            playerData.rewardHistory.push({
                amount: 5,
                timestamp: Date.now(),
                rewardType: "Referral (Welcome)",
                referee: "N/A"
            });
            playerData.rewardHistory.push({
                amount: 3,
                timestamp: Date.now(),
                rewardType: "Referral (Referrer)",
                referee: playerData.pendingReferral
            });

            updatePlayerHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
        }

        if (score >= 100 && !hasReceivedExtraReferralReward && playerData.pendingReferral) {
            hasReceivedExtraReferralReward = true;
            playerData.pendingReferrerReward += 2;
            playerData.referralRewards += 2;

            playerData.rewardHistory.push({
                amount: 2,
                timestamp: Date.now(),
                rewardType: "Referral (Extra)",
                referee: playerData.pendingReferral
            });

            updatePlayerHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
        }
    }

    function move() {
        let head = { x: snake[0].x, y: snake[0].y };
        if (direction === 'right') head.x++;
        if (direction === 'left') head.x--;
        if (direction === 'up') head.y--;
        if (direction === 'down') head.y++;

        if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
            clearInterval(gameInterval);
            gameInterval = null;
            alert('Game Over! Score: ' + score);
            resetGame();
            return;
        }

        for (let segment of snake) {
            if (head.x === segment.x && head.y === segment.y) {
                clearInterval(gameInterval);
                gameInterval = null;
                alert('Game Over! Score: ' + score);
                resetGame();
                return;
            }
        }

        snake.unshift(head);
        if (head.x === box.x && head.y === box.y) {
            score += 10;
            gameRewards += 2;
            if (score > 0 && score % 100 === 0) {
                const reward = 5;
                playerData.pendingRewards += reward;
                playerData.pendingLevels.push({ score, reward });

                playerData.rewardHistory.push({
                    amount: reward,
                    timestamp: Date.now(),
                    rewardType: "Game",
                    referee: "N/A"
                });

                const levelMessage = document.getElementById("levelMessage");
                levelMessage.innerText = `Milestone Reached! Score: ${score}, Reward: ${reward} BST`;
                levelMessage.style.display = "block";
                setTimeout(() => {
                    levelMessage.style.display = "none";
                }, 3000);
            }
            checkReferralRewards();
            generateBox();
        } else {
            snake.pop();
        }
        draw();
        updatePlayerHistoryUI();
    }

    function resetGame() {
        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = null;
        }
        playerData.lastGameScore = score;
        playerData.lastGameRewards = gameRewards;
        playerData.gamesPlayed += 1;
        score = 0;
        gameRewards = 0;
        hasReceivedWelcomeReward = false;
        hasReceivedExtraReferralReward = false;
        snake = [{ x: 10, y: 10 }];
        box = { x: 15, y: 15 };
        direction = 'right';
        updatePlayerHistoryUI();
        localStorage.setItem("playerData", JSON.stringify(playerData));
        draw();
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
        enterFullscreen();
        resetGame();
        if (!gameInterval) {
            gameInterval = setInterval(move, SNAKE_SPEED);
        }
    });

    function generateReferralLink() {
        if (!account) return alert("Connect your wallet first!");
        const referralLink = `${window.location.origin}${window.location.pathname}?ref=${account}`;
        navigator.clipboard.writeText(referralLink).then(() => {
            alert("Referral link copied to clipboard: " + referralLink);
        });
    }

    async function estimateGas(fn, args) {
        if (!contract) return;
        try {
            const gasEstimate = await fn(...args).estimateGas();
            const provider = new ethers.BrowserProvider(window.ethereum);
            const gasPrice = await provider.getFeeData();
            const gasCost = gasEstimate * gasPrice.gasPrice;
            const gasCostInBNB = ethers.formatEther(gasCost);
            document.getElementById("gasEstimate").innerText = `Estimated Gas Fee: ${gasCostInBNB} BNB`;
        } catch (error) {
            document.getElementById("gasEstimate").innerText = "Gas estimation failed.";
        }
    }

    async function connectWallet() {
        if (isConnecting) return alert("Wallet connection in progress. Please wait.");
        if (account) return alert("Wallet already connected!");

        // विभिन्न वॉलेट प्रोवाइडर को चेक करें
        let provider;
        if (window.ethereum) {
            provider = window.ethereum;
        } else if (window.web3) {
            provider = window.web3.currentProvider;
        } else {
            alert("No Web3 wallet detected. Please install MetaMask, Trust Wallet, or another Web3 wallet to continue.");
            return;
        }

        try {
            isConnecting = true;

            // वॉलेट कनेक्ट करें
            const accounts = await provider.request({ method: "eth_requestAccounts" });
            account = accounts[0];
            document.getElementById("connectWallet").innerText = `Connected: ${account.substring(0, 6)}...`;

            // ethers.js के साथ प्रोवाइडर सेट करें
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
        document.getElementById("gamesPlayed").innerText = `Games Played: ${playerData.gamesPlayed}`;
        document.getElementById("totalGameRewards").innerText = `Total Game Rewards: ${playerData.totalRewards} BST`;
        document.getElementById("lastGameScore").innerText = `Last Game Score: ${playerData.lastGameScore}`;
        document.getElementById("lastGameRewards").innerText = `Last Game Rewards: ${playerData.lastGameRewards} BST`;
        document.getElementById("totalReferrals").innerText = `Total Referrals: ${playerData.totalReferrals}`;
        document.getElementById("referralRewards").innerText = `Referral Rewards: ${playerData.referralRewards} BST`;
        document.getElementById("pendingRewardsText").innerText = `Pending Rewards: ${playerData.pendingRewards} BST`;
        document.getElementById("pendingLevelsText").innerText = `Pending Milestones: ${playerData.pendingLevels.length}`;
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

        await estimateGas(contract.claimAllRewards, [
            totalReward,
            referrer,
            referee,
            referrerReward,
            refereeReward
        ]);

        queueTransaction(contract.claimAllRewards, [
            totalReward,
            referrer,
            referee,
            referrerReward,
            refereeReward
        ]);

        playerData.rewards += totalReward;
        playerData.totalRewards += totalReward;
        playerData.pendingRewards = 0;
        playerData.pendingLevels = [];
        playerData.pendingReferral = null;
        playerData.pendingReferrerReward = 0;
        playerData.pendingRefereeReward = 0;

        playerData.rewardHistory.push({
            amount: totalReward,
            timestamp: Date.now(),
            rewardType: "Claim",
            referee: "N/A"
        });

        updatePlayerHistoryUI();
        updateRewardHistoryUI();
        localStorage.setItem("playerData", JSON.stringify(playerData));
        await loadPlayerHistory();
    }

    async function processTransactionQueue() {
        if (isProcessingTransaction || transactionQueue.length === 0) return;
        isProcessingTransaction = true;
        const { fn, args } = transactionQueue.shift();
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const gasPrice = (await provider.getFeeData()).gasPrice;
            const tx = await fn(...args, { gasPrice });
            await tx.wait();
        } catch (error) {
            alert(`Transaction failed: ${error.message}`);
        } finally {
            isProcessingTransaction = false;
            processTransactionQueue();
        }
    }

    function queueTransaction(fn, args) {
        transactionQueue.push({ fn, args });
        processTransactionQueue();
    }

    document.getElementById("connectWallet").addEventListener("click", connectWallet);
    document.getElementById("getReferralLink").addEventListener("click", generateReferralLink);
    document.getElementById("claimGameRewards").addEventListener("click", claimPendingRewards);
    document.getElementById("stakeTokens").addEventListener("click", async () => {
        if (!contract) return alert("Connect your wallet first!");
        const amount = document.getElementById("stakeInput").value;
        if (!amount || amount <= 0) return alert("Enter a valid amount!");
        const amountInWei = ethers.parseUnits(amount, 18);
        await estimateGas(contract.stakeTokens, [amountInWei]);
        queueTransaction(contract.stakeTokens, [amountInWei]);
        document.getElementById("stakeInput").value = "";
        await loadPlayerHistory();
    });
    document.getElementById("claimStakingReward").addEventListener("click", async () => {
        if (!contract) return alert("Connect your wallet first!");
        await estimateGas(contract.claimStakingReward, []);
        queueTransaction(contract.claimStakingReward, []);
        await loadPlayerHistory();
    });
    document.getElementById("unstakeTokens").addEventListener("click", async () => {
        if (!contract) return alert("Connect your wallet first!");
        await estimateGas(contract.unstakeTokens, []);
        queueTransaction(contract.unstakeTokens, []);
        await loadPlayerHistory();
    });
    document.getElementById("buyToken").addEventListener("click", () => {
        alert("Token sale starts on 1st May 2025!");
    });

    updatePlayerHistoryUI();
    updateRewardHistoryUI();
});
