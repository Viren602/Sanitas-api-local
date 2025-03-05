import mongoose from "mongoose";
import connectToDatabase from "../../utils/dbConnection.js";
import globals from "../../utils/globals.js";
import packingMaterialSchema from "../packingMaterialModel.js";

const InvoicePMStockSchema = mongoose.Schema({
    pmId: { type: mongoose.Schema.Types.ObjectId, ref: "PackingMaterialMaster" },
    batchNo: { type: String, default: '' },
    qty: { type: Number, default: 0 },
    pmName: { type: String, default: '' },
    invoiceNo: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const InvoicePMStockModel = async () => {
    const db = await connectToDatabase(globals.Database);
    await packingMaterialSchema()
    return db.models.InvoicePMStock || db.model("InvoicePMStock", InvoicePMStockSchema);
}

// const InvoicePMStockModel = mongoose.model("InvoicePMStock", InvoicePMStockSchema)
export default InvoicePMStockModel;