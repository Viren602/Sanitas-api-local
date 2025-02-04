import mongoose from "mongoose";

const InvoiceRMStockSchema = mongoose.Schema({
    rmId: { type: mongoose.Schema.Types.ObjectId, ref: "RawMaterialMasters" },
    batchNo: { type: String, default: '' },
    qty: { type: Number, default: 0 },
    rmName: { type: String, default: '' },
    invoiceNo: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const InvoiceRMStockModel = mongoose.model("InvoiceRMStock", InvoiceRMStockSchema)
export default InvoiceRMStockModel;