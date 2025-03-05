
import mongoose from "mongoose";
import globals from "../utils/globals.js";
import connectToDatabase from "../utils/dbConnection.js";

const accountGroupSchema = mongoose.Schema({
    ID: { type: Number, default: 0 },
    accountGroupCode: { type: String, default: '' },
    accountGroupname: { type: String, default: '' },
    accountGroupType: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const accountGroupModel = async () => {
    const db = await connectToDatabase(globals.Database);
    return db.models.AccountGroupMasters || db.model("AccountGroupMasters", accountGroupSchema);
}

// const accountGroupModel = mongoose.model("AccountGroupMasters", accountGroupSchema)
export default accountGroupModel;