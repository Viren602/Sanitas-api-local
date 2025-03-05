
import mongoose from "mongoose";
import globals from "../../utils/globals.js";
import connectToDatabase from "../../utils/dbConnection.js";
import gstPurchaseEntryRMPMModel from "./gstPurchaseEntryRMPMModel.js";
import grnEntryPartyDetailsModel from "../InventoryModels/grnEntryPartyDetailsModel.js";
import grnEntryMaterialDetailsModel from "../InventoryModels/grnEntryMaterialDetailsModel.js";
import rawMaterialSchema from "../rawMaterialModel.js";
import packingMaterialSchema from "../packingMaterialModel.js";

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

const gstPurchaseItemListRMPMModel = async () => {
    const db = await connectToDatabase(globals.Database);
    await gstPurchaseEntryRMPMModel()
    await grnEntryPartyDetailsModel()
    await grnEntryMaterialDetailsModel()
    await rawMaterialSchema()
    await packingMaterialSchema()
    return db.models.GSTPurchaseItemListRMPM || db.model("GSTPurchaseItemListRMPM", gstPurchaseItemListRMPMSchema);
}

// const gstPurchaseItemListRMPMModel = mongoose.model("GSTPurchaseItemListRMPM", gstPurchaseItemListRMPMSchema)
export default gstPurchaseItemListRMPMModel;