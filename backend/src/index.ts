/**
 * @file index.js
 * Main entry point
 */
import 'dotenv/config.js'
import { connectDB } from './DB/index.js'
import { app } from './app.js'
import { listenEvents } from './Listeners/provenanceListener.js';
import { createOwnerIfNotExisted } from './Utils/seedOwner.js';

const PORT = process.env.PORT || 8000;

// Establishing DB connection before starting the server
connectDB()
.then(async () => {
    await createOwnerIfNotExisted();

    app.listen(PORT, () => {
        console.log(`Server is running at port: ${PORT}`)

        // Initialize Web3 listeners
        listenEvents();
    })
})
.catch((error) => {
    console.log("MongoDB connection failed !!!", error)

    // Shut down the process completely if the DB connection fails
    process.exit(1);
})