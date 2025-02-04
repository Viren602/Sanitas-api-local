
import mongoose from "mongoose";

const gstInvoiceRMSchema = mongoose.Schema({
    invoiceNo: { type: String, default: 0 },
    invoiceDate: { type: Date, default: '' },
    creditDay: { type: Number, default: 0 },
    orderNo: { type: String, default: '' },
    partyId: { type: mongoose.Schema.Types.ObjectId, ref: "AccountMasters", default: null },
    transportName: { type: String, default: '' },
    transportId: { type: mongoose.Schema.Types.ObjectId, ref: "TransportCourierMasters", default: null },
    lRNo: { type: String, default: '' },
    lRDate: { type: Date, default: '' },
    roadPermitNo: { type: String, default: '' },
    cases: { type: String, default: '' },
    weight: { type: String, default: '' },
    freight: { type: Number, default: '' },
    other: { type: Number, default: '' },
    roundOff: { type: Number, default: '' },
    invoiceNarration: { type: String, default: '' },
    subTotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    cgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    ugst: { type: Number, default: 0 },
    crDrNote: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const gstInvoiceRMModel = mongoose.model("GSTInvoiceRM", gstInvoiceRMSchema)
export default gstInvoiceRMModel;