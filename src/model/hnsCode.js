
import mongoose from "mongoose";

const hnsCodeSchema = mongoose.Schema({
    HSNCode: { type: String, default: '' },
    HNSCodeDescription: { type: String, default: '' },
    SGST: { type: Number, default: 0.0 },
    CGST: { type: Number, default: 0.0 },
    IGST: { type: Number, default: 0.0 },
    UTGST: { type: Number, default: 0.0 },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const HNSCodesScHema = mongoose.model("HSNCodes", hnsCodeSchema)
export default HNSCodesScHema;