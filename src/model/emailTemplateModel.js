
import mongoose from "mongoose";
import connectToDatabase from "../utils/dbConnection.js";

const emailTemplateSchema = mongoose.Schema({
    emailSubject: { type: String, default: '' },
    description: { type: String, default: '' },
    emailTemplateId: { type: Number, default: 0 },
}, { timestamps: true })

const emailTemplateModel = async (dbYear) => {
    const db = await connectToDatabase(dbYear);
    return db.models.EmailTemplate || db.model("EmailTemplate", emailTemplateSchema);
}

// const emailTemplateModel = mongoose.model("EmailTemplate", emailTemplateSchema)
export default emailTemplateModel;