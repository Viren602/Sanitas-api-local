
import mongoose from "mongoose";

const productDetailSchema = mongoose.Schema({
    ID: { type: Number, default: 0 },
    productCode: { type: String, default: '' },
    productName: { type: String, default: '' },
    masterCardNo: { type: String, default: '' },
    effectiveDate: { type: Date, default: '' },
    expiryMonth: { type: Number, default: '' },
    productSpecification: { type: String, default: '' },
    productCategory: { type: String, default: '' },
    color: { type: String, default: 0 },
    storageCondition: { type: String, default: 0.0 },
    labelClaimTitle: { type: String, default: 0.0 },
    prtyname: { type: String, default: 0.0 },
    sizeName: { type: String, default: 0.0 },
    stereo: { type: String, default: 0.0 },
    exportLocal: { type: String, default: 0.0 },
    mfgLicNo: { type: String, default: 0.0 },
    sampleQty: { type: Number, default: '' },
    weight: { type: Number, default: '' },
    testchg: { type: Number, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const productDetailsModel = mongoose.model("ProductMasters", productDetailSchema)
export default productDetailsModel;