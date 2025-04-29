
import mongoose from "mongoose";
import globals from "../../utils/globals.js";
import connectToDatabase from "../../utils/dbConnection.js";
import rawMaterialSchema from "../rawMaterialModel.js";
import packingMaterialSchema from "../packingMaterialModel.js";
import productionRequisitionEntryModel from "./additionalEntryProductionDetails.js";

const additionalEntryMaterialDetailsSchema = mongoose.Schema({
    rawMaterialId: { type: mongoose.Schema.Types.ObjectId, ref: "RawMaterialMasters", default: null },
    packageMaterialId: { type: mongoose.Schema.Types.ObjectId, ref: "PackingMaterialMaster", default: null },
    additionalEntryDetailsId: { type: mongoose.Schema.Types.ObjectId, ref: "AdditionalProductionEntry" },
    qty: { type: Number, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

const additionalEntryMaterialDetailsModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    await rawMaterialSchema(dbYear)
    await packingMaterialSchema(dbYear)
    await productionRequisitionEntryModel(dbYear)
    return db.models.AdditionalEntryMaterialDetails || db.model("AdditionalEntryMaterialDetails", additionalEntryMaterialDetailsSchema);
}

// const additionalEntryMaterialDetailsModel = mongoose.model("AdditionalEntryMaterialDetails", additionalEntryMaterialDetailsSchema)
export default additionalEntryMaterialDetailsModel;