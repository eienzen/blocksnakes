document.addEventListener("DOMContentLoaded", () => {
    let account = null;
    let contract = null;
    let isConnecting = false;
    let gameInterval = null;

    let playerData = JSON.parse(localStorage.getItem("playerData")) || {
        gamesPlayed: 0,
        totalRewards: 0,
        score: 0,
        points: 0,
        rewards: 0,
        pendingRewards: 0,
        pendingLevels: [],
        lastGameScore: 0,
        lastGameRewards: 0,
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
    playerData.pendingLevels = playerData.pendingLevels || [];
    playerData.rewardHistory = playerData.rewardHistory || [];

    const urlParams = new URLSearchParams(window.location.search);
    const referrerAddress = urlParams.get("ref");
    if (referrerAddress && !playerData.pendingReferral) {
        playerData.pendingReferral = referrerAddress;
        localStorage.setItem("playerData", JSON.stringify(playerData));
    }

    const contractAddress = "0x6C12d2802cCF7072e9ED33b3bdBB0ce4230d5032"; // BlockSnakesGame का नया एड्रेस यहाँ डालें
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
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
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
        if (canvas.requestFullscreen) canvas.requestFullscreen();
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
        document.getElementById('points').textContent = `Points: ${playerData.points}`;
        document.getElementById('gameRewards').textContent = `Game Rewards: ${gameRewards} BST`;
    }

    function updateStakeRewardLocally() {
        const now = Math.floor(Date.now() / 1000);
        if (playerData.stakedAmount > 0 && playerData.stakeTimestamp > 0) {
            const timeElapsed = now - playerData.stakeTimestamp;
            const reward = (playerData.stakedAmount * 5 * timeElapsed) / (30 * 24 * 60 * 60 * 100);
            playerData.pendingStakeRewards = (playerData.pendingStakeRewards || 0) + reward;
            playerData.pendingRewards = (playerData.pendingRewards || 0) + reward;
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
            score += 10;
            playerData.points += 10;
            if (playerData.points >= 100) {
                const reward = 5;
                const referrerReward = reward * 0.01; // 1% रेफरल रिवॉर्ड (0.05 BST)
                playerData.pendingRewards += reward;
                playerData.points -= 100;
                gameRewards += reward;

                playerData.rewardHistory.push({ amount: reward, timestamp: Date.now(), rewardType: "Game", referee: "N/A" });
                if (playerData.pendingReferral) {
                    playerData.pendingReferrerReward = (playerData.pendingReferrerReward || 0) + referrerReward;
                    playerData.referralRewards = (playerData.referralRewards || 0) + referrerReward;
                    playerData.totalReferrals = (playerData.totalReferrals || 0) + 1;
                    playerData.rewardHistory.push({ amount: referrerReward, timestamp: Date.now(), rewardType: "Referral", referee: playerData.pendingReferral });
                }
            }
            generateBox();
        } else {
            snake.pop();
        }
        draw();
        localStorage.setItem("playerData", JSON.stringify(playerData));
    }

    function showGameOverPopup() {
        const popup = document.getElementById("gameOverPopup");
        popup.style.display = "block";
        document.getElementById("finalScore").textContent = `Score: ${score}`;
        document.getElementById("finalPoints").textContent = `Points: ${playerData.points}`;
        document.getElementById("finalRewards").textContent = `Rewards: ${gameRewards} BST`;
    }

    async function resetGame() {
        if (gameInterval) clearInterval(gameInterval);
        playerData.lastGameScore = score;
        playerData.lastGameRewards = gameRewards;
        playerData.gamesPlayed += 1;
        score = 0;
        gameRewards = 0;
        playerData.points = 0;
        snake = [{ x: 10, y: 10 }];
        box = { x: 15, y: 15 };
        direction = 'right';
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

    window.addEventListener('resize', updateCanvasSize);

    updateCanvasSize();
    draw();

    document.getElementById('playGame').addEventListener('click', () => {
        if (!account) return alert("Please connect your wallet!");
        enterFullscreen();
        resetGame();
        if (!gameInterval) gameInterval = setInterval(move, SNAKE_SPEED);
    });

    function generateReferralLink() {
        if (!account) return alert("Connect your wallet first!");
        const referralLink = `${window.location.origin}${window.location.pathname}?ref=${account}`;
        navigator.clipboard.writeText(referralLink).then(() => alert("Referral link copied: " + referralLink));
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
            alert("Failed to stake tokens: " + error.message);
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
            alert("Failed to claim welcome bonus: " + error.message);
        }
    }

    async function connectWallet() {
        if (!window.ethereum) return alert("Please install MetaMask!");
        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            account = accounts[0];
            document.getElementById("connectWallet").style.display = "none";
            document.getElementById("disconnectWallet").style.display = "block";
            document.getElementById("walletAddress").textContent = `Connected: ${account.slice(0, 6)}...`;

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            contract = new ethers.Contract(contractAddress, contractABI, signer);

            await loadPlayerHistory();
            alert("Wallet connected successfully!");
        } catch (error) {
            alert("Failed to connect wallet: " + error.message);
        }
    }

    function disconnectWallet() {
        account = null;
        contract = null;
        document.getElementById("connectWallet").style.display = "block";
        document.getElementById("disconnectWallet").style.display = "none";
        document.getElementById("walletAddress").textContent = "";
        alert("Wallet disconnected!");
    }

    async function loadPlayerHistory() {
        if (!contract || !account) return;
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
    }

    function updatePlayerHistoryUI() {
        document.getElementById("gamesPlayed").textContent = `Games Played: ${playerData.gamesPlayed}`;
        document.getElementById("totalGameRewards").textContent = `Total Rewards: ${playerData.totalRewards} BST`;
        document.getElementById("totalReferrals").textContent = `Total Referrals: ${playerData.totalReferrals}`;
        document.getElementById("referralRewards").textContent = `Referral Rewards: ${playerData.referralRewards} BST`;
        document.getElementById("pendingRewardsText").textContent = `Pending Rewards: ${playerData.pendingRewards} BST`;
        document.getElementById("stakedAmountText").textContent = `Staked Amount: ${playerData.stakedAmount} BST`;
        document.getElementById("pendingStakeRewardsText").textContent = `Pending Stake Rewards: ${playerData.pendingStakeRewards} BST`;

        const historyList = document.getElementById("rewardHistoryList");
        historyList.innerHTML = "";
        playerData.rewardHistory.forEach(entry => {
            const li = document.createElement("li");
            li.textContent = `${entry.rewardType}: ${entry.amount} BST on ${new Date(entry.timestamp).toLocaleString()}`;
            historyList.appendChild(li);
        });
    }

    async function claimPendingRewards() {
        if (!contract || !account) return alert("Connect your wallet first!");
        if (playerData.pendingRewards < 10) return alert("Minimum 10 BST required!");
        try {
            const tx = await contract.claimAllRewards(
                account,
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
            alert("Failed to claim rewards: " + error.message);
        }
    }

    document.getElementById("connectWallet").addEventListener("click", connectWallet);
    document.getElementById("disconnectWallet").addEventListener("click", disconnectWallet);
    document.getElementById("getReferralLink").addEventListener("click", generateReferralLink);
    document.getElementById("claimGameRewards").addEventListener("click", claimPendingRewards);
    document.getElementById("stakeButton").addEventListener("click", () => {
        const amount = prompt("Enter amount to stake (BST):");
        if (amount) stakeTokens(parseFloat(amount));
    });
    document.getElementById("welcomeBonusButton").addEventListener("click", claimWelcomeBonus);
    document.getElementById("startNewGame").addEventListener("click", resetGame);
});
