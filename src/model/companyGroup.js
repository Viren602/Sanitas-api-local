
import mongoose from "mongoose";

const companyGroup = mongoose.Schema({
    CompanyGroup: { type: String, default: '' },
    CompanyName: { type: String, default: '' },
    acNo : { type: String, default: '' },
    addressLine1: { type: String, default: '' },
    addressLine2: { type: String, default: '' },
    addressLine3: { type: String, default: '' },
    bankName: { type: String, default: '' },
    branch: { type: String, default: '' },
    email: { type: String, default: '' },
    fssaiNo: { type: String, default: '' },
    gstnNo: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    mfgLicNo: { type: String, default: '' },
    mobile: { type: String, default: '' },
    panNo: { type: String, default: '' },
    pinCode: { type: String, default: '' },
    state: { type: String, default: '' },
    location: { type: String, default: '' },
    termsConditionLine1: { type: String, default: '' },
    termsConditionLine2: { type: String, default: '' },
    termsConditionLine3: { type: String, default: '' },
    termsConditionLine4: { type: String, default: '' },
}, { timestamps: true })


const companyGroupModel = mongoose.model("CompanyGroup", companyGroup)
export default companyGroupModel;