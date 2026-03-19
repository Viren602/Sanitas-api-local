
import mongoose from "mongoose";
import connectToDatabase from "../../utils/dbConnection.js";
import globals from "../../utils/globals.js";
import partyModel from "../partiesModel.js";
import transportCourierModel from "../transportCourierModel.js";
import stateModel from "../stateModel.js";

const gstInvoiceFinishGoodsSchema = mongoose.Schema({
    invoiceNo: { type: String, default: 0 },
    invoiceDate: { type: Date, default: null },
    creditDay: { type: Number, default: 0 },
    orderNo: { type: String, default: '' },
    partyId: { type: mongoose.Schema.Types.ObjectId, ref: "AccountMasters", default: null },
    transportName: { type: String, default: '' },
    transportId: { type: mongoose.Schema.Types.ObjectId, ref: "TransportCourierMasters", default: null },
    lRNo: { type: String, default: '' },
    lRDate: { type: Date, default: null },
    ewbNo: { type: String, default: '' },
    ewbDate: { type: Date, default: null },
    ewbValidTill: { type: Date, default: null },
    ewbStatus: {
        type: String,
        enum: ["Pending", "Generated", "Cancelled"],
        default: "Pending"
    },
    ewbCancelDate: { type: Date, default: null },
    cancelReason: { type: String, default: '' },
    cancelRemark: { type: String, default: '' },
    transportMode: { type: String, default: '' },
    distance: { type: Number, default: 0 },
    vehicleNo: { type: String, default: '' },
    vehicleType: { type: String, default: '' },
    irn: { type: String, default: "" },
    ackNo: { type: String, default: "" },
    ackDate: { type: Date, default: null },
    qrCode: { type: String, default: "" },
    signedInvoice: { type: String, default: "" },
    einvoiceStatus: {
        type: String,
        enum: ["Pending", "Generated", "Cancelled"],
        default: "Pending"
    },
    einvoiceCancelDate: { type: Date, default: null },
    cases: { type: String, default: '' },
    weight: { type: String, default: '' },
    addressLine1: { type: String, default: '' },
    addressLine2: { type: String, default: '' },
    addressLine3: { type: String, default: '' },
    addressLine4: { type: String, default: '' },
    city: { type: String, default: '' },
    pincode: { type: String, default: '' },
    stateId: { type: mongoose.Schema.Types.ObjectId, ref: "StateMasters", default: null },
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
    pendingAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    changeShippedAdd: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const gstInvoiceFinishGoodsModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    await partyModel(dbYear)
    await transportCourierModel(dbYear)
    await stateModel(dbYear)
    return db.models.GSTInvoiceFinishGoods || db.model("GSTInvoiceFinishGoods", gstInvoiceFinishGoodsSchema);
}

// const gstInvoiceFinishGoodsModel = mongoose.model("GSTInvoiceFinishGoods", gstInvoiceFinishGoodsSchema)
export default gstInvoiceFinishGoodsModel;