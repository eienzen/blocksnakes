document.addEventListener("DOMContentLoaded", () => {
    let account;
    let contract;
    let isConnecting = false;
    let transactionQueue = [];
    let isProcessingTransaction = false;
    const MAX_LEVEL = 100;

    // Load player history from localStorage
    let playerData = JSON.parse(localStorage.getItem("playerData")) || {
        gamesPlayed: 0,
        levelsCompleted: 0,
        totalRewards: 0,
        highestLevel: 0,
        score: 0,
        rewards: 0,
        pendingRewards: 0,
        pendingLevels: [],
        currentLevel: 1
    };

    const contractAddress = "0xe8d1f063e641d95908ddabfa58b9f79c4d71d11e"; // यहाँ नया कॉन्ट्रैक्ट अड्रेस डालें
    const contractABI = [
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
				"internalType": "uint256",
				"name": "levelCount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "highestLevel",
				"type": "uint256"
			}
		],
		"name": "BatchLevelCompleted",
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
			},
			{
				"internalType": "uint256",
				"name": "levelCount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "highestLevel",
				"type": "uint256"
			}
		],
		"name": "batchLevelComplete",
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
		"name": "nextLevel",
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
				"name": "levelsCompleted",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalRewards",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "highestLevel",
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
]; // यहाँ नया ABI डालें

    async function connectWallet() {
        if (isConnecting) {
            alert("Wallet connection is already in progress. Please wait.");
            return;
        }
        if (account) {
            alert("Wallet is already connected!");
            return;
        }
        if (window.ethereum) { // सभी Web3 वॉलेट्स (MetaMask, Trust Wallet, Phantom, आदि) को सपोर्ट करता है
            try {
                isConnecting = true;
                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                account = accounts[0];
                document.getElementById("connectWallet").innerText = `Connected: ${account.substring(0, 6)}...`;
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                contract = new ethers.Contract(contractAddress, contractABI, signer);
                console.log("Contract initialized:", contract);
                await loadPlayerHistory();
            } catch (error) {
                alert("Error connecting wallet: " + error.message);
            } finally {
                isConnecting = false;
            }
        } else {
            alert("Please install a Web3 wallet like MetaMask, Trust Wallet, or Phantom!");
        }
    }

    async function loadPlayerHistory() {
        if (!contract || !account) return;
        try {
            const history = await contract.playerHistory(account);
            playerData.gamesPlayed = Number(history.gamesPlayed);
            playerData.levelsCompleted = Number(history.levelsCompleted);
            playerData.totalRewards = Number(history.totalRewards) / 10 ** 18;
            playerData.highestLevel = Number(history.highestLevel);
            playerData.currentLevel = playerData.highestLevel + 1 > MAX_LEVEL ? MAX_LEVEL : playerData.highestLevel + 1;
            updatePlayerHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
        } catch (error) {
            console.error("Error loading player history:", error);
        }
    }

    function updatePlayerHistoryUI() {
        document.getElementById("gamesPlayed").innerText = `Games Played: ${playerData.gamesPlayed}`;
        document.getElementById("levelsCompleted").innerText = `Levels Completed: ${playerData.levelsCompleted}`;
        document.getElementById("totalGameRewards").innerText = `Total Game Rewards: ${playerData.totalRewards} BST`;
        document.getElementById("highestLevel").innerText = `Highest Level: ${playerData.highestLevel}`;
        document.getElementById("score").innerText = `Score: ${playerData.score}`;
        document.getElementById("gameRewards").innerText = `Game Rewards: ${playerData.rewards} BST`;
        document.getElementById("level").innerText = `Current Level: ${playerData.currentLevel}`;
        document.getElementById("pendingRewardsText").innerText = `Pending Rewards: ${playerData.pendingRewards} BST`;
        document.getElementById("pendingLevelsText").innerText = `Pending Levels: ${playerData.pendingLevels.length}`;
        updateLevelInfo();
    }

    function getSnakeSpeed(level) {
        if (level <= 10) return 300;
        const speedReduction = Math.floor((level - 1) / 10) * 10;
        return 300 - speedReduction;
    }

    function getRewardForLevel(level) {
        return 5 + (level - 1) * 2;
    }

    function updateLevelInfo() {
        const speed = getSnakeSpeed(playerData.currentLevel);
        const reward = getRewardForLevel(playerData.currentLevel);
        document.getElementById("levelDetails").innerText = `Level ${playerData.currentLevel}: Required Score: 100, Speed: ${speed}ms, Reward: ${reward} BST`;
    }

    async function estimateGasFee() {
        if (!contract || !account || playerData.pendingRewards === 0) {
            document.getElementById("gasEstimate").innerText = "";
            return;
        }
        try {
            const totalReward = playerData.pendingRewards;
            const levelCount = playerData.pendingLevels.length;
            const highestLevel = playerData.highestLevel;
            const gasEstimate = await contract.estimateGas.batchLevelComplete(totalReward, levelCount, highestLevel);
            const gasPrice = await (new ethers.providers.Web3Provider(window.ethereum)).getGasPrice();
            const gasCost = gasEstimate.mul(gasPrice);
            const gasCostInBNB = ethers.utils.formatEther(gasCost);
            const bnbPrice = 600; // Assume 1 BNB = $600 (as of March 2025)
            const gasCostInUSD = (parseFloat(gasCostInBNB) * bnbPrice).toFixed(2);
            document.getElementById("gasEstimate").innerText = `Estimated Gas Fee: ${gasCostInBNB} BNB (approx $${gasCostInUSD})`;
        } catch (error) {
            console.error("Error estimating gas fee:", error);
            document.getElementById("gasEstimate").innerText = "Unable to estimate gas fee.";
        }
    }

    async function processTransactionQueue() {
        if (isProcessingTransaction || transactionQueue.length === 0) return;
        isProcessingTransaction = true;
        const { fn, args } = transactionQueue.shift();
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const gasPrice = await provider.getGasPrice();
            const increasedGasPrice = gasPrice.mul(2);
            const tx = await fn(...args, { gasPrice: increasedGasPrice });
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

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    let snake = [{ x: 10, y: 10 }]; // स्नेक को इनिशियलाइज़ किया
    let food = { x: 15, y: 15 };
    let dx = 1;
    let dy = 0;
    let gameInterval = null;

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        snake.forEach((segment, index) => {
            const gradient = ctx.createLinearGradient(segment.x * 20, segment.y * 20, (segment.x + 1) * 20, (segment.y + 1) * 20);
            gradient.addColorStop(0, index === 0 ? "#ff00ff" : "#00ffcc");
            gradient.addColorStop(1, "#ff66cc");
            ctx.fillStyle = gradient;
            ctx.fillRect(segment.x * 20, segment.y * 20, 18, 18);
            ctx.strokeStyle = "#000";
            ctx.strokeRect(segment.x * 20, segment.y * 20, 18, 18);
            if (index === 0) {
                ctx.fillStyle = "#fff";
                ctx.beginPath();
                ctx.arc(segment.x * 20 + 5, segment.y * 20 + 5, 2, 0, Math.PI * 2);
                ctx.arc(segment.x * 20 + 13, segment.y * 20 + 5, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#000";
                ctx.beginPath();
                ctx.arc(segment.x * 20 + 5, segment.y * 20 + 5, 1, 0, Math.PI * 2);
                ctx.arc(segment.x * 20 + 13, segment.y * 20 + 5, 1, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        const foodGradient = ctx.createRadialGradient(food.x * 20 + 9, food.y * 20 + 9, 0, food.x * 20 + 9, food.y * 20 + 9, 9);
        foodGradient.addColorStop(0, "#ffcc00");
        foodGradient.addColorStop(1, "#ff6600");
        ctx.fillStyle = foodGradient;
        ctx.beginPath();
        ctx.arc(food.x * 20 + 9, food.y * 20 + 9, 9, 0, Math.PI * 2);
        ctx.fill();
    }

    function move() {
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };
        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
            playerData.score += 10;
            updatePlayerHistoryUI();
            food = { x: Math.floor(Math.random() * 30), y: Math.floor(Math.random() * 20) };
        } else {
            snake.pop();
        }
        if (playerData.score >= 100) {
            levelComplete();
        }
        if (head.x < 0 || head.x >= 30 || head.y < 0 || head.y >= 20) {
            alert("Game Over! Your score: " + playerData.score);
            resetGame();
        }
        draw();
    }

    function resetGame() {
        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = null;
        }
        snake = [{ x: 10, y: 10 }];
        food = { x: 15, y: 15 };
        dx = 1;
        dy = 0;
        playerData.gamesPlayed += 1;
        playerData.score = 0;
        updatePlayerHistoryUI();
        localStorage.setItem("playerData", JSON.stringify(playerData));
        draw();
    }

    function levelComplete() {
        const reward = getRewardForLevel(playerData.currentLevel);
        playerData.pendingRewards += reward;
        playerData.pendingLevels.push({ level: playerData.currentLevel, reward });
        playerData.score = 0;
        playerData.currentLevel += 1;

        if (playerData.currentLevel > playerData.highestLevel) {
            playerData.highestLevel = playerData.currentLevel - 1;
        }

        if (playerData.currentLevel > MAX_LEVEL) {
            alert("Game Completed! You've reached the highest level!");
            playerData.currentLevel = MAX_LEVEL;
            resetGame();
        } else {
            const levelMessage = document.getElementById("levelMessage");
            levelMessage.innerText = `Level ${playerData.currentLevel - 1} Completed! Reward: ${reward} BST. Click 'Claim Game Rewards' to sync to blockchain.`;
            levelMessage.style.display = "block";
            setTimeout(() => {
                levelMessage.style.display = "none";
            }, 3000);
        }

        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = setInterval(move, getSnakeSpeed(playerData.currentLevel));
        }

        updatePlayerHistoryUI();
        localStorage.setItem("playerData", JSON.stringify(playerData));
        estimateGasFee();
    }

    async function claimPendingRewards() {
        if (!contract) {
            alert("Please connect your wallet first!");
            return;
        }
        if (playerData.pendingRewards === 0) {
            alert("No rewards to claim!");
            return;
        }

        const totalReward = playerData.pendingRewards;
        const levelCount = playerData.pendingLevels.length;
        const highestLevel = playerData.highestLevel;

        queueTransaction(contract.batchLevelComplete, [totalReward, levelCount, highestLevel]);

        playerData.rewards += totalReward;
        playerData.levelsCompleted += levelCount;
        playerData.totalRewards += totalReward;
        playerData.pendingRewards = 0;
        playerData.pendingLevels = [];

        updatePlayerHistoryUI();
        localStorage.setItem("playerData", JSON.stringify(playerData));
        await loadPlayerHistory();
        estimateGasFee();
    }

    document.addEventListener("keydown", e => {
        if (e.key === "ArrowUp" && dy !== 1) { dx = 0; dy = -1; }
        if (e.key === "ArrowDown" && dy !== -1) { dx = 0; dy = 1; }
        if (e.key === "ArrowLeft" && dx !== 1) { dx = -1; dy = 0; }
        if (e.key === "ArrowRight" && dx !== -1) { dx = 1; dy = 0; }
    });

    let touchStartX = 0;
    let touchStartY = 0;

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
            if (diffX > 0 && dx !== -1) { dx = 1; dy = 0; }
            else if (dx !== 1) { dx = -1; dy = 0; }
        } else {
            if (diffY > 0 && dy !== -1) { dx = 0; dy = 1; }
            else if (dy !== 1) { dx = 0; dy = -1; }
        }
        touchStartX = touchEndX;
        touchStartY = touchEndY;
    });

    async function showLoading(show) {
        const loading = document.createElement("div");
        loading.id = "loading";
        loading.innerText = "Loading...";
        loading.style.position = "fixed";
        loading.style.top = "50%";
        loading.style.left = "50%";
        loading.style.transform = "translate(-50%, -50%)";
        loading.style.background = "rgba(0, 0, 0, 0.7)";
        loading.style.color = "white";
        loading.style.padding = "20px";
        loading.style.borderRadius = "10px";
        if (show) {
            document.body.appendChild(loading);
        } else {
            document.getElementById("loading")?.remove();
        }
    }

    document.getElementById("connectWallet").addEventListener("click", connectWallet);

    document.getElementById("playGame").addEventListener("click", () => {
        resetGame();
        if (!gameInterval) {
            gameInterval = setInterval(move, getSnakeSpeed(playerData.currentLevel));
        }
    });

    document.getElementById("nextLevel").addEventListener("click", async () => {
        if (!contract) {
            alert("Please connect your wallet first!");
            return;
        }
        queueTransaction(contract.nextLevel, []);
        playerData.score = 0;
        updatePlayerHistoryUI();
        localStorage.setItem("playerData", JSON.stringify(playerData));
        await loadPlayerHistory();
    });

    document.getElementById("claimGameRewards").addEventListener("click", claimPendingRewards);

    document.getElementById("stakeTokens").addEventListener("click", async () => {
        if (!contract) {
            alert("Please connect your wallet first!");
            return;
        }
        const stakeInput = document.getElementById("stakeInput");
        const amount = stakeInput.value;
        if (!amount || amount <= 0) {
            alert("Please enter a valid amount to stake!");
            return;
        }
        const amountInWei = ethers.utils.parseUnits(amount.toString(), 18);
        queueTransaction(contract.stakeTokens, [amountInWei]);
        stakeInput.value = "";
        await loadPlayerHistory();
    });

    document.getElementById("claimStakingReward").addEventListener("click", async () => {
        if (!contract) {
            alert("Please connect your wallet first!");
            return;
        }
        queueTransaction(contract.claimStakingReward, []);
        await loadPlayerHistory();
    });

    document.getElementById("unstakeTokens").addEventListener("click", async () => {
        if (!contract) {
            alert("Please connect your wallet first!");
            return;
        }
        queueTransaction(contract.unstakeTokens, []);
        await loadPlayerHistory();
    });

    document.getElementById("buyToken").addEventListener("click", () => {
        alert("Token sale will start on 1st May 2025!");
    });

    // Initial UI update
    updatePlayerHistoryUI();
    draw();
    estimateGasFee();
});
