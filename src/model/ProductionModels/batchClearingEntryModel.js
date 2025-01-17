import mongoose from "mongoose";

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
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const batchClearingEntryModel = mongoose.model(
    "BatchClearningEntry",
    batchClearingEntrySchema
);
export default batchClearingEntryModel;
