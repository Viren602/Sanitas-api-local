
import mongoose from "mongoose";
import connectToDatabase from "../utils/dbConnection.js";

const colorSchema = mongoose.Schema({
    colorMaster: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const colorModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    return db.models.ColorMasters || db.model("ColorMasters", colorSchema);
}

// const colorModel = mongoose.model("ColorMasters", colorSchema)
export default colorModel;