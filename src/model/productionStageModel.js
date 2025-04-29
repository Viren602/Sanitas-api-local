
import mongoose from "mongoose";
import connectToDatabase from "../utils/dbConnection.js";
import globals from "../utils/globals.js";

const productionStageSchema = mongoose.Schema({
    stageName: { type: String, default: '' },
    code: { type: String, default: '' },
    seqNo: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const productionStageModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    return db.models.ProductionStagMasters || db.model("ProductionStagMasters", productionStageSchema);
}

// const productionStageModel = mongoose.model("ProductionStagMasters", productionStageSchema)
export default productionStageModel;