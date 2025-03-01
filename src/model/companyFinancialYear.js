
import mongoose from "mongoose";
import connectToDatabase from "../utils/dbConnection.js";
import config from "../config/config.js";

const MasterDB = config.MASTER_DB;

const companyFinancialYearModel = async () => {
    const db = await connectToDatabase(MasterDB);
    return db.models.FinancialYearMasters || db.model("FinancialYearMasters", new mongoose.Schema({
        CompanyName: { type: String, default: '' },
        CompanyYear: { type: String, default: '' },
        Path: { type: String, default: '' },
        Type: { type: String, default: '' },
        databaseName: { type: String, default: '' },
    }));
};

export default companyFinancialYearModel;