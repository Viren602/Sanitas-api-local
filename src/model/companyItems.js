
import mongoose from "mongoose";

const itemSchema = mongoose.Schema({
    ItemName: { type: String, default: '' },
    NetRate: { type: Number, default: 0.00 },
    Packing: { type: String, default: '' },
    UnitQuantity: { type: Number, default: 0.0 },
    ItemCategory: { type: String, default: '' },
    BasicRate: { type: Number, default: 0.0 },
    DiscountRate: { type: Number, default: 0.0 },
    MinimumQty: { type: Number, default: 0 },
    MaximumQty: { type: Number, default: 0 },
    MrpRs: { type: Number, default: 0.0 },
    UOM: { type: String, default: '' },
    ProdLoss: { type: Number, default: 0.0 },
    JobCharge: { type: Number, default: 0.0 },
    TestingCharge: { type: Number, default: 0.0 },
    TradePrice: { type: Number, default: 0.0 },
    Box: { type: Number, default: 0.0 },
    Foil: { type: Number, default: 0.0 },
    NonInventoryItem: { type: Boolean, default: false },
    HSNCode: { type: String, default: '' },
    IsDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const companyItems = mongoose.model("CompanyItem", itemSchema)
export default companyItems;