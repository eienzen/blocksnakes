document.addEventListener("DOMContentLoaded", () => {
    const { ethers } = window.ethers;
    let account = null;
    let provider = null;
    let signer = null;
    let contract = null;
    let isConnecting = false;
    let gameInterval = null;

    // खिलाड़ी डेटा लोकल स्टोरेज से लोड करें
    let playerData = JSON.parse(localStorage.getItem("playerData")) || {
        gamesPlayed: 0,
        totalRewards: 0,
        score: 0,
        points: 0,
        rewards: 0,
        pendingRewards: 0,
        totalReferrals: 0,
        referralRewards: 0,
        rewardHistory: [],
        stakedAmount: 0,
        stakeTimestamp: 0,
        pendingStakeRewards: 0,
    };
    playerData.rewardHistory = playerData.rewardHistory || [];

    // रेफरल लिंक से पता प्राप्त करें
    const urlParams = new URLSearchParams(window.location.search);
    const referrerAddress = urlParams.get("ref");
    if (referrerAddress && !playerData.pendingReferral) {
        playerData.pendingReferral = referrerAddress;
        localStorage.setItem("playerData", JSON.stringify(playerData));
    }

    // कॉन्ट्रैक्ट डिटेल्स
    const contractAddress = "0xf49f65048cafc5163f623d46c598f92c64065834"; // यहाँ अपना कॉन्ट्रैक्ट पता डालें
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

    // स्नेक गेम सेटअप
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const gridWidth = 30;
    const gridHeight = 20;
    let gridSize;
    let snake = [{ x: 10, y: 10 }];
    let box = { x: 15, y: 15 };
    let direction = 'right';
    let score = 0;
    let gameRewards = 0;
    const SNAKE_SPEED = 300;
    let lastSnakeState = null;

    // कैनवास साइज़ अपडेट करें
    function updateCanvasSize() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        gridSize = Math.min(screenWidth / gridWidth, screenHeight / gridHeight);
        canvas.width = gridSize * gridWidth;
        canvas.height = gridSize * gridHeight;
        canvas.style.width = `${canvas.width}px`;
        canvas.style.height = `${canvas.height}px`;
    }

    // फुलस्क्रीन मोड में प्रवेश करें
    function enterFullscreen() {
        if (canvas.requestFullscreen) canvas.requestFullscreen();
        else if (canvas.mozRequestFullScreen) canvas.mozRequestFullScreen();
        else if (canvas.webkitRequestFullscreen) canvas.webkitRequestFullscreen();
        else if (canvas.msRequestFullscreen) canvas.msRequestFullscreen();
    }

    // बॉक्स जेनरेट करें
    function generateBox() {
        box.x = Math.floor(Math.random() * gridWidth);
        box.y = Math.floor(Math.random() * gridHeight);
    }

    // गेम ड्रॉ करें
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "#0a0a23");
        gradient.addColorStop(1, "#1f2a44");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        snake.forEach((segment, index) => {
            const segmentGradient = ctx.createLinearGradient(segment.x * gridSize, segment.y * gridSize, (segment.x + 1) * gridSize, (segment.y + 1) * gridSize);
            segmentGradient.addColorStop(0, index === 0 ? "#ff00ff" : "#00ffcc");
            segmentGradient.addColorStop(1, index === 0 ? "#ff66cc" : "#66ffcc");
            ctx.fillStyle = segmentGradient;
            ctx.shadowColor = "rgba(255, 0, 255, 0.5)";
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.roundRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2, 5);
            ctx.fill();
            ctx.strokeStyle = "#000";
            ctx.stroke();
        });

        const boxGradient = ctx.createLinearGradient(box.x * gridSize, box.y * gridSize, (box.x + 1) * gridSize, (box.y + 1) * gridSize);
        boxGradient.addColorStop(0, "#ff5555");
        boxGradient.addColorStop(1, "#ffaa00");
        ctx.fillStyle = boxGradient;
        ctx.shadowColor = "rgba(255, 85, 85, 0.5)";
        ctx.shadowBlur = 10;
        ctx.fillRect(box.x * gridSize, box.y * gridSize, gridSize - 2, gridSize - 2);

        document.getElementById('score').textContent = `Score: ${score}`;
        document.getElementById('points').textContent = `Points: ${playerData.points}`;
        document.getElementById('gameRewards').textContent = `Game Rewards: ${gameRewards} BST`;
    }

    // स्टेकिंग रिवॉर्ड्स को लोकली अपडेट करें
    function updateStakeRewardLocally() {
        if (!contract || !account) return;
        contract.calculateStakingReward(account).then(reward => {
            playerData.pendingStakeRewards = ethers.formatEther(reward);
            updatePlayerHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
        }).catch(err => console.error("Error calculating stake reward:", err));
    }
    setInterval(updateStakeRewardLocally, 60 * 1000);

    // स्नेक मूवमेंट
    async function move() {
        let head = { x: snake[0].x, y: snake[0].y };
        if (direction === 'right') head.x++;
        if (direction === 'left') head.x--;
        if (direction === 'up') head.y--;
        if (direction === 'down') head.y++;

        lastSnakeState = { snake: [...snake], direction, score, points: playerData.points, gameRewards };

        if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight || snake.some(s => s.x === head.x && s.y === head.y)) {
            clearInterval(gameInterval);
            gameInterval = null;
            showGameOverPopup();
            return;
        }

        snake.unshift(head);
        if (head.x === box.x && head.y === box.y) {
            score += 10;
            playerData.points += 10;
            if (playerData.points >= 100) {
                const reward = 5; // उदाहरण रिवॉर्ड
                gameRewards += reward;
                playerData.pendingRewards += reward;
                playerData.points -= 100;
                playerData.rewardHistory.push({
                    amount: reward,
                    timestamp: Date.now(),
                    rewardType: "Game (100 Points)",
                    referee: "N/A"
                });
                document.getElementById("levelMessage").innerText = `100 Points Reached! Reward: ${reward} BST`;
                document.getElementById("levelMessage").style.display = "block";
                setTimeout(() => document.getElementById("levelMessage").style.display = "none", 3000);
            }
            generateBox();
        } else {
            snake.pop();
        }
        draw();
        updatePlayerHistoryUI();
        localStorage.setItem("playerData", JSON.stringify(playerData));
    }

    // गेम ओवर पॉपअप
    function showGameOverPopup() {
        const popup = document.createElement("div");
        popup.id = "gameOverPopup";
        popup.style.cssText = "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #fff; padding: 20px; border: 2px solid #333;";
        popup.innerHTML = `
            <h2>Game Over!</h2>
            <p>Score: ${score}</p>
            <p>Points: ${playerData.points}</p>
            <p>Rewards: ${gameRewards} BST</p>
            <button id="startNewGame">Start New Game</button>
            <button id="payToContinue">Pay 5 BST to Continue</button>
            <button id="syncAndExit">Sync & Exit</button>
        `;
        document.body.appendChild(popup);

        document.getElementById("startNewGame").addEventListener("click", resetGame);
        document.getElementById("payToContinue").addEventListener("click", payToContinue);
        document.getElementById("syncAndExit").addEventListener("click", syncAndExit);
    }

    // गेम रीसेट करें
    async function resetGame() {
        if (gameInterval) clearInterval(gameInterval);
        playerData.gamesPlayed += 1;
        if (contract) await contract.incrementGamesPlayed(account);
        score = 0;
        gameRewards = 0;
        playerData.points = 0;
        snake = [{ x: 10, y: 10 }];
        box = { x: 15, y: 15 };
        direction = 'right';
        lastSnakeState = null;
        updatePlayerHistoryUI();
        localStorage.setItem("playerData", JSON.stringify(playerData));
        draw();
        document.getElementById("gameOverPopup")?.remove();
        gameInterval = setInterval(move, SNAKE_SPEED);
    }

    // गेम जारी रखें (5 BST का भुगतान)
    async function payToContinue() {
        if (!contract || !account) return alert("Connect your wallet first!");
        try {
            const tx = await contract.payToContinue();
            await tx.wait();
            snake = lastSnakeState.snake;
            direction = lastSnakeState.direction;
            score = lastSnakeState.score;
            playerData.points = lastSnakeState.points;
            gameRewards = lastSnakeState.gameRewards;
            gameInterval = setInterval(move, SNAKE_SPEED);
            document.getElementById("gameOverPopup")?.remove();
            alert("Game continued for 5 BST!");
        } catch (error) {
            console.error("Error paying to continue:", error);
            alert("Failed to continue game: " + error.message);
        }
    }

    // डेटा सिंक करें और बाहर निकलें
    async function syncAndExit() {
        if (!contract || !account) return alert("Connect your wallet first!");
        pauseGame();
        try {
            await syncPendingRewards();
            alert("Data synced successfully!");
            document.getElementById("gameOverPopup")?.remove();
        } catch (morph) {
            console.error("Error syncing data:", error);
            alert("Failed to sync data: " + error.message);
        }
    }

    // गेम पॉज करें
    function pauseGame() {
        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = null;
        }
    }

    // गेम रीस्टार्ट करें
    function restartGame() {
        if (!gameInterval) gameInterval = setInterval(move, SNAKE_SPEED);
    }

    // कीबोर्ड और टच इनपुट
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

    // वॉलेट कनेक्ट करें
    async function connectWallet() {
        if (isConnecting) return alert("Wallet connection in progress...");
        if (account) return alert("Wallet already connected!");
        if (!window.ethereum) return alert("Please install MetaMask!");

        try {
            isConnecting = true;
            provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            signer = await provider.getSigner();
            account = await signer.getAddress();
            contract = new ethers.Contract(contractAddress, contractABI, signer);

            document.getElementById("connectWallet").style.display = "none";
            document.getElementById("disconnectWallet").style.display = "inline-block";
            document.getElementById("disconnectWallet").innerText = `Connected: ${account.slice(0, 6)}...`;
            await loadPlayerHistory();
            alert("Wallet connected successfully!");
        } catch (error) {
            console.error("Error connecting wallet:", error);
            alert("Failed to connect wallet: " + error.message);
        } finally {
            isConnecting = false;
        }
    }

    // वॉलेट डिस्कनेक्ट करें
    function disconnectWallet() {
        account = null;
        provider = null;
        signer = null;
        contract = null;
        document.getElementById("connectWallet").style.display = "inline-block";
        document.getElementById("disconnectWallet").style.display = "none";
        alert("Wallet disconnected successfully!");
    }

    // खिलाड़ी इतिहास लोड करें
    async function loadPlayerHistory() {
        if (!contract || !account) return;
        try {
            const history = await contract.playerHistory(account);
            const stakeInfo = await contract.stakes(account);
            const rewardHistory = await contract.getRewardHistory(account);

            playerData.gamesPlayed = Number(history.gamesPlayed);
            playerData.totalRewards = ethers.formatEther(history.totalRewards);
            playerData.totalReferrals = Number(history.totalReferrals);
            playerData.referralRewards = ethers.formatEther(history.referralRewards);
            playerData.stakedAmount = ethers.formatEther(stakeInfo.amount);
            playerData.stakeTimestamp = Number(stakeInfo.startTime);
            playerData.pendingStakeRewards = ethers.formatEther(await contract.calculateStakingReward(account));
            playerData.rewardHistory = rewardHistory.map(entry => ({
                amount: ethers.formatEther(entry.amount),
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

    // UI अपडेट करें
    function updatePlayerHistoryUI() {
        document.getElementById("gamesPlayed").innerText = `Games Played: ${playerData.gamesPlayed}`;
        document.getElementById("totalGameRewards").innerText = `Total Game Rewards: ${playerData.totalRewards} BST`;
        document.getElementById("totalReferrals").innerText = `Total Referrals: ${playerData.totalReferrals}`;
        document.getElementById("referralRewards").innerText = `Referral Rewards: ${playerData.referralRewards} BST`;
        document.getElementById("pendingRewardsText").innerText = `Pending Rewards: ${playerData.pendingRewards} BST`;
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

    // रेफरल लिंक जेनरेट करें
    function generateReferralLink() {
        if (!account) return alert("Connect your wallet first!");
        const referralLink = `${window.location.origin}${window.location.pathname}?ref=${account}`;
        navigator.clipboard.writeText(referralLink).then(() => alert("Referral link copied: " + referralLink));
    }

    // टोकन स्टेक करें
    async function stakeTokens() {
        if (!contract || !account) return alert("Connect your wallet first!");
        const amount = document.getElementById("stakeInput").value;
        if (!amount) return alert("Enter an amount to stake!");
        try {
            const tx = await contract.stakeTokens(ethers.parseEther(amount));
            await tx.wait();
            playerData.stakedAmount = Number(playerData.stakedAmount) + Number(amount);
            playerData.stakeTimestamp = Math.floor(Date.now() / 1000);
            updatePlayerHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
            alert(`Successfully staked ${amount} BST!`);
        } catch (error) {
            console.error("Error staking tokens:", error);
            alert("Failed to stake tokens: " + error.message);
        }
    }

    // स्टेकिंग रिवॉर्ड्स क्लेम करें
    async function claimStakingReward() {
        if (!contract || !account) return alert("Connect your wallet first!");
        try {
            const tx = await contract.claimStakingReward();
            await tx.wait();
            playerData.pendingStakeRewards = 0;
            await loadPlayerHistory();
            alert("Staking rewards claimed successfully!");
        } catch (error) {
            console.error("Error claiming staking reward:", error);
            alert("Failed to claim staking reward: " + error.message);
        }
    }

    // टोकन अनस्टेक करें
    async function unstakeTokens() {
        if (!contract || !account) return alert("Connect your wallet first!");
        try {
            const tx = await contract.unstakeTokens();
            await tx.wait();
            playerData.stakedAmount = 0;
            playerData.stakeTimestamp = 0;
            playerData.pendingStakeRewards = 0;
            await loadPlayerHistory();
            alert("Tokens unstaked successfully!");
        } catch (error) {
            console.error("Error unstaking tokens:", error);
            alert("Failed to unstake tokens: " + error.message);
        }
    }

    // पेंडिंग रिवॉर्ड्स सिंक करें
    async function syncPendingRewards() {
        if (!contract || !account) return alert("Connect your wallet first!");
        if (playerData.pendingRewards < 10) return alert("You need at least 10 BST to sync rewards!");

        const totalReward = playerData.pendingRewards;
        const referrer = playerData.pendingReferral || "0x0000000000000000000000000000000000000000";
        const referee = account;
        const referrerReward = totalReward * 0.1; // 10% रेफरल रिवॉर्ड उदाहरण
        const refereeReward = 0;

        try {
            const tx = await contract.claimAllRewards(
                account,
                ethers.parseEther(totalReward.toString()),
                referrer,
                referee,
                ethers.parseEther(referrerReward.toString()),
                ethers.parseEther(refereeReward.toString())
            );
            await tx.wait();
            playerData.totalRewards = Number(playerData.totalRewards) + totalReward;
            playerData.pendingRewards = 0;
            playerData.pendingReferral = null;
            await loadPlayerHistory();
        } catch (error) {
            console.error("Error syncing rewards:", error);
            throw error;
        }
    }

    // पेंडिंग रिवॉर्ड्स क्लेम करें
    async function claimPendingRewards() {
        if (!contract || !account) return alert("Connect your wallet first!");
        pauseGame();
        try {
            await syncPendingRewards();
            alert("Rewards claimed successfully!");
            restartGame();
        } catch (error) {
            alert("Failed to claim rewards: " + error.message);
            restartGame();
        }
    }

    // इवेंट लिस्टनर्स
    document.getElementById("connectWallet")?.addEventListener("click", connectWallet);
    document.getElementById("disconnectWallet")?.addEventListener("click", disconnectWallet);
    document.getElementById("getReferralLink")?.addEventListener("click", generateReferralLink);
    document.getElementById("playGame")?.addEventListener("click", () => {
        if (!account) return alert("Connect your wallet to play!");
        enterFullscreen();
        resetGame();
        if (!gameInterval) gameInterval = setInterval(move, SNAKE_SPEED);
    });
    document.getElementById("claimGameRewards")?.addEventListener("click", claimPendingRewards);
    document.getElementById("stakeTokens")?.addEventListener("click", stakeTokens);
    document.getElementById("claimStakingReward")?.addEventListener("click", claimStakingReward);
    document.getElementById("unstakeTokens")?.addEventListener("click", unstakeTokens);
});
