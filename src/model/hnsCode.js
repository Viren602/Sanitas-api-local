
import mongoose from "mongoose";
import globals from "../utils/globals.js";
import connectToDatabase from "../utils/dbConnection.js";

const hnsCodeSchema = mongoose.Schema({
    HSNCode: { type: String, default: '' },
    HNSCodeDescription: { type: String, default: '' },
    SGST: { type: Number, default: 0.0 },
    CGST: { type: Number, default: 0.0 },
    IGST: { type: Number, default: 0.0 },
    UTGST: { type: Number, default: 0.0 },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const HNSCodesScHema = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    return db.models.HSNCodes || db.model("HSNCodes", hnsCodeSchema);
}

// const HNSCodesScHema = mongoose.model("HSNCodes", hnsCodeSchema)
export default HNSCodesScHema;