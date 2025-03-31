document.addEventListener("DOMContentLoaded", () => {
    let provider;
    let signer;
    let contract;
    let playerAddress;

    // यहाँ BlockSnakesGame का पता डालें
    const contractAddress = "0x3F4da0Ae45B6caC314BCC4A634280C84984272B9"; // Remix से कॉपी किया गया BlockSnakesGame का पता डालें
    
    // यहाँ नया contractABI पेस्ट करें (Remix से कॉपी करें)
    const contractABI = [
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
				"name": "to",
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
				"internalType": "uint256",
				"name": "ownerShare",
				"type": "uint256"
			}
		],
		"name": "TokensMinted",
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
		"name": "OWNER_SHARE",
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
	},
	{
		"inputs": [],
		"name": "bstToken",
		"outputs": [
			{
				"internalType": "contract BlockSnakesToken",
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
				"internalType": "uint256",
				"name": "referrerReward",
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
		"name": "claimWelcomeBonus",
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
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
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
	}
];

    // MetaMask कनेक्शन
    async function connectWallet() {
        if (typeof window.ethereum === 'undefined') {
            alert("MetaMask is not installed. Please install MetaMask to play the game.");
            return;
        }
        if (typeof ethers === 'undefined') {
            alert("Ethers.js library failed to load. Please check your internet connection or refresh the page.");
            return;
        }
        try {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            signer = provider.getSigner();
            playerAddress = await signer.getAddress();
            contract = new ethers.Contract(contractAddress, contractABI, signer);
            updatePlayerHistory("Connected Wallet", `Address: ${playerAddress}`);
            updateUI();
        } catch (error) {
            console.error("Failed to connect wallet:", error);
            alert("Failed to connect wallet. Please ensure MetaMask is installed and try again.");
        }
    }

    // UI अपडेट करना
    async function updateUI() {
        if (!contract || !playerAddress) return;
        try {
            const playerData = await contract.playerHistory(playerAddress);
            document.getElementById("gamesPlayed").textContent = `Games Played: ${playerData.gamesPlayed.toString()}`;
            document.getElementById("totalGameRewards").textContent = `Total Game Rewards: ${ethers.utils.formatUnits(playerData.totalRewards, 18)} BST`;
            document.getElementById("pendingRewardsText").textContent = `Pending Rewards: ${ethers.utils.formatUnits(playerData.pendingStakeRewards, 18)} BST`;
        } catch (error) {
            console.error("Error updating UI:", error);
        }
    }

    // गेम रिवॉर्ड्स क्लेम करना
    async function claimGameRewards() {
        if (!contract) {
            alert("Please connect your wallet first!");
            return;
        }
        try {
            const playerData = await contract.playerHistory(playerAddress);
            const pendingRewards = ethers.utils.formatUnits(playerData.pendingStakeRewards, 18);
            if (pendingRewards < 50) {
                alert("You need at least 50 BST to withdraw!");
                return;
            }
            const tx = await contract.claimAllRewards(playerAddress, ethers.utils.parseUnits(pendingRewards, 18), "0x0000000000000000000000000000000000000000", 0);
            await tx.wait();
            alert(`Successfully claimed ${pendingRewards} BST!`);
            updatePlayerHistory("Claimed Game Rewards", `${pendingRewards} BST`);
            updateUI();
        } catch (error) {
            console.error("Error claiming game rewards:", error);
            alert("Failed to claim game rewards. See console for details.");
        }
    }

    // BST स्टेक करना
    async function stakeTokens() {
        if (!contract) {
            alert("Please connect your wallet first!");
            return;
        }
        const amount = document.getElementById("stakeInput").value;
        if (!amount || isNaN(amount) || amount <= 0) {
            alert("Please enter a valid amount!");
            return;
        }
        try {
            const amountWei = ethers.utils.parseUnits(amount, 18);
            const tx = await contract.stake(amountWei);
            await tx.wait();
            alert(`Successfully staked ${amount} BST!`);
            updatePlayerHistory("Staked BST", `${amount} BST`);
            updateUI();
        } catch (error) {
            console.error("Error staking:", error);
            alert("Failed to stake. See console for details.");
        }
    }

    // स्टेकिंग रिवॉर्ड क्लेम करना
    async function claimStakingReward() {
        if (!contract) {
            alert("Please connect your wallet first!");
            return;
        }
        try {
            const tx = await contract.updateStakeReward(playerAddress);
            await tx.wait();
            const playerData = await contract.playerHistory(playerAddress);
            const pendingStakeRewards = ethers.utils.formatUnits(playerData.pendingStakeRewards, 18);
            if (pendingStakeRewards > 0) {
                const claimTx = await contract.claimAllRewards(playerAddress, ethers.utils.parseUnits(pendingStakeRewards, 18), "0x0000000000000000000000000000000000000000", 0);
                await claimTx.wait();
                alert(`Successfully claimed ${pendingStakeRewards} BST staking reward!`);
                updatePlayerHistory("Claimed Staking Reward", `${pendingStakeRewards} BST`);
                updateUI();
            } else {
                alert("No staking rewards to claim!");
            }
        } catch (error) {
            console.error("Error claiming staking reward:", error);
            alert("Failed to claim staking reward. See console for details.");
        }
    }

    // अनस्टेक करना (डमी फंक्शन, कॉन्ट्रैक्ट में अनस्टेक फंक्शन नहीं है)
    function unstakeTokens() {
        alert("Unstake functionality is not implemented in the smart contract yet.");
        updatePlayerHistory("Attempted Unstake", "Not implemented");
    }

    // ऑफलाइन प्लेयर हिस्ट्री मैनेज करना
    function updatePlayerHistory(action, details) {
        const history = JSON.parse(localStorage.getItem("playerHistory")) || [];
        const entry = {
            action: action,
            details: details,
            timestamp: new Date().toLocaleString()
        };
        history.push(entry);
        localStorage.setItem("playerHistory", JSON.stringify(history));
        displayPlayerHistory();
    }

    function displayPlayerHistory() {
        const history = JSON.parse(localStorage.getItem("playerHistory")) || [];
        document.getElementById("lastGameScore").textContent = `Last Game Score: ${score}`;
        document.getElementById("lastGameRewards").textContent = `Last Game Rewards: ${gameRewards} BST`;
    }

    // स्नेक गेम लॉजिक
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    const gridSize = 20;
    let snake = [{ x: 10, y: 10 }];
    let food = { x: 15, y: 15 };
    let dx = 1;
    let dy = 0;
    let score = 0;
    let gameRewards = 0;
    let gameRunning = false;
    let levelMilestones = [50, 100, 150, 200];
    let pendingMilestones = 0;

    function drawGrid() {
        ctx.strokeStyle = "#ddd";
        for (let x = 0; x <= canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y <= canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

    function drawSnake() {
        ctx.fillStyle = "limegreen";
        ctx.strokeStyle = "darkgreen";
        snake.forEach(segment => {
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
            ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
        });
    }

    function drawFood() {
        ctx.fillStyle = "red";
        ctx.strokeStyle = "darkred";
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
        ctx.strokeRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
    }

    function spawnFood() {
        food.x = Math.floor(Math.random() * (canvas.width / gridSize));
        food.y = Math.floor(Math.random() * (canvas.height / gridSize));
    }

    function updateSnake() {
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };
        snake.unshift(head);

        // खाना खाने की जाँच
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            spawnFood();
            updatePlayerHistory("Ate Food", `Score: ${score}`);
            document.getElementById("score").textContent = `Score: ${score}`;
            checkLevelMilestone();
        } else {
            snake.pop();
        }

        // दीवार से टकराने की जाँच
        if (head.x < 0 || head.x >= canvas.width / gridSize || head.y < 0 || head.y >= canvas.height / gridSize) {
            gameOver();
        }

        // खुद से टकराने की जाँच
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver();
                break;
            }
        }
    }

    function checkLevelMilestone() {
        for (let milestone of levelMilestones) {
            if (score >= milestone && !levelMilestones.includes(score - 10)) {
                gameRewards += 10; // हर माइलस्टोन पर 10 BST
                pendingMilestones += 1;
                document.getElementById("gameRewards").textContent = `Game Rewards: ${gameRewards} BST`;
                document.getElementById("pendingRewardsText").textContent = `Pending Rewards: ${gameRewards} BST`;
                document.getElementById("pendingLevelsText").textContent = `Pending Milestones: ${pendingMilestones}`;
                showLevelMessage(`Level Up! Score ${milestone} reached. Earned 10 BST!`);
                updatePlayerHistory("Level Milestone", `Score ${milestone}, Earned 10 BST`);
            }
        }
    }

    function showLevelMessage(message) {
        const levelMessage = document.getElementById("levelMessage");
        levelMessage.textContent = message;
        levelMessage.style.display = "block";
        setTimeout(() => {
            levelMessage.style.display = "none";
        }, 2000);
    }

    function gameOver() {
        gameRunning = false;
        alert(`Game Over! Score: ${score}`);
        updatePlayerHistory("Game Over", `Score: ${score}, Rewards: ${gameRewards} BST`);
        document.getElementById("playGame").disabled = false;
        snake = [{ x: 10, y: 10 }];
        dx = 1;
        dy = 0;
        score = 0;
        document.getElementById("score").textContent = `Score: ${score}`;
        spawnFood();
    }

    function playGame() {
        if (gameRunning) return;
        gameRunning = true;
        document.getElementById("playGame").disabled = true;
        updatePlayerHistory("Started Game", "New game started");
        gameLoop();
    }

    function gameLoop() {
        if (!gameRunning) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid();
        drawFood();
        updateSnake();
        drawSnake();
        setTimeout(gameLoop, 100);
    }

    // कीबोर्ड इनपुट हैंडल करना
    document.addEventListener("keydown", (event) => {
        switch (event.key) {
            case "ArrowUp":
                if (dy !== 1) { dx = 0; dy = -1; }
                break;
            case "ArrowDown":
                if (dy !== -1) { dx = 0; dy = 1; }
                break;
            case "ArrowLeft":
                if (dx !== 1) { dx = -1; dy = 0; }
                break;
            case "ArrowRight":
                if (dx !== -1) { dx = 1; dy = 0; }
                break;
        }
    });

    // बाय टोकन (डमी फंक्शन)
    function buyToken() {
        alert("Token sale will start on 1st May 2025!");
        updatePlayerHistory("Attempted Buy Token", "Sale starts on 1st May 2025");
    }

    // गेम शुरू करना
    spawnFood();
    displayPlayerHistory();

    // ग्लोबल फंक्शंस को एक्सपोज़ करें
    window.connectWallet = connectWallet;
    window.claimGameRewards = claimGameRewards;
    window.stakeTokens = stakeTokens;
    window.claimStakingReward = claimStakingReward;
    window.unstakeTokens = unstakeTokens;
    window.playGame = playGame;
    window.buyToken = buyToken;

    // बटन्स पर इवेंट लिस्टनर जोड़ें
    document.getElementById("connectWallet").addEventListener("click", connectWallet);
    document.getElementById("claimGameRewards").addEventListener("click", claimGameRewards);
    document.getElementById("stakeTokens").addEventListener("click", stakeTokens);
    document.getElementById("claimStakingReward").addEventListener("click", claimStakingReward);
    document.getElementById("unstakeTokens").addEventListener("click", unstakeTokens);
    document.getElementById("playGame").addEventListener("click", playGame);
    document.getElementById("buyToken").addEventListener("click", buyToken);
});
