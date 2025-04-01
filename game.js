// ग्लोबल वेरिएबल्स
let contract, provider, signer, account;
let gameRewards = 0;
let score = 0;
let gamesPlayed = 0;
let totalGameRewards = 0;
let lastGameScore = 0;
let lastGameRewards = 0;
let totalReferrals = 0;
let referralRewards = 0;
let pendingRewards = 0;
let playerData = {
    balance: 0,
    stakedAmount: 0,
    stakeTimestamp: 0,
    pendingRewards: 0,
    hasClaimedWelcomeBonus: false
};

// स्नेक गेम के लिए कैनवस और कॉन्टेक्स्ट
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let snake = { x: 200, y: 200, direction: "right", body: [] };
let food = { x: 0, y: 0 };
let gameLoop;

// टोकन सप्लाई डेटा
const tokenSupplyData = {
    teamAndDev: 40, // 40%
    gameAndStaking: 30, // 30%
    marketing: 20, // 20%
    community: 10 // 10%
};

// MetaMask से कनेक्ट करें (BSC टेस्टनेट)
async function connectWallet() {
    if (window.ethereum) {
        try {
            provider = window.ethereum;
            const ethersProvider = new ethers.providers.Web3Provider(provider);
            signer = ethersProvider.getSigner();
            const accounts = await provider.request({ method: "eth_requestAccounts" });
            account = accounts[0];

            // BSC टेस्टनेट पर स्विच करें
            await provider.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0x61" }] // BSC टेस्टनेट चेन ID: 97 (हेक्स में 0x61)
            });

            // नया कॉन्ट्रैक्ट एड्रेस और ABI यहाँ डालें
            // 1. contractABI डालें: यह आपके स्मार्ट कॉन्ट्रैक्ट का ABI है, जो आपको Remix या आपके डिप्लॉयमेंट टूल से मिलेगा।
            //    उदाहरण:
            //    const contractABI = [
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
				"name": "player",
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
		"name": "Unstaked",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "referrer",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "addReferralReward",
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
		"inputs": [],
		"name": "claimPendingRewards",
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
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "unstake",
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
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "updateGameReward",
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
		"inputs": [],
		"name": "communityAllocation",
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
		"name": "gameAndStakingAllocation",
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
		"name": "marketingAllocation",
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
				"internalType": "uint256",
				"name": "pendingGameRewards",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "pendingReferralRewards",
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
		"name": "REFERRAL_COMMISSION",
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
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "STAKING_REWARD_RATE",
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
		"name": "teamAndDevAllocation",
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
            //
            // 2. contractAddress डालें: यह आपके डिप्लॉय किए गए स्मार्ट कॉन्ट्रैक्ट का एड्रेस है (जैसे 0xYourContractAddress)।
            //    उदाहरण:
            //    const contractAddress = "0x709ca4d3d776d2f3d164856d097da6229411b52a";
            //
            // 3. contract को इनिशियलाइज़ करें:
            //    contract = new ethers.Contract(contractAddress, contractABI, signer);

            // ऊपर दिए गए कमेंट्स के हिसाब से contractAddress और contractABI डालने के बाद, नीचे की लाइन को अनकमेंट करें:
            // contract = new ethers.Contract(contractAddress, contractABI, signer);

            document.getElementById("connectWallet").style.display = "none";
            document.getElementById("disconnectWallet").style.display = "inline";
            document.getElementById("walletAddress").innerText = `Wallet: ${account}`;
            await loadPlayerHistory();
            await loadTokenSupplyChart();
        } catch (error) {
            console.error("Error connecting wallet:", error);
            alert("Failed to connect wallet: " + error.message);
        }
    } else {
        alert("Please install MetaMask!");
    }
}

// वॉलेट डिस्कनेक्ट करें
function disconnectWallet() {
    account = null;
    contract = null;
    document.getElementById("connectWallet").style.display = "inline";
    document.getElementById("disconnectWallet").style.display = "none";
    document.getElementById("walletAddress").innerText = "Wallet: Not Connected";
}

// प्लेयर हिस्ट्री लोड करें
async function loadPlayerHistory() {
    if (!contract || !account) return;
    const history = await contract.playerHistory(account);
    const balance = await contract.balanceOf(account);
    playerData = {
        balance: parseFloat(ethers.formatUnits(balance, 18)),
        stakedAmount: parseFloat(ethers.formatUnits(history[0], 18)),
        stakeTimestamp: parseInt(history[1]),
        pendingRewards: parseFloat(ethers.formatUnits(history[2], 18)) + parseFloat(ethers.formatUnits(history[3], 18)) + parseFloat(ethers.formatUnits(history[4], 18)),
        hasClaimedWelcomeBonus: history[5]
    };
    gameRewards = parseFloat(ethers.formatUnits(history[3], 18));
    pendingRewards = playerData.pendingRewards;
    updatePlayerHistoryUI();
}

