
import mongoose from "mongoose";
import globals from "../utils/globals.js";
import connectToDatabase from "../utils/dbConnection.js";

const pmCategorySchema = mongoose.Schema({
    pmCategory: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const pmCategoryModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    return db.models.pmCategoryMasters || db.model("pmCategoryMasters", pmCategorySchema);
}

// const pmCategoryModel = mongoose.model("pmCategoryMasters", pmCategorySchema)
export default pmCategoryModel;