import mongoose from "mongoose";
import config from "../config/config.js";

const connections = {};

const connectToDatabase = async (dbName) => {
    if (!connections[dbName]) {
        const dbURI = config.YEAR_DBCONNECTION.replace("{0}", dbName);

        try {
            const conn = await mongoose.createConnection(dbURI).asPromise(); // Ensure connection is established before proceeding

            conn.on("connected", () => {
                console.log(`✅ Connected to database: ${dbName}`);
            });

            conn.on("error", (err) => {
                console.error(`❌ Database connection error (${dbName}):`, err);
            });

            connections[dbName] = conn;
        } catch (err) {
            console.error(`❌ Failed to connect to database: ${dbName}`, err);
            throw err; // Ensure caller knows about the failure
        }
    }
    
    return connections[dbName];
};

export default connectToDatabase;
