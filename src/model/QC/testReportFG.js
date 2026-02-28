
import mongoose from "mongoose";
import connectToDatabase from "../../utils/dbConnection.js";
import sampleEntryFGModel from "./sampleEntryFG.js";
import productDetailsModel from "../productDetailsModel.js";
import productionPlanningEntryModel from "../ProductionModels/productionPlanningEntryModel.js";

const testReportFGSchema = mongoose.Schema({
    reportNo: { type: String, default: '' },
    reportDate: { type: Date, default: null },
    analyst: { type: String, default: '' },
    analysisDate: { type: Date, default: null },
    labIncharge: { type: String, default: '' },
    sampleEntryFGId: { type: mongoose.Schema.Types.ObjectId, ref: "SampleEntryFG", default: null },
    productionId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductionEntry", default: null },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const testReportFGModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    await sampleEntryFGModel(dbYear)
    await productionPlanningEntryModel(dbYear)
    return db.models.TestReportFG || db.model("TestReportFG", testReportFGSchema);
}

export default testReportFGModel;