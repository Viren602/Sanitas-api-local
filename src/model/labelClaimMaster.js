
import mongoose from "mongoose";
import connectToDatabase from "../utils/dbConnection.js";
import globals from "../utils/globals.js";

const labelClaimSchema = mongoose.Schema({
    labelClaim: { type: String, default: '' },
    labelClaimCode: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const labelClaimModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    return db.models.LabelClaimMasters || db.model("LabelClaimMasters", labelClaimSchema);
}

// const labelClaimModel = mongoose.model("LabelClaimMasters", labelClaimSchema)
export default labelClaimModel;