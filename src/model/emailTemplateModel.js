
import mongoose from "mongoose";

const emailTemplateSchema = mongoose.Schema({
    emailSubject: { type: String, default: '' },
    description: { type: String, default: '' },
    emailTemplateId: { type: Number, default: 0 },
}, { timestamps: true })


const emailTemplateModel = mongoose.model("EmailTemplate", emailTemplateSchema)
export default emailTemplateModel;