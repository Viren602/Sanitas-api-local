
import mongoose from "mongoose";

const rmCategorySchema = mongoose.Schema({
    rmCategory: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const rmCategoryModel = mongoose.model("rmCategoryMasters", rmCategorySchema)
export default rmCategoryModel;