document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded, initializing game...");

    let account = null;
    let contract = null;
    let animationFrameId = null;
    const TARGET_NETWORK_ID = "97";
    let WITHDRAWAL_FEE_BNB = "0.0002";
    let isGameRunning = false;

    let playerData = JSON.parse(localStorage.getItem("playerData")) || {
        gamesPlayed: 0, totalRewards: 0, boxesEaten: 0, pendingRewards: 0,
        totalReferrals: 0, referralRewards: 0, pendingReferral: null,
        pendingReferrerReward: 0, rewardHistory: [], hasClaimedWelcomeBonus: false,
        walletBalance: 0, walletAddress: null,
        isRewardSubmitted: false
    };

    const urlParams = new URLSearchParams(window.location.search);
    const referrerAddress = urlParams.get("ref");
    if (referrerAddress && !playerData.pendingReferral && ethers.utils.isAddress(referrerAddress)) {
        playerData.pendingReferral = referrerAddress;
    }

    const contractAddress = "0x780b1C8cd6B68B0d51F541D6CA93232c1B4bE37f";
    const contractABI = [
        // ABI from Solidity contract above
        {
            "inputs": [{"internalType": "address", "name": "_gameOracle", "type": "address"}],
            "stateMutability": "nonpayable", "type": "constructor"
        }, {
            "inputs": [{"internalType": "address", "name": "spender", "type": "address"}, {"internalType": "uint256", "name": "allowance", "type": "uint256"}, {"internalType": "uint256", "name": "needed", "type": "uint256"}],
            "name": "ERC20InsufficientAllowance", "type": "error"
        }, {
            "inputs": [{"internalType": "address", "name": "sender", "type": "address"}, {"internalType": "uint256", "name": "balance", "type": "uint256"}, {"internalType": "uint256", "name": "needed", "type": "uint256"}],
            "name": "ERC20InsufficientBalance", "type": "error"
        }, {
            "inputs": [{"internalType": "address", "name": "approver", "type": "address"}],
            "name": "ERC20InvalidApprover", "type": "error"
        }, {
            "inputs": [{"internalType": "address", "name": "receiver", "type": "address"}],
            "name": "ERC20InvalidReceiver", "type": "error"
        }, {
            "inputs": [{"internalType": "address", "name": "sender", "type": "address"}],
            "name": "ERC20InvalidSender", "type": "error"
        }, {
            "inputs": [{"internalType": "address", "name": "spender", "type": "address"}],
            "name": "ERC20InvalidSpender", "type": "error"
        }, {
            "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
            "name": "OwnableInvalidOwner", "type": "error"
        }, {
            "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
            "name": "OwnableUnauthorizedAccount", "type": "error"
        }, {
            "anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "owner", "type": "address"}, {"indexed": true, "internalType": "address", "name": "spender", "type": "address"}, {"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}],
            "name": "Approval", "type": "event"
        }, {
            "anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "player", "type": "address"}, {"indexed": false, "internalType": "string", "name": "reason", "type": "string"}],
            "name": "ErrorEvent", "type": "event"
        }, {
            "anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "oldOracle", "type": "address"}, {"indexed": true, "internalType": "address", "name": "newOracle", "type": "address"}],
            "name": "GameOracleUpdated", "type": "event"
        }, {
            "anonymous": false, "inputs": [{"indexed": false, "internalType": "uint256", "name": "newLimit", "type": "uint256"}],
            "name": "MaxWithdrawalLimitUpdated", "type": "event"
        }, {
            "anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "oldWallet", "type": "address"}, {"indexed": true, "internalType": "address", "name": "newWallet", "type": "address"}],
            "name": "OwnerWalletUpdated", "type": "event"
        }, {
            "anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "previousOwner", "type": "address"}, {"indexed": true, "internalType": "address", "name": "newOwner", "type": "address"}],
            "name": "OwnershipTransferred", "type": "event"
        }, {
            "anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "referrer", "type": "address"}, {"indexed": true, "internalType": "address", "name": "referee", "type": "address"}],
            "name": "ReferralAdded", "type": "event"
        }, {
            "anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "player", "type": "address"}, {"indexed": false, "internalType": "uint256", "name": "totalReward", "type": "uint256"}, {"indexed": true, "internalType": "address", "name": "referrer", "type": "address"}, {"indexed": false, "internalType": "uint256", "name": "referrerReward", "type": "uint256"}],
            "name": "RewardsClaimed", "type": "event"
        }, {
            "anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "owner", "type": "address"}, {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}],
            "name": "TokensBurned", "type": "event"
        }, {
            "anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "owner", "type": "address"}, {"indexed": false, "internalType": "uint256", "name": "totalAmount", "type": "uint256"}, {"indexed": false, "internalType": "uint256", "name": "ownerAmount", "type": "uint256"}, {"indexed": false, "internalType": "uint256", "name": "contractAmount", "type": "uint256"}],
            "name": "TokensMinted", "type": "event"
        }, {
            "anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "player", "type": "address"}, {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}, {"indexed": false, "internalType": "uint256", "name": "fee", "type": "uint256"}, {"indexed": false, "internalType": "bool", "name": "success", "type": "bool"}],
            "name": "TokensWithdrawn", "type": "event"
        }, {
            "anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "from", "type": "address"}, {"indexed": true, "internalType": "address", "name": "to", "type": "address"}, {"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}],
            "name": "Transfer", "type": "event"
        }, {
            "anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "player", "type": "address"}, {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}],
            "name": "WelcomeBonusClaimed", "type": "event"
        }, {
            "anonymous": false, "inputs": [{"indexed": false, "internalType": "uint256", "name": "newFeeInBnbWei", "type": "uint256"}],
            "name": "WithdrawalFeeUpdated", "type": "event"
        }, {
            "inputs": [{"internalType": "address", "name": "spender", "type": "address"}, {"internalType": "uint256", "name": "value", "type": "uint256"}],
            "name": "approve", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function"
        }, {
            "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
            "name": "burnTokens", "outputs": [], "stateMutability": "nonpayable", "type": "function"
        }, {
            "inputs": [{"internalType": "uint256", "name": "totalReward", "type": "uint256"}, {"internalType": "address", "name": "player", "type": "address"}, {"internalType": "address", "name": "referrer", "type": "address"}],
            "name": "claimAllRewards", "outputs": [], "stateMutability": "nonpayable", "type": "function"
        }, {
            "inputs": [],
            "name": "claimWelcomeBonus", "outputs": [], "stateMutability": "nonpayable", "type": "function"
        }, {
            "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
            "name": "mintTokens", "outputs": [], "stateMutability": "nonpayable", "type": "function"
        }, {
            "inputs": [],
            "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function"
        }, {
            "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "value", "type": "uint256"}],
            "name": "transfer", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function"
        }, {
            "inputs": [{"internalType": "address", "name": "from", "type": "address"}, {"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "value", "type": "uint256"}],
            "name": "transferFrom", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function"
        }, {
            "inputs": [{"internalType": "address", "name": "newOwner", "type": "address"}],
            "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function"
        }, {
            "stateMutability": "payable", "type": "receive"
        }, {
            "inputs": [{"internalType": "address", "name": "_newOracle", "type": "address"}],
            "name": "updateGameOracle", "outputs": [], "stateMutability": "nonpayable", "type": "function"
        }, {
            "inputs": [{"internalType": "uint256", "name": "_newLimit", "type": "uint256"}],
            "name": "updateMaxWithdrawalLimit", "outputs": [], "stateMutability": "nonpayable", "type": "function"
        }, {
            "inputs": [{"internalType": "address", "name": "_newWallet", "type": "address"}],
            "name": "updateOwnerWallet", "outputs": [], "stateMutability": "nonpayable", "type": "function"
        }, {
            "inputs": [{"internalType": "uint256", "name": "_newFeeInBnbWei", "type": "uint256"}],
            "name": "updateWithdrawalFee", "outputs": [], "stateMutability": "nonpayable", "type": "function"
        }, {
            "inputs": [],
            "name": "withdrawAllTokens", "outputs": [], "stateMutability": "payable", "type": "function"
        }, {
            "inputs": [{"internalType": "address", "name": "owner", "type": "address"}, {"internalType": "address", "name": "spender", "type": "address"}],
            "name": "allowance", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"
        }, {
            "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
            "name": "balanceOf", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"
        }, {
            "inputs": [],
            "name": "contractBalance", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"
        }, {
            "inputs": [],
            "name": "decimals", "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}], "stateMutability": "view", "type": "function"
        }, {
            "inputs": [],
            "name": "gameOracle", "outputs": [{"internalType": "address", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"
        }, {
            "inputs": [{"internalType": "address", "name": "player", "type": "address"}],
            "name": "getInternalBalance", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"
        }, {
            "inputs": [{"internalType": "address", "name": "player", "type": "address"}],
            "name": "getRewardHistory", "outputs": [{"components": [{"internalType": "uint256", "name": "amount", "type": "uint256"}, {"internalType": "uint256", "name": "timestamp", "type": "uint256"}, {"internalType": "string", "name": "rewardType", "type": "string"}, {"internalType": "address", "name": "referee", "type": "address"}], "internalType": "struct BlockSnakesGame.Reward[]", "name": "", "type": "tuple[]"}], "stateMutability": "view", "type": "function"
        }, {
            "inputs": [],
            "name": "maxWithdrawalLimit", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"
        }, {
            "inputs": [],
            "name": "MINIMUM_WITHDRAWAL", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"
        }, {
            "inputs": [],
            "name": "name", "outputs": [{"internalType": "string", "name": "", "type": "string"}], "stateMutability": "view", "type": "function"
        }, {
            "inputs": [],
            "name": "owner", "outputs": [{"internalType": "address", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"
        }, {
            "inputs": [],
            "name": "ownerWallet", "outputs": [{"internalType": "address", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"
        }, {
            "inputs": [{"internalType": "address", "name": "", "type": "address"}],
            "name": "playerHistory", "outputs": [{"internalType": "uint256", "name": "gamesPlayed", "type": "uint256"}, {"internalType": "uint256", "name": "totalRewards", "type": "uint256"}, {"internalType": "uint256", "name": "totalReferrals", "type": "uint256"}, {"internalType": "uint256", "name": "referralRewards", "type": "uint256"}, {"internalType": "bool", "name": "hasClaimedWelcomeBonus", "type": "bool"}, {"internalType": "uint256", "name": "internalBalance", "type": "uint256"}], "stateMutability": "view", "type": "function"
        }, {
            "inputs": [],
            "name": "REFERRAL_COMMISSION_RATE", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"
        }, {
            "inputs": [{"internalType": "address", "name": "", "type": "address"}],
            "name": "referrals", "outputs": [{"internalType": "address", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"
        }, {
            "inputs": [{"internalType": "address", "name": "", "type": "address"}, {"internalType": "uint256", "name": "", "type": "uint256"}],
            "name": "rewardHistory", "outputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}, {"internalType": "uint256", "name": "timestamp", "type": "uint256"}, {"internalType": "string", "name": "rewardType", "type": "string"}, {"internalType": "address", "name": "referee", "type": "address"}], "stateMutability": "view", "type": "function"
        }, {
            "inputs": [],
            "name": "symbol", "outputs": [{"internalType": "string", "name": "", "type": "string"}], "stateMutability": "view", "type": "function"
        }, {
            "inputs": [],
            "name": "totalSupply", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"
        }, {
            "inputs": [],
            "name": "WELCOME_BONUS", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"
        }, {
            "inputs": [],
            "name": "withdrawalFeeInBnb", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"
        }
    ];

    const gameOracleAddress = "0x6C12d2802cCF7072e9ED33b3bdBB0ce4230d5032";
    const gameOraclePrivateKey = "e4594c8a3cd798aed0c2b1276012e87cce67c4a21142cf0b3467d8815bf37544";

    let gameOracleProvider;
    try {
        gameOracleProvider = new ethers.providers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545/", { chainId: 97, name: "BNB Testnet" });
        console.log("Connected to primary JSON-RPC provider.");
    } catch (error) {
        console.error("Failed to connect to primary JSON-RPC URL:", error);
        gameOracleProvider = new ethers.providers.JsonRpcProvider("https://data-seed-prebsc-2-s1.binance.org:8545/", { chainId: 97, name: "BNB Testnet" });
        console.log("Connected to secondary JSON-RPC provider.");
    }
    const gameOracleWallet = new ethers.Wallet(gameOraclePrivateKey, gameOracleProvider);
    const gameOracleContract = new ethers.Contract(contractAddress, contractABI, gameOracleWallet);

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas ? canvas.getContext("2d") : null;
    const gridWidth = 30;
    const gridHeight = 20;
    let gridSize;
    let snake = [{ x: 10, y: 10 }];
    let boxes = [];
    let direction = "right";
    let boxesEaten = 0;
    let gameRewards = 0;
    const baseSnakeSpeed = 150;
    let lastMoveTime = 0;

    const eatingSound = document.getElementById("eatingSound");
    const gameOverSound = document.getElementById("gameOverSound");
    const victorySound = document.getElementById("victorySound");

    function showLoading(show) {
        document.getElementById("loadingIndicator").style.display = show ? "block" : "none";
    }

    function updateCanvasSize() {
        if (!canvas) return console.error("Canvas not available!");
        const screenWidth = Math.min(window.innerWidth * 0.95, 500);
        const screenHeight = Math.min(window.innerHeight * 0.8, 400);
        gridSize = Math.min(screenWidth / gridWidth, screenHeight / gridHeight);
        canvas.width = gridSize * gridWidth;
        canvas.height = gridSize * gridHeight;
        canvas.style.width = `${canvas.width}px`;
        canvas.style.height = `${canvas.height}px`;
        draw();
    }

    function enterFullscreen() {
        if (document.fullscreenEnabled && canvas) {
            canvas.requestFullscreen().catch(err => {
                console.warn("Fullscreen failed, continuing without fullscreen:", err);
                updateCanvasSize();
            });
        } else {
            updateCanvasSize();
        }
    }

    function generateBoxes() {
        boxes = [];
        const numBoxes = 10;
        for (let i = 0; i < numBoxes; i++) {
            let newBox;
            do {
                newBox = { x: Math.floor(Math.random() * gridWidth), y: Math.floor(Math.random() * gridHeight) };
            } while (snake.some(segment => segment.x === newBox.x && segment.y === newBox.y) || boxes.some(b => b.x === newBox.x && b.y === newBox.y));
            boxes.push(newBox);
        }
    }

    function draw() {
        if (!ctx) return console.error("Canvas context not available!");
        ctx.fillStyle = "#0a0a23";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        snake.forEach((segment, index) => {
            ctx.fillStyle = index === 0 ? "#ffd700" : "#800080";
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
            if (index === 0) {
                ctx.beginPath();
                ctx.arc(segment.x * gridSize + gridSize * 0.25, segment.y * gridSize + gridSize * 0.3, gridSize * 0.1, 0, Math.PI * 2);
                ctx.fillStyle = "white";
                ctx.fill();
                ctx.beginPath();
                ctx.arc(segment.x * gridSize + gridSize * 0.25, segment.y * gridSize + gridSize * 0.3, gridSize * 0.05, 0, Math.PI * 2);
                ctx.fillStyle = "black";
                ctx.fill();
                ctx.beginPath();
                ctx.arc(segment.x * gridSize + gridSize * 0.75, segment.y * gridSize + gridSize * 0.3, gridSize * 0.1, 0, Math.PI * 2);
                ctx.fillStyle = "white";
                ctx.fill();
                ctx.beginPath();
                ctx.arc(segment.x * gridSize + gridSize * 0.75, segment.y * gridSize + gridSize * 0.3, gridSize * 0.05, 0, Math.PI * 2);
                ctx.fillStyle = "black";
                ctx.fill();
            }
        });

        boxes.forEach(box => {
            ctx.fillStyle = "#ff5555";
            ctx.fillRect(box.x * gridSize, box.y * gridSize, gridSize - 2, gridSize - 2);
        });

        document.getElementById("boxesEaten").textContent = `Boxes Eaten: ${boxesEaten}`;
        document.getElementById("pendingRewards").textContent = `Pending Rewards: ${playerData.pendingRewards.toFixed(2)} BST`;
    }

    function gameLoop(currentTime) {
        if (isGameRunning && ctx) {
            if (currentTime - lastMoveTime >= baseSnakeSpeed) {
                move();
                lastMoveTime = currentTime;
            }
        }
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    async function move() {
        if (!isGameRunning || !ctx) return;

        let head = { x: snake[0].x, y: snake[0].y };
        if (direction === "right") head.x++;
        if (direction === "left") head.x--;
        if (direction === "up") head.y--;
        if (direction === "down") head.y++;

        if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
            gameOverSound.play();
            if (gameRewards > 0 && account && gameOracleContract && !playerData.isRewardSubmitted) {
                await submitGameReward(gameRewards);
                playerData.isRewardSubmitted = true;
            }
            showGameOverPopup();
            isGameRunning = false;
            return;
        }

        snake.unshift(head);
        const eatenBoxIndex = boxes.findIndex(box => box.x === head.x && box.y === head.y);
        if (eatenBoxIndex !== -1) {
            eatingSound.play();
            boxesEaten++;
            const reward = 0.5;
            gameRewards += reward;
            playerData.pendingRewards += reward;
            playerData.totalRewards += reward;
            boxes.splice(eatenBoxIndex, 1);
            if (boxes.length < 5) generateBoxes();
            if (boxesEaten % 10 === 0 || boxesEaten % 20 === 0 || boxesEaten % 30 === 0) victorySound.play();
        } else {
            snake.pop();
        }
        draw();
        localStorage.setItem("playerData", JSON.stringify(playerData));
    }

    function showGameOverPopup() {
        const popup = document.getElementById("gameOverPopup");
        if (!popup) return;
        document.getElementById("finalBoxesEaten").textContent = `Boxes Eaten: ${boxesEaten}`;
        document.getElementById("finalRewards").textContent = `Earned BST: ${gameRewards.toFixed(2)} BST`;
        popup.style.display = "block";
        isGameRunning = false;
        document.getElementById("closePopup").onclick = () => {
            popup.style.display = "none";
        };
    }

    async function resetGame() {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        isGameRunning = false;
        console.log("Resetting game...");
        showLoading(true);

        playerData.gamesPlayed += 1;
        boxesEaten = 0;
        gameRewards = 0;
        snake = [{ x: 10, y: 10 }];
        direction = "right";
        playerData.isRewardSubmitted = false;
        generateBoxes();
        updateCanvasSize();
        draw();
        showLoading(false);
        updatePlayerHistoryUI();
        localStorage.setItem("playerData", JSON.stringify(playerData));
    }

    async function submitGameReward(rewardAmount) {
        if (!account || !gameOracleContract || playerData.isRewardSubmitted) return;
        try {
            showLoading(true);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = await provider.getSigner();
            const nonce = await provider.getTransactionCount(account, "latest");

            const tx = await gameOracleContract.claimAllRewards(
                ethers.utils.parseUnits(rewardAmount.toString(), 18),
                account,
                playerData.pendingReferral || ethers.constants.AddressZero,
                { gasLimit: 400000, nonce }
            );
            const receipt = await tx.wait();
            playerData.totalRewards += rewardAmount;
            playerData.pendingRewards = 0;
            playerData.pendingReferral = null;
            gameRewards = 0;
            playerData.rewardHistory.push({
                amount: rewardAmount,
                timestamp: Date.now(),
                rewardType: "Game",
                referee: playerData.pendingReferral || "N/A"
            });
            if (playerData.pendingReferral) {
                const referralCommissionRate = (await contract.REFERRAL_COMMISSION_RATE()) / 10000;
                const referrerReward = rewardAmount * referralCommissionRate;
                playerData.pendingReferrerReward += referrerReward;
                playerData.referralRewards += referrerReward;
                playerData.rewardHistory.push({
                    amount: referrerReward,
                    timestamp: Date.now(),
                    rewardType: "Referral",
                    referee: playerData.pendingReferral
                });
            }
            playerData.isRewardSubmitted = true;
            await loadPlayerHistory();
            updatePlayerHistoryUI();
            alert(`${rewardAmount} BST rewards submitted!`);
        } catch (error) {
            console.error("Error submitting rewards:", error);
            document.getElementById("withdrawalStatus").textContent = `Error: ${error.message || error.toString()}`;
            alert("Failed to submit rewards: " + (error.message || error.toString()));
            if (error.code === 'NONCE_EXPIRED' || error.code === 'CALL_EXCEPTION') {
                playerData.isRewardSubmitted = false;
            }
        } finally {
            showLoading(false);
        }
    }

    async function claimPendingRewards() {
        if (!contract || !account) return alert("Connect wallet first!");
        try {
            showLoading(true);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const balance = await provider.getBalance(account);
            if (balance < ethers.utils.parseUnits(WITHDRAWAL_FEE_BNB, 18)) {
                alert(`Need ${WITHDRAWAL_FEE_BNB} BNB for fee.`);
                return;
            }
            const internalBalance = await contract.getInternalBalance(account);
            if (ethers.BigNumber.from(internalBalance).lt(ethers.utils.parseUnits(playerData.pendingRewards.toString(), 18))) {
                alert("Insufficient internal balance. Please submit game rewards first.");
                return;
            }
            const nonce = await provider.getTransactionCount(account, "latest");
            const tx = await contract.withdrawAllTokens({ value: ethers.utils.parseUnits(WITHDRAWAL_FEE_BNB, 18), gasLimit: 400000, nonce });
            const receipt = await tx.wait();
            playerData.walletBalance = Number(ethers.utils.formatUnits(await contract.balanceOf(account), 18));
            playerData.pendingRewards = 0;
            await loadPlayerHistory();
            updatePlayerHistoryUI();
            alert("Rewards claimed successfully!");
        } catch (error) {
            console.error("Error claiming rewards:", error);
            document.getElementById("withdrawalStatus").textContent = `Error: ${error.message || error.toString()}`;
            alert("Failed to claim rewards: " + (error.message || error.toString()));
        } finally {
            showLoading(false);
        }
    }

    async function claimWelcomeBonus() {
        if (!contract || !account || playerData.hasClaimedWelcomeBonus) {
            alert("Bonus already claimed or connect wallet!");
            return;
        }
        try {
            showLoading(true);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = await provider.getSigner();
            const balance = await provider.getBalance(account);
            if (balance < ethers.utils.parseUnits(WITHDRAWAL_FEE_BNB, 18)) {
                alert(`Need ${WITHDRAWAL_FEE_BNB} BNB for fee.`);
                return;
            }
            const welcomeBonus = await contract.welcomeBonus();
            const nonce = await provider.getTransactionCount(account, "latest");
            const tx = await contract.claimWelcomeBonus({ value: ethers.utils.parseUnits(WITHDRAWAL_FEE_BNB, 18), gasLimit: 400000, nonce });
            await tx.wait();
            playerData.hasClaimedWelcomeBonus = true;
            playerData.totalRewards += Number(ethers.utils.formatUnits(welcomeBonus, 18));
            playerData.pendingRewards += Number(ethers.utils.formatUnits(welcomeBonus, 18));
            playerData.rewardHistory.push({
                amount: Number(ethers.utils.formatUnits(welcomeBonus, 18)),
                timestamp: Date.now(),
                rewardType: "Welcome Bonus",
                referee: "N/A"
            });
            await loadPlayerHistory();
            updatePlayerHistoryUI();
            alert(`${Number(ethers.utils.formatUnits(welcomeBonus, 18))} BST welcome bonus claimed!`);
        } catch (error) {
            console.error("Error claiming welcome bonus:", error);
            if (error.reason) {
                alert(`Failed to claim bonus: ${error.reason}`);
            } else {
                alert("Failed to claim bonus: " + (error.message || error.toString()));
            }
        } finally {
            showLoading(false);
        }
    }

    async function setWelcomeBonus(newBonus) {
        if (!contract || !account || !(await contract.owner() === account)) {
            alert("Only owner can set welcome bonus!");
            return;
        }
        try {
            showLoading(true);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = await provider.getSigner();
            const nonce = await provider.getTransactionCount(account, "latest");
            const tx = await contract.setWelcomeBonus(newBonus, { gasLimit: 400000, nonce });
            await tx.wait();
            alert(`Welcome bonus set to ${newBonus} BST!`);
        } catch (error) {
            console.error("Error setting welcome bonus:", error);
            alert("Failed to set welcome bonus: " + (error.message || error.toString()));
        } finally {
            showLoading(false);
        }
    }

    async function setReferralCommissionRate(newRate) {
        if (!contract || !account || !(await contract.owner() === account)) {
            alert("Only owner can set referral commission rate!");
            return;
        }
        try {
            showLoading(true);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = await provider.getSigner();
            const nonce = await provider.getTransactionCount(account, "latest");
            const tx = await contract.setReferralCommissionRate(newRate, { gasLimit: 400000, nonce });
            await tx.wait();
            alert(`Referral commission rate set to ${newRate}%!`);
        } catch (error) {
            console.error("Error setting referral commission rate:", error);
            alert("Failed to set referral commission rate: " + (error.message || error.toString()));
        } finally {
            showLoading(false);
        }
    }

    function generateReferralLink() {
        if (!account) return alert("Connect wallet first!");
        const baseUrl = window.location.origin + window.location.pathname;
        const referralLink = `${baseUrl}?ref=${account}`;
        navigator.clipboard.writeText(referralLink).then(() => {
            alert("Referral link copied to clipboard: " + referralLink);
        }).catch(err => {
            alert("Failed to copy referral link: " + err.message);
        });
    }

    async function connectWallet() {
        if (!window.ethereum) return alert("Install MetaMask!");
        try {
            showLoading(true);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const network = await provider.getNetwork();
            if (network.chainId !== 97) await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x61" }] });
            account = (await provider.send("eth_requestAccounts", []))[0];
            playerData.walletAddress = account;
            contract = new ethers.Contract(contractAddress, contractABI, await provider.getSigner());
            if (!playerData.hasClaimedWelcomeBonus) {
                await claimWelcomeBonus();
            }
            await loadPlayerHistory();
            updatePlayerHistoryUI();
            document.getElementById("connectWallet").style.display = "none";
            document.getElementById("disconnectWallet").style.display = "block";
            document.getElementById("walletAddress").textContent = `Connected: ${account.slice(0, 6)}...`;
            document.getElementById("walletBalance").textContent = `Wallet Balance: ${Number(ethers.utils.formatUnits(await contract.balanceOf(account), 18)).toFixed(2)} BST`;
            alert("Wallet connected!");
        } catch (error) {
            console.error("Wallet error:", error);
            alert("Failed to connect: " + error.message);
        } finally {
            showLoading(false);
        }
    }

    function disconnectWallet() {
        account = null;
        contract = null;
        document.getElementById("connectWallet").style.display = "block";
        document.getElementById("disconnectWallet").style.display = "none";
        document.getElementById("walletAddress").textContent = "";
        document.getElementById("walletBalance").textContent = "";
        updatePlayerHistoryUI();
        alert("Wallet disconnected!");
    }

    async function loadPlayerHistory() {
        if (!contract || !account) return updatePlayerHistoryUI();
        try {
            showLoading(true);
            const history = await contract.playerHistory(account);
            playerData.gamesPlayed = Number(history.gamesPlayed);
            playerData.totalRewards = Number(ethers.utils.formatUnits(history.totalRewards, 18));
            playerData.totalReferrals = Number(history.totalReferrals);
            playerData.referralRewards = Number(ethers.utils.formatUnits(history.referralRewards, 18));
            playerData.hasClaimedWelcomeBonus = history.hasClaimedWelcomeBonus;
            playerData.pendingRewards = Number(ethers.utils.formatUnits(await contract.getInternalBalance(account), 18));
            playerData.walletBalance = Number(ethers.utils.formatUnits(await contract.balanceOf(account), 18));
            updatePlayerHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
        } catch (error) {
            console.error("History error:", error);
            alert("Failed to load history: " + error.message);
        } finally {
            showLoading(false);
        }
    }

    function updatePlayerHistoryUI() {
        document.getElementById("gamesPlayed").textContent = `Games Played: ${playerData.gamesPlayed}`;
        document.getElementById("totalGameRewards").textContent = `Total Game Rewards: ${playerData.totalRewards.toFixed(2)} BST`;
        document.getElementById("totalReferrals").textContent = `Total Referrals: ${playerData.totalReferrals}`;
        document.getElementById("referralRewards").textContent = `Referral Rewards: ${playerData.referralRewards.toFixed(2)} BST`;
        document.getElementById("pendingRewardsText").textContent = `Pending Rewards: ${playerData.pendingRewards.toFixed(2)} BST`;
        document.getElementById("walletBalance").textContent = `Wallet Balance: ${playerData.walletBalance.toFixed(2)} BST`;
        document.getElementById("walletAddress").textContent = account ? `Connected: ${account.slice(0, 6)}...` : "";
        document.getElementById("rewardHistoryList").innerHTML = playerData.rewardHistory.map(entry =>
            `<li>${entry.rewardType}: ${entry.amount.toFixed(2)} BST on ${new Date(entry.timestamp).toLocaleString()}${entry.referee !== "N/A" ? ` (Referee: ${entry.referee.slice(0, 6)}...)` : ""}</li>`
        ).join("");
    }

    document.getElementById("playGame").addEventListener("click", async () => {
        if (!account) return alert("Connect wallet!");
        showLoading(true);
        enterFullscreen();
        await resetGame();
        isGameRunning = true;
        animationFrameId = requestAnimationFrame(gameLoop);
        showLoading(false);
    });
    document.getElementById("connectWallet").addEventListener("click", connectWallet);
    document.getElementById("disconnectWallet").addEventListener("click", disconnectWallet);
    document.getElementById("claimGameRewards").addEventListener("click", claimPendingRewards);
    document.getElementById("welcomeBonusButton").addEventListener("click", claimWelcomeBonus);
    document.getElementById("setWelcomeBonus").addEventListener("click", () => setWelcomeBonus(prompt("Enter new welcome bonus in BST:")));
    document.getElementById("setReferralCommission").addEventListener("click", () => setReferralCommissionRate(prompt("Enter new referral commission rate (e.g., 1 for 1%):")));
    document.getElementById("getReferralLink").addEventListener("click", generateReferralLink);

    document.addEventListener("keydown", (event) => {
        if (isGameRunning) {
            if (event.key === "ArrowUp" && direction !== "down") direction = "up";
            if (event.key === "ArrowDown" && direction !== "up") direction = "down";
            if (event.key === "ArrowLeft" && direction !== "right") direction = "left";
            if (event.key === "ArrowRight" && direction !== "left") direction = "right";
        }
    });

    let touchStartX = 0, touchStartY = 0, lastTouchTime = 0;
    if (canvas) {
        canvas.addEventListener("touchstart", (event) => { touchStartX = event.touches[0].clientX; touchStartY = event.touches[0].clientY; });
        canvas.addEventListener("touchmove", (event) => {
            if (!isGameRunning) return;
            const touch = event.touches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            if (Date.now() - lastTouchTime < 200) return;
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 100) {
                if (deltaX > 0 && direction !== "left") direction = "right";
                else if (deltaX < 0 && direction !== "right") direction = "left";
            } else if (Math.abs(deltaY) > 100) {
                if (deltaY > 0 && direction !== "up") direction = "down";
                else if (deltaY < 0 && direction !== "down") direction = "up";
            }
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            lastTouchTime = Date.now();
        });
    }

    window.addEventListener("resize", updateCanvasSize);
    updateCanvasSize();
    generateBoxes();
    draw();
    updatePlayerHistoryUI();
});
