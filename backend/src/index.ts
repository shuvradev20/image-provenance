import 'dotenv/config.js'
import { connectDB } from './DB/index.js'
import { app } from './app.js'
import { createSuperAdminIfNotExisted } from './Utils/seedSuperAdmin.js';

const PORT = process.env.PORT || 8000;

connectDB()
.then(async () => {
    await createSuperAdminIfNotExisted();

    app.listen(PORT, () => {
        console.log(`Server is running at port: ${PORT}`)
    })
})
.catch((error) => {
    console.log("MongoDB connection failed !!!", error)

    process.exit(1);
})