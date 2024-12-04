
import mongoose from "mongoose";

const packingMaterialSchema = mongoose.Schema({
    packingMaterialSize: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const packingMaterialSizeModel = mongoose.model("PackingMaterialSizes", packingMaterialSchema)
export default packingMaterialSizeModel;