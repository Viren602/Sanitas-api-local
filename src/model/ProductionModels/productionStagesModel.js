import mongoose from "mongoose";

const ProductionStagesSchema = mongoose.Schema(
  {
    productionStageId: { type: Number, default: 0 },
    productionStageName: { type: String, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ProductionStagesModel = mongoose.model(
  "ProductionStage",
  ProductionStagesSchema
);
export default ProductionStagesModel;
