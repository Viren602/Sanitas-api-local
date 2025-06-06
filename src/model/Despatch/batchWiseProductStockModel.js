
import mongoose from "mongoose";
import connectToDatabase from "../../utils/dbConnection.js";
import globals from "../../utils/globals.js";
import batchClearingEntryModel from "../ProductionModels/batchClearingEntryModel.js";
import companyItems from "../companyItems.js";

const batchWiseProductStockSchema = mongoose.Schema({
    productionNo: { type: String, default: '' },
    batchClearingEntryId: { type: mongoose.Schema.Types.ObjectId, ref: "BatchClearningEntry", default: null, },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "CompanyItem", default: null, },
    batchNo: { type: String, default: '' },
    expDate: { type: Date, default: '' },
    mfgDate: { type: Date, default: '' },
    quantity: { type: Number, default: 0 },
    mrp: { type: Number, default: 0 },
    hsnCode: { type: String, default: '' },
    isFromOpeningStock: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const batchWiseProductStockModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    await batchClearingEntryModel(dbYear)
    await companyItems(dbYear)
    return db.models.BatchWiseProductStock || db.model("BatchWiseProductStock", batchWiseProductStockSchema);
}

// const batchWiseProductStockModel = mongoose.model("BatchWiseProductStock", batchWiseProductStockSchema)
export default batchWiseProductStockModel;