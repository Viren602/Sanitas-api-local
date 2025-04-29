
import mongoose from "mongoose";
import connectToDatabase from "../utils/dbConnection.js";
import globals from "../utils/globals.js";

const rawMaterialModel = mongoose.Schema({
    rmCode: { type: String, default: '' },
    rmName: { type: String, default: '' },
    eqTo: { type: String, default: '' },
    specification: { type: String, default: '' },
    specificationNo: { type: Number, default: '' },
    rmUOM: { type: String, default: '' },
    rmCategory: { type: String, default: '' },
    storageCondition: { type: String, default: '' },
    rmPurchaseRate: { type: Number, default: 0.0 },
    rmPackQty: { type: Number, default: 0.0 },
    testingCharge: { type: Number, default: 0.0 },
    minQty: { type: Number, default: 0.0 },
    maxQty: { type: Number, default: 0.0 },
    sampleQty: { type: Number, default: 0.0 },
    reTestPeriod: { type: Number, default: 0.0 },
    batchWeight: { type: Number, default: 0.0 },
    assayCount: { type: Number, default: 0.0 },
    moistureCount: { type: Number, default: 0.0 },
    rmCategoryId: { type: Number, default: 0.0 },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const rawMaterialSchema = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    return db.models.RawMaterialMasters || db.model("RawMaterialMasters", rawMaterialModel);
}

// const rawMaterialSchema = mongoose.model("RawMaterialMasters", rawMaterialModel)
export default rawMaterialSchema;