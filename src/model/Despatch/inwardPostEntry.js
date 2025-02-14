import mongoose from "mongoose";

const inwardPostScHema = mongoose.Schema({
    date: { type: Date, default: '' },
    courier: { type: String, default: '' },
    partyId: { type: mongoose.Schema.Types.ObjectId, ref: "AccountMasters", default: null, },
    podNo: { type: String, default: '' },
    narration: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const inwardPostModel = mongoose.model("InwardPostEntry", inwardPostScHema)
export default inwardPostModel;