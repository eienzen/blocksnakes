document.addEventListener("DOMContentLoaded", () => {
    let provider;
    let signer;
    let contract;
    let playerAddress;

    const contractAddress = "0x3f4da0ae45b6cac314bcc4a634280c84984272b9"; // यहाँ BlockSnakesGame का पता डालें
    // यहाँ नया contractABI पेस्ट करें (Remix से कॉपी करें, जैसा ऊपर बताया गया है)
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

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 400;
    canvas.height = 400;

    let snake = [{ x: 200, y: 200 }]; // स्नेक की शुरुआती पोजीशन
    let box = { x: 0, y: 0 };
    let score = 0;
    let points = 0;
    let gameRewards = 0;
    let dx = 10;
    let dy = 0;
    let gameLoop;

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

    // बाकी कोड (connectWallet, disconnectWallet, आदि) वही रहेगा

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
        // स्नेक को कैनवस के बीच में शुरू करें
        snake = [{ x: 200, y: 200 }]; // 400x400 कैनवस में बीच की पोजीशन
        dx = 10;
        dy = 0;
        score = 0;
        points = 0;
        spawnBox();
        draw(); // गेम रीसेट होने पर तुरंत ड्रॉ करें
        document.getElementById("score").innerText = `Score: ${score}`;
        document.getElementById("points").innerText = `Points: ${points}`;
    }

    function spawnBox() {
        // रेड बॉक्स को रैंडम जगह पर स्पॉन करें, लेकिन सुनिश्चित करें कि यह स्नेक के ऊपर न हो
        do {
            box.x = Math.floor(Math.random() * 40) * 10;
            box.y = Math.floor(Math.random() * 40) * 10;
        } while (snake.some(segment => segment.x === box.x && segment.y === box.y));
    }

    function draw() {
        // कैनवस को साफ करें
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // रेड बॉक्स ड्रॉ करें
        ctx.fillStyle = "#ff0000"; // चमकदार लाल रंग
        ctx.strokeStyle = "#ffffff"; // सफेद बॉर्डर
        ctx.lineWidth = 2;
        ctx.fillRect(box.x, box.y, 10, 10);
        ctx.strokeRect(box.x, box.y, 10, 10);

        // स्नेक ड्रॉ करें
        snake.forEach(segment => {
            ctx.fillStyle = "#00ff00"; // चमकदार हरा रंग
            ctx.strokeStyle = "#000000"; // काला बॉर्डर
            ctx.lineWidth = 2;
            ctx.fillRect(segment.x, segment.y, 10, 10);
            ctx.strokeRect(segment.x, segment.y, 10, 10);
        });
    }

    async function move() {
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };
        snake.unshift(head);

        if (head.x === box.x && head.y === box.y) {
            score += 10;
            points += 10;
            playerData.points = points;

            if (playerData.points >= 100) {
                const reward = 5;
                const referrerReward = 0.05;

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
                await updateRewardHistory();
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

        draw(); // हर मूवमेंट के बाद ड्रॉ करें
        document.getElementById("score").innerText = `Score: ${score}`;
        document.getElementById("points").innerText = `Points: ${playerData.points}`;
        document.getElementById("gameRewards").innerText = `Game Rewards: ${gameRewards} BST`;
        document.getElementById("pendingRewardsText").innerText = `Pending Rewards: ${(playerData.pendingRewards + playerData.pendingStakeRewards).toFixed(2)} BST`;
    }

    // बाकी कोड (collision, keydown, आदि) वही रहेगा
});
