import mongoose from "mongoose";
import connectToDatabase from "../../utils/dbConnection.js";
import globals from "../../utils/globals.js";
import companyItems from "../companyItems.js";
import orderDetailsSalesOrderEntryModel from "./orderDetailsSalesOrderEntryModel.js";

const orderDetailsSalesOrderItemMappingSchema = mongoose.Schema({
    salesOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "SalesOrderDetails" },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "CompanyItem" },
    quantity: { type: Number, default: '' },
    free: { type: Number, default: '' },
    mrp: { type: Number, default: 0 },
    rate: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const orderDetailsSalesOrderItemMappingModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    await companyItems(dbYear)
    await orderDetailsSalesOrderEntryModel(dbYear)
    return db.models.SalesOrderDetailsItemMapping || db.model("SalesOrderDetailsItemMapping", orderDetailsSalesOrderItemMappingSchema);
}

// const orderDetailsSalesOrderItemMappingModel = mongoose.model("SalesOrderDetailsItemMapping", orderDetailsSalesOrderItemMappingSchema)
export default orderDetailsSalesOrderItemMappingModel;