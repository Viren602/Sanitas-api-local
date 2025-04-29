import mongoose from "mongoose";
import globals from "../../utils/globals.js";
import connectToDatabase from "../../utils/dbConnection.js";
import productionPlanningEntryModel from "./productionPlanningEntryModel.js";
import companyItems from "../companyItems.js";

const batchClearingEntrySchema = mongoose.Schema(
    {
        productDetialsId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductionEntry", default: null, },
        packingItemId: { type: mongoose.Schema.Types.ObjectId, ref: "CompanyItem", default: null, },
        packing: { type: String, default: "" },
        quantity: { type: Number, default: 0 },
        retainSample: { type: Number, default: 0 },
        testQty: { type: Number, default: 0 },
        mrp: { type: Number, default: 0 },
        pending: { type: Number, default: 0 },
        netQuantity: { type: Number, default: 0 },
        clearBatch: { type: Boolean, default: false },
        isFromOpeningStock: { type: Boolean, default: false },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const batchClearingEntryModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    await productionPlanningEntryModel(dbYear)
    await companyItems(dbYear)
    return db.models.BatchClearningEntry || db.model("BatchClearningEntry", batchClearingEntrySchema);
}

// const batchClearingEntryModel = mongoose.model(
//     "BatchClearningEntry",
//     batchClearingEntrySchema
// );
export default batchClearingEntryModel;
