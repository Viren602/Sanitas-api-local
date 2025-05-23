
import mongoose from "mongoose";
import globals from "../utils/globals.js";
import connectToDatabase from "../utils/dbConnection.js";

const partySchema = mongoose.Schema({
    id: { type: Number, default: 0 },
    partyCode: { type: String, default: '' },
    partyName: { type: String, default: '' },
    address1: { type: String, default: '' },
    address2: { type: String, default: '' },
    address3: { type: String, default: '' },
    address4: { type: String, default: '' },
    corrspAddress1: { type: String, default: '' },
    corrspAddress2: { type: String, default: '' },
    corrspAddress3: { type: String, default: '' },
    corrspAddress4: { type: String, default: '' },
    email: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pinCode: { type: Number, default: 0 },
    distance: { type: Number, default: 0 },
    gstnNo: { type: String, default: '' },
    mobileNo1: { type: String, default: '' },
    mobileNo2: { type: String, default: '' },
    documentThrough: { type: String, default: '' },
    bankDiscount: { type: Number, default: 0 },
    crdays: { type: Number, default: 0 },
    transporterName: { type: String, default: '' },
    discount: { type: Number, default: 0 },
    salesManComm: { type: Number, default: 0 },
    salesMan: { type: String, default: '' },
    acGroupCode: { type: String, default: '' },
    openBalance: { type: Number, default: 0 },
    pint: { type: Number, default: 0 },
    pcform: { type: String, default: '' },
    prtapl: { type: String, default: '' },
    itype: { type: String, default: '' },
    plevel: { type: String, default: '' },
    trancode: { type: String, default: '' },
    ccode: { type: String, default: '' },
    accountCodeName: { type: String, default: '' },
    person: { type: String, default: '' },
    dlNo1: { type: String, default: '' },
    dlNo2: { type: String, default: '' },
    telephone: { type: String, default: '' },
    partyType: { type: String, default: '' },
    fax: { type: String, default: '' },
    fssaiNo: { type: String, default: '' },
    bankName: { type: String, default: '' },
    bankAddress1: { type: String, default: '' },
    bankAddress2: { type: String, default: '' },
    bankAddress3: { type: String, default: '' },
    bankDiscount: { type: Number, default: 0 },
    branch: { type: String, default: '' },
    acno: { type: String, default: '' },
    ifsc: { type: String, default: '' },
    actype: { type: String, default: '' },
    invType: { type: String, default: '' },
    courier: { type: String, default: '' },
    remark: { type: String, default: '' },
    salesManComm: { type: Number, default: 0 },
    openBalance: { type: Number, default: 0 },
    openBalanceDRCR: { type: String, default: '' },
    isGSTApply: { type: String, default: '' },
    hsncode: { type: String, default: '' },
    hsndesc: { type: String, default: '' },
    sgst: { type: Number, default: 0 },
    cgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    maintainAc: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const partyModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    return db.models.AccountMasters || db.model("AccountMasters", partySchema);
}
 
// const partyModel = mongoose.model("AccountMasters", partySchema)
export default partyModel;