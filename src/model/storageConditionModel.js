
import mongoose from "mongoose";
import connectToDatabase from "../utils/dbConnection.js";
import globals from "../utils/globals.js";

const storageConditionSchema = mongoose.Schema({
    storageCondition: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const storageConditionModel = async () => {
    const db = await connectToDatabase(globals.Database);
    return db.models.StorageConditionMasters || db.model("StorageConditionMasters", storageConditionSchema);
}

// const storageConditionModel = mongoose.model("StorageConditionMasters", storageConditionSchema)
export default storageConditionModel;