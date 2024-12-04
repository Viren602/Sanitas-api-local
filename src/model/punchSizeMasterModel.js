
import mongoose from "mongoose";

const punchSizeSchema = mongoose.Schema({
    punchSizeMaster: { type: String, default: '' },
    punchSizeId: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const punchSizeModel = mongoose.model("PunchSizeMasters", punchSizeSchema)
export default punchSizeModel;