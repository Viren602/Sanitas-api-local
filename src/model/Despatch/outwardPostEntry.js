import mongoose from "mongoose";
import connectToDatabase from "../../utils/dbConnection.js";
import globals from "../../utils/globals.js";
import partyModel from "../partiesModel.js";

const outwardPostScHema = mongoose.Schema({
    date: { type: Date, default: '' },
    courier: { type: String, default: '' },
    partyId: { type: mongoose.Schema.Types.ObjectId, ref: "AccountMasters", default: null, },
    podNo: { type: String, default: '' },
    narration: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const outwardPostModel = async () => {
    const db = await connectToDatabase(globals.Database);
    await partyModel()
    return db.models.OutwardPostEntry || db.model("OutwardPostEntry", outwardPostScHema);
}


// const outwardPostModel = mongoose.model("OutwardPostEntry", outwardPostScHema)
export default outwardPostModel;