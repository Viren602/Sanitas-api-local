
import mongoose from "mongoose";
import connectToDatabase from "../utils/dbConnection.js";
import globals from "../utils/globals.js";

const userLogModelSchema = mongoose.Schema({
    token: { type: String, default: '' },
    userName: { type: String, default: '' },
    sessionTimeout: { type: String, default: '' },
    expires: { type: Date, default: '' },
    email: { type: String, default: '' },
    device: { type: String, default: '' }
}, { timestamps: true })

const userLogModel = async () => {
    const db = await connectToDatabase(globals.Database);
    return db.models.UserLogData || db.model("UserLogData", userLogModelSchema);
}

// const userLogModel = mongoose.model("UserLogData", userLogModelSchema)
export default userLogModel;