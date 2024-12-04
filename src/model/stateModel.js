
import mongoose from "mongoose";

const stateSchema = mongoose.Schema({
    stateName: { type: String, default: '' },
    code: { type: String, default: '' },
    stateid: { type: String, default: '' },
    stateCode: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const stateModel = mongoose.model("StateMasters", stateSchema)
export default stateModel;