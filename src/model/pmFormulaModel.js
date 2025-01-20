
import mongoose from "mongoose";

const pmFormulaSchema = mongoose.Schema({
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "CompanyItem" },
    ID: { type: Number, default: 0 },
    itemCode: { type: String, default: '' },
    batchSize: { type: Number, default: 0 },
    weight : { type: Number, default: 0 },
    stageId : { type: Number, default: 0 },
    pmCode : { type: String, default: '' },
    qty : { type: Number, default: 0 },
    uom : { type: String, default: '' },
    loss : { type: Number, default: 0 },
    netQty : { type: Number, default: 0 },
    entDate : { type: Date, default: 0 },
    pmName : { type: String, default: '' },
    stageName : { type: String, default: '' },
    stat : { type: Number, default: 0 },
    packageMaterialId: { type: mongoose.Schema.Types.ObjectId, ref: "PackingMaterialMaster" },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const pmFormulaModel = mongoose.model("PMFormulaMaster", pmFormulaSchema)
export default pmFormulaModel;