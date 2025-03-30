// Wait for the DOM to load before running the script
document.addEventListener("DOMContentLoaded", () => {
    // Web3 provider setup
    let provider;
    let signer;
    let contract;
    let playerAddress;

    // Contract address and ABI
    const contractAddress = "0x9Bec45dD0959E1912Dc72a548745308C77dCe4a2"; // यहाँ गेम कॉन्ट्रैक्ट का पता डालें (BlockSnakesGame का पता)
    const contractABI = [
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
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
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

    // Game variables
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 400;
    canvas.height = 400;

    let snake = [{ x: 200, y: 200 }];
    let box = { x: 0, y: 0 };
    let score = 0;
    let points = 0;
    let gameRewards = 0;
    let dx = 10;
    let dy = 0;
    let gameLoop;

    // Player data
    let playerData = {
        points: 0,
        pendingRewards: 0,
        pendingReferrerReward: 0,
        totalReferrals: 0,
        referralRewards: 0,
        gamesPlayed: 0,
        totalRewards: 0,
        stakedAmount: 0,
        pendingStakeRewards: 0,
        rewardHistory: []
    };

    // Connect wallet
    const connectWalletButton = document.getElementById("connectWallet");
    connectWalletButton.addEventListener("click", async () => {
        if (typeof window.ethereum === "undefined") {
            alert("Please install MetaMask!");
            return;
        }

        try {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            signer = provider.getSigner();
            playerAddress = await signer.getAddress();
            contract = new ethers.Contract(contractAddress, contractABI, signer);

            // Check if connected to BSC Testnet (Chain ID: 97)
            const network = await provider.getNetwork();
            if (network.chainId !== 97) {
                alert("Please switch to BSC Testnet in MetaMask!");
                return;
            }

            connectWalletButton.style.display = "none";
            document.getElementById("disconnectWallet").style.display = "block";

            // Load player data
            await loadPlayerData();
            await updateRewardHistory();
        } catch (error) {
            console.error("Error connecting wallet:", error);
            alert("Error connecting to MetaMask: " + error.message);
        }
    });

    // Disconnect wallet
    document.getElementById("disconnectWallet").addEventListener("click", () => {
        provider = null;
        signer = null;
        contract = null;
        playerAddress = null;

        document.getElementById("connectWallet").style.display = "block";
        document.getElementById("disconnectWallet").style.display = "none";

        // Reset UI
        resetUI();
    });

    // Claim Welcome Bonus
    document.getElementById("welcomeBonusButton").addEventListener("click", async () => {
        if (!contract || !playerAddress) {
            alert("Please connect your wallet first!");
            return;
        }

        try {
            const tx = await contract.claimWelcomeBonus();
            await tx.wait();
            alert("Welcome Bonus claimed successfully! You received 100 BST.");
            await loadPlayerData();
            await updateRewardHistory();
        } catch (error) {
            console.error("Error claiming welcome bonus:", error);
            alert("Error claiming welcome bonus: " + error.message);
        }
    });

    // Stake BST
    document.getElementById("stakeButton").addEventListener("click", async () => {
        if (!contract || !playerAddress) {
            alert("Please connect your wallet first!");
            return;
        }

        const amount = prompt("Enter amount to stake (in BST):");
        if (!amount || isNaN(amount) || amount <= 0) {
            alert("Please enter a valid amount!");
            return;
        }

        try {
            const amountWei = ethers.utils.parseUnits(amount, 18);
            const tx = await contract.stake(amountWei);
            await tx.wait();
            alert(`Successfully staked ${amount} BST!`);
            await loadPlayerData();
        } catch (error) {
            console.error("Error staking:", error);
            alert("Error staking: " + error.message);
        }
    });

    // Claim Rewards
    document.getElementById("claimGameRewards").addEventListener("click", async () => {
        if (!contract || !playerAddress) {
            alert("Please connect your wallet first!");
            return;
        }

        try {
            const referrer = new URLSearchParams(window.location.search).get("referrer") || "0x0000000000000000000000000000000000000000";
            const totalReward = ethers.utils.parseUnits((playerData.pendingRewards + playerData.pendingStakeRewards).toString(), 18);
            const referrerReward = ethers.utils.parseUnits(playerData.pendingReferrerReward.toString(), 18);

            if (playerData.pendingRewards + playerData.pendingStakeRewards < 10) {
                alert("You need at least 10 BST to claim rewards!");
                return;
            }

            const tx = await contract.claimAllRewards(playerAddress, totalReward, referrer, referrerReward);
            await tx.wait();
            alert("Rewards claimed successfully!");
            playerData.pendingRewards = 0;
            playerData.pendingReferrerReward = 0;
            playerData.pendingStakeRewards = 0;
            await loadPlayerData();
            await updateRewardHistory();
        } catch (error) {
            console.error("Error claiming rewards:", error);
            alert("Error claiming rewards: " + error.message);
        }
    });

    // Get Referral Link
    document.getElementById("getReferralLink").addEventListener("click", () => {
        if (!playerAddress) {
            alert("Please connect your wallet first!");
            return;
        }

        const referralLink = `${window.location.origin}${window.location.pathname}?referrer=${playerAddress}`;
        navigator.clipboard.writeText(referralLink);
        alert("Referral link copied to clipboard: " + referralLink);
    });

    // Load player data
    async function loadPlayerData() {
        if (!contract || !playerAddress) return;

        try {
            const history = await contract.playerHistory(playerAddress);
            playerData.gamesPlayed = history.gamesPlayed.toNumber();
            playerData.totalRewards = parseFloat(ethers.utils.formatUnits(history.totalRewards, 18)).toFixed(2);
            playerData.totalReferrals = history.totalReferrals.toNumber();
            playerData.referralRewards = parseFloat(ethers.utils.formatUnits(history.referralRewards, 18)).toFixed(2);
            playerData.stakedAmount = parseFloat(ethers.utils.formatUnits(history.stakedAmount, 18)).toFixed(2);
            playerData.pendingStakeRewards = parseFloat(ethers.utils.formatUnits(history.pendingStakeRewards, 18)).toFixed(2);

            // Update UI
            document.getElementById("gamesPlayed").innerText = `Games Played: ${playerData.gamesPlayed}`;
            document.getElementById("totalGameRewards").innerText = `Total Game Rewards: ${playerData.totalRewards} BST`;
            document.getElementById("totalReferrals").innerText = `Total Referrals: ${playerData.totalReferrals}`;
            document.getElementById("referralRewards").innerText = `Referral Rewards: ${playerData.referralRewards} BST`;
            document.getElementById("pendingRewardsText").innerText = `Pending Rewards: ${(playerData.pendingRewards + playerData.pendingStakeRewards).toFixed(2)} BST`;
            document.getElementById("stakedAmountText").innerText = `Staked Amount: ${playerData.stakedAmount} BST`;
            document.getElementById("pendingStakeRewardsText").innerText = `Pending Stake Rewards: ${playerData.pendingStakeRewards} BST`;
        } catch (error) {
            console.error("Error loading player data:", error);
            alert("Error loading player data: " + error.message);
        }
    }

    // Update reward history
    async function updateRewardHistory() {
        if (!contract || !playerAddress) return;

        try {
            const history = await contract.getRewardHistory(playerAddress);
            playerData.rewardHistory = history.map(item => ({
                amount: parseFloat(ethers.utils.formatUnits(item.amount, 18)).toFixed(2),
                timestamp: new Date(item.timestamp * 1000).toLocaleString(),
                rewardType: item.rewardType,
                referee: item.referee
            }));

            const historyList = document.getElementById("rewardHistoryList");
            historyList.innerHTML = "";
            playerData.rewardHistory.forEach(item => {
                const li = document.createElement("li");
                li.innerText = `Type: ${item.rewardType}, Amount: ${item.amount} BST, Time: ${item.timestamp}, Referee: ${item.referee}`;
                historyList.appendChild(li);
            });
        } catch (error) {
            console.error("Error updating reward history:", error);
            alert("Error updating reward history: " + error.message);
        }
    }

    // Reset UI
    function resetUI() {
        document.getElementById("gamesPlayed").innerText = "Games Played: 0";
        document.getElementById("totalGameRewards").innerText = "Total Game Rewards: 0 BST";
        document.getElementById("totalReferrals").innerText = "Total Referrals: 0";
        document.getElementById("referralRewards").innerText = "Referral Rewards: 0 BST";
        document.getElementById("pendingRewardsText").innerText = "Pending Rewards: 0 BST";
        document.getElementById("stakedAmountText").innerText = "Staked Amount: 0 BST";
        document.getElementById("pendingStakeRewardsText").innerText = "Pending Stake Rewards: 0 BST";
        document.getElementById("rewardHistoryList").innerHTML = "";
        document.getElementById("score").innerText = "Score: 0";
        document.getElementById("points").innerText = "Points: 0";
        document.getElementById("gameRewards").innerText = "Game Rewards: 0 BST";
        score = 0;
        points = 0;
        gameRewards = 0;
        playerData = {
            points: 0,
            pendingRewards: 0,
            pendingReferrerReward: 0,
            totalReferrals: 0,
            referralRewards: 0,
            gamesPlayed: 0,
            totalRewards: 0,
            stakedAmount: 0,
            pendingStakeRewards: 0,
            rewardHistory: []
        };
    }

    // Game logic
    document.getElementById("playGame").addEventListener("click", () => {
        if (!playerAddress) {
            alert("Please connect your wallet first!");
            return;
        }

        if (gameLoop) return;
        resetGame();
        gameLoop = setInterval(move, 100);
    });

    function resetGame() {
        snake = [{ x: 200, y: 200 }];
        dx = 10;
        dy = 0;
        score = 0;
        points = 0;
        spawnBox();
        document.getElementById("score").innerText = `Score: ${score}`;
        document.getElementById("points").innerText = `Points: ${points}`;
    }

    function spawnBox() {
        box.x = Math.floor(Math.random() * 40) * 10;
        box.y = Math.floor(Math.random() * 40) * 10;
    }

    function move() {
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };
        snake.unshift(head);

        if (head.x === box.x && head.y === box.y) {
            score += 10;
            points += 10;
            playerData.points = points;

            if (playerData.points >= 100) {
                const reward = 5;
                const referrerReward = 0.05; // 1% of 5 BST

                playerData.pendingRewards += reward;
                playerData.points -= 100;
                points -= 100;
                gameRewards += reward;

                playerData.rewardHistory.push({
                    amount: reward.toFixed(2),
                    timestamp: new Date().toLocaleString(),
                    rewardType: "Game (100 Points)",
                    referee: "N/A"
                });

                const referrer = new URLSearchParams(window.location.search).get("referrer");
                if (referrer && referrer !== playerAddress) {
                    playerData.pendingReferrerReward = (playerData.pendingReferrerReward || 0) + referrerReward;
                    playerData.referralRewards = (parseFloat(playerData.referralRewards) + referrerReward).toFixed(2);
                    playerData.totalReferrals = (playerData.totalReferrals || 0) + 1;

                    playerData.rewardHistory.push({
                        amount: referrerReward.toFixed(2),
                        timestamp: new Date().toLocaleString(),
                        rewardType: "Referral (Game)",
                        referee: referrer
                    });
                }
                updateRewardHistory();
            }
            spawnBox();
        } else {
            snake.pop();
        }

        if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height || collision(head)) {
            clearInterval(gameLoop);
            gameLoop = null;
            alert("Game Over! Score: " + score);
            playerData.gamesPlayed += 1;
            await loadPlayerData();
        }

        draw();
        document.getElementById("score").innerText = `Score: ${score}`;
        document.getElementById("points").innerText = `Points: ${playerData.points}`;
        document.getElementById("gameRewards").innerText = `Game Rewards: ${gameRewards} BST`;
        document.getElementById("pendingRewardsText").innerText = `Pending Rewards: ${(playerData.pendingRewards + playerData.pendingStakeRewards).toFixed(2)} BST`;
    }

    function collision(head) {
        return snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "red";
        ctx.fillRect(box.x, box.y, 10, 10);
        ctx.fillStyle = "green";
        snake.forEach(segment => ctx.fill penasrect(segment.x, segment.y, 10, 10));
    }

    // Keyboard controls
    document.addEventListener("keydown", e => {
        switch (e.key) {
            case "ArrowUp":
                if (dy === 0) { dx = 0; dy = -10; }
                break;
            case "ArrowDown":
                if (dy === 0) { dx = 0; dy = 10; }
                break;
            case "ArrowLeft":
                if (dx === 0) { dx = -10; dy = 0; }
                break;
            case "ArrowRight":
                if (dx === 0) { dx = 10; dy = 0; }
                break;
        }
    });
});
