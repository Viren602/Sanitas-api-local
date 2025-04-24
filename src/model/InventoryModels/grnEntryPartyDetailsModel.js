
import mongoose from "mongoose";
import globals from "../../utils/globals.js";
import connectToDatabase from "../../utils/dbConnection.js";
import partyModel from "../partiesModel.js";

const grnEntryPartyDetailsSchema = mongoose.Schema({
    partyId: { type: mongoose.Schema.Types.ObjectId, ref: "AccountMasters" },
    grnNo: { type: String, default: '' },
    grnDate: { type: Date, default: new Date() },
    invoiceNo: { type: String, default: '' },
    invoiceDate: { type: Date, default: '' },
    grnEntryType: { type: String, default: '' },
    isGSTPurchaseEntryRMPM: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const grnEntryPartyDetailsModel = async () => {
    const db = await connectToDatabase(globals.Database);
    await partyModel()
    return db.models.GRNEntryPartyDetail || db.model("GRNEntryPartyDetail", grnEntryPartyDetailsSchema);
}

// const grnEntryPartyDetailsModel = mongoose.model("GRNEntryPartyDetail", grnEntryPartyDetailsSchema)
export default grnEntryPartyDetailsModel;