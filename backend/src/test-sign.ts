import { ethers } from "ethers";

// const privateKey = "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a" // for surojit
// const privateKey = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"  // for shuvro
const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // for owner
// const privateKey = "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6" // for juthi admin
const wallet = new ethers.Wallet(privateKey);

console.log("Test Wallet Address:", wallet.address);

const nonce = "662222";

async function generateSignature() {
    const signature = await wallet.signMessage(nonce);
    console.log("Tomar Signature:", signature);
}

generateSignature();

// npx tsx src/test-sign.ts

// 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 shuvro
// 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb9226 owner
