import mongoose from "mongoose";
import config from "../config/config.js";

const connections = {};

const connectToDatabase = async (dbName) => {
    if (!connections[dbName]) {
        // const dbURI = `mongodb+srv://fenil2502:KRMHA7bwog8xnGso@fenilapi.de2pm.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=FenilApi`;

        const dbURI = config.YEAR_DBCONNECTION.replace("{0}", dbName);
        const conn = mongoose.createConnection(dbURI);

        conn.on("connected", () => {
            console.log(`✅ Connected to database: ${dbName}`);
        });

        conn.on("error", (err) => {
            console.error(`❌ Database connection error (${dbName}):`, err);
        });

        connections[dbName] = conn;
    } else {
        // console.log(`ℹ️ Using existing database connection: ${dbName}`);
    }
    return connections[dbName];
};

export default connectToDatabase;
