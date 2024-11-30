
import mongoose from "mongoose";

const categorySchema = mongoose.Schema({
    categoryName: { type: String, default: '' },
}, { timestamps: true })


const ItemCategory = mongoose.model("ItemCategories", categorySchema)
export default ItemCategory;