
import mongoose from "mongoose";

const additionalEntryMaterialDetailsSchema = mongoose.Schema({
    rawMaterialId: { type: mongoose.Schema.Types.ObjectId, ref: "RawMaterialMasters", default: null },
    packageMaterialId: { type: mongoose.Schema.Types.ObjectId, ref: "PackingMaterialMaster", default: null  },
    additionalEntryDetailsId: { type: mongoose.Schema.Types.ObjectId, ref: "AdditionalProductionEntry" },
    qty: { type: Number, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const additionalEntryMaterialDetailsModel = mongoose.model("AdditionalEntryMaterialDetails", additionalEntryMaterialDetailsSchema)
export default additionalEntryMaterialDetailsModel;