
import mongoose from "mongoose";
import connectToDatabase from "../../utils/dbConnection.js";
import globals from "../../utils/globals.js";
import partyModel from "../partiesModel.js";

const otherDeliveryChallanSchema = mongoose.Schema({
    serialNo: { type: String, default: 0 },
    returnDate: { type: Date, default: '' },
    partyId: { type: mongoose.Schema.Types.ObjectId, ref: "AccountMasters", default: null },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const otherDeliveryChallanModel = async () => {
    const db = await connectToDatabase(globals.Database);
    await partyModel()
    return db.models.OtherDeliveryChallan || db.model("OtherDeliveryChallan", otherDeliveryChallanSchema);
}

export default otherDeliveryChallanModel;