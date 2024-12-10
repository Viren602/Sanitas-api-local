
import mongoose from "mongoose";

const accountGroupSchema = mongoose.Schema({
    ID: { type: Number, default: 0 },
    accountGroupCode: { type: String, default: '' },
    accountGroupname: { type: String, default: '' },
    accountGroupType: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })


const accountGroupModel = mongoose.model("AccountGroupMasters", accountGroupSchema)
export default accountGroupModel;