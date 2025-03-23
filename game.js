document.addEventListener("DOMContentLoaded", () => {
    let account;
    let contract;
    let isConnecting = false;
    let isTransactionPending = false;
    const contractAddress = "0x6699acf8d94d1a7b9740b7b7c1d51332620591c8"; // यहाँ नया कॉन्ट्रैक्ट अड्रेस डालें
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
				"name": "level",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "reward",
				"type": "uint256"
			}
		],
		"name": "LevelCompleted",
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
		"inputs": [],
		"name": "claimStakingReward",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "reward",
				"type": "uint256"
			}
		],
		"name": "levelComplete",
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

    // Load player history from localStorage
    let playerData = JSON.parse(localStorage.getItem("playerData")) || {
        gamesPlayed: 0,
        levelsCompleted: 0,
        totalRewards: 0,
        highestLevel: 0,
        score: 0,
        rewards: 0
    };

    async function connectWallet() {
        if (isConnecting) {
            alert("Wallet connection is already in progress. Please wait.");
            return;
        }
        if (account) {
            alert("Wallet is already connected!");
            return;
        }
        if (window.ethereum && window.ethereum.isMetaMask) {
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
            alert("Please install MetaMask! Other wallets are not supported.");
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
            updatePlayerHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
        } catch (error) {
            console.error("Error loading player history:", error);
        }
    }

    function updatePlayerHistoryUI() {
        document.getElementById("gamesPlayed").innerText = `Games Played: ${playerData.gamesPlayed}`;
        document.getElementById("levelsCompleted").innerText = `Levels Completed: ${playerData.levelsCompleted}`;
        document.getElementById("totalRewards").innerText = `Total Rewards: ${playerData.totalRewards} BST`;
        document.getElementById("highestLevel").innerText = `Highest Level: ${playerData.highestLevel}`;
        document.getElementById("score").innerText = `Score: ${playerData.score}`;
        document.getElementById("reward").innerText = `Rewards: ${playerData.rewards} BST`;
        document.getElementById("level").innerText = `Current Level: ${playerData.highestLevel + 1}`;
    }

    function setTransactionPending(pending) {
        isTransactionPending = pending;
        const buttons = ["nextLevel", "stakeTokens", "claimReward", "unstakeTokens"];
        buttons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            button.disabled = pending;
        });
    }

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    let snake = [{ x: 10, y: 10 }];
    let food = { x: 15, y: 15 };
    let dx = 1;
    let dy = 0;
    let gameInterval = null;

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        snake.forEach((segment, index) => {
            const gradient = ctx.createLinearGradient(segment.x * 20, segment.y * 20, (segment.x + 1) * 20, (segment.y + 1) * 20);
            gradient.addColorStop(0, index === 0 ? "#ff00ff" : "#00ff88");
            gradient.addColorStop(1, "#00b7eb");
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
        foodGradient.addColorStop(0, "#ff0000");
        foodGradient.addColorStop(1, "#ff5555");
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
        updatePlayerHistoryUI();
        localStorage.setItem("playerData", JSON.stringify(playerData));
        draw();
    }

    async function levelComplete() {
        if (!contract) {
            alert("Please connect your wallet first!");
            return;
        }
        if (isTransactionPending) {
            alert("A transaction is already pending. Please wait.");
            return;
        }
        try {
            setTransactionPending(true);
            const reward = 10; // 10 BST per level
            const tx = await contract.levelComplete(reward);
            await tx.wait();
            playerData.rewards += reward;
            playerData.score = 0; // Reset score after level completion
            updatePlayerHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
            await loadPlayerHistory(); // Refresh history from contract
        } catch (error) {
            alert("Error completing level: " + error.message);
        } finally {
            setTransactionPending(false);
        }
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
            gameInterval = setInterval(move, 300);
        }
    });

    document.getElementById("nextLevel").addEventListener("click", async () => {
        if (!contract) {
            alert("Please connect your wallet first!");
            return;
        }
        if (isTransactionPending) {
            alert("A transaction is already pending. Please wait.");
            return;
        }
        showLoading(true);
        try {
            setTransactionPending(true);
            const tx = await contract.nextLevel();
            await tx.wait();
            playerData.score = 0; // Reset score for new level
            updatePlayerHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
            await loadPlayerHistory();
        } catch (error) {
            alert("Error going to next level: " + error.message);
        } finally {
            setTransactionPending(false);
            showLoading(false);
        }
    });

    document.getElementById("stakeTokens").addEventListener("click", async () => {
        if (!contract) {
            alert("Please connect your wallet first!");
            return;
        }
        if (isTransactionPending) {
            alert("A transaction is already pending. Please wait.");
            return;
        }
        const stakeInput = document.getElementById("stakeInput");
        const amount = stakeInput.value;
        if (!amount || amount <= 0) {
            alert("Please enter a valid amount to stake!");
            return;
        }
        try {
            setTransactionPending(true);
            const amountInWei = ethers.utils.parseUnits(amount.toString(), 18);
            const tx = await contract.stakeTokens(amountInWei);
            await tx.wait();
            alert("Tokens staked successfully!");
            stakeInput.value = "";
            await loadPlayerHistory();
        } catch (error) {
            alert("Error staking tokens: " + error.message);
        } finally {
            setTransactionPending(false);
        }
    });

    document.getElementById("claimReward").addEventListener("click", async () => {
        if (!contract) {
            alert("Please connect your wallet first!");
            return;
        }
        if (isTransactionPending) {
            alert("A transaction is already pending. Please wait.");
            return;
        }
        try {
            setTransactionPending(true);
            const tx = await contract.claimStakingReward();
            await tx.wait();
            alert("Staking reward claimed successfully!");
            await loadPlayerHistory();
        } catch (error) {
            alert("Error claiming reward: " + error.message);
        } finally {
            setTransactionPending(false);
        }
    });

    document.getElementById("unstakeTokens").addEventListener("click", async () => {
        if (!contract) {
            alert("Please connect your wallet first!");
            return;
        }
        if (isTransactionPending) {
            alert("A transaction is already pending. Please wait.");
            return;
        }
        try {
            setTransactionPending(true);
            const tx = await contract.unstakeTokens();
            await tx.wait();
            alert("Tokens unstaked successfully!");
            await loadPlayerHistory();
        } catch (error) {
            alert("Error unstaking tokens: " + error.message);
        } finally {
            setTransactionPending(false);
        }
    });

    document.getElementById("buyToken").addEventListener("click", () => {
        alert("Token sale will start on 1st May 2025!");
    });

    // Initial UI update
    updatePlayerHistoryUI();
    draw();
});
