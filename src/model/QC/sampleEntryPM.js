
import mongoose from "mongoose";
import connectToDatabase from "../../utils/dbConnection.js";
import grnEntryPartyDetailsModel from "../InventoryModels/grnEntryPartyDetailsModel.js";
import partyModel from "../partiesModel.js";
import packingMaterialSchema from "../packingMaterialModel.js";

const sampleEntryPMSchema = mongoose.Schema({
    refNo: { type: String, default: '' },
    refDate: { type: Date, default: null },
    grnNo: { type: String, default: '' },
    receivedDate: { type: Date, default: null },
    grnId: { type: mongoose.Schema.Types.ObjectId, ref: "GRNEntryPartyDetail", default: null },
    pmId: { type: mongoose.Schema.Types.ObjectId, ref: "PackingMaterialMaster", default: null },
    batchNo: { type: String, default: '' },
    invoiceNo: { type: String, default: '' },
    invoiceDate: { type: Date, default: null },
    sampleQty: { type: Number, default: 0 },
    purchaseQty: { type: Number, default: 0 },
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

const sampleEntryPMModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    await grnEntryPartyDetailsModel(dbYear)
    await packingMaterialSchema(dbYear)
    await partyModel(dbYear)
    return db.models.SampleEntryPM || db.model("SampleEntryPM", sampleEntryPMSchema);
}

export default sampleEntryPMModel;