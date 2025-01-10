
import mongoose from "mongoose";

const ProductionRequisitionRMFormulaSchema = mongoose.Schema({
    productDetialsId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductionEntry" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductMasters" },
    qty: { type: Number, default: 0 },
    netQty: { type: Number, default: 0 },
    rmName: { type: String, default: '' },
    uom: { type: String, default: '' },
    rmUOM: { type: String, default: '' },
    stageName: { type: String, default: '' },
    totalStock: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const ProductionRequisitionRMFormulaModel = mongoose.model("ProductionRequisitionRMFormulaList", ProductionRequisitionRMFormulaSchema)
export default ProductionRequisitionRMFormulaModel;