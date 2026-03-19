import mongoose from "mongoose";
import connectToDatabase from "../utils/dbConnection.js";

const emailConfigSchema = mongoose.Schema({
    email: { type: String, default: '' },
    pass: { type: String, default: '' },
    secondaryEmail: { type: String, default: '' },
    mobileNo: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
    secondaryPass: { type: String, default: '' },
}, { timestamps: true })

const emailConfigModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    return db.models.emailconfigs || db.model("emailconfigs", emailConfigSchema);
}


export default emailConfigModel;