
import mongoose from "mongoose";
import connectToDatabase from "../utils/dbConnection.js";
import globals from "../utils/globals.js";

const categorySchema = mongoose.Schema({
    categoryName: { type: String, default: '' },
}, { timestamps: true })

const ItemCategory = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    return db.models.ItemCategories || db.model("ItemCategories", categorySchema);
}

// const ItemCategory = mongoose.model("ItemCategories", categorySchema)
export default ItemCategory;