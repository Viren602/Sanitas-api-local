
import mongoose from "mongoose";
import connectToDatabase from "../utils/dbConnection.js";
import globals from "../utils/globals.js";

const categorySchema = mongoose.Schema({
    categoryName: { type: String, default: '' },
}, { timestamps: true })

const ItemCategory = async () => {
    const db = await connectToDatabase(globals.Database);
    return db.models.ItemCategories || db.model("ItemCategories", categorySchema);
}

// const ItemCategory = mongoose.model("ItemCategories", categorySchema)
export default ItemCategory;