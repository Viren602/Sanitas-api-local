import mongoose from "mongoose";

const orderDetailsSalesOrderEntrySchema = mongoose.Schema({
    partyId: { type: mongoose.Schema.Types.ObjectId, ref: "AccountMasters" },
    orderNo: { type: String, default: '' },
    orderDate: { type: String, default: '' },
    remarks: { type: String, default: 0 },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const orderDetailsSalesOrderEntryModel = mongoose.model("SalesOrderDetails", orderDetailsSalesOrderEntrySchema)
export default orderDetailsSalesOrderEntryModel;