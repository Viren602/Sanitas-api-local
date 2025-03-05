
import mongoose from "mongoose";
import globals from "../utils/globals.js";
import connectToDatabase from "../utils/dbConnection.js";

const packingMaterialSchema = mongoose.Schema({
    packingMaterialSize: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const packingMaterialSizeModel = async () => {
    const db = await connectToDatabase(globals.Database);
    return db.models.PackingMaterialSizes || db.model("PackingMaterialSizes", packingMaterialSchema);
}

// const packingMaterialSizeModel = mongoose.model("PackingMaterialSizes", packingMaterialSchema)
export default packingMaterialSizeModel;