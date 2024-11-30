
import mongoose from "mongoose";

const companyGroup = mongoose.Schema({
    CompanyGroup: { type: String, default: '' },
    CompanyName: { type: String, default: '' },
}, { timestamps: true })


const companyGroupModel = mongoose.model("CompanyGroup", companyGroup)
export default companyGroupModel;