
import mongoose from "mongoose";

const batchWiseProductStockSchema = mongoose.Schema({
    productionNo: { type: String, default: '' },
    batchClearingEntryId : { type: mongoose.Schema.Types.ObjectId, ref: "BatchClearningEntry", default: null, },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "CompanyItem", default: null, },
    batchNo: { type: String, default: '' },
    expDate: { type: Date, default: '' },
    mfgDate: { type: Date, default: '' },
    quantity: { type: Number, default: 0 },
    mrp: { type: Number, default: 0 },
    hsnCode: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const batchWiseProductStockModel = mongoose.model("BatchWiseProductStock", batchWiseProductStockSchema)
export default batchWiseProductStockModel;