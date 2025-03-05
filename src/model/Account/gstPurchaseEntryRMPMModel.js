
import mongoose from "mongoose";
import globals from "../../utils/globals.js";
import connectToDatabase from "../../utils/dbConnection.js";
import partyModel from "../partiesModel.js";

const gstPurchaseEntryRMPMSchema = mongoose.Schema({
    srNo: { type: String, default: 0 },
    invoiceNo: { type: String, default: 0 },
    invoiceDate: { type: Date, default: '' },
    reptDate: { type: Date, default: '' },
    partyId: { type: mongoose.Schema.Types.ObjectId, ref: "AccountMasters", default: null },
    freight: { type: Number, default: '' },
    other: { type: Number, default: '' },
    roundOff: { type: Number, default: '' },
    subTotal: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    cgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    ugst: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    remarks: { type: String, default: '' },
    pendingAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const gstPurchaseEntryRMPMModel = async () => {
    const db = await connectToDatabase(globals.Database);
    await partyModel()
    return db.models.GSTPurchaseEntryRMPM || db.model("GSTPurchaseEntryRMPM", gstPurchaseEntryRMPMSchema);
}

// const gstPurchaseEntryRMPMModel = mongoose.model("GSTPurchaseEntryRMPM", gstPurchaseEntryRMPMSchema)
export default gstPurchaseEntryRMPMModel;