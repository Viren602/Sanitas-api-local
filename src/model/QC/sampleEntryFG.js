
import mongoose from "mongoose";
import connectToDatabase from "../../utils/dbConnection.js";
import partyModel from "../partiesModel.js";
import productionPlanningEntryModel from "../ProductionModels/productionPlanningEntryModel.js";
import productDetailsModel from "../productDetailsModel.js";

const sampleEntryFGSchema = mongoose.Schema({
    refNo: { type: String, default: '' },
    refDate: { type: Date, default: null },
    prodNo: { type: String, default: '' },
    receivedDate: { type: Date, default: null },
    productionId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductionEntry", default: null },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductMasters", default: null },
    batchNo: { type: String, default: '' },
    invoiceNo: { type: String, default: '' },
    invoiceDate: { type: Date, default: null },
    sampleQty: { type: Number, default: 0 },
    batchSize: { type: Number, default: 0 },
    mfgDate: { type: Date, default: null },
    expDate: { type: Date, default: null },
    conditionOfContainer: { type: String, default: '' },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "AccountMasters", default: null },
    noOfContainer: { type: String, default: '' },
    mfgBy: { type: String, default: '' },
    isOutSideAnalysis: { type: Boolean, default: false },
    labName: { type: String, default: '' },
    remark: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const sampleEntryFGModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    await productDetailsModel(dbYear)
    await partyModel(dbYear)
    await productionPlanningEntryModel(dbYear)
    return db.models.SampleEntryFG || db.model("SampleEntryFG", sampleEntryFGSchema);
}

export default sampleEntryFGModel;