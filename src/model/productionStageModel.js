
import mongoose from "mongoose";

const productionStageSchema = mongoose.Schema({
    stageName: { type: String, default: '' },
    code: { type: String, default: '' },
    seqNo: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const productionStageModel = mongoose.model("ProductionStagMasters", productionStageSchema)
export default productionStageModel;