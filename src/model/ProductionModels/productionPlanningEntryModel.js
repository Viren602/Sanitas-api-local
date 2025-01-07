import mongoose from "mongoose";

const productionPlanningEntrySchema = mongoose.Schema(
  {
    partyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountMasters",
      default: null,
    },
    productionNo : { type: String, default: "" },
    productionPlanningDate : { type: Date, default: "" },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductMasters",
      default: null,
    },
    batchNo: { type: String, default: "" },
    batchSize: { type: Number, default: 0 },
    planningDate: { type: Date, default: "" },
    despDate: { type: Date, default: "" },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyItem",
      default: null,
    },
    despQty: { type: Number, default: 0 },
    mrp: { type: Number, default: 0 },
    packing: { type: String, default: "" },
    salesRate: { type: Number, default: 0 },
    itemId2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyItem",
      default: null,
    },
    despQty2: { type: Number, default: 0 },
    mrp2: { type: Number, default: 0 },
    salesRate2: { type: Number, default: 0 },
    packing2: { type: String, default: "" },
    productionStageStatusId: { type: Number, default: "" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const productionPlanningEntryModel = mongoose.model(
  "ProductionEntry",
  productionPlanningEntrySchema
);
export default productionPlanningEntryModel;
