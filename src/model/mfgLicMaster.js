
import mongoose from "mongoose";
import connectToDatabase from "../utils/dbConnection.js";
import globals from "../utils/globals.js";

const mfgLicSchema = mongoose.Schema({
    mfgLicMaster: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const mfgLicModel = async () => {
    const db = await connectToDatabase(globals.Database);
    return db.models.MfgLicMasters || db.model("MfgLicMasters", mfgLicSchema);
}

// const mfgLicModel = mongoose.model("MfgLicMasters", mfgLicSchema)
export default mfgLicModel;