
import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    companyName: { type: String, default: '' },
    isAdmin:  { type: Boolean, default: true },
    companyGroup : { type: String, default: '' },
    financialYear : { type: String, default: ''},
    addressLine1 : { type: String, default: ''},
    addressLine2 : { type: String, default: ''},
    city : { type: String, default: ''},
    pinCode : { type: String, default: ''},
    state : { type: String, default: ''},
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const UsersSCHM = mongoose.model("User", userSchema)
export default UsersSCHM;