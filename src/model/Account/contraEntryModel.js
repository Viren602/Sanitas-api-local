
import mongoose from "mongoose";
import connectToDatabase from "../../utils/dbConnection.js";
import globals from "../../utils/globals.js";
import daybookMasterModel from "../daybookMasterModel.js";

const contraEntrySchema = mongoose.Schema({
    voucherNo: { type: String, default: '' },
    date: { type: Date, default: '' },
    fromDaybookId: { type: mongoose.Schema.Types.ObjectId, ref: "DaybookMaster", default: null },
    toDayBookId: { type: mongoose.Schema.Types.ObjectId, ref: "DaybookMaster", default: null },
    amount: { type: Number, default: '' },
    chqNo: { type: String, default: '' },
    narration1: { type: String, default: '' },
    narration2: { type: String, default: '' },
    fromBankBalance: { type: Number, default: 0 },
    toBankBalance: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const contraEntryModel = async () => {
    const db = await connectToDatabase(globals.Database);
    await daybookMasterModel()
    return db.models.ContraEntry || db.model("ContraEntry", contraEntrySchema);
}

// const contraEntryModel = mongoose.model("ContraEntry", contraEntrySchema)
export default contraEntryModel;