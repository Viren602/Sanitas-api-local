
import mongoose from "mongoose";
import globals from "../../utils/globals.js";
import connectToDatabase from "../../utils/dbConnection.js";
import partyModel from "../partiesModel.js";

const generalCreditNoteSchema = mongoose.Schema({
    noteNo: { type: String, default: 0 },
    date: { type: Date, default: 0 },
    partyId: { type: mongoose.Schema.Types.ObjectId, ref: "AccountMasters", default: null },
    hsnSac: { type: String, default: '' },
    partyGstnNo: { type: String, default: '' },
    acName: { type: String, default: '' },
    acNarration1: { type: String, default: '' },
    acNarration2: { type: String, default: '' },
    acId: { type: mongoose.Schema.Types.ObjectId, ref: "AccountMasters", default: null },
    selfIssue: { type: String, default: '' },
    gstApply: { type: String, default: '' },
    rcm: { type: String, default: '' },
    hsnSacCode: { type: String, default: '' },
    sgst: { type: Number, default: 0 },
    cgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    ugst: { type: Number, default: 0 },
    hsnDescription: { type: String, default: '' },
    sgstAmount: { type: Number, default: 0 },
    cgstAmount: { type: Number, default: 0 },
    igstAmount: { type: Number, default: 0 },
    ugstAmount: { type: Number, default: 0 },
    description1: { type: String, default: '' },
    description2: { type: String, default: '' },
    description3: { type: String, default: '' },
    description4: { type: String, default: '' },
    description5: { type: String, default: '' },
    amount1: { type: Number, default: '' },
    amount2: { type: Number, default: '' },
    amount3: { type: Number, default: '' },
    amount4: { type: Number, default: '' },
    amount5: { type: Number, default: '' },
    subTotal: { type: Number, default: 0 },
    grandTotal: { type: Number, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const generalCreditNoteModel = async () => {
    const db = await connectToDatabase(globals.Database);
    await partyModel()
    return db.models.GeneralCreditNote || db.model("GeneralCreditNote", generalCreditNoteSchema);
}

// const generalCreditNoteModel = mongoose.model("GeneralCreditNote", generalCreditNoteSchema)
export default generalCreditNoteModel;