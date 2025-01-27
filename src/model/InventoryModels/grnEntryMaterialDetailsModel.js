
import mongoose from "mongoose";

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
    purchaseOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseOrderDetail", default: null },
    purchaseOrdermaterialId: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseOrderMaterialDetail" },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const grnEntryMaterialDetailsModel = mongoose.model("GRNEntryMaterialDetail", grnEntryMaterialDetailsSchema)
export default grnEntryMaterialDetailsModel;