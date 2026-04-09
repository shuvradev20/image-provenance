import { ethers } from "ethers";
import { Image } from "../Models/image.models.js";
import { User } from "../Models/user.model.js";
import { PROVENANCE_ABI, PROVENANCE_ADDRESS, RPC_URL } from "../config/contract.js";

/**
 * @function listenEvents
 * @description Acts as a Web3 Indexer for the application. It listens to real-time 
 * events emitted by the Smart Contract and synchronizes the off-chain MongoDB database. 
 * This ensures the UI remains fast while reflecting the true state of the blockchain.
 */
export const listenEvents = async(): Promise<void> => {
    try {
        // Initialize connection to the blockchain node
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(PROVENANCE_ADDRESS, PROVENANCE_ABI, provider);

        console.log("listener is live! Syncing raw data with mongoDB..");

        // --- user and Admin Governance Events ---

        /**
         * @event UserRegistered
         * @description Fired when an admin approves a pending user on-chain.
         */
        contract.on("UserRegistered", async (userWallet: string, event: any) => {
            console.log(`\n User Approved on Blockchain! Wallet: ${userWallet}`)
            try {
                await User.findOneAndUpdate(
                    {
                        walletAddress: userWallet.toLowerCase()
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

        /**
         * @event UserRevoked
         * @description Fired when an admin bans a user on-chain after 3 warnings.
         */
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

         /**
         * @event AdminAdded
         * @description Fired when the contract owner promotes a user to Admin role.
         */
        contract.on("AdminAdded", async (adminWallet: string, event: any) => {
            console.log(`\n New Admin Added! Wallet: ${adminWallet}`);
            try {
                await User.findOneAndUpdate(
                    {
                        walletAddress: adminWallet 
                    },
                    { 
                        status: 'active' 
                    },
                    { 
                        returnDocument: 'after' 
                    }
                );
            } catch (error) { 
                console.error("DB Error on AdminAdded:", error); 
            }
        });

       /**
         * @event AdminRemoved
         * @description Fired when the contract owner removes an Admin.
         * Action: Completely deletes the admin's record from the database
         */
        contract.on("AdminRemoved", async (adminWallet: string, event: any) => {
            console.log(`\n Admin Removed! Wallet: ${adminWallet}`);
            try {
                const deleteAdmin = await User.findByIdAndDelete({
                    walletAddress: adminWallet.toLowerCase()
                })

                if(deleteAdmin) {
                    console.log(`Admin ${adminWallet} completely removed from the platform DB`)
                } else {
                    console.log(` Admin ${adminWallet} not found in DB during removal`)
                }
            } catch (error) { console.error("DB Error on AdminRemoved:", error); }
        });

        // --- Image Provenance Events ---

        /**
         * @event ImageRegistered
         * @description Fired when a new image is successfully registered on-chain.
         */
        contract.on("ImageRegistered", async (creator: string, hash: string, metadataCID: string, event: any) => {
            console.log(`\n New Image Verified! Hash: ${hash}`);
            try {
                await Image.findOneAndUpdate(
                    { 
                        imageHash: hash 
                    },
                    { 
                        status: 'verified', 
                        transactionHash: event.log.transactionHash, // Linking DB to Tx
                        // currentOwner: creator.toLowerCase()
                    },
                    { returnDocument: 'after' }
                );
            } catch (error) { 
                console.error("DB Error on Register:", error); 
            }
        });

        /**
         * @event ImageTransferred
         * @description Fired when ownership of an image record is transferred to another wallet.
         */
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

        /**
         * @event MetadataUpdated
         * @description Fired if an owner updates the IPFS metadata link for their image.
         */
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

        /**
         * @event ImageFlagged
         * @description Fired when admins flag an image for copyright/tampering on-chain.
         */
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

        /**
         * @event ImageUnflagged
         * @description Fired when admins clear an image's flagged status after review.
         */
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

        /**
         * @event ImageBurned
         * @description Fired when an image record is permanently destroyed (burned) on-chain.
         */
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

        provider.on("error", (error) => {
            console.error("\n ⚠️ Listener crash koreche! Node er sathe jhamela:", error.message);
            
            // 1. Purono sob connection ar event listener bad diye dao
            provider.removeAllListeners();

            console.log("🔄 5 second por listener abar auto-restart nicche...");

            // 2. 5 second por abar nije nijeke call kore fresh vabe start koro
            setTimeout(() => {
                listenEvents();
            }, 2000);
        });

    } catch (error) {
        console.error("Listener Setup Error", error);
    }
}