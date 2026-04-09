import { User, type IUser } from '../Models/user.model.js'
import { uploadOnCloudinary } from './cloudinary.js'

export const createOwnerIfNotExisted = async () : Promise<void> => {
    try {
        const existingOwner = await User.findOne({role: "owner"});

        if(existingOwner) {
            console.log("System Owner already exists in DB")
            return;
        }

        const imageUpload = await uploadOnCloudinary("public/temp/shuvra.jpg");

        const ownerData: Partial<IUser> = {
            fullName: "Shuvra Dev",
            email: "shuvra1149131@gmail.com",
            walletAddress: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266".toLowerCase(),
            role: "owner",
            status: "active",
            profileImage: imageUpload?.secure_url || ""
        }

        const owner = new User(ownerData);
        await owner.save();
        console.log("Owner created successfully!");
        
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error creating owner:", error.message);
        } else {
            console.log("Unknown error creating owner:", error);
        }
    }
}