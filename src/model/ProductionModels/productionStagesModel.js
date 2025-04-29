import mongoose from "mongoose";
import connectToDatabase from "../../utils/dbConnection.js";
import globals from "../../utils/globals.js";

const ProductionStagesSchema = mongoose.Schema(
  {
    productionStageId: { type: Number, default: 0 },
    productionStageName: { type: String, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ProductionStagesModel = async (dbYear) => {
  const db = await connectToDatabase(dbYear);
  return db.models.ProductionStage || db.model("ProductionStage", ProductionStagesSchema);
}

// const ProductionStagesModel = mongoose.model("ProductionStage", ProductionStagesSchema);
export default ProductionStagesModel;
