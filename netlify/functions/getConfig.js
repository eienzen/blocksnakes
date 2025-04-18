exports.handler = async () => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
            GAME_ORACLE_ADDRESS: process.env.GAME_ORACLE_ADDRESS,
            GAME_ORACLE_RPC_URL: process.env.GAME_ORACLE_RPC_URL,
            GAME_ORACLE_RPC_URL_SECONDARY: process.env.GAME_ORACLE_RPC_URL_SECONDARY,
            WITHDRAWAL_FEE_BNB: process.env.WITHDRAWAL_FEE_BNB
        })
    };
};