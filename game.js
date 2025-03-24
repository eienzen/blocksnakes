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
        lastGameRewards: 0
    };
    playerData.pendingLevels = playerData.pendingLevels || [];

    // कॉन्ट्रैक्ट एड्रेस यहाँ डालें (रीमिक्स से नया कॉन्ट्रैक्ट एड्रेस लें)
    const contractAddress = "0x08e72a6bdfcf66ca6d43d45e8e65ff1772564938"; // यहाँ नया कॉन्ट्रैक्ट एड्रेस डालें

    // कॉन्ट्रैक्ट ABI यहाँ डालें (रीमिक्स से नया ABI लें)
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
    const SNAKE_SPEED = 300;

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
        // 3D बैकग्राउंड
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "#0a0a23");
        gradient.addColorStop(1, "#1f2a44");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 3D स्नेक
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
                // 3D आँखें
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

        // 3D बॉक्स
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
        // हाइलाइट लाइन्स
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

    // मूवमेंट फंक्शन
    function move() {
        let head = { x: snake[0].x, y: snake[0].y };
        if (direction === 'right') head.x++;
        if (direction === 'left') head.x--;
        if (direction === 'up') head.y--;
        if (direction === 'down') head.y++;

        // दीवार से टकराने की जाँच
        if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
            clearInterval(gameInterval);
            gameInterval = null;
            alert('Game Over! Score: ' + score);
            resetGame();
            return;
        }

        // स्नेक की बॉडी से टकराने की जाँच
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
                const levelMessage = document.getElementById("levelMessage");
                levelMessage.innerText = `Milestone Reached! Score: ${score}, Reward: ${reward} BST`;
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
            gameInterval = setInterval(move, SNAKE_SPEED);
        }
    });

    // वॉलेट और स्टेकिंग फंक्शन्स
    async function connectWallet() {
        if (isConnecting) return alert("Wallet connection in progress. Please wait.");
        if (account) return alert("Wallet already connected!");
        if (!window.ethereum) {
            alert("No Web3 wallet detected. Please install MetaMask or another Web3 wallet to continue.");
            return;
        }
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
            if (error.code === 4001) {
                alert("User rejected the request. Please connect your wallet to continue.");
            } else if (error.code === -32002) {
                alert("A wallet connection request is already pending. Please check your MetaMask extension.");
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
            updatePlayerHistoryUI();
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
        document.getElementById("pendingRewardsText").innerText = `Pending Rewards: ${playerData.pendingRewards} BST`;
        document.getElementById("pendingLevelsText").innerText = `Pending Milestones: ${playerData.pendingLevels.length}`;
    }

    async function claimPendingRewards() {
        if (!contract) return alert("Connect your wallet first!");
        if (playerData.pendingRewards < 50) return alert("Minimum withdrawal is 50 BST!");
        const totalReward = playerData.pendingRewards;
        queueTransaction(contract.addRewards, [totalReward]);
        playerData.rewards += totalReward;
        playerData.totalRewards += totalReward;
        playerData.pendingRewards = 0;
        playerData.pendingLevels = [];
        updatePlayerHistoryUI();
        localStorage.setItem("playerData", JSON.stringify(playerData));
        await loadPlayerHistory();
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
