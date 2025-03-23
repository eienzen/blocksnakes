let account;
let contract;
const contractAddress = "0x2ba5fcad65a538900311eb55e31e6f74b15555da"; // यहाँ नया कॉन्ट्रैक्ट अड्रेस डालें
const contractABI = [[
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
		"name": "unstakeTokens",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "initialOwner",
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
		"inputs": [],
		"name": "LEVEL_FEE",
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
		"name": "REWARD_RATE",
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
		"name": "stakedBalances",
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
		"name": "stakingTimestamps",
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
]]; // यहाँ नया ABI डालें

async function connectWallet() {
    if (window.ethereum) {
        try {
            // MetaMask से अकाउंट्स रिक्वेस्ट करें
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            account = accounts[0];
            document.getElementById("connectWallet").innerText = `Connected: ${account.substring(0, 6)}...`;

            // Ethers.js प्रोवाइडर सेट करें
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            // कॉन्ट्रैक्ट इंस्टेंस बनाएँ
            contract = new ethers.Contract(contractAddress, contractABI, signer);
        } catch (error) {
            alert("Error connecting wallet: " + error.message);
        }
    } else {
        alert("Please install MetaMask!");
    }
}

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let dx = 1;
let dy = 0;
let score = 0;
let level = 1;
let gameInterval = null;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    snake.forEach(segment => {
        ctx.fillStyle = "limegreen";
        ctx.fillRect(segment.x * 20, segment.y * 20, 18, 18);
        ctx.strokeStyle = "darkgreen";
        ctx.strokeRect(segment.x * 20, segment.y * 20, 18, 18);
    });
    ctx.fillStyle = "red";
    ctx.fillRect(food.x * 20, food.y * 20, 18, 18);
    ctx.strokeStyle = "darkred";
    ctx.strokeRect(food.x * 20, food.y * 20, 18, 18);
}

function move() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById("score").innerText = `Score: ${score}`;
        food = { x: Math.floor(Math.random() * 30), y: Math.floor(Math.random() * 20) };
    } else {
        snake.pop();
    }
    if (score >= 100) {
        levelComplete();
    }
    if (head.x < 0 || head.x >= 30 || head.y < 0 || head.y >= 20) {
        alert("Game Over! Your score: " + score);
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
    score = 0;
    document.getElementById("score").innerText = `Score: ${score}`;
    document.getElementById("level").innerText = `Current Level: ${level}`;
    document.getElementById("reward").innerText = `Rewards: 0 BST`;
    draw();
}

async function levelComplete() {
    try {
        const reward = 10; // 10 BST per level
        await contract.levelComplete(reward).send();
        document.getElementById("reward").innerText = `Rewards: ${reward} BST`;
    } catch (error) {
        alert("Error completing level: " + error.message);
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
    showLoading(true);
    try {
        await contract.nextLevel().send();
        level++;
        document.getElementById("level").innerText = `Current Level: ${level}`;
        resetGame();
    } catch (error) {
        alert("Error going to next level: " + error.message);
    } finally {
        showLoading(false);
    }
});

document.getElementById("stakeTokens").addEventListener("click", async () => {
    try {
        const amount = prompt("Enter amount to stake:");
        await contract.stakeTokens(amount).send();
        alert("Tokens staked successfully!");
    } catch (error) {
        alert("Error staking tokens: " + error.message);
    }
});

document.getElementById("claimReward").addEventListener("click", async () => {
    try {
        await contract.claimStakingReward().send();
        alert("Staking reward claimed successfully!");
    } catch (error) {
        alert("Error claiming reward: " + error.message);
    }
});

document.getElementById("unstakeTokens").addEventListener("click", async () => {
    try {
        await contract.unstakeTokens().send();
        alert("Tokens unstaked successfully!");
    } catch (error) {
        alert("Error unstaking tokens: " + error.message);
    }
});

document.getElementById("buyToken").addEventListener("click", () => {
    alert("Token sale will start on 1st May 2025!");
});

draw();
