
import mongoose from "mongoose";

const storageConditionSchema = mongoose.Schema({
    storageCondition: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const storageConditionModel = mongoose.model("StorageConditionMasters", storageConditionSchema)
export default storageConditionModel;