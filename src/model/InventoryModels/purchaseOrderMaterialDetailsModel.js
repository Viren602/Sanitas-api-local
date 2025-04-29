
import mongoose from "mongoose";
import connectToDatabase from "../../utils/dbConnection.js";
import globals from "../../utils/globals.js";
import purchaseOrderDetailsModel from "./purchaseOrderDetailsModel.js";
import rawMaterialSchema from "../rawMaterialModel.js";
import packingMaterialSchema from "../packingMaterialModel.js";

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
    isGRNEntryDone: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const purchaserOrderMaterialDetailsModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    await purchaseOrderDetailsModel(dbYear)
    await rawMaterialSchema(dbYear)
    await packingMaterialSchema(dbYear)
    return db.models.PurchaseOrderMaterialDetail || db.model("PurchaseOrderMaterialDetail", purchaserOrderMaterialDetailsSchema);
}

// const purchaserOrderMaterialDetailsModel = mongoose.model("PurchaseOrderMaterialDetail", purchaserOrderMaterialDetailsSchema)
export default purchaserOrderMaterialDetailsModel;