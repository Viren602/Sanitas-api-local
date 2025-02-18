
import mongoose from "mongoose";

const contraEntrySchema = mongoose.Schema({
    voucherNo: { type: String, default: '' },
    date: { type: Date, default: '' },
    fromDaybookId: { type: mongoose.Schema.Types.ObjectId, ref: "DaybookMaster", default: null },
    toDayBookId: { type: mongoose.Schema.Types.ObjectId, ref: "DaybookMaster", default: null },
    amount: { type: Number, default: '' },
    chqNo: { type: String, default: '' },
    narration1: { type: String, default: '' },
    narration2: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const contraEntryModel = mongoose.model("ContraEntry", contraEntrySchema)
export default contraEntryModel;