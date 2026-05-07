const mongoose = require("mongoose");
require("dotenv").config();

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for cleanup");
        
        const collection = mongoose.connection.db.collection("users");
        
        // List indexes
        const indexes = await collection.indexes();
        console.log("Current indexes:", indexes);
        
        // Drop phone_1 if it exists
        if (indexes.find(idx => idx.name === "phone_1")) {
            await collection.dropIndex("phone_1");
            console.log("Dropped index: phone_1");
        }
        
        console.log("Cleanup complete");
        process.exit(0);
    } catch (error) {
        console.error("Cleanup error:", error);
        process.exit(1);
    }
}

cleanup();
