
import mongoose from "mongoose";

const mfgLicSchema = mongoose.Schema({
    mfgLicMaster: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const mfgLicModel = mongoose.model("MfgLicMasters", mfgLicSchema)
export default mfgLicModel;