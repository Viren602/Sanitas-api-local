
import mongoose from "mongoose";
import connectToDatabase from "../utils/dbConnection.js";
import globals from "../utils/globals.js";

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

const UsersSCHM = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    return db.models.User || db.model("User", userSchema);
}

// const UsersSCHM = mongoose.model("User", userSchema)
export default UsersSCHM;