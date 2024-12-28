
import mongoose from "mongoose";

const inquiryDetailsSchema = mongoose.Schema({
    partyIds: { type: String, default: '' },
    materialType: { type: String, default: '' },
    inquiryNo: { type: String, default: '' },
    inquiryDate: { type: Date, default: new Date() },
    status: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const inquiryDetailsModel = mongoose.model("InquiryDetails", inquiryDetailsSchema)
export default inquiryDetailsModel;