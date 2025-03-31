document.addEventListener("DOMContentLoaded", () => {
    let provider;
    let signer;
    let contract;
    let playerAddress;

    // यहाँ BlockSnakesGame का पता डालें
    const contractAddress = "0x456..."; // Remix से कॉपी किया गया BlockSnakesGame का पता डालें
    
    // यहाँ नया contractABI पेस्ट करें (Remix से कॉपी करें)
    const contractABI = [
        {
            "inputs": [],
            "name": "claimWelcomeBonus",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {"name": "player", "type": "address"},
                {"name": "totalReward", "type": "uint256"},
                {"name": "referrer", "type": "address"},
                {"name": "referrerReward", "type": "uint256"}
            ],
            "name": "claimAllRewards",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{"name": "player", "type": "address"}],
            "name": "getRewardHistory",
            "outputs": [
                {
                    "components": [
                        {"name": "amount", "type": "uint256"},
                        {"name": "timestamp", "type": "uint256"},
                        {"name": "rewardType", "type": "string"},
                        {"name": "referee", "type": "address"}
                    ],
                    "name": "",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{"name": "", "type": "address"}],
            "name": "playerHistory",
            "outputs": [
                {"name": "gamesPlayed", "type": "uint256"},
                {"name": "totalRewards", "type": "uint256"},
                {"name": "totalReferrals", "type": "uint256"},
                {"name": "referralRewards", "type": "uint256"},
                {"name": "stakedAmount", "type": "uint256"},
                {"name": "stakeTimestamp", "type": "uint256"},
                {"name": "pendingStakeRewards", "type": "uint256"},
                {"name": "hasClaimedWelcomeBonus", "type": "bool"}
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{"name": "amount", "type": "uint256"}],
            "name": "stake",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{"name": "player", "type": "address"}],
            "name": "updateStakeReward",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ];

    // MetaMask कनेक्शन
    async function connectWallet() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                provider = new ethers.providers.Web3Provider(window.ethereum);
                await provider.send("eth_requestAccounts", []);
                signer = provider.getSigner();
                playerAddress = await signer.getAddress();
                contract = new ethers.Contract(contractAddress, contractABI, signer);
                document.getElementById("wallet-address").innerText = `Connected: ${playerAddress}`;
            } catch (error) {
                console.error("Failed to connect wallet:", error);
                alert("Failed to connect wallet. Please ensure MetaMask is installed and try again.");
            }
        } else {
            alert("MetaMask is not installed. Please install MetaMask to play the game.");
        }
    }

    // वेलकम बोनस क्लेम करना
    async function claimWelcomeBonus() {
        if (!contract) {
            alert("Please connect your wallet first!");
            return;
        }
        try {
            const tx = await contract.claimWelcomeBonus();
            await tx.wait();
            alert("Welcome Bonus claimed successfully!");
        } catch (error) {
            console.error("Error claiming welcome bonus:", error);
            alert("Failed to claim welcome bonus. See console for details.");
        }
    }

    // स्नेक गेम लॉजिक
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    const snake = [{ x: 10, y: 10 }];
    const gridSize = 20;
    let dx = 1;
    let dy = 0;

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

    function updateSnake() {
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };
        snake.unshift(head);
        snake.pop();
    }

    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid();
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

    gameLoop();

    // ग्लोबल फंक्शंस को एक्सपोज़ करें
    window.connectWallet = connectWallet;
    window.claimWelcomeBonus = claimWelcomeBonus;
});
