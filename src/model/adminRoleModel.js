
import mongoose from "mongoose";
import connectToDatabase from "../utils/dbConnection.js";
import config from "../config/config.js";

const MasterDB = config.MASTER_DB;

const adminRoleModel = async () => {
    const db = await connectToDatabase(MasterDB);
    return db.models.adminroles || db.model("adminroles", new mongoose.Schema({
        roleName: { type: String, default: '' },
        roleId: { type: Number, default: 0 },

    }));
};

export default adminRoleModel;