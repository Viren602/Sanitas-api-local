
import mongoose from "mongoose";

const partyWiseNetRateDetailsSchema = mongoose.Schema({
    partyId: { type: mongoose.Schema.Types.ObjectId, ref: "AccountMasters" },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "CompanyItem" },
    netRate: { type: Number, default: 0 },
    freePersantage: { type: Number, default: 0 },
    supply: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const partyWiseNetRateDetailsModel = mongoose.model("PartyWiseNetRateDetails", partyWiseNetRateDetailsSchema)
export default partyWiseNetRateDetailsModel;