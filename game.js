document.addEventListener("DOMContentLoaded", () => {
    let account = null;
    let contract = null;
    let gameInterval = null;
    const TARGET_NETWORK_ID = "97"; // BNB Testnet Chain ID
    let WITHDRAWAL_FEE_BNB = "0.0002"; // डिफॉल्ट फीस

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
        hasClaimedWelcomeBonus: false,
        walletBalance: 0,
        walletAddress: null
    };

    const urlParams = new URLSearchParams(window.location.search);
    const referrerAddress = urlParams.get("ref");
    if (referrerAddress && !playerData.pendingReferral) {
        playerData.pendingReferral = referrerAddress;
    }

    // स्मार्ट कॉन्ट्रैक्ट डिटेल्स
    const contractAddress = "YOUR_CONTRACT_ADDRESS"; // यहाँ अपना डिप्लॉयड कॉन्ट्रैक्ट एड्रेस डालें
    const contractABI = [ /* यहाँ रीमिक्स से कॉपी किया गया ABI पेस्ट करें */ ]; // पूरा ABI यहाँ डालें
    const gameOracleAddress = "0x1fAC26109AC7f829448c67DF5110bcf37Ffcd4f0"; // GameOracle पता
    const gameOraclePrivateKey = "YOUR_GAME_ORACLE_PRIVATE_KEY"; // GameOracle की प्राइवेट की यहाँ डालें
    const gameOracleProvider = new ethers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545/");
    const gameOracleWallet = new ethers.Wallet(gameOraclePrivateKey, gameOracleProvider);
    const gameOracleContract = new ethers.Contract(contractAddress, contractABI, gameOracleWallet);

    // कैनवस और गेम लॉजिक
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const gridWidth = 30;
    const gridHeight = 20;
    let gridSize;
    let snake = [{ x: 10, y: 10 }];
    let boxes = [];
    let direction = 'right';
    let score = 0;
    let gameRewards = 0;
    let baseSnakeSpeed = 300;
    let currentSnakeSpeed = baseSnakeSpeed;

    function updateCanvasSize() {
        const screenWidth = window.innerWidth * 0.9;
        const screenHeight = window.innerHeight * 0.7;
        gridSize = Math.min(screenWidth / gridWidth, screenHeight / gridHeight);
        canvas.width = gridSize * gridWidth;
        canvas.height = gridSize * gridHeight;
        canvas.style.width = `${canvas.width}px`;
        canvas.style.height = `${canvas.height}px`;
    }

    function enterFullscreen() {
        if (canvas.requestFullscreen) canvas.requestFullscreen();
    }

    function generateBoxes() {
        boxes = [];
        const numBoxes = 5;
        for (let i = 0; i < numBoxes; i++) {
            let newBox;
            do {
                newBox = { x: Math.floor(Math.random() * gridWidth), y: Math.floor(Math.random() * gridHeight) };
            } while (snake.some(segment => segment.x === newBox.x && segment.y === newBox.y) || boxes.some(b => b.x === newBox.x && b.y === newBox.y));
            boxes.push(newBox);
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#0a0a23";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const gradient = ctx.createLinearGradient(snake[0].x * gridSize, snake[0].y * gridSize, snake[snake.length - 1].x * gridSize, snake[snake.length - 1].y * gridSize);
        gradient.addColorStop(0, "#00ffcc");
        gradient.addColorStop(1, "#00ccaa");
        snake.forEach((segment, index) => {
            ctx.fillStyle = gradient;
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);

            if (index === 0) {
                ctx.fillStyle = "#00ffcc";
                ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);

                ctx.fillStyle = "#ffffff";
                const eyeSize = gridSize / 3;
                const pupilSize = eyeSize / 2;
                if (direction === 'right') {
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + gridSize - eyeSize, segment.y * gridSize + eyeSize, eyeSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + gridSize - eyeSize, segment.y * gridSize + gridSize - eyeSize, eyeSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#000000";
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + gridSize - eyeSize, segment.y * gridSize + eyeSize, pupilSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + gridSize - eyeSize, segment.y * gridSize + gridSize - eyeSize, pupilSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                } else if (direction === 'left') {
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + eyeSize, segment.y * gridSize + eyeSize, eyeSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + eyeSize, segment.y * gridSize + gridSize - eyeSize, eyeSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#000000";
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + eyeSize, segment.y * gridSize + eyeSize, pupilSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + eyeSize, segment.y * gridSize + gridSize - eyeSize, pupilSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                } else if (direction === 'up') {
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + eyeSize, segment.y * gridSize + eyeSize, eyeSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + gridSize - eyeSize, segment.y * gridSize + eyeSize, eyeSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#000000";
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + eyeSize, segment.y * gridSize + eyeSize, pupilSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + gridSize - eyeSize, segment.y * gridSize + eyeSize, pupilSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                } else if (direction === 'down') {
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + eyeSize, segment.y * gridSize + gridSize - eyeSize, eyeSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + gridSize - eyeSize, segment.y * gridSize + gridSize - eyeSize, eyeSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#000000";
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + eyeSize, segment.y * gridSize + gridSize - eyeSize, pupilSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(segment.x * gridSize + gridSize - eyeSize, segment.y * gridSize + gridSize - eyeSize, pupilSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        });

        boxes.forEach(box => {
            ctx.fillStyle = "#ff5555";
            ctx.fillRect(box.x * gridSize, box.y * gridSize, gridSize - 2, gridSize - 2);
        });

        document.getElementById('score').textContent = `Score: ${score}`;
        document.getElementById('potentialBST').textContent = `Potential BST: ${(score / 100 * 5).toFixed(2)}`;
        document.getElementById('gameRewards').textContent = `Game Rewards: ${gameRewards} BST`;
    }

    async function move() {
        let head = { x: snake[0].x, y: snake[0].y };
        if (direction === 'right') head.x++;
        if (direction === 'left') head.x--;
        if (direction === 'up') head.y--;
        if (direction === 'down') head.y++;

        if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight || snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            clearInterval(gameInterval);
            gameInterval = null;
            showGameOverPopup();
            return;
        }

        snake.unshift(head);
        const eatenBoxIndex = boxes.findIndex(box => box.x === head.x && box.y === head.y);
        if (eatenBoxIndex !== -1) {
            score += 10;
            boxes.splice(eatenBoxIndex, 1);
            if (score % 100 === 0) {
                const reward = 5;
                const referrerReward = reward * 0.01;
                playerData.pendingRewards += reward;
                gameRewards += reward;
                playerData.totalRewards += reward;

                playerData.rewardHistory.push({ amount: reward, timestamp: Date.now(), rewardType: "Game", referee: "N/A" });
                if (playerData.pendingReferral) {
                    playerData.pendingReferrerReward += referrerReward;
                    playerData.referralRewards += referrerReward;
                    playerData.totalReferrals += 1;
                    playerData.rewardHistory.push({ amount: referrerReward, timestamp: Date.now(), rewardType: "Referral", referee: playerData.pendingReferral });
                }

                currentSnakeSpeed = Math.max(50, currentSnakeSpeed * 0.995);
                clearInterval(gameInterval);
                gameInterval = setInterval(move, currentSnakeSpeed);
            }
            if (boxes.length < 3) generateBoxes();
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
            popup.style.cssText = "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: #2a2a5d; color: #fff; padding: 20px; border: 2px solid #00ffcc; border-radius: 10px;";
            document.body.appendChild(popup);
            document.getElementById("startNewGame").addEventListener("click", resetGame);
        }
        popup.style.display = "block";
    }

    async function resetGame() {
        if (gameInterval) clearInterval(gameInterval);
        if (gameRewards > 0 && account) {
            await submitGameReward(gameRewards);
        }
        playerData.gamesPlayed += 1;
        score = 0;
        gameRewards = 0;
        snake = [{ x: 10, y: 10 }];
        direction = 'right';
        currentSnakeSpeed = baseSnakeSpeed;
        generateBoxes();
        updatePlayerHistoryUI();
        localStorage.setItem("playerData", JSON.stringify(playerData));
        draw();
        const popup = document.getElementById("gameOverPopup");
        if (popup) popup.style.display = "none";
        if (account) gameInterval = setInterval(move, currentSnakeSpeed);
    }

    let touchStartX = 0;
    let touchStartY = 0;
    let lastMoveTime = 0;
    const touchThreshold = 20;

    canvas.addEventListener('touchstart', (event) => {
        event.preventDefault();
        const touch = event.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        lastMoveTime = Date.now();
    });

    canvas.addEventListener('touchmove', (event) => {
        event.preventDefault();
        const touch = event.touches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        const now = Date.now();

        if (now - lastMoveTime < 100) return;

        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > touchThreshold) {
            if (deltaX > 0 && direction !== 'left') direction = 'right';
            else if (deltaX < 0 && direction !== 'right') direction = 'left';
            lastMoveTime = now;
        } else if (Math.abs(deltaY) > touchThreshold) {
            if (deltaY > 0 && direction !== 'up') direction = 'down';
            else if (deltaY < 0 && direction !== 'down') direction = 'up';
            lastMoveTime = now;
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowUp' && direction !== 'down') direction = 'up';
        if (event.key === 'ArrowDown' && direction !== 'up') direction = 'down';
        if (event.key === 'ArrowLeft' && direction !== 'right') direction = 'left';
        if (event.key === 'ArrowRight' && direction !== 'left') direction = 'right';
    });

    window.addEventListener('resize', updateCanvasSize);

    updateCanvasSize();
    generateBoxes();
    draw();

    const playGameBtn = document.getElementById('playGame');
    if (playGameBtn) {
        playGameBtn.addEventListener('click', () => {
            if (!account) return alert("Please connect your wallet!");
            enterFullscreen();
            resetGame();
            if (!gameInterval) gameInterval = setInterval(move, currentSnakeSpeed);
        });
    }

    function generateReferralLink() {
        if (!account) return alert("Connect your wallet first!");
        const referralLink = `${window.location.origin}${window.location.pathname}?ref=${account}`;
        navigator.clipboard.writeText(referralLink).then(() => alert("Referral link copied: " + referralLink));
    }

    async function fetchWithdrawalFee() {
        if (!contract) return;
        try {
            const feeWei = await contract.withdrawalFeeInBnb();
            WITHDRAWAL_FEE_BNB = ethers.formatUnits(feeWei, 18);
            console.log("Updated withdrawal fee:", WITHDRAWAL_FEE_BNB, "BNB");
        } catch (error) {
            console.error("Error fetching withdrawal fee:", error);
        }
    }

    async function claimWelcomeBonus() {
        if (!contract || !account) return alert("Connect your wallet first!");
        if (playerData.hasClaimedWelcomeBonus) return alert("Welcome bonus already claimed!");

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const balance = await provider.getBalance(account);
            const feeWei = ethers.parseUnits(WITHDRAWAL_FEE_BNB, 18);
            if (balance < feeWei) {
                return alert(`Insufficient BNB balance. You need at least ${WITHDRAWAL_FEE_BNB} BNB for the fee.`);
            }

            const contractBalance = await contract.contractBalance();
            const welcomeBonusAmount = ethers.parseUnits("100", 18);
            if (contractBalance < welcomeBonusAmount) {
                return alert("Contract does not have enough BST tokens to pay the welcome bonus.");
            }

            const tx = await contract.claimWelcomeBonus({ value: feeWei, gasLimit: 300000 });
            await tx.wait();

            playerData.hasClaimedWelcomeBonus = true;
            playerData.totalRewards += 100;
            playerData.pendingRewards += 100;
            playerData.rewardHistory.push({ amount: 100, timestamp: Date.now(), rewardType: "Welcome Bonus", referee: "N/A" });
            playerData.walletBalance = Number(ethers.formatUnits(await contract.getInternalBalance(account), 18));
            updatePlayerHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
            alert("Welcome bonus of 100 BST claimed!");
        } catch (error) {
            console.error("Error claiming welcome bonus:", error);
            alert("Failed to claim welcome bonus: " + (error.message || "Unknown error"));
        }
    }

    async function submitGameReward(rewardAmount) {
        if (!account) return alert("Connect your wallet first!");
        if (rewardAmount < 5) return; // साइलेंटली स्किप करें अगर रिवॉर्ड 5 से कम है

        try {
            const rewardWei = ethers.parseUnits(rewardAmount.toString(), 18);
            const tx = await gameOracleContract.claimAllRewards(
                rewardWei,
                account,
                playerData.pendingReferral || "0x0000000000000000000000000000000000000000",
                { gasLimit: 300000 }
            );
            await tx.wait();

            playerData.totalRewards += rewardAmount;
            if (playerData.pendingReferral) {
                const referrerReward = rewardAmount * 0.01;
                playerData.referralRewards += referrerReward;
                playerData.pendingReferrerReward = 0;
            }
            playerData.pendingRewards += rewardAmount;
            playerData.pendingReferral = null;
            updatePlayerHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
            alert(`${rewardAmount} BST rewards submitted successfully!`);
        } catch (error) {
            console.error("Error submitting game rewards:", error);
            alert("Failed to submit rewards: " + (error.message || "Unknown error"));
        }
    }

    async function claimPendingRewards() {
        if (!contract || !account) return alert("Connect your wallet first!");
        if (playerData.pendingRewards < 10) return alert("Minimum 10 BST required to claim!");

        try {
            await fetchWithdrawalFee();
            const provider = new ethers.BrowserProvider(window.ethereum);
            const balance = await provider.getBalance(account);
            const feeWei = ethers.parseUnits(WITHDRAWAL_FEE_BNB, 18);
            if (balance < feeWei) {
                return alert(`Insufficient BNB balance. You need at least ${WITHDRAWAL_FEE_BNB} BNB for the fee.`);
            }

            const contractBalance = await contract.contractBalance();
            const rewardWei = ethers.parseUnits(playerData.pendingRewards.toString(), 18);
            if (contractBalance < rewardWei) {
                return alert("Contract does not have enough BST tokens.");
            }

            const tx = await contract.withdrawAllTokens({ value: feeWei, gasLimit: 300000 });
            await tx.wait();

            playerData.walletBalance = Number(ethers.formatUnits(await contract.balanceOf(account), 18));
            playerData.pendingRewards = 0;
            playerData.rewardHistory.push({ amount: playerData.pendingRewards, timestamp: Date.now(), rewardType: "Withdrawal", referee: "N/A" });
            updatePlayerHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
            alert("Pending rewards withdrawn successfully!");
        } catch (error) {
            console.error("Error claiming rewards:", error);
            alert("Failed to claim rewards: " + (error.message || "Unknown error"));
        }
    }

    async function connectWallet() {
        if (!window.ethereum) return alert("Please install MetaMask!");
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const network = await provider.getNetwork();
            if (network.chainId.toString() !== TARGET_NETWORK_ID) {
                await window.ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: `0x${parseInt(TARGET_NETWORK_ID).toString(16)}` }],
                });
            }

            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            account = accounts[0];

            if (playerData.walletAddress && playerData.walletAddress !== account) {
                playerData = {
                    gamesPlayed: 0,
                    totalRewards: 0,
                    score: 0,
                    pendingRewards: 0,
                    totalReferrals: 0,
                    referralRewards: 0,
                    pendingReferral: null,
                    pendingReferrerReward: 0,
                    rewardHistory: [],
                    hasClaimedWelcomeBonus: false,
                    walletBalance: 0,
                    walletAddress: account
                };
            } else {
                playerData.walletAddress = account;
            }

            const signer = await provider.getSigner();
            contract = new ethers.Contract(contractAddress, contractABI, signer);

            const connectBtn = document.getElementById("connectWallet");
            const disconnectBtn = document.getElementById("disconnectWallet");
            const walletAddr = document.getElementById("walletAddress");
            if (connectBtn) connectBtn.style.display = "none";
            if (disconnectBtn) disconnectBtn.style.display = "block";
            if (walletAddr) walletAddr.textContent = `Connected: ${account.slice(0, 6)}...`;

            await loadPlayerHistory();
            await fetchWithdrawalFee();
            updatePlayerHistoryUI();
            localStorage.setItem("playerData", JSON.stringify(playerData));
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
        updatePlayerHistoryUI();
        alert("Wallet disconnected!");
    }

    async function loadPlayerHistory() {
        if (!contract || !account) {
            updatePlayerHistoryUI();
            return;
        }
        try {
            const history = await contract.playerHistory(account);
            playerData.gamesPlayed = Number(history.gamesPlayed);
            playerData.totalRewards = Number(ethers.formatUnits(history.totalRewards, 18));
            playerData.totalReferrals = Number(history.totalReferrals);
            playerData.referralRewards = Number(ethers.formatUnits(history.referralRewards, 18));
            playerData.hasClaimedWelcomeBonus = history.hasClaimedWelcomeBonus;
            playerData.walletBalance = Number(ethers.formatUnits(await contract.balanceOf(account), 18));
            playerData.pendingRewards = Number(ethers.formatUnits(await contract.getInternalBalance(account), 18));

            const rewards = await contract.getRewardHistory(account);
            playerData.rewardHistory = rewards.map(r => ({
                amount: Number(ethers.formatUnits(r.amount, 18)),
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
            totalGameRewards: `Total Game Rewards: ${playerData.totalRewards.toFixed(2)} BST`,
            totalReferrals: `Total Referrals: ${playerData.totalReferrals}`,
            referralRewards: `Referral Rewards: ${playerData.referralRewards.toFixed(2)} BST`,
            pendingRewardsText: `Pending Rewards: ${playerData.pendingRewards.toFixed(2)} BST`,
            walletBalance: `Wallet Balance: ${account ? playerData.walletBalance.toFixed(2) : "0"} BST`,
            walletAddress: account ? `Connected: ${account.slice(0, 6)}...` : ""
        };

        for (const [id, value] of Object.entries(elements)) {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        }

        const historyList = document.getElementById("rewardHistoryList");
        if (historyList) {
            historyList.innerHTML = "";
            if (account) {
                playerData.rewardHistory.forEach(entry => {
                    const li = document.createElement("li");
                    li.textContent = `${entry.rewardType}: ${entry.amount.toFixed(2)} BST on ${new Date(entry.timestamp).toLocaleString()}${entry.referee !== "N/A" ? ` (Referee: ${entry.referee})` : ""}`;
                    historyList.appendChild(li);
                });
            }
        }
    }

    const connectBtn = document.getElementById("connectWallet");
    const disconnectBtn = document.getElementById("disconnectWallet");
    const referralBtn = document.getElementById("getReferralLink");
    const claimRewardsBtn = document.getElementById("claimGameRewards");
    const welcomeBtn = document.getElementById("welcomeBonusButton");

    if (connectBtn) connectBtn.addEventListener("click", connectWallet);
    if (disconnectBtn) disconnectBtn.addEventListener("click", disconnectWallet);
    if (referralBtn) referralBtn.addEventListener("click", generateReferralLink);
    if (claimRewardsBtn) claimRewardsBtn.addEventListener("click", claimPendingRewards);
    if (welcomeBtn) welcomeBtn.addEventListener("click", claimWelcomeBonus);

    updatePlayerHistoryUI();
});
