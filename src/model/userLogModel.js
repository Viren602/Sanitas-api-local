
import mongoose from "mongoose";
import connectToDatabase from "../utils/dbConnection.js";
import globals from "../utils/globals.js";
import config from "../config/config.js";

const MasterDB = config.MASTER_DB;

const userLogModelSchema = mongoose.Schema({
    token: { type: String, default: '' },
    userName: { type: String, default: '' },
    sessionTimeout: { type: String, default: '' },
    expires: { type: Date, default: '' },
    email: { type: String, default: '' },
    device: { type: String, default: '' },
    companyId: { type: String, default: '' }
}, { timestamps: true })

const userLogModel = async () => {
    const db = await connectToDatabase(MasterDB);
    return db.models.UserLogData || db.model("UserLogData", userLogModelSchema);
}

// const userLogModel = mongoose.model("UserLogData", userLogModelSchema)
export default userLogModel;