// UI अपडेट करें
function updatePlayerHistoryUI() {
    document.getElementById("balance").innerText = `Balance: ${playerData.balance} BST`;
    document.getElementById("stakedAmount").innerText = `Staked: ${playerData.stakedAmount} BST`;
    document.getElementById("pendingRewardsText").innerText = `Pending Rewards: ${pendingRewards} BST`;
    document.getElementById("gameRewards").innerText = `Game Rewards: ${gameRewards} BST`;
    document.getElementById("score").innerText = `Score: ${score}`;
    document.getElementById("gamesPlayed").innerText = `Games Played: ${gamesPlayed}`;
    document.getElementById("totalGameRewards").innerText = `Total Game Rewards: ${totalGameRewards} BST`;
    document.getElementById("lastGameScore").innerText = `Last Game Score: ${lastGameScore}`;
    document.getElementById("lastGameRewards").innerText = `Last Game Rewards: ${lastGameRewards} BST`;
    document.getElementById("totalReferrals").innerText = `Total Referrals: ${totalReferrals}`;
    document.getElementById("referralRewards").innerText = `Referral Rewards: ${referralRewards} BST`;
}

// वेलकम बोनस क्लेम करें
async function claimWelcomeBonus() {
    if (!contract || !account) return alert("Connect your wallet first!");
    if (playerData.hasClaimedWelcomeBonus) return alert("Welcome bonus already claimed!");
    try {
        const tx = await contract.claimWelcomeBonus();
        await tx.wait();
        playerData.hasClaimedWelcomeBonus = true;
        playerData.pendingRewards += 100;
        playerData.balance += 100;
        pendingRewards += 100;
        updatePlayerHistoryUI();
        localStorage.setItem("playerData", JSON.stringify(playerData));
        alert("Welcome bonus claimed successfully!");
    } catch (error) {
        console.error("Error claiming welcome bonus:", error);
        alert("Failed to claim welcome bonus: " + error.message);
    }
}

// टोकन स्टेक करें
async function stakeTokens() {
    if (!contract || !account) return alert("Connect your wallet first!");
    const amount = document.getElementById("stakeInput").value;
    if (!amount || parseFloat(amount) <= 0) return alert("Please enter a valid amount!");
    try {
        const amountWei = ethers.parseUnits(amount.toString(), 18);
        const approveTx = await contract.approve(contract.target, amountWei);
        await approveTx.wait();
        const tx = await contract.stake(amountWei);
        await tx.wait();
        playerData.stakedAmount += parseFloat(amount);
        playerData.balance -= parseFloat(amount);
        if (playerData.stakeTimestamp === 0) {
            playerData.stakeTimestamp = Math.floor(Date.now() / 1000);
        }
        updatePlayerHistoryUI();
        localStorage.setItem("playerData", JSON.stringify(playerData));
        alert(`Successfully staked ${amount} BST!`);
    } catch (error) {
        console.error("Error staking tokens:", error);
        alert("Failed to stake tokens: " + error.message);
    }
}

// टोकन अनस्टेक करें
async function unstakeTokens() {
    if (!contract || !account) return alert("Connect your wallet first!");
    const amount = prompt("Enter amount to unstake (BST):");
    if (!amount || parseFloat(amount) <= 0) return alert("Please enter a valid amount!");
    try {
        const amountWei = ethers.parseUnits(amount.toString(), 18);
        const tx = await contract.unstake(amountWei);
        await tx.wait();
        playerData.stakedAmount -= parseFloat(amount);
        playerData.balance += parseFloat(amount);
        if (playerData.stakedAmount === 0) {
            playerData.stakeTimestamp = 0;
        }
        updatePlayerHistoryUI();
        localStorage.setItem("playerData", JSON.stringify(playerData));
        alert(`Successfully unstaked ${amount} BST!`);
    } catch (error) {
        console.error("Error unstaking tokens:", error);
        alert("Failed to unstake tokens: " + error.message);
    }
}

