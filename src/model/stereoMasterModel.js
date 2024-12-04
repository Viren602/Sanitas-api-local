
import mongoose from "mongoose";

const stereoSchema = mongoose.Schema({
    stereoName: { type: String, default: '' },
    stereoCode: { type: Number, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const stereoModel = mongoose.model("StereoMasters", stereoSchema)
export default stereoModel;