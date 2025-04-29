
import mongoose from "mongoose";
import globals from "../../utils/globals.js";
import connectToDatabase from "../../utils/dbConnection.js";
import partyModel from "../partiesModel.js";

const purchaseOrderDetailsSchema = mongoose.Schema({
    partyId: { type: mongoose.Schema.Types.ObjectId, ref: "AccountMasters" },
    purchaseOrderNo: { type: String, default: '' },
    purchaseOrderDate: { type: Date, default: '' },
    email: { type: String, default: '' },
    status: { type: String, default: '' },
    deliveryBefore: { type: Date, default: '' },
    refNo: { type: String, default: '' },
    refDate: { type: Date, default: '' },
    materialType: { type: String, default: '' },
    gstApplicable: { type: String, default: '' },
    paymentTerm: { type: String, default: '' },
    freight: { type: String, default: '' },
    transportBy: { type: String, default: '' },
    bookingArea: { type: String, default: '' },
    addressLine1: { type: String, default: '' },
    addressLine2: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const purchaseOrderDetailsModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    await partyModel(dbYear)
    return db.models.PurchaseOrderDetail || db.model("PurchaseOrderDetail", purchaseOrderDetailsSchema);
}

// const purchaseOrderDetailsModel = mongoose.model("PurchaseOrderDetail", purchaseOrderDetailsSchema)
export default purchaseOrderDetailsModel;