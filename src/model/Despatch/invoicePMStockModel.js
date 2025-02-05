import mongoose from "mongoose";

const InvoicePMStockSchema = mongoose.Schema({
    pmId: { type: mongoose.Schema.Types.ObjectId, ref: "PackingMaterialMaster" },
    batchNo: { type: String, default: '' },
    qty: { type: Number, default: 0 },
    pmName: { type: String, default: '' },
    invoiceNo: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const InvoicePMStockModel = mongoose.model("InvoicePMStock", InvoicePMStockSchema)
export default InvoicePMStockModel;