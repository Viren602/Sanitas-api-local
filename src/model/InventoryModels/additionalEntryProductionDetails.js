
import mongoose from "mongoose";

const productionRequisitionEntryschema = mongoose.Schema({
    reqDate: { type: Date, default: '' },
    slipNo: { type: String, default: '' },
    type: { type: String, default: '' },
    batchNo: { type: String, default: '' },
    batchSize: { type: String, default: '' },
    productName: { type: String, default: '' },
    materialType: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const productionRequisitionEntryModel = mongoose.model("AdditionalProductionEntry", productionRequisitionEntryschema)
export default productionRequisitionEntryModel;