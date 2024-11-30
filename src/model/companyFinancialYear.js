
import mongoose from "mongoose";

const financialYears = mongoose.Schema({
    CompanyName: { type: String, default: '' },
    CompanyYear: { type: String, default: '' },
    Path: { type: String, default: '' },
    Type: { type: String, default: '' },
}, { timestamps: true })


const companyFinancialYearModel = mongoose.model("CompanyMasters", financialYears)
export default companyFinancialYearModel;