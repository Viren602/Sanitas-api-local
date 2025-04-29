
import mongoose from "mongoose";
import connectToDatabase from "../../utils/dbConnection.js";
import globals from "../../utils/globals.js";
import gstInvoiceRMModel from "./gstInvoiceRMModel.js";
import rawMaterialSchema from "../rawMaterialModel.js";
import HNSCodesScHema from "../hnsCode.js";

const gstInvoiceRMItemsSchema = mongoose.Schema({
    gstInvoiceRMID: { type: mongoose.Schema.Types.ObjectId, ref: "GSTInvoiceRM" },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "RawMaterialMasters" },
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

const gstinvoiceRMItemModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    await gstInvoiceRMModel(dbYear)
    await rawMaterialSchema(dbYear)
    await HNSCodesScHema(dbYear)
    return db.models.ItemsForGSTInvoiceRM || db.model("ItemsForGSTInvoiceRM", gstInvoiceRMItemsSchema);
}

// const gstinvoiceRMItemModel = mongoose.model("ItemsForGSTInvoiceRM", gstInvoiceRMItemsSchema)
export default gstinvoiceRMItemModel;