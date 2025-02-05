
import mongoose from "mongoose";

const gstInvoicePMItemSchema = mongoose.Schema({
    gstInvoicePMID: { type: mongoose.Schema.Types.ObjectId, ref: "GSTInvoicePM" },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "PackingMaterialMaster" },
    itemName: { type: String, default: '' },
    batchNo: { type: String, default: '' },
    make: { type: String, default: '' },
    mfgDate: { type: Date, default: '' },
    expDate: { type: Date, default: '' },
    qty: { type: Number, default: 0 },
    stockTotalqty: { type: Number, default: 0 },
    rate: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    taxableAmount: { type: Number, default: 0 },
    hsnCodeId: { type: mongoose.Schema.Types.ObjectId, ref: "HSNCodes" },
    hsnCodeName: { type: String, default: '' },
    sgst: { type: Number, default: 0 },
    cgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    ugst: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const gstInvoicePMItemModel = mongoose.model("ItemsForGSTInvoicePM", gstInvoicePMItemSchema)
export default gstInvoicePMItemModel;