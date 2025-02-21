
import mongoose from "mongoose";

const jsEntrySchema = mongoose.Schema({
    srNo: { type: String, default: 0 },
    date: { type: Date, default: 0 },
    totalDebitAmount: { type: Number, default: 0 },
    totalCreditAmount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const jvEntryModel = mongoose.model("JVEntry", jsEntrySchema)
export default jvEntryModel;