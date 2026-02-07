import mongoose from "mongoose";
import connectToDatabase from "../../utils/dbConnection.js";
import monoGramModel from "../monogramModel.js";
import testReportPMModel from "./testReportPM.js";

const testReportFGDataMappingSchema = mongoose.Schema({
    testName: { type: String, default: '' },
    result: { type: String, default: null },
    limit: { type: String, default: '' },
    monogramId: { type: mongoose.Schema.Types.ObjectId, ref: "MonoGrams", default: null },
    testReportFGId: { type: mongoose.Schema.Types.ObjectId, ref: "TestReportFG", default: null },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const testReportFGDataMappingModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    await testReportPMModel(dbYear)
    await monoGramModel(dbYear)
    return db.models.TestReportFGDataMapping || db.model("TestReportFGDataMapping", testReportFGDataMappingSchema);
}

export default testReportFGDataMappingModel;