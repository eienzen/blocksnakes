document.addEventListener("DOMContentLoaded", () => {
    let account = null;
    let contract = null;
    let isConnecting = false;
    let gameInterval = null;

    let playerData = JSON.parse(localStorage.getItem("playerData")) || {
        gamesPlayed: 0,
        totalRewards: 0,
        score: 0,
        points: 0, // नया: पॉइंट्स ट्रैक करने के लिए
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
        rewardHistory: [],
        stakedAmount: 0,
        stakeTimestamp: 0,
        pendingStakeRewards: 0
    };
    playerData.pendingLevels = playerData.pendingLevels || [];
    playerData.rewardHistory = playerData.rewardHistory || [];

    const urlParams = new URLSearchParams(window.location.search);
    const referrerAddress = urlParams.get("ref");
    if (referrerAddress && !playerData.pendingReferral) {
        playerData.pendingReferral = referrerAddress;
        localStorage.setItem("playerData", JSON.stringify(playerData));
    }

    const contractAddress = "0xc95ec79230a752f402fb42ed558206a3f5dfd8a6";
    const contractABI = [
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
				"indexed": false,
				"internalType": "address",
				"name": "referrer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "referrerReward",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "refereeReward",
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
		"name": "StakeRewardUpdated",
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
		"name": "Staked",
		"type": "event"
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
		"name": "renounceOwnership",
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
		"name": "stake",
		"outputs": [],
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
				"name": "player",
				"type": "address"
			}
		],
		"name": "updateStakeReward",
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
		"name": "withdrawTokens",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_bstToken",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "bstToken",
		"outputs": [
			{
				"internalType": "contract IERC20",
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
				"internalType": "uint256",
				"name": "stakedAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "stakeTimestamp",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "pendingStakeRewards",
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
		"name": "SECONDS_IN_MONTH",
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
		"name": "STAKE_REWARD_RATE",
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
    let snake = [{ x: 10, y: 10 }];
    let box = { x: 15, y: 15 };
    let direction = 'right';
    let score = 0;
    let gameRewards = 0;
    const SNAKE_SPEED = 300;
    let lastSnakeState = null;

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
        if (canvas.requestFullscreen) canvas.requestFullscreen();
        else if (canvas.mozRequestFullScreen) canvas.mozRequestFullScreen();
        else if (canvas.webkitRequestFullscreen) canvas.webkitRequestFullscreen();
        else if (canvas.msRequestFullscreen) canvas.msRequestFullscreen();
    }

    function generateBox() {
        box.x = Math.floor(Math.random() * gridWidth);
        box.y = Math.floor(Math.random() * gridHeight);
    }

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
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;
            ctx.beginPath();
            ctx.roundRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2, 5);
            ctx.fill();
            ctx.strokeStyle = "#000";
            ctx.stroke();

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

        document.getElementById('score').textContent = `Score: ${score}`;
        document.getElementById('points').textContent = `Points: ${playerData.points}`; // पॉइंट्स दिखाएं
        document.getElementById('gameRewards').textContent = `Game Rewards: ${gameRewards} BST`;
    }

    let hasReceivedWelcomeReward = false;
    let hasReceivedExtraReferralReward = false;

    function checkReferralRewards() {
        if (!account) return;

        if (score >= 50 && !hasReceivedWelcomeReward && playerData.pendingReferral) {
            hasReceivedWelcomeReward = true;
            const refereeAmount = 5;
            playerData.pendingRefereeReward = (playerData.pendingRefereeReward || 0) + refereeAmount;
            playerData.pendingRewards = (playerData.pendingRewards || 0) + refereeAmount;
            playerData.totalReferrals = (playerData.totalReferrals || 0) + 1;

            playerData.rewardHistory.push({
                amount: refereeAmount,
                timestamp: Date.now(),
                rewardType: "Referral (Welcome - Referee)",
                referee: "N/A"
            });

            updatePlayerHistoryUI();
            updateRewardHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
        }

        if (playerData.rewards >= 100 && !hasReceivedExtraReferralReward && playerData.pendingReferral) {
            hasReceivedExtraReferralReward = true;
            const referrerAmount = playerData.rewards * 0.01;
            playerData.pendingReferrerReward = (playerData.pendingReferrerReward || 0) + referrerAmount;
            playerData.referralRewards = (playerData.referralRewards || 0) + referrerAmount;

            playerData.rewardHistory.push({
                amount: referrerAmount,
                timestamp: Date.now(),
                rewardType: "Referral (Extra - Referrer)",
                referee: playerData.pendingReferral
            });

            updatePlayerHistoryUI();
            updateRewardHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
        }
    }

    function updateStakeRewardLocally() {
        const now = Math.floor(Date.now() / 1000);
        const lastTimestamp = playerData.stakeTimestamp || now;
        const SECONDS_IN_MONTH = 30 * 24 * 60 * 60;
        const STAKE_REWARD_RATE = 5;

        if (playerData.stakedAmount > 0 && now > lastTimestamp) {
            const timeElapsed = now - lastTimestamp;
            const reward = (playerData.stakedAmount * STAKE_REWARD_RATE * timeElapsed) / (SECONDS_IN_MONTH * 100);
            playerData.pendingStakeRewards = (playerData.pendingStakeRewards || 0) + reward;
            playerData.pendingRewards = (playerData.pendingRewards || 0) + reward;
            playerData.stakeTimestamp = now;

            playerData.rewardHistory.push({
                amount: reward,
                timestamp: Date.now(),
                rewardType: "Stake",
                referee: "N/A"
            });

            updatePlayerHistoryUI();
            updateRewardHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
        }
    }

    setInterval(updateStakeRewardLocally, 60 * 1000); // हर मिनट स्टेक रिवॉर्ड अपडेट

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
            points: playerData.points, // पॉइंट्स भी स्टोर करें
            gameRewards: gameRewards
        };

        if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
            clearInterval(gameInterval);
            gameInterval = null;
            showGameOverPopup();
            return;
        }

        snake.unshift(head);
        if (head.x === box.x && head.y === box.y) {
            score += 10;
            playerData.points += 10; // बॉक्स खाने पर 10 पॉइंट्स
            if (playerData.points >= 100) {
                const reward = 5;
                playerData.pendingRewards += reward;
                playerData.points -= 100; // 100 पॉइंट्स कट करें
                gameRewards += reward;

                playerData.rewardHistory.push({
                    amount: reward,
                    timestamp: Date.now(),
                    rewardType: "Game (100 Points)",
                    referee: "N/A"
                });

                const levelMessage = document.getElementById("levelMessage");
                levelMessage.innerText = `100 Points Reached! Reward: ${reward} BST`;
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
        localStorage.setItem("playerData", JSON.stringify(playerData)); // तुरंत हिस्ट्री अपडेट
    }

    function showGameOverPopup() {
        const popup = document.createElement("div");
        popup.id = "gameOverPopup";
        popup.style.position = "fixed";
        popup.style.top = "50%";
        popup.style.left = "50%";
        popup.style.transform = "translate(-50%, -50%)";
        popup.style.backgroundColor = "#fff";
        popup.style.padding = "20px";
        popup.style.border = "2px solid #333";
        popup.innerHTML = `
            <h2>Game Over!</h2>
            <p id="finalScore">Score: ${score}</p>
            <p id="finalPoints">Points: ${playerData.points}</p>
            <p id="finalRewards">Rewards: ${gameRewards} BST</p>
            <button id="startNewGame">Start New Game</button>
            <button id="syncAndExit">Sync & Exit</button>
        `;
        document.body.appendChild(popup);

        document.getElementById("startNewGame").addEventListener("click", resetGame);
        document.getElementById("syncAndExit").addEventListener("click", syncAndExit);
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
        playerData.points = 0; // गेम रीसेट पर पॉइंट्स भी रीसेट
        hasReceivedWelcomeReward = false;
        hasReceivedExtraReferralReward = false;
        snake = [{ x: 10, y: 10 }];
        box = { x: 15, y: 15 };
        direction = 'right';
        lastSnakeState = null;
        updatePlayerHistoryUI();
        localStorage.setItem("playerData", JSON.stringify(playerData));
        draw();
        const popup = document.getElementById("gameOverPopup");
        if (popup) popup.remove();
    }

    async function syncAndExit() {
        if (!contract || !account) {
            alert("Please connect your wallet to sync data!");
            return;
        }
        pauseGame();
        try {
            await syncPendingRewards();
            alert("Data synced successfully!");
        } catch (error) {
            console.error("Error syncing data:", error);
            alert("Failed to sync data: " + error.message);
        }
        document.getElementById("gameOverPopup").remove();
    }

    function pauseGame() {
        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = null;
            console.log("Game paused due to transaction");
        }
    }

    function restartGame() {
        if (!gameInterval) {
            gameInterval = setInterval(move, SNAKE_SPEED);
            console.log("Game restarted after transaction");
        }
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

    const playGameButton = document.getElementById('playGame');
    if (playGameButton) {
        playGameButton.addEventListener('click', () => {
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
    }

    function generateReferralLink() {
        if (!account) return alert("Connect your wallet first!");
        const referralLink = `${window.location.origin}${window.location.pathname}?ref=${account}`;
        navigator.clipboard.writeText(referralLink).then(() => {
            alert("Referral link copied to clipboard: " + referralLink);
        });
    }

    async function stakeTokens(amount) {
        if (!contract || !account) return alert("Connect your wallet first!");
        try {
            const tx = await contract.stake(ethers.parseUnits(amount.toString(), 18));
            await tx.wait();
            playerData.stakedAmount += amount;
            playerData.stakeTimestamp = Math.floor(Date.now() / 1000);
            localStorage.setItem("playerData", JSON.stringify(playerData));
            updatePlayerHistoryUI();
            alert(`Successfully staked ${amount} BST!`);
        } catch (error) {
            console.error("Error staking tokens:", error);
            alert("Failed to stake tokens: " + error.message);
        }
    }

    async function connectWallet() {
        if (isConnecting) {
            alert("Wallet connection in progress. Please wait.");
            return;
        }
        if (account) {
            alert("Wallet already connected!");
            return;
        }

        if (!window.ethereum) {
            alert("MetaMask not detected. Please install MetaMask and refresh the page.");
            return;
        }

        const provider = window.ethereum;
        if (!provider.isMetaMask) {
            alert("Detected provider is not MetaMask. Please use MetaMask.");
            return;
        }

        try {
            isConnecting = true;
            const accounts = await provider.request({ method: "eth_requestAccounts" });
            if (!accounts || accounts.length === 0) {
                throw new Error("No accounts found. Please ensure MetaMask is unlocked.");
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
            alert("Wallet connected successfully!");
        } catch (error) {
            console.error("Error connecting wallet:", error);
            if (error.code === 4001) {
                alert("You rejected the connection request. Please approve it in MetaMask.");
            } else if (error.code === -32002) {
                alert("A connection request is already pending. Please check MetaMask.");
            } else if (error.code === -32603) {
                alert("No active wallet found. Please ensure MetaMask is unlocked and try again.");
            } else {
                alert("Failed to connect wallet: " + error.message);
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
            playerData.stakedAmount = Number(history.stakedAmount) / 10 ** 18;
            playerData.stakeTimestamp = Number(history.stakeTimestamp);
            playerData.pendingStakeRewards = Number(history.pendingStakeRewards) / 10 ** 18;

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
        document.getElementById("stakedAmountText").innerText = `Staked Amount: ${playerData.stakedAmount || 0} BST`;
        document.getElementById("pendingStakeRewardsText").innerText = `Pending Stake Rewards: ${playerData.pendingStakeRewards || 0} BST`;
    }

    function updateRewardHistoryUI() {
        const historyList = document.getElementById("rewardHistoryList");
        historyList.innerHTML = "";
        playerData.rewardHistory.forEach(entry => {
            const date = new Date(entry.timestamp).toLocaleString();
            const li = document.createElement("li");
            li.innerText = `${entry.rewardType}: ${entry.amount.toFixed(6)} BST on ${date} ${entry.referee !== "N/A" ? `(Referee: ${entry.referee})` : ""}`;
            historyList.appendChild(li);
        });
    }

    async function syncPendingRewards() {
        if (!contract || !account) return alert("Connect your wallet first!");
        if (playerData.pendingRewards < 10) return alert("You need at least 10 BST to sync rewards!");

        const totalReward = playerData.pendingRewards;
        const referrer = playerData.pendingReferral || "0x0000000000000000000000000000000000000000";
        const referee = account;
        const referrerReward = playerData.pendingReferrerReward;
        const refereeReward = playerData.pendingRefereeReward;

        try {
            const tx = await contract.claimAllRewards(
                account,
                ethers.parseUnits(totalReward.toString(), 18),
                referrer,
                referee,
                ethers.parseUnits(referrerReward.toString(), 18),
                ethers.parseUnits(refereeReward.toString(), 18)
            );
            await tx.wait();
            playerData.rewards = (playerData.rewards || 0) + playerData.pendingRewards;
            playerData.totalRewards = (playerData.totalRewards || 0) + playerData.pendingRewards;
            playerData.pendingRewards = 0;
            playerData.pendingLevels = [];
            playerData.pendingReferral = null;
            playerData.pendingReferrerReward = 0;
            playerData.pendingRefereeReward = 0;
            playerData.pendingStakeRewards = 0;
            updatePlayerHistoryUI();
            updateRewardHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
        } catch (error) {
            console.error("Error syncing rewards:", error);
            throw error;
        }
    }

    async function claimPendingRewards() {
        if (!contract || !account) return alert("Connect your wallet first!");
        if (playerData.pendingRewards < 10) return alert("You need at least 10 BST to withdraw!");

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

    const connectWalletButton = document.getElementById("connectWallet");
    if (connectWalletButton) connectWalletButton.addEventListener("click", connectWallet);

    const disconnectWalletButton = document.getElementById("disconnectWallet");
    if (disconnectWalletButton) disconnectWalletButton.addEventListener("click", disconnectWallet);

    const getReferralLinkButton = document.getElementById("getReferralLink");
    if (getReferralLinkButton) getReferralLinkButton.addEventListener("click", generateReferralLink);

    const claimGameRewardsButton = document.getElementById("claimGameRewards");
    if (claimGameRewardsButton) claimGameRewardsButton.addEventListener("click", claimPendingRewards);

    const stakeButton = document.getElementById("stakeButton");
    if (stakeButton) stakeButton.addEventListener("click", () => {
        const amount = prompt("Enter amount to stake (BST):");
        if (amount) stakeTokens(parseFloat(amount));
    });
});
