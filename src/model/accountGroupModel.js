
import mongoose from "mongoose";
import connectToDatabase from "../utils/dbConnection.js";

const accountGroupSchema = mongoose.Schema({
    ID: { type: Number, default: 0 },
    accountGroupCode: { type: String, default: '' },
    accountGroupname: { type: String, default: '' },
    accountGroupType: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const accountGroupModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    return db.models.AccountGroupMasters || db.model("AccountGroupMasters", accountGroupSchema);
}

// const accountGroupModel = mongoose.model("AccountGroupMasters", accountGroupSchema)
export default accountGroupModel;