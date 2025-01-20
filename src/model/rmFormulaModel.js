
import mongoose from "mongoose";

const rmFormulaSchema = mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductMasters" },
    ID: { type: Number, default: 0 },
    productCode: { type: String, default: '' },
    batchSize: { type: Number, default: 0 },
    weight: { type: Number, default: 0 },
    stageId: { type: Number, default: 0 },
    itemCode: { type: String, default: '' },
    qty: { type: Number, default: 0 },
    netQty: { type: Number, default: 0 },
    lcQty: { type: Number, default: 0 },
    lcUOM: { type: String, default: '' },
    lcPer: { type: String, default: '' },
    uom: { type: String, default: '' },
    loss: { type: Number, default: 0 },
    entDate: { type: Date, default: 0 },
    rmName: { type: String, default: '' },
    stageName: { type: String, default: '' },
    stCode: { type: String, default: '' },
    stkCode: { type: String, default: '' },
    stkName: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
    rmId: { type: mongoose.Schema.Types.ObjectId, ref: "RawMaterialMasters" }
}, { timestamps: true })


const rmFormulaModel = mongoose.model("RMFormulaMaster", rmFormulaSchema)
export default rmFormulaModel;