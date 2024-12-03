
import mongoose from "mongoose";

const pmCategorySchema = mongoose.Schema({
    pmCategory: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const pmCategoryModel = mongoose.model("pmCategoryMasters", pmCategorySchema)
export default pmCategoryModel;