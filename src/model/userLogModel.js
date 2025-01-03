
import mongoose from "mongoose";

const userLogModelSchema = mongoose.Schema({
    token: { type: String, default: '' },
    userName: { type: String, default: '' },
    sessionTimeout: { type: String, default: '' },
    expires: { type: Date, default: '' },
    email: { type: String, default: '' },
    device: { type: String, default: '' }
}, { timestamps: true })


const userLogModel = mongoose.model("UserLogData", userLogModelSchema)
export default userLogModel;