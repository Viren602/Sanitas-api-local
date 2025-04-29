
import mongoose from "mongoose";
import connectToDatabase from "../utils/dbConnection.js";
import globals from "../utils/globals.js";

const rmCategorySchema = mongoose.Schema({
    rmCategory: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const rmCategoryModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    return db.models.rmCategoryMasters || db.model("rmCategoryMasters", rmCategorySchema);
}

// const rmCategoryModel = mongoose.model("rmCategoryMasters", rmCategorySchema)
export default rmCategoryModel;