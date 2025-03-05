
import mongoose from "mongoose";
import connectToDatabase from "../utils/dbConnection.js";
import globals from "../utils/globals.js";

const stereoSchema = mongoose.Schema({
    stereoName: { type: String, default: '' },
    stereoCode: { type: Number, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const stereoModel = async () => {
    const db = await connectToDatabase(globals.Database);
    return db.models.StereoMasters || db.model("StereoMasters", stereoSchema);
}

// const stereoModel = mongoose.model("StereoMasters", stereoSchema)
export default stereoModel;