import grnEntryMaterialDetailsModel from "../model/InventoryModels/grnEntryMaterialDetailsModel.js";
import grnEntryPartyDetailsModel from "../model/InventoryModels/grnEntryPartyDetailsModel.js";


const addEditGRNEntryMaterialMapping = async (req, res) => {
    try {
        let data = req.body.data
        let responseData = {};
        if (data.grnRawMaterialPartyDetails.partyDetailsId && data.grnRawMaterialPartyDetails.partyDetailsId.trim() !== '') {
            const response = await grnEntryPartyDetailsModel.findByIdAndUpdate(data.grnRawMaterialPartyDetails.partyDetailsId, data.grnRawMaterialPartyDetails, { new: true });
            if (response) {
                responseData.partyDetails = response;
            } else {
                responseData.partyDetails = 'Party details not found';
            }
        } else {

            let nextGRNNO = 'G001';

            const lastRecord = await grnEntryPartyDetailsModel
                .findOne()
                .sort({ grnNo: -1 })
                .select('grnNo')
                .exec();

            if (lastRecord && lastRecord.grnNo) {
                const lastNumber = parseInt(lastRecord.grnNo.slice(1), 10);
                nextGRNNO = `G${String(lastNumber + 1).padStart(3, '0')}`;
            }

            data.grnRawMaterialPartyDetails.grnNo = nextGRNNO;

            const response = new grnEntryPartyDetailsModel(data.grnRawMaterialPartyDetails);
            await response.save();
            responseData.partyDetails = response;
        }

        if (data.grnMaterialDetails.materialDetailsId && data.grnMaterialDetails.materialDetailsId.trim() !== '') {
            data.grnMaterialDetails.grnEntryPartyDetailId = responseData.partyDetails._id
            const response = await grnEntryMaterialDetailsModel.findByIdAndUpdate(data.grnMaterialDetails.materialDetailsId, data.grnMaterialDetails, { new: true });
            if (response) {
                responseData.materialDetails = response;
            } else {
                responseData.materialDetails = 'Material details not found';
            }
        } else {
            data.grnMaterialDetails.grnEntryPartyDetailId = responseData.partyDetails._id
            const response = new grnEntryMaterialDetailsModel(data.grnMaterialDetails);
            await response.save();
            responseData.materialDetails = response;
        }

        res.status(200).json({
            Message: "GRN entry material mapping added/updated successfully",
            data: responseData
        });

    } catch (error) {
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllPartyListForGRNEntry = async (req, res) => {
    try {
        let data = req.body.data

        let queryObject = { isDeleted: false }

        let filterBy = 'partyName'

        if (data.filterBy && data.filterBy.trim() !== '') {
            filterBy = data.filterBy
        }

        console.log(data.materialType)

        if (data.materialType && data.materialType !== 'Select' && data.materialType.trim() !== '') {
            queryObject.grnEntryType = data.materialType
        }

        let response = await grnEntryPartyDetailsModel
            .find(queryObject)
            .sort(filterBy)
            .populate({
                path: 'partyId',
                select: 'partyName _id'
            });

        if (data.partyName && data.partyName.trim() !== '') {
            response = response.filter(item =>
                item.partyId?.partyName?.toLowerCase().startsWith(data.partyName.toLowerCase())
            );
        }

        res.status(200).json({ Message: "Items fetched successfully", responseContent: response });
    } catch (error) {
        console.log("error in item master controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllgrnEntryMaterialDetailsById = async (req, res) => {
    try {
        const { id } = req.query;
        let response = []
        if (id) {
            response = await grnEntryMaterialDetailsModel
            .find({ grnEntryPartyDetailId: id, isDeleted : false })
            .populate({
                path: 'rawMaterialId',
                select: 'rmName _id',
            })
            .populate({
                path: 'packageMaterialId',
                select: 'pmName _id',
            });
        }
        res.status(200).json({ Message: "Items fetched successfully", responseContent: response });
    } catch (error) {
        console.log("error in Inventory controller", error);
        res.status(500).json({ error: error.message });
    }
};

const deleteGRNEntryMaterialDetailsById = async (req, res) => {
    try {
        const { id } = req.query;
        let response = {}
        if (id) {
            response = await grnEntryPartyDetailsModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true, useFindAndModify: false });
        }
        res.status(200).json({ Message: "GRN Party Details deleted successfully", responseContent: response });
    } catch (error) {
        console.log("error in item master controller", error);
        res.status(500).json({ error: error.message });
    }
};

const deleteItemforGRNEntryMaterialById = async (req, res) => {
    try {
        const { id } = req.query;
        let response = {}
        console.log(id)
        if (id) {
            response = await grnEntryMaterialDetailsModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true, useFindAndModify: false });
        }
        res.status(200).json({ Message: "GRN Material Detail deleted successfully", responseContent: response });
    } catch (error) {
        console.log("error in item master controller", error);
        res.status(500).json({ error: error.message });
    }
};

export {
    addEditGRNEntryMaterialMapping,
    getAllPartyListForGRNEntry,
    getAllgrnEntryMaterialDetailsById,
    deleteGRNEntryMaterialDetailsById,
    deleteItemforGRNEntryMaterialById
};