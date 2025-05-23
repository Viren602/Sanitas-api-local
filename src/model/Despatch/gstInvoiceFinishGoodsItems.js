
import mongoose from "mongoose";
import globals from "../../utils/globals.js";
import connectToDatabase from "../../utils/dbConnection.js";
import gstInvoiceFinishGoodsModel from "./gstInvoiceFinishGoods.js";
import companyItems from "../companyItems.js";
import HNSCodesScHema from "../hnsCode.js";
import batchClearingEntryModel from "../ProductionModels/batchClearingEntryModel.js";
import batchWiseProductStockModel from "./batchWiseProductStockModel.js";

const gstInvoiceFinishGoodsItemsSchema = mongoose.Schema({
    gstInvoiceFinishGoodsId: { type: mongoose.Schema.Types.ObjectId, ref: "GSTInvoiceFinishGoods" },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "CompanyItem" },
    itemName: { type: String, default: '' },
    packing: { type: String, default: 0 },
    batchNo: { type: String, default: '' },
    mfgDate: { type: Date, default: '' },
    expDate: { type: Date, default: '' },
    mrp: { type: Number, default: 0 },
    qty: { type: Number, default: 0 },
    stockTotalqty: { type: Number, default: 0 },
    free: { type: Number, default: 0 },
    rate: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    discRate: { type: Number, default: 0 },
    discAmount: { type: Number, default: 0 },
    taxableAmount: { type: Number, default: 0 },
    hsnCodeId: { type: mongoose.Schema.Types.ObjectId, ref: "HSNCodes" },
    hsnCodeName: { type: String, default: '' },
    sgst: { type: Number, default: 0 },
    cgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    ugst: { type: Number, default: 0 },
    batchClearingEntryId: { type: mongoose.Schema.Types.ObjectId, ref: "BatchClearningEntry" },
    stockId: { type: mongoose.Schema.Types.ObjectId, ref: "BatchWiseProductStock" },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const gstInvoiceFinishGoodsItemsModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    await gstInvoiceFinishGoodsModel(dbYear)
    await companyItems(dbYear)
    await HNSCodesScHema(dbYear)
    await batchClearingEntryModel(dbYear)
    await batchWiseProductStockModel(dbYear)
    return db.models.ItemsForGSTInvoiceFinishGoods || db.model("ItemsForGSTInvoiceFinishGoods", gstInvoiceFinishGoodsItemsSchema);
}

// const gstInvoiceFinishGoodsItemsModel = mongoose.model("ItemsForGSTInvoiceFinishGoods", gstInvoiceFinishGoodsItemsSchema)
export default gstInvoiceFinishGoodsItemsModel;