
import mongoose from "mongoose";
import connectToDatabase from "../utils/dbConnection.js";
import globals from "../utils/globals.js";
import companyItems from "./companyItems.js";
import partyModel from "./partiesModel.js";

const partyWiseNetRateDetailsSchema = mongoose.Schema({
    partyId: { type: mongoose.Schema.Types.ObjectId, ref: "AccountMasters" },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "CompanyItem" },
    netRate: { type: Number, default: 0 },
    freePersantage: { type: Number, default: 0 },
    supply: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const partyWiseNetRateDetailsModel = async () => {
    const db = await connectToDatabase(globals.Database);
    await companyItems()
    await partyModel()
    return db.models.PartyWiseNetRateDetails || db.model("PartyWiseNetRateDetails", partyWiseNetRateDetailsSchema);
}

// const partyWiseNetRateDetailsModel = mongoose.model("PartyWiseNetRateDetails", partyWiseNetRateDetailsSchema)
export default partyWiseNetRateDetailsModel;