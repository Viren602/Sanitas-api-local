
import mongoose from "mongoose";
import connectToDatabase from "../../utils/dbConnection.js";
import testReportRMModel from "./testReportRM.js";
import monoGramModel from "../monogramModel.js";

const testReportRMDataMappingSchema = mongoose.Schema({
    testName: { type: String, default: '' },
    result: { type: String, default: null },
    limit: { type: String, default: '' },
    monogramId: { type: mongoose.Schema.Types.ObjectId, ref: "MonoGrams", default: null },
    testReportRMId: { type: mongoose.Schema.Types.ObjectId, ref: "SampleEntryPM", default: null },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const testReportRMDataMappingModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    await testReportRMModel(dbYear)
    await monoGramModel(dbYear)
    return db.models.TestReportRMDataMapping || db.model("TestReportRMDataMapping", testReportRMDataMappingSchema);
}

export default testReportRMDataMappingModel;