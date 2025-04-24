
import mongoose from "mongoose";
import globals from "../utils/globals.js";
import connectToDatabase from "../utils/dbConnection.js";
import config from "../config/config.js";
import adminRoleModel from "./adminRoleModel.js";
// import adminRoleModel from "./adminroleModel.js";

const MasterDB = config.MASTER_DB;

const admins = mongoose.Schema({
    UserName: { type: String, default: '' },
    Password: { type: String, default: '' },
    Level: { type: String, default: '' },
    Location: { type: String, default: '' },
    Status: { type: String, default: '' },
    hashPassword: { type: String, default: '' },
    email: { type: String, default: '' },
    roleId: { type: Number, default: '' },
    // roles: { type: Array, default: [] },
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'adminroles' }],
    isTradingAccount: { type: Boolean, default: false },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const companyAdminModel = async () => {
    const db = await connectToDatabase(MasterDB);
    await adminRoleModel()
    return db.models.Admin || db.model("Admin", admins);
}
// const companyAdminModel = mongoose.model("Admin", admins)
export default companyAdminModel;