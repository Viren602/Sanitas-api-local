
import mongoose from "mongoose";
import connectToDatabase from "../utils/dbConnection.js";
import globals from "../utils/globals.js";

const storageConditionSchema = mongoose.Schema({
    storageCondition: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const storageConditionModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    return db.models.StorageConditionMasters || db.model("StorageConditionMasters", storageConditionSchema);
}

// const storageConditionModel = mongoose.model("StorageConditionMasters", storageConditionSchema)
export default storageConditionModel;