import { ethers } from "ethers";

// 1. Ekta fake private key nilam (shudhu test korar jonno)
const privateKey = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
const wallet = new ethers.Wallet(privateKey);

console.log("Test Wallet Address:", wallet.address);

// 2. Postman theke je nonce ta pabe, seta ekhane boshabe
const nonce = "651042"; // Ekhon apatoto jemon ache temon-i thak

async function generateSignature() {
    // 3. Ethers.js diye fake MetaMask-er moto sign korchi
    const signature = await wallet.signMessage(nonce);
    console.log("Tomar Signature:", signature);
}

generateSignature();

// npx tsx src/test-sign.ts
// 0xFCAd0B19bB29D4674531d6f115237E16AfCE377c