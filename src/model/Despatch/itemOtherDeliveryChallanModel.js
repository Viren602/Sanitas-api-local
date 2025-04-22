
import mongoose from "mongoose";
import globals from "../../utils/globals.js";
import connectToDatabase from "../../utils/dbConnection.js";
import companyItems from "../companyItems.js";
import otherDeliveryChallanModel from "./otherDeliveryChallanModel.js";
import batchWiseProductStockModel from "./batchWiseProductStockModel.js";

const itemOtherDeliveryChallanSchema = mongoose.Schema({
    otherDeliveryChallanId: { type: mongoose.Schema.Types.ObjectId, ref: "OtherDeliveryChallan" },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "CompanyItem" },
    stockId: { type: mongoose.Schema.Types.ObjectId, ref: "BatchWiseProductStock" },
    batchNo: { type: String, default: '' },
    mfgDate: { type: Date, default: '' },
    expDate: { type: Date, default: '' },
    qty: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const itemOtherDeliveryChalanModel = async () => {
    const db = await connectToDatabase(globals.Database);
    await companyItems()
    await otherDeliveryChallanModel()
    await batchWiseProductStockModel()
    return db.models.ItemOtherDeliveryChallanModel || db.model("ItemOtherDeliveryChallanModel", itemOtherDeliveryChallanSchema);
}

export default itemOtherDeliveryChalanModel;