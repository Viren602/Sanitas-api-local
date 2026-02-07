
import mongoose from "mongoose";
import connectToDatabase from "../../utils/dbConnection.js";
import sampleEntryRMModel from "./sampleEntryRM.js";

const testReportRMSchema = mongoose.Schema({
    reportNo: { type: String, default: '' },
    reportDate: { type: Date, default: null },
    analyst: { type: String, default: '' },
    labIncharge: { type: String, default: '' },
    sampleEntryRMId: { type: mongoose.Schema.Types.ObjectId, ref: "SampleEntryRM", default: null },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const testReportRMModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    await sampleEntryRMModel(dbYear)
    return db.models.TestReportRM || db.model("TestReportRM", testReportRMSchema);
}

export default testReportRMModel;