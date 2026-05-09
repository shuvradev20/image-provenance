import config from '../config/config.js'
import { Admin, type IAdmin} from '../Models/admin.models.js'

export const createSuperAdminIfNotExisted = async (): Promise<void> => {
    try {
        const existingSuperAdmin = await Admin.findOne({role: "superAdmin"});
    
        if(existingSuperAdmin) {
            console.log("System Super Admin already exists in DB");
            return;
        }
    
        const defaultPassword = config.defaultAdminPassword
    
        const superAdminData: Partial<IAdmin> = {
            fullName: "Shuvra Dev",
            email: "shuvra1149131@gmail.com",
            password: defaultPassword,
            role: "superAdmin"
        }
    
        const superAdmin = new Admin(superAdminData)
        await superAdmin.save();
        console.log("Super Admin created successfully!");
    } catch (error) {
        if(error instanceof Error) {
            console.log("Error creating super admin", error.message)
        } else {
            console.log("Unknown error creating super admin:", error)
        }
    };
};
