const { ethers } = require("ethers");
const privateKey = "e4594c8a3cd798aed0c2b1276012e87cce67c4a21142cf0b3467d8815bf37544";
const wallet = new ethers.Wallet(privateKey);
const message = ethers.toUtf8Bytes("Mint 100 BST tokens");
const messageHash = ethers.keccak256(message);

(async () => {
  const signature = await wallet.signMessage(ethers.getBytes(messageHash));
  console.log("Message Hash:", messageHash);
  console.log("Signature:", signature);
})();