
import mongoose from "mongoose";
import connectToDatabase from "../utils/dbConnection.js";
import globals from "../utils/globals.js";

const daybookMasterSchema = mongoose.Schema({
    ID: { type: Number, default: 0 },
    daybookCode: { type: String, default: '' },
    daybookName: { type: String, default: '' },
    acGroupCode: { type: String, default: '' },
    accountGroupname: { type: String, default: '' },
    openBalance: { type: Number, default: 0 },
    openBalanceDRCR: { type: String, default: '' },
    bookType: { type: String, default: '' },
    shortName: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const daybookMasterModel = async () => {
    const db = await connectToDatabase(globals.Database);
    return db.models.DaybookMaster || db.model("DaybookMaster", daybookMasterSchema);
}

// const daybookMasterModel = mongoose.model("DaybookMaster", daybookMasterSchema)
export default daybookMasterModel;