// रिवॉर्ड्स क्लेम करें
async function claimPendingRewards() {
    if (!contract || !account) return alert("Connect your wallet first!");
    if (pendingRewards < 10) return alert("You need at least 10 BST to withdraw!");
    try {
        const tx = await contract.claimPendingRewards();
        await tx.wait();
        playerData.balance += pendingRewards;
        pendingRewards = 0;
        playerData.pendingRewards = 0;
        updatePlayerHistoryUI();
        localStorage.setItem("playerData", JSON.stringify(playerData));
        alert("Rewards claimed successfully!");
    } catch (error) {
        console.error("Error claiming rewards:", error);
        alert("Failed to claim rewards: " + error.message);
    }
}

// स्नेक गेम का लॉजिक
function startGame() {
    snake = { x: 200, y: 200, direction: "right", body: [] };
    score = 0;
    spawnFood();
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(updateGame, 100);
}

function spawnFood() {
    food.x = Math.floor(Math.random() * (canvas.width / 20)) * 20;
    food.y = Math.floor(Math.random() * (canvas.height / 20)) * 20;
}

async function updateGame() {
    if (snake.direction === "right") snake.x += 20;
    if (snake.direction === "left") snake.x -= 20;
    if (snake.direction === "up") snake.y -= 20;
    if (snake.direction === "down") snake.y += 20;

    if (snake.x === food.x && snake.y === food.y) {
        score += 10;
        snake.body.push({ x: snake.x, y: snake.y });
        spawnFood();

        if (score >= 100) {
            const reward = 5;
            if (contract && account) {
                const tx = await contract.updateGameReward(account, ethers.parseUnits(reward.toString(), 18));
                await tx.wait();
            }
            gameRewards += reward;
            pendingRewards += reward;
            playerData.pendingRewards += reward;
            totalGameRewards += reward;
            lastGameRewards = reward;
            updatePlayerHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
        }
    }

    if (snake.x < 0 || snake.x >= canvas.width || snake.y < 0 || snake.y >= canvas.height) {
        clearInterval(gameLoop);
        gamesPlayed++;
        lastGameScore = score;
        updatePlayerHistoryUI();
        localStorage.setItem("playerData", JSON.stringify(playerData));
        alert(`Game Over! Score: ${score}`);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, 20, 20);
    ctx.fillStyle = "green";
    ctx.fillRect(snake.x, snake.y, 20, 20);
    for (let part of snake.body) {
        ctx.fillRect(part.x, part.y, 20, 20);
    }
}

// कीबोर्ड इनपुट
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" && snake.direction !== "left") snake.direction = "right";
    if (e.key === "ArrowLeft" && snake.direction !== "right") snake.direction = "left";
    if (e.key === "ArrowUp" && snake.direction !== "down") snake.direction = "up";
    if (e.key === "ArrowDown" && snake.direction !== "up") snake.direction = "down";
});

// रेफरल लिंक जेनरेट करें
function getReferralLink() {
    if (!account) return alert("Connect your wallet first!");
    const referralLink = `${window.location.origin}?ref=${account}`;
    navigator.clipboard.writeText(referralLink);
    alert("Referral link copied to clipboard: " + referralLink);
}

// टोकन सप्लाई चार्ट लोड करें
async function loadTokenSupplyChart() {
    const chartCanvas = document.getElementById("tokenSupplyChart");
    if (!chartCanvas) return;

    const ctx = chartCanvas.getContext("2d");
    new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Team & Development", "Game & Staking Rewards", "Marketing & Partnerships", "Community & Airdrops"],
            datasets: [{
                data: [
                    tokenSupplyData.teamAndDev,
                    tokenSupplyData.gameAndStaking,
                    tokenSupplyData.marketing,
                    tokenSupplyData.community
                ],
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "top",
                },
                title: {
                    display: true,
                    text: "Token Supply Distribution"
                }
            }
        }
    });
}

// लोकल स्टोरेज से डेटा लोड करें
window.onload = () => {
    const savedData = localStorage.getItem("playerData");
    if (savedData) {
        playerData = JSON.parse(savedData);
        updatePlayerHistoryUI();
    }
};

// बटन इवेंट लिस्टनर्स
document.getElementById("connectWallet").addEventListener("click", connectWallet);
document.getElementById("disconnectWallet").addEventListener("click", disconnectWallet);
document.getElementById("welcomeBonusButton").addEventListener("click", claimWelcomeBonus);
document.getElementById("playGame").addEventListener("click", startGame);
document.getElementById("claimGameRewards").addEventListener("click", claimPendingRewards);
document.getElementById("stakeTokens").addEventListener("click", stakeTokens);
document.getElementById("unstakeTokens").addEventListener("click", unstakeTokens);
document.getElementById("getReferralLink").addEventListener("click", getReferralLink);
