import { ethers } from "ethers";
import { Image } from "../Models/image.models.js";
import { User } from "../Models/user.model.js";
import { PROVENANCE_ABI, PROVENANCE_ADDRESS, RPC_URL } from "../config/contract.js";

export const listenEvents = async(): Promise<void> => {
    try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(PROVENANCE_ADDRESS, PROVENANCE_ABI, provider);

        console.log("listener is live! Syncing raw data with mongoDB..");


        contract.on("UserRegistered", async (userWallet: string, event: any) => {
            console.log(`\n User Approved on Blockchain! Wallet: ${userWallet}`)
            try {
                await User.findByIdAndUpdate(
                    {
                        walletAddress: userWallet
                    },
                    {
                        status: 'active'
                    },
                    {
                        returnDocument: 'after'
                    }
                )
            } catch (error) {
                console.error("DB Error on UserRegister:", error)
            }
        })

        contract.on("UserRevoked", async (userWallet: string, event: any) => {
            console.log(`\n User Banned! Wallet: ${userWallet}`);
            try {
                await User.findOneAndUpdate(
                    { 
                        walletAddress: userWallet
                    },
                    { 
                        status: 'banned' 
                    }, 
                    {
                        returnDocument: 'after' 
                    }
                );
            } catch (error) { 
                console.error("DB Error on UserRevoked:", error); 
            }
        });

        contract.on("AdminAdded", async (adminWallet: string, event: any) => {
            console.log(`\n New Admin Added! Wallet: ${adminWallet}`);
            try {
                await User.findOneAndUpdate(
                    {
                        walletAddress: adminWallet 
                    },
                    { 
                        role: 'admin' 
                    },
                    { 
                        returnDocument: 'after' 
                    }
                );
            } catch (error) { 
                console.error("DB Error on AdminAdded:", error); 
            }
        });

        contract.on("AdminRemoved", async (adminWallet: string, event: any) => {
            console.log(`\n Admin Removed! Wallet: ${adminWallet}`);
            try {
                await User.findOneAndUpdate(
                    { 
                        walletAddress: adminWallet 
                    },
                    { 
                        role: 'user' 
                    },
                    { 
                        returnDocument: 'after' 
                    }
                );
            } catch (error) { console.error("DB Error on AdminRemoved:", error); }
        });

        contract.on("ImageRegistered", async (creator: string, hash: string, metadataCID: string, event: any) => {
            console.log(`\n New Image Verified! Hash: ${hash}`);
            try {
                await Image.findOneAndUpdate(
                    { 
                        imageHash: hash 
                    },
                    { 
                        status: 'verified', 
                        transactionHash: event.log.transactionHash,
                        currentOwner: creator
                    },
                    { returnDocument: 'after' }
                );
            } catch (error) { 
                console.error("DB Error on Register:", error); 
            }
        });

        contract.on("ImageTransferred", async (hash: string, from: string, to: string, event: any) => {
            console.log(`\n Ownership Transferred! Hash: ${hash}`);
            try {
                await Image.findOneAndUpdate(
                    { 
                        imageHash: hash 
                    },
                    { 
                        currentOwner: to 
                    }, 
                    { 
                        returnDocument: 'after' 
                    }
                );
            } catch (error) { console.error("DB Error on Transfer:", error); }
        });

        contract.on("MetadataUpdated", async (hash: string, newMetadataCID: string, txReceipt: any) => {
            console.log(`\n Metadata Updated! Hash: ${hash}`);
            try {
                await Image.findOneAndUpdate(
                    { 
                        imageHash: hash 
                    },
                    { 
                        metadataCID: newMetadataCID 
                    }, 
                    { 
                        returnDocument: 'after' 
                    }
                );
            } catch (error) { console.error("DB Error on MetadataUpdate:", error); }
        });

        contract.on("ImageFlagged", async (hash: string, txReceipt: any) => {
            console.log(`\n Image Flagged! Hash: ${hash}`);
            try {
                await Image.findOneAndUpdate(
                    { 
                        imageHash: hash 
                    },
                    { 
                        status: 'flagged', 
                        isTampered: true 
                    }, 
                    { returnDocument: 'after' }
                );
            } catch (error) { 
                console.error(" DB Error on Flag:", error); 
            }
        });

        contract.on("ImageUnflagged", async (hash: string, txReceipt: any) => {
            console.log(`\n Image Unflagged! Hash: ${hash}`);
            try {
                await Image.findOneAndUpdate(
                    { 
                        imageHash: hash 
                    },
                    { 
                        status: 'verified', 
                        isTampered: false 
                    }, 
                    { 
                        returnDocument: 'after' 
                    }
                );
            } catch (error) { 
                console.error(" DB Error on Unflag:", error); 
            }
        });

        contract.on("ImageBurned", async (hash: string, txReceipt: any) => {
            console.log(`\n Image Burned! Hash: ${hash}`);
            try {
                await Image.findOneAndUpdate(
                    { imageHash: hash },
                    { 
                        status: 'burned', 
                        isBurned: true,
                        currentOwner: '0x0000000000000000000000000000000000000000' 
                    }, 
                    { returnDocument: 'after' }
                );
            } catch (error) { 
                console.error(" DB Error on Burn:", error); 
            }
        });

    } catch (error) {
        console.error("Listener Setup Error", error);
    }
}