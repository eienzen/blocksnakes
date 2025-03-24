document.addEventListener("DOMContentLoaded", () => {
    let account;
    let contract;
    let isConnecting = false;
    let transactionQueue = [];
    let isProcessingTransaction = false;

    // Load player history from localStorage
    let playerData = JSON.parse(localStorage.getItem("playerData")) || {
        gamesPlayed: 0,
        totalRewards: 0,
        score: 0,
        rewards: 0,
        pendingRewards: 0,
        pendingLevels: [],
        lastGameScore: 0,
        lastGameRewards: 0
    };

    // Ensure pendingLevels is properly initialized
    playerData.pendingLevels = playerData.pendingLevels || [];

    const contractAddress = "0xca9361708db63ab85dc5c8af3a8b4ac744719371"; // यहाँ नया कॉन्ट्रैक्ट अड्रेस डालें
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
        if (window.ethereum) {
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
            playerData.totalRewards = Number(history.totalRewards) / 10 ** 18;
            updatePlayerHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
        } catch (error) {
            console.error("Error loading player history:", error);
        }
    }

    function updatePlayerHistoryUI() {
        document.getElementById("gamesPlayed").innerText = `Games Played: ${playerData.gamesPlayed}`;
        document.getElementById("totalGameRewards").innerText = `Total Game Rewards: ${playerData.totalRewards} BST`;
        document.getElementById("lastGameScore").innerText = `Last Game Score: ${playerData.lastGameScore || 0}`;
        document.getElementById("lastGameRewards").innerText = `Last Game Rewards: ${playerData.lastGameRewards || 0} BST`;
        document.getElementById("score").innerText = `Score: ${playerData.score}`;
        document.getElementById("gameRewards").innerText = `Game Rewards: ${playerData.rewards} BST`;
        document.getElementById("pendingRewardsText").innerText = `Pending Rewards: ${playerData.pendingRewards} BST`;
        document.getElementById("pendingLevelsText").innerText = `Pending Milestones: ${playerData.pendingLevels.length}`;
    }

    async function estimateGasFee() {
        if (!contract || !account || playerData.pendingRewards === 0) {
            document.getElementById("gasEstimate").innerText = "";
            return;
        }
        try {
            const totalReward = playerData.pendingRewards;
            const milestoneCount = playerData.pendingLevels.length;
            const gasEstimate = await contract.estimateGas.batchLevelComplete(totalReward, milestoneCount, 0);
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
    let box = { x: 15, y: 15 }; // बॉक्स (फूड की जगह)
    let dx = 1;
    let dy = 0;
    let gameInterval = null;
    const SNAKE_SPEED = 300; // डिफिकल्टी वही रखी (300ms)

    function draw() {
        // 3D बैकग्राउंड
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "#0a0a23");
        gradient.addColorStop(1, "#1f2a44");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 3D स्नेक
        snake.forEach((segment, index) => {
            const segmentGradient = ctx.createLinearGradient(segment.x * 20, segment.y * 20, (segment.x + 1) * 20, (segment.y + 1) * 20);
            segmentGradient.addColorStop(0, index === 0 ? "#ff00ff" : "#00ffcc");
            segmentGradient.addColorStop(1, "#ff66cc");
            ctx.fillStyle = segmentGradient;
            ctx.shadowColor = "rgba(255, 0, 255, 0.5)";
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;
            ctx.beginPath();
            ctx.roundRect(segment.x * 20, segment.y * 20, 18, 18, 5);
            ctx.fill();
            ctx.strokeStyle = "#000";
            ctx.stroke();
            if (index === 0) {
                // 3D आंखें
                ctx.fillStyle = "#fff";
                ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
                ctx.shadowBlur = 5;
                ctx.beginPath();
                ctx.arc(segment.x * 20 + 5, segment.y * 20 + 5, 3, 0, Math.PI * 2);
                ctx.arc(segment.x * 20 + 13, segment.y * 20 + 5, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#000";
                ctx.shadowBlur = 0;
                ctx.beginPath();
                ctx.arc(segment.x * 20 + 5, segment.y * 20 + 5, 1, 0, Math.PI * 2);
                ctx.arc(segment.x * 20 + 13, segment.y * 20 + 5, 1, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // 3D बॉक्स (फूड की जगह)
        const boxGradient = ctx.createLinearGradient(box.x * 20, box.y * 20, (box.x + 1) * 20, (box.y + 1) * 20);
        boxGradient.addColorStop(0, "#ff5555");
        boxGradient.addColorStop(1, "#ffaa00");
        ctx.fillStyle = boxGradient;
        ctx.shadowColor = "rgba(255, 85, 85, 0.5)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        ctx.fillRect(box.x * 20, box.y * 20, 18, 18);
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        ctx.strokeRect(box.x * 20, box.y * 20, 18, 18);
        // 3D इफेक्ट के लिए हाइलाइट लाइन्स
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.moveTo(box.x * 20, box.y * 20);
        ctx.lineTo(box.x * 20 + 5, box.y * 20 + 5);
        ctx.moveTo(box.x * 20 + 18, box.y * 20);
        ctx.lineTo(box.x * 20 + 13, box.y * 20 + 5);
        ctx.moveTo(box.x * 20 + 18, box.y * 20 + 18);
        ctx.lineTo(box.x * 20 + 13, box.y * 20 + 13);
        ctx.moveTo(box.x * 20, box.y * 20 + 18);
        ctx.lineTo(box.x * 20 + 5, box.y * 20 + 13);
        ctx.stroke();
    }

    function move() {
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };
        snake.unshift(head);
        if (head.x === box.x && head.y === box.y) {
            playerData.score += 10;
            // स्कोर के आधार पर रिवॉर्ड
            if (playerData.score > 0 && playerData.score % 100 === 0) {
                const reward = 5; // 100 स्कोर के लिए 5 BST
                playerData.pendingRewards += reward;
                playerData.pendingLevels.push({ score: playerData.score, reward });
                const levelMessage = document.getElementById("levelMessage");
                levelMessage.innerText = `Milestone Reached! Score: ${playerData.score}, Reward: ${reward} BST.`;
                levelMessage.style.display = "block";
                setTimeout(() => {
                    levelMessage.style.display = "none";
                }, 3000);
            }
            updatePlayerHistoryUI();
            box = { x: Math.floor(Math.random() * 30), y: Math.floor(Math.random() * 20) };
        } else {
            snake.pop();
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
        // गेम ओवर होने पर स्कोर और रिवॉर्ड्स हिस्ट्री में जोड़ें
        playerData.lastGameScore = playerData.score;
        playerData.lastGameRewards = playerData.pendingRewards;
        snake = [{ x: 10, y: 10 }];
        box = { x: 15, y: 15 };
        dx = 1;
        dy = 0;
        playerData.gamesPlayed += 1;
        playerData.score = 0;
        updatePlayerHistoryUI();
        localStorage.setItem("playerData", JSON.stringify(playerData));
        draw();
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
        // मिनिमम विड्रॉल लिमिट चेक
        if (playerData.pendingRewards < 50) {
            alert("Minimum withdrawal limit is 50 BST. You need more rewards to claim!");
            return;
        }

        const totalReward = playerData.pendingRewards;
        const milestoneCount = playerData.pendingLevels.length;

        queueTransaction(contract.batchLevelComplete, [totalReward, milestoneCount, 0]);

        playerData.rewards += totalReward;
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
            gameInterval = setInterval(move, SNAKE_SPEED);
        }
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
