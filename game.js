document.addEventListener("DOMContentLoaded", () => {
    let account = null;
    let contract = null;
    let gameInterval = null;
    const TARGET_NETWORK_ID = "97"; // BNB Testnet Chain ID

    let playerData = JSON.parse(localStorage.getItem("playerData")) || {
        gamesPlayed: 0,
        totalRewards: 0,
        score: 0,
        pendingRewards: 0,
        totalReferrals: 0,
        referralRewards: 0,
        pendingReferral: null,
        pendingReferrerReward: 0,
        rewardHistory: [],
        stakedAmount: 0,
        stakeTimestamp: 0,
        pendingStakeRewards: 0,
        hasClaimedWelcomeBonus: false
    };

    const urlParams = new URLSearchParams(window.location.search);
    const referrerAddress = urlParams.get("ref");
    if (referrerAddress && !playerData.pendingReferral) {
        playerData.pendingReferral = referrerAddress;
    }

    const contractAddress = "0x98948c3b81253686c682A2A7525F913FFBE95e7c"; // यहाँ कॉन्ट्रैक्ट एड्रेस डालें
    const contractABI = [
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
				"indexed": false,
				"internalType": "string",
				"name": "message",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "DebugLog",
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
				"name": "ownerReward",
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
				"name": "totalReward",
				"type": "uint256"
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
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
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
		"inputs": [],
		"name": "OWNER_COMMISSION_RATE",
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

    function updateCanvasSize() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        gridSize = Math.min(screenWidth / gridWidth, screenHeight / gridHeight);
        canvas.width = gridSize * gridWidth;
        canvas.height = gridSize * gridHeight;
        canvas.style.width = `${canvas.width}px`;
        canvas.style.height = `${canvas.height}px`;
    }

    function enterFullscreen() {
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen();
        } else if (canvas.webkitRequestFullscreen) {
            canvas.webkitRequestFullscreen();
        } else if (canvas.mozRequestFullScreen) {
            canvas.mozRequestFullScreen();
        } else if (canvas.msRequestFullscreen) {
            canvas.msRequestFullscreen();
        }
    }

    function generateBox() {
        box.x = Math.floor(Math.random() * gridWidth);
        box.y = Math.floor(Math.random() * gridHeight);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#0a0a23";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        snake.forEach(segment => {
            ctx.fillStyle = "#00ffcc";
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
        });

        ctx.fillStyle = "#ff5555";
        ctx.fillRect(box.x * gridSize, box.y * gridSize, gridSize - 2, gridSize - 2);

        document.getElementById('score').textContent = `Score: ${score}`;
        document.getElementById('potentialBST').textContent = `Potential BST: ${(score / 100 * 5).toFixed(2)}`;
        document.getElementById('gameRewards').textContent = `Game Rewards: ${gameRewards} BST`;
    }

    function updateStakeRewardLocally() {
        const now = Math.floor(Date.now() / 1000);
        if (playerData.stakedAmount > 0 && playerData.stakeTimestamp > 0) {
            const timeElapsed = now - playerData.stakeTimestamp;
            const reward = (playerData.stakedAmount * 5 * timeElapsed) / (30 * 24 * 60 * 60 * 100);
            playerData.pendingStakeRewards += reward;
            playerData.pendingRewards += reward;
            playerData.stakeTimestamp = now;
            playerData.rewardHistory.push({ amount: reward, timestamp: Date.now(), rewardType: "Stake", referee: "N/A" });
            updatePlayerHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
        }
    }

    setInterval(updateStakeRewardLocally, 60 * 1000);

    async function move() {
        let head = { x: snake[0].x, y: snake[0].y };
        if (direction === 'right') head.x++;
        if (direction === 'left') head.x--;
        if (direction === 'up') head.y--;
        if (direction === 'down') head.y++;

        if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
            clearInterval(gameInterval);
            gameInterval = null;
            showGameOverPopup();
            return;
        }

        snake.unshift(head);
        if (head.x === box.x && head.y === box.y) {
            score += 10; // 1 बॉक्स = 10 स्कोर
            if (score >= 100) {
                const reward = 5; // 100 स्कोर = 5 BST
                const referrerReward = reward * 0.01; // 1% रेफरर को (0.05 BST)
                playerData.pendingRewards += reward;
                gameRewards += reward;
                score -= 100; // स्कोर रीसेट करें

                playerData.rewardHistory.push({ amount: reward, timestamp: Date.now(), rewardType: "Game", referee: "N/A" });
                if (playerData.pendingReferral) {
                    playerData.pendingReferrerReward += referrerReward;
                    playerData.referralRewards += referrerReward;
                    playerData.totalReferrals += 1;
                    playerData.rewardHistory.push({ amount: referrerReward, timestamp: Date.now(), rewardType: "Referral", referee: playerData.pendingReferral });
                }
            }
            generateBox();
        } else {
            snake.pop();
        }
        draw();
        updatePlayerHistoryUI();
        localStorage.setItem("playerData", JSON.stringify(playerData));
    }

    function showGameOverPopup() {
        let popup = document.getElementById("gameOverPopup");
        if (!popup) {
            popup = document.createElement("div");
            popup.id = "gameOverPopup";
            popup.innerHTML = `
                <h2>Game Over!</h2>
                <p id="finalScore">Score: ${score}</p>
                <p id="finalPotentialBST">Potential BST: ${(score / 100 * 5).toFixed(2)}</p>
                <p id="finalRewards">Rewards: ${gameRewards} BST</p>
                <button id="startNewGame">Start New Game</button>
            `;
            popup.style.cssText = "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: #fff; color: #000; padding: 20px; border: 2px solid #333;";
            document.body.appendChild(popup);
            document.getElementById("startNewGame").addEventListener("click", resetGame);
        }
        popup.style.display = "block";
    }

    async function resetGame() {
        if (gameInterval) clearInterval(gameInterval);
        playerData.gamesPlayed += 1;
        score = 0;
        gameRewards = 0;
        snake = [{ x: 10, y: 10 }];
        box = { x: 15, y: 15 };
        direction = 'right';
        updatePlayerHistoryUI();
        localStorage.setItem("playerData", JSON.stringify(playerData));
        draw();
        const popup = document.getElementById("gameOverPopup");
        if (popup) popup.style.display = "none";
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowUp' && direction !== 'down') direction = 'up';
        if (event.key === 'ArrowDown' && direction !== 'up') direction = 'down';
        if (event.key === 'ArrowLeft' && direction !== 'right') direction = 'left';
        if (event.key === 'ArrowRight' && direction !== 'left') direction = 'right';
    });

    let touchStartX = 0;
    let touchStartY = 0;

    canvas.addEventListener('touchstart', (event) => {
        event.preventDefault();
        const touch = event.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    });

    canvas.addEventListener('touchmove', (event) => {
        event.preventDefault();
        const touch = event.touches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 10 && direction !== 'left') direction = 'right';
            else if (deltaX < -10 && direction !== 'right') direction = 'left';
        } else {
            if (deltaY > 10 && direction !== 'up') direction = 'down';
            else if (deltaY < -10 && direction !== 'down') direction = 'up';
        }
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    });

    window.addEventListener('resize', updateCanvasSize);

    updateCanvasSize();
    draw();

    const playGameBtn = document.getElementById('playGame');
    if (playGameBtn) {
        playGameBtn.addEventListener('click', () => {
            if (!account) return alert("Please connect your wallet!");
            enterFullscreen();
            resetGame();
            if (!gameInterval) gameInterval = setInterval(move, SNAKE_SPEED);
        });
    }

    function generateReferralLink() {
        if (!account) return alert("Connect your wallet first!");
        const referralLink = `${window.location.origin}${window.location.pathname}?ref=${account}`;
        navigator.clipboard.writeText(referralLink).then(() => alert("Referral link copied: " + referralLink));
    }

    async function approveTokens(amount) {
        if (!contract || !account) return alert("Connect your wallet first!");
        if (amount <= 0) return alert("Amount must be greater than 0!");

        try {
            const balance = await contract.balanceOf(account);
            const amountWei = ethers.parseUnits(amount.toString(), 18);

            if (balance < amountWei) {
                return alert("Insufficient BST balance! Please get some BST tokens.");
            }

            const allowance = await contract.allowance(account, contractAddress);
            if (allowance < amountWei) {
                const approveTx = await contract.approve(contractAddress, amountWei);
                await approveTx.wait();
                alert(`Approved ${amount} BST for staking! Now you can stake your tokens.`);
            } else {
                alert("Already approved sufficient tokens! Proceed to stake.");
            }
        } catch (error) {
            console.error("Error approving tokens:", error);
            alert("Failed to approve tokens: " + (error.message || "Unknown error"));
        }
    }

    async function stakeTokens(amount) {
        if (!contract || !account) return alert("Connect your wallet first!");
        if (amount <= 0) return alert("Amount must be greater than 0!");

        try {
            const balance = await contract.balanceOf(account);
            const amountWei = ethers.parseUnits(amount.toString(), 18);

            if (balance < amountWei) {
                return alert("Insufficient BST balance! Please get some BST tokens.");
            }

            const allowance = await contract.allowance(account, contractAddress);
            if (allowance < amountWei) {
                return alert("Please approve tokens first using the 'Approve Tokens' button!");
            }

            const tx = await contract.stake(amountWei);
            await tx.wait();
            playerData.stakedAmount += amount;
            playerData.stakeTimestamp = Math.floor(Date.now() / 1000);
            localStorage.setItem("playerData", JSON.stringify(playerData));
            updatePlayerHistoryUI();
            alert(`Successfully staked ${amount} BST!`);
        } catch (error) {
            console.error("Error staking tokens:", error);
            let errorMessage = error.message || "Unknown error";
            if (error.data && error.data.message) {
                errorMessage = error.data.message;
            }
            alert("Failed to stake tokens: " + errorMessage);
        }
    }

    async function claimWelcomeBonus() {
        if (!contract || !account) return alert("Connect your wallet first!");
        if (playerData.hasClaimedWelcomeBonus) return alert("Welcome bonus already claimed!");
        try {
            const tx = await contract.claimWelcomeBonus();
            await tx.wait();
            playerData.hasClaimedWelcomeBonus = true;
            playerData.totalRewards += 100;
            playerData.rewardHistory.push({ amount: 100, timestamp: Date.now(), rewardType: "Welcome Bonus", referee: "N/A" });
            updatePlayerHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
            alert("Welcome bonus of 100 BST claimed!");
        } catch (error) {
            console.error("Error claiming welcome bonus:", error);
            alert("Failed to claim welcome bonus: " + (error.message || "Unknown error"));
        }
    }

    async function connectWallet() {
        if (!window.ethereum) return alert("Please install MetaMask or another compatible wallet!");
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const network = await provider.getNetwork();
            if (network.chainId.toString() !== TARGET_NETWORK_ID) {
                try {
                    await window.ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: `0x${parseInt(TARGET_NETWORK_ID).toString(16)}` }],
                    });
                } catch (switchError) {
                    if (switchError.code === 4902) {
                        await window.ethereum.request({
                            method: "wallet_addEthereumChain",
                            params: [{
                                chainId: `0x${parseInt(TARGET_NETWORK_ID).toString(16)}`,
                                chainName: "BNB Testnet",
                                nativeCurrency: { name: "BNB", symbol: "tBNB", decimals: 18 },
                                rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545/"],
                                blockExplorerUrls: ["https://testnet.bscscan.com"],
                            }],
                        });
                    } else {
                        throw switchError;
                    }
                }
            }

            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            account = accounts[0];
            const signer = await provider.getSigner();
            contract = new ethers.Contract(contractAddress, contractABI, signer);

            const connectBtn = document.getElementById("connectWallet");
            const disconnectBtn = document.getElementById("disconnectWallet");
            const walletAddr = document.getElementById("walletAddress");
            if (connectBtn) connectBtn.style.display = "none";
            if (disconnectBtn) disconnectBtn.style.display = "block";
            if (walletAddr) walletAddr.textContent = `Connected: ${account.slice(0, 6)}...`;

            await loadPlayerHistory();
            alert("Wallet connected successfully!");
        } catch (error) {
            console.error("Error connecting wallet:", error);
            alert("Failed to connect wallet: " + (error.message || "Unknown error"));
        }
    }

    function disconnectWallet() {
        account = null;
        contract = null;
        const connectBtn = document.getElementById("connectWallet");
        const disconnectBtn = document.getElementById("disconnectWallet");
        const walletAddr = document.getElementById("walletAddress");
        if (connectBtn) connectBtn.style.display = "block";
        if (disconnectBtn) disconnectBtn.style.display = "none";
        if (walletAddr) walletAddr.textContent = "";
        alert("Wallet disconnected!");
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
            playerData.hasClaimedWelcomeBonus = history.hasClaimedWelcomeBonus;

            const rewards = await contract.getRewardHistory(account);
            playerData.rewardHistory = rewards.map(r => ({
                amount: Number(r.amount) / 10 ** 18,
                timestamp: Number(r.timestamp) * 1000,
                rewardType: r.rewardType,
                referee: r.referee === "0x0000000000000000000000000000000000000000" ? "N/A" : r.referee
            }));

            updatePlayerHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
        } catch (error) {
            console.error("Error loading player history:", error);
        }
    }

    function updatePlayerHistoryUI() {
        const elements = {
            gamesPlayed: `Games Played: ${playerData.gamesPlayed}`,
            totalGameRewards: `Total Game Rewards: ${playerData.totalRewards} BST`,
            totalReferrals: `Total Referrals: ${playerData.totalReferrals}`,
            referralRewards: `Referral Rewards: ${playerData.referralRewards} BST`,
            pendingRewardsText: `Pending Rewards: ${playerData.pendingRewards} BST`,
            stakedAmountText: `Staked Amount: ${playerData.stakedAmount} BST`,
            pendingStakeRewardsText: `Pending Stake Rewards: ${playerData.pendingStakeRewards} BST`
        };

        for (const [id, value] of Object.entries(elements)) {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        }

        const historyList = document.getElementById("rewardHistoryList");
        if (historyList) {
            historyList.innerHTML = "";
            playerData.rewardHistory.forEach(entry => {
                const li = document.createElement("li");
                li.textContent = `${entry.rewardType}: ${entry.amount} BST on ${new Date(entry.timestamp).toLocaleString()}`;
                historyList.appendChild(li);
            });
        }
    }

    async function claimPendingRewards() {
        if (!contract || !account) return alert("Connect your wallet first!");
        if (playerData.pendingRewards < 10) return alert("Minimum 10 BST required to claim!");
        try {
            const tx = await contract.claimAllRewards(
                ethers.parseUnits(playerData.pendingRewards.toString(), 18),
                playerData.pendingReferral || "0x0000000000000000000000000000000000000000"
            );
            await tx.wait();
            playerData.totalRewards += playerData.pendingRewards;
            playerData.referralRewards += playerData.pendingReferrerReward;
            playerData.pendingRewards = 0;
            playerData.pendingReferrerReward = 0;
            playerData.pendingReferral = null;
            updatePlayerHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
            alert("Rewards claimed successfully!");
        } catch (error) {
            console.error("Error claiming rewards:", error);
            let errorMessage = error.message || "Unknown error";
            if (error.data && error.data.message) {
                errorMessage = error.data.message;
            }
            alert("Failed to claim rewards: " + errorMessage);
        }
    }

    const connectBtn = document.getElementById("connectWallet");
    const disconnectBtn = document.getElementById("disconnectWallet");
    const referralBtn = document.getElementById("getReferralLink");
    const claimRewardsBtn = document.getElementById("claimGameRewards");
    const stakeBtn = document.getElementById("stakeTokens");
    const approveBtn = document.getElementById("approveTokens");
    const welcomeBtn = document.getElementById("welcomeBonusButton");

    if (connectBtn) connectBtn.addEventListener("click", connectWallet);
    if (disconnectBtn) disconnectBtn.addEventListener("click", disconnectWallet);
    if (referralBtn) referralBtn.addEventListener("click", generateReferralLink);
    if (claimRewardsBtn) claimRewardsBtn.addEventListener("click", claimPendingRewards);
    if (stakeBtn) stakeBtn.addEventListener("click", () => {
        const amount = document.getElementById("stakeInput")?.value;
        if (amount) stakeTokens(parseFloat(amount));
    });
    if (approveBtn) approveBtn.addEventListener("click", () => {
        const amount = document.getElementById("stakeInput")?.value;
        if (amount) approveTokens(parseFloat(amount));
    });
    if (welcomeBtn) welcomeBtn.addEventListener("click", claimWelcomeBonus);
});
