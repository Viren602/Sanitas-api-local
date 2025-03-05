
import mongoose from "mongoose";
import connectToDatabase from "../../utils/dbConnection.js";
import globals from "../../utils/globals.js";

const jsEntrySchema = mongoose.Schema({
    srNo: { type: String, default: 0 },
    date: { type: Date, default: 0 },
    totalDebitAmount: { type: Number, default: 0 },
    totalCreditAmount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const jvEntryModel = async () => {
    const db = await connectToDatabase(globals.Database);
    return db.models.JVEntry || db.model("JVEntry", jsEntrySchema);
}

// const jvEntryModel = mongoose.model("JVEntry", jsEntrySchema)
export default jvEntryModel;