
import mongoose from "mongoose";

const grnEntryPartyDetailsSchema = mongoose.Schema({
    partyId: { type: mongoose.Schema.Types.ObjectId, ref: "AccountMasters" },
    grnNo: { type: String, default: '' },
    grnDate: { type: Date, default: new Date() },
    invoiceNo: { type: String, default: '' },
    invoiceDate: { type: Date, default: '' },
    grnEntryType: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const grnEntryPartyDetailsModel = mongoose.model("GRNEntryPartyDetail", grnEntryPartyDetailsSchema)
export default grnEntryPartyDetailsModel;