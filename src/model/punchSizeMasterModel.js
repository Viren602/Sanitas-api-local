
import mongoose from "mongoose";
import connectToDatabase from "../utils/dbConnection.js";
import globals from "../utils/globals.js";

const punchSizeSchema = mongoose.Schema({
    punchSizeMaster: { type: String, default: '' },
    punchSizeId: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const punchSizeModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    return db.models.PunchSizeMasters || db.model("PunchSizeMasters", punchSizeSchema);
}

// const punchSizeModel = mongoose.model("PunchSizeMasters", punchSizeSchema)
export default punchSizeModel;