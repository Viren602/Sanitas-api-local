
import mongoose from "mongoose";

const gstPurchaseItemListRMPMSchema = mongoose.Schema({
    gstPurchaseEntryRMPMId: { type: mongoose.Schema.Types.ObjectId, ref: "GSTPurchaseEntryRMPM" },
    grnPartyDetailsId: { type: mongoose.Schema.Types.ObjectId, ref: "GRNEntryPartyDetail" },
    grnMaterialId: { type: mongoose.Schema.Types.ObjectId, ref: "GRNEntryMaterialDetail" },
    rawMaterialId: { type: mongoose.Schema.Types.ObjectId, ref: "RawMaterialMasters", default: null },
    packageMaterialId: { type: mongoose.Schema.Types.ObjectId, ref: "PackingMaterialMaster", default: null },
    grnNo: { type: String, default: '' },
    other: { type: Number, default: '' },
    itemName: { type: String, default: '' },
    itemId: { type: String, default: '' },
    batchNo: { type: String, default: '' },
    qty: { type: Number, default: 0 },
    rate: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    hsnCodeName: { type: String, default: '' },
    sgst: { type: Number, default: 0 },
    cgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    ugst: { type: Number, default: 0 },
    taxableAmount: { type: Number, default: 0 },
    sgstAmount: { type: Number, default: 0 },
    cgstAmount: { type: Number, default: 0 },
    ugstAmount: { type: Number, default: 0 },
    igstAmount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const gstPurchaseItemListRMPMModel = mongoose.model("GSTPurchaseItemListRMPM", gstPurchaseItemListRMPMSchema)
export default gstPurchaseItemListRMPMModel;