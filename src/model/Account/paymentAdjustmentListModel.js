
import mongoose from "mongoose";
import connectToDatabase from "../../utils/dbConnection.js";
import globals from "../../utils/globals.js";
import paymentReceiptEntryModel from "./paymentReceiptEntryModel.js";
import gstInvoiceFinishGoodsModel from "../Despatch/gstInvoiceFinishGoods.js";
import gstInvoiceRMModel from "../Despatch/gstInvoiceRMModel.js";
import gstInvoicePMModel from "../Despatch/gstInvoicePMModel.js";
import gstPurchaseEntryRMPMModel from "./gstPurchaseEntryRMPMModel.js";
import gstPurchaseWithoutInventoryEntryModel from "./gstPurcaseWithoutInventoryEntryModel.js";

const paymentAdjustmentListSchema = mongoose.Schema({
    paymentReceiptId: { type: mongoose.Schema.Types.ObjectId, ref: "PaymentReceiptEntry", default: null },
    adjType: { type: String, default: '' },
    invoiceNo: { type: String, default: '' },
    invoiceAmount: { type: Number, default: '' },
    adjAmount: { type: Number, default: '' },
    gstInvoiceFinishGoodsId: { type: mongoose.Schema.Types.ObjectId, ref: "GSTInvoiceFinishGoods", default: null },
    gstPMInvoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "GSTInvoiceRM", default: null },
    gstRMInvoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "GSTInvoicePM", default: null },
    gstPurchaseEntryRMPMId: { type: mongoose.Schema.Types.ObjectId, ref: "GSTPurchaseEntryRMPM", default: null },
    gstPurchaseEntryWithoutInventoryId: { type: mongoose.Schema.Types.ObjectId, ref: "GstPurchaseWithoutInventoryEntry", default: null },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const paymentAdjustmentListModel = async () => {
    const db = await connectToDatabase(globals.Database);
    await paymentReceiptEntryModel()
    await gstInvoiceFinishGoodsModel()
    await gstInvoiceRMModel()
    await gstInvoicePMModel()
    await gstPurchaseEntryRMPMModel()
    await gstPurchaseWithoutInventoryEntryModel()
    return db.models.PaymentAdjustmentList || db.model("PaymentAdjustmentList", paymentAdjustmentListSchema);
}

// const paymentAdjustmentListModel = mongoose.model("PaymentAdjustmentList", paymentAdjustmentListSchema)
export default paymentAdjustmentListModel;