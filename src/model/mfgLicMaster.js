
import mongoose from "mongoose";
import connectToDatabase from "../utils/dbConnection.js";
import globals from "../utils/globals.js";

const mfgLicSchema = mongoose.Schema({
    mfgLicMaster: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const mfgLicModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    return db.models.MfgLicMasters || db.model("MfgLicMasters", mfgLicSchema);
}

// const mfgLicModel = mongoose.model("MfgLicMasters", mfgLicSchema)
export default mfgLicModel;