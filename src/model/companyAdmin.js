
import mongoose from "mongoose";
import globals from "../utils/globals.js";
import connectToDatabase from "../utils/dbConnection.js";

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

const companyAdminModel = async () => {
    const db = await connectToDatabase(globals.Database);
    console.log("dbName", globals.Database)
    return db.models.Admin || db.model("Admin", admins);
}
// const companyAdminModel = mongoose.model("Admin", admins)
export default companyAdminModel;