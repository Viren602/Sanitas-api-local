
import mongoose from "mongoose";

const colorSchema = mongoose.Schema({
    colorMaster: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const colorModel = mongoose.model("ColorMasters", colorSchema)
export default colorModel;