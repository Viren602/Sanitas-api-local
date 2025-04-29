
import mongoose from "mongoose";
import connectToDatabase from "../../utils/dbConnection.js";
import globals from "../../utils/globals.js";
import daybookMasterModel from "../daybookMasterModel.js";
import partyModel from "../partiesModel.js";
import gstInvoiceFinishGoodsModel from "../Despatch/gstInvoiceFinishGoods.js";
import gstInvoiceRMModel from "../Despatch/gstInvoiceRMModel.js";
import gstInvoicePMModel from "../Despatch/gstInvoicePMModel.js";
import gstPurchaseEntryRMPMModel from "./gstPurchaseEntryRMPMModel.js";
import gstPurchaseWithoutInventoryEntryModel from "./gstPurcaseWithoutInventoryEntryModel.js";
import contraEntryModel from "./contraEntryModel.js";
import jvEntryModel from "./jvEntryModel.js";

const paymentReceiptEntrySchema = mongoose.Schema({
    voucherNo: { type: String, default: '' },
    bankName: { type: String, default: '' },
    bankId: { type: mongoose.Schema.Types.ObjectId, ref: "DaybookMaster", default: null },
    date: { type: Date, default: '' },
    partyId: { type: mongoose.Schema.Types.ObjectId, ref: "AccountMasters", default: null },
    partyBankNameOrPayto: { type: String, default: '' },
    chqNo: { type: String, default: '' },
    debitAmount: { type: Number, default: 0 },
    creditAmount: { type: Number, default: 0 },
    narration1: { type: String, default: '' },
    narration2: { type: String, default: '' },
    narration3: { type: String, default: '' },
    entryType: { type: String, default: '' },
    from: { type: String, default: '' },
    gstInvoiceFinishGoodsId: { type: mongoose.Schema.Types.ObjectId, ref: "GSTInvoiceFinishGoods", default: null },
    gstInvoiceRMId: { type: mongoose.Schema.Types.ObjectId, ref: "GSTInvoiceRM", default: null },
    gstInvoicePMId: { type: mongoose.Schema.Types.ObjectId, ref: "GSTInvoicePM", default: null },
    gstpurchaseInvoiceRMPMId: { type: mongoose.Schema.Types.ObjectId, ref: "GSTPurchaseEntryRMPM", default: null },
    gstPurchaseEntryWithoutInventoryId: { type: mongoose.Schema.Types.ObjectId, ref: "GstPurchaseWithoutInventoryEntry", default: null },
    contraId: { type: mongoose.Schema.Types.ObjectId, ref: "ContraEntry", default: null },
    jvEntryId: { type: mongoose.Schema.Types.ObjectId, ref: "JVEntry", default: null },
    drcrDropDown: { type: String, default: false },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const paymentReceiptEntryModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    await daybookMasterModel(dbYear)
    await partyModel(dbYear)
    await gstInvoiceFinishGoodsModel(dbYear)
    await gstInvoiceRMModel(dbYear)
    await gstInvoicePMModel(dbYear)
    await gstPurchaseEntryRMPMModel(dbYear)
    await gstPurchaseWithoutInventoryEntryModel(dbYear)
    await contraEntryModel(dbYear)
    await jvEntryModel(dbYear)
    return db.models.PaymentReceiptEntry || db.model("PaymentReceiptEntry", paymentReceiptEntrySchema);
}

// const paymentReceiptEntryModel = mongoose.model("PaymentReceiptEntry", paymentReceiptEntrySchema)
export default paymentReceiptEntryModel;