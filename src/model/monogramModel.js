
import mongoose from "mongoose";
import connectToDatabase from "../utils/dbConnection.js";
import rawMaterialSchema from "./rawMaterialModel.js";
import testMasterModel from "./testMasterModel.js";

const monoGramSchema = mongoose.Schema({
    rawMaterialId: { type: mongoose.Schema.Types.ObjectId, ref: "RawMaterialMasters", default: null },
    packingMaterialId: { type: mongoose.Schema.Types.ObjectId, ref: "PackingMaterialMaster", default: null },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductMasters", default: null },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: "TestMasters" },
    result: { type: String, default: false },
    limit: { type: String, default: false },
    isOwnLaboratory: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const monoGramModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    await rawMaterialSchema(dbYear);
    await testMasterModel(dbYear);
    return db.models.MonoGrams || db.model("MonoGrams", monoGramSchema);
}

export default monoGramModel;