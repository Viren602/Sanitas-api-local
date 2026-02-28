import mongoose from "mongoose";
import connectToDatabase from "../../utils/dbConnection.js";
import sampleEntryPMModel from "./sampleEntryPM.js";

const testReportPMSchema = mongoose.Schema({
    reportNo: { type: String, default: '' },
    reportDate: { type: Date, default: null },
    analyst: { type: String, default: '' },
    analysisDate: { type: Date, default: null },
    labIncharge: { type: String, default: '' },
    sampleEntryPMId: { type: mongoose.Schema.Types.ObjectId, ref: "SampleEntryPM", default: null },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const testReportPMModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    await sampleEntryPMModel(dbYear)
    return db.models.TestReportPM || db.model("TestReportPM", testReportPMSchema);
}

export default testReportPMModel;