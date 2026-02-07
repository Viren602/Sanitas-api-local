import mongoose from "mongoose";
import connectToDatabase from "../../utils/dbConnection.js";
import monoGramModel from "../monogramModel.js";
import testReportPMModel from "./testReportPM.js";

const testReportPMDataMappingSchema = mongoose.Schema({
    testName: { type: String, default: '' },
    result: { type: String, default: null },
    limit: { type: String, default: '' },
    monogramId: { type: mongoose.Schema.Types.ObjectId, ref: "MonoGrams", default: null },
    testReportPMId: { type: mongoose.Schema.Types.ObjectId, ref: "SampleEntryPM", default: null },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const testReportPMDataMappingModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    await testReportPMModel(dbYear)
    await monoGramModel(dbYear)
    return db.models.TestReportPMDataMapping || db.model("TestReportPMDataMapping", testReportPMDataMappingSchema);
}

export default testReportPMDataMappingModel;