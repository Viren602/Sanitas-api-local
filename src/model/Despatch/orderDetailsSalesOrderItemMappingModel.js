import mongoose from "mongoose";

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


const orderDetailsSalesOrderItemMappingModel = mongoose.model("SalesOrderDetailsItemMapping", orderDetailsSalesOrderItemMappingSchema)
export default orderDetailsSalesOrderItemMappingModel;