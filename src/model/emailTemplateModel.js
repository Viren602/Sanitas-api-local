
import mongoose from "mongoose";
import globals from "../utils/globals.js";
import connectToDatabase from "../utils/dbConnection.js";

const emailTemplateSchema = mongoose.Schema({
    emailSubject: { type: String, default: '' },
    description: { type: String, default: '' },
    emailTemplateId: { type: Number, default: 0 },
}, { timestamps: true })

const emailTemplateModel = async () => {
    const db = await connectToDatabase(globals.Database);
    return db.models.EmailTemplate || db.model("EmailTemplate", emailTemplateSchema);
}

// const emailTemplateModel = mongoose.model("EmailTemplate", emailTemplateSchema)
export default emailTemplateModel;