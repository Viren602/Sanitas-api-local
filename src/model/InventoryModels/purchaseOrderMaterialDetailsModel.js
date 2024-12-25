
import mongoose from "mongoose";

const purchaserOrderMaterialDetailsSchema = mongoose.Schema({
    purchaseOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseOrderDetail" },
    rawMaterialId: { type: mongoose.Schema.Types.ObjectId, ref: "RawMaterialMasters", default: null },
    packageMaterialId: { type: mongoose.Schema.Types.ObjectId, ref: "PackingMaterialMaster", default: null },
    uom: { type: String, default: '' },
    qty: { type: Number, default: '' },
    rate: { type: Number, default: '' },
    per: { type: Number, default: '' },
    amount: { type: Number, default: '' },
    make: { type: String, default: '' },
    remarks: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const purchaserOrderMaterialDetailsModel = mongoose.model("PurchaseOrderMaterialDetail", purchaserOrderMaterialDetailsSchema)
export default purchaserOrderMaterialDetailsModel;