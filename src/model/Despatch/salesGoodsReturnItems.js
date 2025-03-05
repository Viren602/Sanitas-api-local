
import mongoose from "mongoose";
import connectToDatabase from "../../utils/dbConnection.js";
import globals from "../../utils/globals.js";
import salesGoodsReturnEntryModel from "./salesGoodsReturnEntryModel.js";
import companyItems from "../companyItems.js";
import HNSCodesScHema from "../hnsCode.js";
import batchClearingEntryModel from "../ProductionModels/batchClearingEntryModel.js";
import batchWiseProductStockModel from "./batchWiseProductStockModel.js";

const salesGoodsReturnItemsSchema = mongoose.Schema({
    salesGoodsReturnId: { type: mongoose.Schema.Types.ObjectId, ref: "SalesGoodsReturnEntry" },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "CompanyItem" },
    itemName: { type: String, default: '' },
    packing: { type: String, default: 0 },
    batchNo: { type: String, default: '' },
    mfgDate: { type: Date, default: '' },
    expDate: { type: Date, default: '' },
    stockUpgrade: { type: String, default: '' },
    invoiceNo: { type: String, default: '' },
    invoiceDate: { type: Date, default: '' },
    returnType: { type: String, default: '' },
    mrp: { type: Number, default: 0 },
    qty: { type: Number, default: 0 },
    free: { type: Number, default: 0 },
    rate: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
    taxableAmount: { type: Number, default: 0 },
    hsnCodeId: { type: mongoose.Schema.Types.ObjectId, ref: "HSNCodes" },
    hsnCodeName: { type: String, default: '' },
    sgstRate: { type: Number, default: 0 },
    cgstRate: { type: Number, default: 0 },
    igstRate: { type: Number, default: 0 },
    ugstRate: { type: Number, default: 0 },
    batchClearingEntryId: { type: mongoose.Schema.Types.ObjectId, ref: "BatchClearningEntry" },
    stockId: { type: mongoose.Schema.Types.ObjectId, ref: "BatchWiseProductStock" },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const salesGoodsReturnItemsModel = async () => {
    const db = await connectToDatabase(globals.Database);
    await salesGoodsReturnEntryModel()
    await companyItems()
    await HNSCodesScHema()
    await batchClearingEntryModel()
    await batchWiseProductStockModel()
    return db.models.ItemsForSalesGoodsReturnItems || db.model("ItemsForSalesGoodsReturnItems", salesGoodsReturnItemsSchema);
}

// const salesGoodsReturnItemsModel = mongoose.model("ItemsForSalesGoodsReturnItems", salesGoodsReturnItemsSchema)
export default salesGoodsReturnItemsModel;