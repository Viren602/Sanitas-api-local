
import mongoose from "mongoose";
import connectToDatabase from "../utils/dbConnection.js";
import globals from "../utils/globals.js";

const colorSchema = mongoose.Schema({
    colorMaster: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const colorModel = async () => {
    const db = await connectToDatabase(globals.Database);
    return db.models.ColorMasters || db.model("ColorMasters", colorSchema);
}

// const colorModel = mongoose.model("ColorMasters", colorSchema)
export default colorModel;