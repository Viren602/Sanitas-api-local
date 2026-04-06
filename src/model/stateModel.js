
import mongoose from "mongoose";
import connectToDatabase from "../utils/dbConnection.js";
import globals from "../utils/globals.js";

const stateSchema = mongoose.Schema({
    stateName: { type: String, default: '' },
    code: { type: String, default: '' },
    stateid: { type: String, default: '' },
    stateCode: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const stateModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    return db.models.StateMasters || db.model("StateMasters", stateSchema);
}

// const stateModel = mongoose.model("StateMasters", stateSchema)
export default stateModel;