
import mongoose from "mongoose";
import connectToDatabase from "../../utils/dbConnection.js";
import globals from "../../utils/globals.js";
import rawMaterialSchema from "../rawMaterialModel.js";
import packingMaterialSchema from "../packingMaterialModel.js";
import grnEntryPartyDetailsModel from "./grnEntryPartyDetailsModel.js";
import purchaseOrderDetailsModel from "./purchaseOrderDetailsModel.js";
import purchaserOrderMaterialDetailsModel from "./purchaseOrderMaterialDetailsModel.js";

const grnEntryMaterialDetailsSchema = mongoose.Schema({
    rawMaterialId: { type: mongoose.Schema.Types.ObjectId, ref: "RawMaterialMasters", default: null },
    packageMaterialId: { type: mongoose.Schema.Types.ObjectId, ref: "PackingMaterialMaster", default: null },
    grnEntryPartyDetailId: { type: mongoose.Schema.Types.ObjectId, ref: "GRNEntryPartyDetail" },
    batchNo: { type: String, default: '' },
    qty: { type: Number, default: '' },
    rate: { type: Number, default: '' },
    amount: { type: Number, default: '' },
    mfgBy: { type: String, default: '' },
    mfgDate: { type: Date, default: '' },
    expDate: { type: Date, default: '' },
    packing: { type: String, default: '' },
    isPurchaseOrderEntry: { type: Boolean, default: false },
    isGSTPurchaseEntryRMPM: { type: Boolean, default: false },
    purchaseOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseOrderDetail", default: null },
    purchaseOrdermaterialId: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseOrderMaterialDetail" },
    isOpeningStock: { type: Boolean, default: false },
    openingStockDate: { type: Date, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const grnEntryMaterialDetailsModel = async () => {
    const db = await connectToDatabase(globals.Database);
    await rawMaterialSchema()
    await packingMaterialSchema()
    await grnEntryPartyDetailsModel()
    await purchaseOrderDetailsModel()
    await purchaserOrderMaterialDetailsModel()
    return db.models.GRNEntryMaterialDetail || db.model("GRNEntryMaterialDetail", grnEntryMaterialDetailsSchema);
}

// const grnEntryMaterialDetailsModel = mongoose.model("GRNEntryMaterialDetail", grnEntryMaterialDetailsSchema)
export default grnEntryMaterialDetailsModel;