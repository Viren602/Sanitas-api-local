
import mongoose from "mongoose";
import connectToDatabase from "../../utils/dbConnection.js";
import globals from "../../utils/globals.js";

const inquiryDetailsSchema = mongoose.Schema({
    partyIds: { type: String, default: '' },
    materialType: { type: String, default: '' },
    inquiryNo: { type: String, default: '' },
    inquiryDate: { type: Date, default: new Date() },
    status: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const inquiryDetailsModel = async () => {
    const db = await connectToDatabase(globals.Database);
    return db.models.InquiryDetails || db.model("InquiryDetails", inquiryDetailsSchema);
}

// const inquiryDetailsModel = mongoose.model("InquiryDetails", inquiryDetailsSchema)
export default inquiryDetailsModel;