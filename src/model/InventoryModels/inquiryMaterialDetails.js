
import mongoose from "mongoose";

const inquiryMaterialDetailsSchema = mongoose.Schema({
    rawMaterialId: { type: mongoose.Schema.Types.ObjectId, ref: "RawMaterialMasters", default: null },
    packageMaterialId: { type: mongoose.Schema.Types.ObjectId, ref: "PackingMaterialMaster", default: null  },
    inquiryId: { type: mongoose.Schema.Types.ObjectId, ref: "InquiryDetails" },
    qty: { type: Number, default: '' },
    uom: { type: String, default: '' },
    remarks: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const inquiryMaterialDetailsModel = mongoose.model("InquiryMaterialDetails", inquiryMaterialDetailsSchema)
export default inquiryMaterialDetailsModel;