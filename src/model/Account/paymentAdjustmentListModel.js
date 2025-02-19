
import mongoose from "mongoose";

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


const paymentAdjustmentListModel = mongoose.model("PaymentAdjustmentList", paymentAdjustmentListSchema)
export default paymentAdjustmentListModel;