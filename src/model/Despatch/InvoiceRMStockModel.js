import mongoose from "mongoose";
import globals from "../../utils/globals.js";
import connectToDatabase from "../../utils/dbConnection.js";
import rawMaterialSchema from "../rawMaterialModel.js";

const InvoiceRMStockSchema = mongoose.Schema({
    rmId: { type: mongoose.Schema.Types.ObjectId, ref: "RawMaterialMasters" },
    batchNo: { type: String, default: '' },
    qty: { type: Number, default: 0 },
    rmName: { type: String, default: '' },
    invoiceNo: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const InvoiceRMStockModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    await rawMaterialSchema(dbYear)
    return db.models.InvoiceRMStock || db.model("InvoiceRMStock", InvoiceRMStockSchema);
}

// const InvoiceRMStockModel = mongoose.model("InvoiceRMStock", InvoiceRMStockSchema)
export default InvoiceRMStockModel;