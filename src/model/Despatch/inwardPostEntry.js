import mongoose from "mongoose";
import globals from "../../utils/globals.js";
import connectToDatabase from "../../utils/dbConnection.js";
import partyModel from "../partiesModel.js";

const inwardPostScHema = mongoose.Schema({
    date: { type: Date, default: '' },
    courier: { type: String, default: '' },
    partyId: { type: mongoose.Schema.Types.ObjectId, ref: "AccountMasters", default: null, },
    podNo: { type: String, default: '' },
    narration: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const inwardPostModel = async () => {
    const db = await connectToDatabase(globals.Database);
    await partyModel()
    return db.models.InwardPostEntry || db.model("InwardPostEntry", inwardPostScHema);
}

// const inwardPostModel = mongoose.model("InwardPostEntry", inwardPostScHema)
export default inwardPostModel;