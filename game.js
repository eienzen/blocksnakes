document.addEventListener("DOMContentLoaded", () => {
    let account;
    let contract;
    let isConnecting = false;
    let transactionQueue = [];
    let isProcessingTransaction = false;

    // प्लेयर डेटा लोकल स्टोरेज से लोड करें
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
    playerData.pendingLevels = playerData.pendingLevels || [];

    const contractAddress = "0xca9361708db63ab85dc5c8af3a8b4ac744719371";
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
];

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    // ग्रिड सेटअप
    const gridWidth = 30;
    const gridHeight = 20;
    let gridSize;
    let gameInterval;
    let snake = [{ x: 10, y: 10 }];
    let box = { x: 15, y: 15 };
    let direction = 'right';
    let score = 0;
    let gameRewards = 0;

    // कैनवास साइज़ डायनामिकली अपडेट करें
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

    // फुल स्क्रीन में जाएं
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

    // नया बॉक्स जेनरेट करें
    function generateBox() {
        box.x = Math.floor(Math.random() * gridWidth);
        box.y = Math.floor(Math.random() * gridHeight);
    }

    // ड्रॉइंग फंक्शन
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#1abc9c';
        snake.forEach(segment => {
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
        });
        ctx.fillStyle = '#ff5555';
        ctx.fillRect(box.x * gridSize, box.y * gridSize, gridSize - 2, gridSize - 2);
        document.getElementById('score').textContent = `Score: ${score}`;
        document.getElementById('gameRewards').textContent = `Game Rewards: ${gameRewards} BST`;
    }

    // मूवमेंट फंक्शन
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
            gameRewards += 2; // हर बॉक्स के लिए 2 BST
            if (score > 0 && score % 100 === 0) {
                playerData.pendingRewards += 5; // 100 स्कोर पर 5 BST
                playerData.pendingLevels.push({ score, reward: 5 });
                const levelMessage = document.getElementById("levelMessage");
                levelMessage.innerText = `Milestone Reached! Score: ${score}, Reward: 5 BST`;
                levelMessage.style.display = "block";
                setTimeout(() => levelMessage.style.display = "none", 3000);
            }
            generateBox();
        } else {
            snake.pop();
        }
        draw();
        updatePlayerHistoryUI();
    }

    // गेम रीसेट करें
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
        snake = [{ x: 10, y: 10 }];
        box = { x: 15, y: 15 };
        direction = 'right';
        updatePlayerHistoryUI();
        localStorage.setItem("playerData", JSON.stringify(playerData));
        draw();
    }

    // कीबोर्ड इनपुट
    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowUp' && direction !== 'down') direction = 'up';
        if (event.key === 'ArrowDown' && direction !== 'up') direction = 'down';
        if (event.key === 'ArrowLeft' && direction !== 'right') direction = 'left';
        if (event.key === 'ArrowRight' && direction !== 'left') direction = 'right';
    });

    // टच कंट्रोल्स
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

    // रिसाइज़ इवेंट
    window.addEventListener('resize', updateCanvasSize);

    // शुरुआती सेटअप
    updateCanvasSize();
    draw();

    // "Play Game" बटन
    document.getElementById('playGame').addEventListener('click', () => {
        enterFullscreen();
        resetGame();
        if (!gameInterval) {
            gameInterval = setInterval(move, 200);
        }
    });

    // बाकी फंक्शन्स (वॉलेट, स्टेकिंग, आदि)
    async function connectWallet() {
        if (isConnecting) return alert("Wallet connection in progress.");
        if (account) return alert("Wallet already connected!");
        if (window.ethereum) {
            try {
                isConnecting = true;
                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                account = accounts[0];
                document.getElementById("connectWallet").innerText = `Connected: ${account.substring(0, 6)}...`;
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                contract = new ethers.Contract(contractAddress, contractABI, signer);
                await loadPlayerHistory();
            } catch (error) {
                alert("Error connecting wallet: " + error.message);
            } finally {
                isConnecting = false;
            }
        } else {
            alert("Please install a Web3 wallet!");
        }
    }

    async function loadPlayerHistory() {
        if (!contract || !account) return;
        const history = await contract.playerHistory(account);
        playerData.gamesPlayed = Number(history.gamesPlayed);
        playerData.totalRewards = Number(history.totalRewards) / 10 ** 18;
        updatePlayerHistoryUI();
        localStorage.setItem("playerData", JSON.stringify(playerData));
    }

    function updatePlayerHistoryUI() {
        document.getElementById("gamesPlayed").innerText = `Games Played: ${playerData.gamesPlayed}`;
        document.getElementById("totalGameRewards").innerText = `Total Game Rewards: ${playerData.totalRewards} BST`;
        document.getElementById("lastGameScore").innerText = `Last Game Score: ${playerData.lastGameScore}`;
        document.getElementById("lastGameRewards").innerText = `Last Game Rewards: ${playerData.lastGameRewards} BST`;
        document.getElementById("pendingRewardsText").innerText = `Pending Rewards: ${playerData.pendingRewards} BST`;
        document.getElementById("pendingLevelsText").innerText = `Pending Milestones: ${playerData.pendingLevels.length}`;
    }

    async function claimPendingRewards() {
        if (!contract) return alert("Connect your wallet first!");
        if (playerData.pendingRewards < 50) return alert("Minimum withdrawal is 50 BST!");
        const totalReward = playerData.pendingRewards;
        const milestoneCount = playerData.pendingLevels.length;
        queueTransaction(contract.batchLevelComplete, [totalReward, milestoneCount, 0]);
        playerData.rewards += totalReward;
        playerData.totalRewards += totalReward;
        playerData.pendingRewards = 0;
        playerData.pendingLevels = [];
        updatePlayerHistoryUI();
        localStorage.setItem("playerData", JSON.stringify(playerData));
        await load    await loadPlayerHistory();
    }

    async function processTransactionQueue() {
        if (isProcessingTransaction || transactionQueue.length === 0) return;
        isProcessingTransaction = true;
        const { fn, args } = transactionQueue.shift();
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const gasPrice = await provider.getGasPrice();
            const tx = await fn(...args, { gasPrice: gasPrice.mul(2) });
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
    document.getElementById("claimGameRewards").addEventListener("click", claimPendingRewards);
    document.getElementById("stakeTokens").addEventListener("click", async () => {
        if (!contract) return alert("Connect your wallet first!");
        const amount = document.getElementById("stakeInput").value;
        if (!amount || amount <= 0) return alert("Enter a valid amount!");
        const amountInWei = ethers.utils.parseUnits(amount, 18);
        queueTransaction(contract.stakeTokens, [amountInWei]);
        document.getElementById("stakeInput").value = "";
        await loadPlayerHistory();
    });
    document.getElementById("claimStakingReward").addEventListener("click", async () => {
        if (!contract) return alert("Connect your wallet first!");
        queueTransaction(contract.claimStakingReward, []);
        await loadPlayerHistory();
    });
    document.getElementById("unstakeTokens").addEventListener("click", async () => {
        if (!contract) return alert("Connect your wallet first!");
        queueTransaction(contract.unstakeTokens, []);
        await loadPlayerHistory();
    });
    document.getElementById("buyToken").addEventListener("click", () => {
        alert("Token sale starts on 1st May 2025!");
    });

    updatePlayerHistoryUI();
});
