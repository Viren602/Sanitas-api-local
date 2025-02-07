
import mongoose from "mongoose";

const salesGoodsReturnEntrySchema = mongoose.Schema({
    serialNo: { type: String, default: 0 },
    returnDate: { type: Date, default: '' },
    deliveryChallanNo: { type: String, default: '' },
    dcDate: { type: Date, default: '' },
    transportId: { type: mongoose.Schema.Types.ObjectId, ref: "TransportCourierMasters", default: null },
    transportName: { type: String, default: '' },
    partyId: { type: mongoose.Schema.Types.ObjectId, ref: "AccountMasters", default: null },
    lRNo: { type: String, default: '' },
    lRDate: { type: Date, default: '' },
    subTotal: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    cgst: { type: Number, default: 0 },
    other: { type: Number, default: '' },
    round: { type: Number, default: '' },
    grandTotal: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const salesGoodsReturnEntryModel = mongoose.model("SalesGoodsReturnEntry", salesGoodsReturnEntrySchema)
export default salesGoodsReturnEntryModel;