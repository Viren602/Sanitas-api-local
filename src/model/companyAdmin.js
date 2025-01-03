
import mongoose from "mongoose";

const admins = mongoose.Schema({
    UserName: { type: String, default: '' },
    Password: { type: String, default: '' },
    Level: { type: String, default: '' },
    Location: { type: String, default: '' },
    Status: { type: String, default: '' },
    hashPassword: { type: String, default: '' },
    email: { type: String, default: '' },
    roleId: { type: Number, default: '' },
}, { timestamps: true })


const companyAdminModel = mongoose.model("Admin", admins)
export default companyAdminModel;