import 'dotenv/config.js'
import { connectDB } from './DB/index.js'
import { app } from './app.js'
import { listenEvents } from './Listeners/provenanceListener.js';

const PORT = process.env.PORT || 8000;

connectDB()
.then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running at port: ${PORT}`)
        listenEvents();
    })
})
.catch((error) => {
    console.log("MongoDB connection failed !!!", error)
})