
import mongoose from "mongoose";

const packingMaterial = mongoose.Schema({
    id: { type: Number, default: 0 },
    pmCode: { type: String, default: '' },
    pmName: { type: String, default: '' },
    specification: { type: String, default: '' },
    pmUOM: { type: String, default: '' },
    pmCategory: { type: String, default: '' },
    storageCondition: { type: String, default: '' },
    pmSize: { type: String, default: '' },
    pmCategoryCode: { type: Number, default: 0 },
    pmPurchaseRate: { type: Number, default: 0.0 },
    pmPurchaseQty: { type: Number, default: 0.0 },
    pmTestingCharge: { type: Number, default: 0.0 },
    pmMinQty: { type: Number, default: 0.0 },
    pmMaxQty: { type: Number, default: 0.0 },
    pmSampleQty: { type: Number, default: 0.0 },
    weightUnit: { type: Number, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const packingMaterialSchema = mongoose.model("PackingMaterialMaster", packingMaterial)
export default packingMaterialSchema;