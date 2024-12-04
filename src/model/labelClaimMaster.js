
import mongoose from "mongoose";

const labelClaimSchema = mongoose.Schema({
    labelClaim: { type: String, default: '' },
    labelClaimCode: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const labelClaimModel = mongoose.model("LabelClaimMasters", labelClaimSchema)
export default labelClaimModel;