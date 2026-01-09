
import mongoose from "mongoose";
import connectToDatabase from "../utils/dbConnection.js";

const testMasterSchema = mongoose.Schema({
    testName: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const testMasterModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    return db.models.TestMasters || db.model("TestMasters", testMasterSchema);
}

export default testMasterModel;