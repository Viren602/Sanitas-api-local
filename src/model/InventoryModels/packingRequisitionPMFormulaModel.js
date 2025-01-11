
import mongoose from "mongoose";

const PackingRequisitionPMFormulaSchema = mongoose.Schema({
    productDetialsId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductionEntry" },
    packingItemId: { type: mongoose.Schema.Types.ObjectId, ref: "CompanyItem" },
    qty: { type: Number, default: 0 },
    netQty: { type: Number, default: 0 },
    pmName: { type: String, default: '' },
    uom: { type: String, default: '' },
    pmUOM: { type: String, default: '' },
    stageName: { type: String, default: '' },
    totalStock: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const PackingRequisitionPMFormulaModel = mongoose.model("PackingRequisitionPMFormulaList", PackingRequisitionPMFormulaSchema)
export default PackingRequisitionPMFormulaModel;