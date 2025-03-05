
import mongoose from "mongoose";
import globals from "../../utils/globals.js";
import connectToDatabase from "../../utils/dbConnection.js";
import rawMaterialSchema from "../rawMaterialModel.js";
import packingMaterialSchema from "../packingMaterialModel.js";
import inquiryDetailsModel from "./inquiryDetailsModel.js";

const inquiryMaterialDetailsSchema = mongoose.Schema({
    rawMaterialId: { type: mongoose.Schema.Types.ObjectId, ref: "RawMaterialMasters", default: null },
    packageMaterialId: { type: mongoose.Schema.Types.ObjectId, ref: "PackingMaterialMaster", default: null },
    inquiryId: { type: mongoose.Schema.Types.ObjectId, ref: "InquiryDetails" },
    qty: { type: Number, default: '' },
    uom: { type: String, default: '' },
    remarks: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const inquiryMaterialDetailsModel = async () => {
    const db = await connectToDatabase(globals.Database);
    await rawMaterialSchema()
    await packingMaterialSchema()
    await inquiryDetailsModel()
    return db.models.InquiryMaterialDetails || db.model("InquiryMaterialDetails", inquiryMaterialDetailsSchema);
}

// const inquiryMaterialDetailsModel = mongoose.model("InquiryMaterialDetails", inquiryMaterialDetailsSchema)
export default inquiryMaterialDetailsModel;