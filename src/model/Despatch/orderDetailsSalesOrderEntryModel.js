import mongoose from "mongoose";
import connectToDatabase from "../../utils/dbConnection.js";
import globals from "../../utils/globals.js";
import partyModel from "../partiesModel.js";

const orderDetailsSalesOrderEntrySchema = mongoose.Schema({
    partyId: { type: mongoose.Schema.Types.ObjectId, ref: "AccountMasters" },
    orderNo: { type: String, default: '' },
    orderDate: { type: String, default: '' },
    remarks: { type: String, default: 0 },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const orderDetailsSalesOrderEntryModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    await partyModel(dbYear)
    return db.models.SalesOrderDetails || db.model("SalesOrderDetails", orderDetailsSalesOrderEntrySchema);
}

// const orderDetailsSalesOrderEntryModel = mongoose.model("SalesOrderDetails", orderDetailsSalesOrderEntrySchema)
export default orderDetailsSalesOrderEntryModel;