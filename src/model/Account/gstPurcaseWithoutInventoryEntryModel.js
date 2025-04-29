
import mongoose from "mongoose";
import globals from "../../utils/globals.js";
import connectToDatabase from "../../utils/dbConnection.js";
import partyModel from "../partiesModel.js";

const gstPurchaseWithoutInventoryEntrySchema = mongoose.Schema({
    srNo: { type: String, default: 0 },
    invoiceNo: { type: String, default: 0 },
    invoiceDate: { type: Date, default: '' },
    invoiceType: { type: String, default: '' },
    partyId: { type: mongoose.Schema.Types.ObjectId, ref: "AccountMasters", default: null },
    purchasedItemName: { type: String, default: '' },
    amount: { type: Number, default: '' },
    hsnCodeName: { type: String, default: '' },
    sgst: { type: Number, default: 0 },
    cgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    ugst: { type: Number, default: 0 },
    taxableAmount: { type: Number, default: 0 },
    sgstAmount: { type: Number, default: 0 },
    cgstAmount: { type: Number, default: 0 },
    igstAmount: { type: Number, default: 0 },
    ugstAmount: { type: Number, default: 0 },
    freight: { type: Number, default: '' },
    others: { type: Number, default: '' },
    roundOff: { type: Number, default: '' },
    grandTotal: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const gstPurchaseWithoutInventoryEntryModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    await partyModel(dbYear)
    return db.models.GstPurchaseWithoutInventoryEntry || db.model("GstPurchaseWithoutInventoryEntry", gstPurchaseWithoutInventoryEntrySchema);
}

// const gstPurchaseWithoutInventoryEntryModel = mongoose.model("GstPurchaseWithoutInventoryEntry", gstPurchaseWithoutInventoryEntrySchema)
export default gstPurchaseWithoutInventoryEntryModel;