import mongoose from "mongoose";
import connectToDatabase from "../../utils/dbConnection.js";
import globals from "../../utils/globals.js";
import productDetailsModel from "../productDetailsModel.js";
import partyModel from "../partiesModel.js";
import companyItems from "../companyItems.js";
import ProductionStagesModel from "./productionStagesModel.js";

const productionPlanningEntrySchema = mongoose.Schema(
  {
    partyId: { type: mongoose.Schema.Types.ObjectId, ref: "AccountMasters", default: null, },
    productionNo: { type: String, default: "" },
    productionPlanningDate: { type: Date, default: "" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductMasters", default: null, },
    batchNo: { type: String, default: "" },
    batchSize: { type: Number, default: 0 },
    planningDate: { type: Date, default: "" },
    despDate: { type: Date, default: "" },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "CompanyItem", default: null, },
    despQty: { type: Number, default: 0 },
    mrp: { type: Number, default: 0 },
    packing: { type: String, default: "" },
    salesRate: { type: Number, default: 0 },
    itemId2: { type: mongoose.Schema.Types.ObjectId, ref: "CompanyItem", default: null },
    despQty2: { type: Number, default: 0 },
    mrp2: { type: Number, default: 0 },
    salesRate2: { type: Number, default: 0 },
    packing2: { type: String, default: "" },
    size: { type: String, default: "" },
    colour: { type: String, default: "" },
    mfgDate: { type: Date, default: "" },
    productionPlanningRequestDate: { type: Date, default: "" },
    expDate: { type: Date, default: "" },
    stdBatchSize: { type: String, default: "" },
    productionStageStatusId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductionStage", default: null },
    packingRequisitionReqDate: { type: Date, default: "" },
    productionRequisitionReqDate: { type: Date, default: "" },
    packingItemId: { type: mongoose.Schema.Types.ObjectId, ref: "CompanyItem", default: null },
    packQty: { type: Number, default: "" },
    isRMFormulaCreated: { type: Boolean, default: false },
    isPMFormulaCreated: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);


const productionPlanningEntryModel = async (dbYear) => {
  const db = await connectToDatabase(dbYear);
  await productDetailsModel(dbYear)
  await partyModel(dbYear)
  await companyItems(dbYear)
  await ProductionStagesModel(dbYear)
  return db.models.ProductionEntry || db.model("ProductionEntry", productionPlanningEntrySchema);
}

// const productionPlanningEntryModel = mongoose.model(
//   "ProductionEntry",
//   productionPlanningEntrySchema
// );
export default productionPlanningEntryModel;
