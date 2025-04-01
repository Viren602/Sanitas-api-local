
import mongoose from "mongoose";
import connectToDatabase from "../utils/dbConnection.js";
import config from "../config/config.js";

const MasterDB = config.MASTER_DB;

const companySelectionMasterModel = async () => {
    const db = await connectToDatabase(MasterDB);
    return db.models.CompanyMasters || db.model("CompanyMasters", new mongoose.Schema({
        CompanyName: { type: String, default: '' },
        companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    }));
};

export default companySelectionMasterModel;