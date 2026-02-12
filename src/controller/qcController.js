import { encryptionAPI, getRequestData } from "../middleware/encryption.js";
import grnEntryPartyDetailsModel from "../model/InventoryModels/grnEntryPartyDetailsModel.js";
import productionPlanningEntryModel from "../model/ProductionModels/productionPlanningEntryModel.js";
import ProductionStagesModel from "../model/ProductionModels/productionStagesModel.js";
import sampleEntryFGModel from "../model/QC/sampleEntryFG.js";
import sampleEntryPMModel from "../model/QC/sampleEntryPM.js";
import sampleEntryRMModel from "../model/QC/sampleEntryRM.js";
import testReportFGModel from "../model/QC/testReportFG.js";
import testReportFGDataMappingModel from "../model/QC/testReportFGDataMapping.js";
import testReportPMModel from "../model/QC/testReportPM.js";
import testReportPMDataMappingModel from "../model/QC/testReportPMDataMapping.js";
import testReportRMModel from "../model/QC/testReportRM.js";
import testReportRMDataMappingModel from "../model/QC/testReportRMDataMapping.js";
import errorHandler from "../server/errorHandle.js";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

const getGRNItemsByGRNNo = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id, id2 } = req.query;
        let grnNo = getRequestData(id)
        let grnType = getRequestData(id2)

        let gepdModel = await grnEntryPartyDetailsModel(dbYear);

        let grnExists = await gepdModel.findOne({
            isDeleted: false,
            grnNo: grnNo,
            grnEntryType: grnType
        }).select({ _id: 1 });

        if (!grnExists) {
            return res.status(200).json({
                data: {
                    statusCode: 404,
                    Message: "GRN No not exist",
                    responseData: null,
                    isEnType: true
                },
            });
        }

        let response = await gepdModel.aggregate([
            {
                $match: {
                    isDeleted: false,
                    grnNo: grnNo,
                    grnEntryType: grnType
                }
            },
            {
                $lookup: {
                    from: "grnentrymaterialdetails",
                    localField: "_id",
                    foreignField: "grnEntryPartyDetailId",
                    as: "grnMaterial"
                }
            },
            {
                $unwind: {
                    path: "$grnMaterial",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "packingmaterialmasters",
                    let: { type: "$grnEntryType", pmId: "$grnMaterial.packageMaterialId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$$type", "Packing"] },
                                        { $eq: ["$_id", "$$pmId"] },
                                    ]
                                }
                            }
                        }
                    ],
                    as: "packingMaterial"
                }
            },
            {
                $unwind: {
                    path: "$packingMaterial",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "rawmaterialmasters",
                    let: { type: "$grnEntryType", rmId: "$grnMaterial.rawMaterialId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$$type", "Raw"] },
                                        { $eq: ["$_id", "$$rmId"] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "rawMaterial"
                }
            },
            {
                $unwind: {
                    path: "$rawMaterial",
                    preserveNullAndEmptyArrays: true
                }
            },
            // Removing records which haven't monogram
            {
                $lookup: {
                    from: "monograms",
                    let: {
                        type: "$grnEntryType",
                        rawId: "$rawMaterial._id",
                        packId: "$packingMaterial._id"
                    },
                    pipeline: [
                        {
                            $match: {
                                isDeleted: false,
                                $expr: {
                                    $or: [
                                        {
                                            $and: [
                                                { $eq: ["$$type", "Raw"] },
                                                { $eq: ["$rawMaterialId", "$$rawId"] }
                                            ]
                                        },
                                        {
                                            $and: [
                                                { $eq: ["$$type", "Packing"] },
                                                { $eq: ["$packingMaterialId", "$$packId"] }
                                            ]
                                        }
                                    ]
                                }
                            }
                        },
                        { $limit: 1 }
                    ],
                    as: "monoGram"
                }
            },
            {
                $match: {
                    $expr: {
                        $not: {
                            $and: [
                                { $eq: [{ $size: "$monoGram" }, 0] },
                                {
                                    $eq: [
                                        {
                                            $cond: [
                                                { $eq: ["$grnEntryType", "Raw"] },
                                                "$rawMaterial.labTestRequire",
                                                "$packingMaterial.labTestRequire"
                                            ]
                                        },
                                        false
                                    ]
                                }
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    grnEntryPartyDetailId: 1,
                    partyId: 1,
                    grnNo: 1,
                    grnDate: {
                        $dateToString: {
                            format: "%d-%m-%Y",
                            date: "$grnDate"
                        }
                    },
                    invoiceNo: 1,
                    invoiceDate: 1,
                    grnEntryType: 1,
                    grnEntryMaterialDetailId: "$grnMaterial._id",
                    materialBatchNo: "$grnMaterial.batchNo",
                    materialQty: "$grnMaterial.qty",
                    materialMfgDate: 1,
                    materialExpDate: 1,
                    materialMfgBy: "$grnMaterial.mfgBy",
                    materialId: {
                        $cond: [
                            { $eq: ["$grnEntryType", "Raw"] },
                            "$rawMaterial._id",
                            "$packingMaterial._id"
                        ]
                    },
                    materialName: {
                        $cond: [
                            { $eq: ["$grnEntryType", "Raw"] },
                            "$rawMaterial.rmName",
                            "$packingMaterial.pmName"
                        ]
                    },
                    uom: {
                        $cond: [
                            { $eq: ["$grnEntryType", "Raw"] },
                            "$rawMaterial.rmUOM",
                            "$packingMaterial.pmUOM"
                        ]
                    },

                }
            },
            {
                $lookup: {
                    from: "sampleentryrms",
                    let: {
                        grnId: "$_id",
                        materialId: "$materialId",
                        grnNo: "$grnNo"
                    },
                    pipeline: [
                        {
                            $match: {
                                isDeleted: false,
                                $expr: {
                                    $and: [
                                        { $eq: ["$grnId", "$$grnId"] },
                                        { $eq: ["$rmId", "$$materialId"] },
                                        { $eq: ["$grnNo", "$$grnNo"] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "sampleDataRM"
                }
            },
            {
                $match: {
                    sampleDataRM: { $eq: [] }
                }
            },
            {
                $lookup: {
                    from: "sampleentrypms",
                    let: {
                        grnId: "$_id",
                        materialId: "$materialId",
                        grnNo: "$grnNo"
                    },
                    pipeline: [
                        {
                            $match: {
                                isDeleted: false,
                                $expr: {
                                    $and: [
                                        { $eq: ["$grnId", "$$grnId"] },
                                        { $eq: ["$pmId", "$$materialId"] },
                                        { $eq: ["$grnNo", "$$grnNo"] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "sampleDataPM"
                }
            },
            {
                $match: {
                    sampleDataPM: { $eq: [] }
                }
            },
        ])

        let responseData = encryptionAPI(response, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetch successfully",
                responseData: responseData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in getGRNItemsByGRNNo Api", error);
        errorHandler(error, req, res, "Error in getGRNItemsByGRNNo Api")
    }
};

// Raw Material Sample Entry
const getRawMaterialSampleEntryCount = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let seModel = await sampleEntryRMModel(dbYear)

        const lastRecord = await seModel
            .findOne({ isDeleted: false })
            .sort({ _id: -1 })
            .select("refNo");

        let newRefNo = "R0001";

        if (lastRecord && lastRecord.refNo) {
            const lastNumber = parseInt(lastRecord.refNo.replace("R", ""), 10);

            const nextNumber = lastNumber + 1;

            newRefNo = "R" + String(nextNumber).padStart(4, "0");
        }

        const response = {
            refNo: newRefNo
        };


        let encryptData = encryptionAPI(response, 1);

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetched successfully",
                responseData: encryptData,
                isEnType: true,
            },
        });

    } catch (error) {
        console.log("Error in getRawMaterialSampleEntryCount API", error);
        errorHandler(error, req, res, "Error in getRawMaterialSampleEntryCount API")
    }
};

const addEditRawMaterialSampleEntry = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')

        if (data.sampleEntryRMId && data.sampleEntryRMId.trim() !== '') {

            let sampleRMModel = await sampleEntryRMModel(dbYear);
            const response = await sampleRMModel.findByIdAndUpdate(data.sampleEntryRMId, data, { new: true });
            if (!response) {
                res.status(200).json({
                    data: {
                        statusCode: 404,
                        Message: "Sample details not found",
                        responseData: null,
                        isEnType: true,
                    },
                });
            }

            let encryptData = encryptionAPI(response, 1);
            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Sample details updated successfully",
                    responseData: encryptData,
                    isEnType: true,
                },
            });
        } else {
            let sampleRMModel = await sampleEntryRMModel(dbYear);
            const response = new sampleRMModel(data);
            await response.save();

            let encryptData = encryptionAPI(response, 1);
            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Sample details added successfully",
                    responseData: encryptData,
                    isEnType: true,
                },
            });
        }

    } catch (error) {
        console.log("Error in addEditRawMaterialSampleEntry Api", error);
        errorHandler(error, req, res, "Error in addEditRawMaterialSampleEntry Api")
    }
};

const getAllRawMaterialSampleEntry = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;

        const { id, id1, id2 } = req.query;
        let globalSearch = getRequestData(id)
        let materialId = getRequestData(id1)
        let partyId = getRequestData(id2)

        let queryObject = {
            isDeleted: false,
        }

        if (materialId) {
            queryObject.rmId = new ObjectId(materialId);
        }

        if (partyId) {
            queryObject.supplierId = new ObjectId(partyId);
        }

        let sampleRMModel = await sampleEntryRMModel(dbYear);
        let response = await sampleRMModel.aggregate([
            { $match: queryObject },
            {
                $lookup: {
                    from: "accountmasters",
                    localField: "supplierId",
                    foreignField: "_id",
                    as: "party"
                }
            },
            {
                $unwind: {
                    path: "$party",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "rawmaterialmasters",
                    localField: "rmId",
                    foreignField: "_id",
                    as: "material"
                }
            },
            {
                $unwind: {
                    path: "$material",
                    preserveNullAndEmptyArrays: true
                }
            },
            ...(globalSearch ? [{
                $match: {
                    $or: [
                        { refNo: { $regex: globalSearch, $options: "i" } },
                        { batchNo: { $regex: globalSearch, $options: "i" } },
                        { "party.partyName": { $regex: globalSearch, $options: "i" } },
                        { "material.rmName": { $regex: globalSearch, $options: "i" } }
                    ]
                }
            }] : []),
            {
                $project: {
                    sampleEntryRMId: "$_id",
                    _id: 0,
                    refNo: 1,
                    refDate: {
                        $cond: [
                            { $ifNull: ["$refDate", false] },
                            {
                                $dateToString: {
                                    format: "%d-%m-%Y",
                                    date: "$refDate",
                                    timezone: "Asia/Kolkata"
                                }
                            },
                            null
                        ]
                    },
                    batchNo: 1,
                    partyName: "$party.partyName",
                    materialName: "$material.rmName",
                    grnNo: 1,
                }
            }
        ]);

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Raw material sample entry fatched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in getAllRawMaterialSampleEntry Api", error);
        errorHandler(error, req, res, "Error in getAllRawMaterialSampleEntry Api")
    }
};

const getRawMaterialSampleEntryDetailsById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let sampleEntryRMId = getRequestData(id)

        let gepdModel = await sampleEntryRMModel(dbYear);
        let responseItem = await gepdModel.aggregate([
            {
                $match: {
                    isDeleted: false,
                    _id: new ObjectId(sampleEntryRMId)
                }
            },
            {
                $lookup: {
                    from: "accountmasters",
                    localField: "supplierId",
                    foreignField: "_id",
                    as: "partyData"
                }
            },
            {
                $unwind: {
                    path: "$partyData",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $lookup: {
                    from: "rawmaterialmasters",
                    localField: "rmId",
                    foreignField: "_id",
                    as: "materialdata"
                }
            },
            {
                $unwind: {
                    path: "$materialdata",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $addFields: {
                    partyName: "$partyData.partyName",
                    materialName: "$materialdata.rmName",
                    uom: "$materialdata.rmUOM"
                }
            },
            {
                $project: {
                    partyData: 0,
                    materialdata: 0
                }
            },
            {
                $limit: 1
            }
        ]);
        let data = await testReportRMModel(dbYear);
        let flag = await data.findOne({ sampleEntryRMId: new ObjectId(sampleEntryRMId), isDeleted: false }).select({ _id: 1 })

        let response = responseItem[0] || null;
        response.isTestReportEntry = flag ? true : false;

        let responseData = encryptionAPI(response, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetch successfully",
                responseData: responseData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in getRawMaterialSampleEntryDetailsById Api", error);
        errorHandler(error, req, res, "Error in getRawMaterialSampleEntryDetailsById Api")
    }
};

const deleteRawMaterialSampleEntryById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let sampleEntryRMId = getRequestData(id)

        let gepdModel = await sampleEntryRMModel(dbYear);
        let response = await gepdModel.findOneAndUpdate(
            { _id: sampleEntryRMId, isDeleted: false },
            { $set: { isDeleted: true } },
            { new: true }
        );

        let responseData = encryptionAPI(response, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Deleted successfully",
                responseData: responseData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in deleteRawMaterialSampleEntryById Api", error);
        errorHandler(error, req, res, "Error in deleteRawMaterialSampleEntryById Api")
    }
};

// Packing Material Sample Entry

const getPackingMaterialSampleEntryCount = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let seModel = await sampleEntryPMModel(dbYear)

        const lastRecord = await seModel
            .findOne({ isDeleted: false })
            .sort({ _id: -1 })
            .select("refNo");

        let newRefNo = "P0001";

        if (lastRecord && lastRecord.refNo) {
            const lastNumber = parseInt(lastRecord.refNo.replace("P", ""), 10);

            const nextNumber = lastNumber + 1;

            newRefNo = "P" + String(nextNumber).padStart(4, "0");
        }

        const response = {
            refNo: newRefNo
        };


        let encryptData = encryptionAPI(response, 1);

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetched successfully",
                responseData: encryptData,
                isEnType: true,
            },
        });

    } catch (error) {
        console.log("Error in getPackingMaterialSampleEntryCount API", error);
        errorHandler(error, req, res, "Error in getPackingMaterialSampleEntryCount API")
    }
};

const addEditPackingMaterialSampleEntry = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')

        if (data.sampleEntryPMId && data.sampleEntryPMId.trim() !== '') {

            let samplePMModel = await sampleEntryPMModel(dbYear);
            const response = await samplePMModel.findByIdAndUpdate(data.sampleEntryPMId, data, { new: true });
            if (!response) {
                res.status(200).json({
                    data: {
                        statusCode: 404,
                        Message: "Sample details not found",
                        responseData: null,
                        isEnType: true,
                    },
                });
            }

            let encryptData = encryptionAPI(response, 1);
            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Sample details updated successfully",
                    responseData: encryptData,
                    isEnType: true,
                },
            });
        } else {
            let samplePMModel = await sampleEntryPMModel(dbYear);
            const response = new samplePMModel(data);
            await response.save();

            let encryptData = encryptionAPI(response, 1);
            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Sample details added successfully",
                    responseData: encryptData,
                    isEnType: true,
                },
            });
        }

    } catch (error) {
        console.log("Error in addEditRawMaterialSampleEntry Api", error);
        errorHandler(error, req, res, "Error in addEditRawMaterialSampleEntry Api")
    }
};

const getAllPackingMaterialSampleEntry = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;

        const { id, id1, id2 } = req.query;
        let globalSearch = getRequestData(id)
        let materialId = getRequestData(id1)
        let partyId = getRequestData(id2)

        let queryObject = {
            isDeleted: false,
        }

        if (materialId) {
            queryObject.pmId = new ObjectId(materialId);;
        }

        if (partyId) {
            queryObject.supplierId = new ObjectId(partyId);
        }

        let samplePMModel = await sampleEntryPMModel(dbYear);
        let response = await samplePMModel.aggregate([
            { $match: queryObject },
            {
                $lookup: {
                    from: "accountmasters",
                    localField: "supplierId",
                    foreignField: "_id",
                    as: "party"
                }
            },
            {
                $unwind: {
                    path: "$party",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "packingmaterialmasters",
                    localField: "pmId",
                    foreignField: "_id",
                    as: "material"
                }
            },
            {
                $unwind: {
                    path: "$material",
                    preserveNullAndEmptyArrays: true
                }
            },
            ...(globalSearch ? [{
                $match: {
                    $or: [
                        { refNo: { $regex: globalSearch, $options: "i" } },
                        { batchNo: { $regex: globalSearch, $options: "i" } },
                        { "party.partyName": { $regex: globalSearch, $options: "i" } },
                        { "material.pmName": { $regex: globalSearch, $options: "i" } }
                    ]
                }
            }] : []),
            {
                $project: {
                    sampleEntryPMId: "$_id",
                    _id: 0,
                    refNo: 1,
                    refDate: {
                        $cond: [
                            { $ifNull: ["$refDate", false] },
                            {
                                $dateToString: {
                                    format: "%d-%m-%Y",
                                    date: "$refDate",
                                    timezone: "Asia/Kolkata"
                                }
                            },
                            null
                        ]
                    },
                    batchNo: 1,
                    partyName: "$party.partyName",
                    materialName: "$material.pmName",
                    grnNo: 1,
                }
            }
        ]);

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Packing material sample entry fatched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in addEditPackingMaterialSampleEntry Api", error);
        errorHandler(error, req, res, "Error in addEditPackingMaterialSampleEntry Api")
    }
};

const getPackingMaterialSampleEntryDetailsById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let sampleEntryPMId = getRequestData(id)

        let gepdModel = await sampleEntryPMModel(dbYear);
        let responseItem = await gepdModel.aggregate([
            {
                $match: {
                    isDeleted: false,
                    _id: new ObjectId(sampleEntryPMId)
                }
            },
            {
                $lookup: {
                    from: "accountmasters",
                    localField: "supplierId",
                    foreignField: "_id",
                    as: "partyData"
                }
            },
            {
                $unwind: {
                    path: "$partyData",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $lookup: {
                    from: "packingmaterialmasters",
                    localField: "pmId",
                    foreignField: "_id",
                    as: "materialdata"
                }
            },
            {
                $unwind: {
                    path: "$materialdata",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $addFields: {
                    partyName: "$partyData.partyName",
                    materialName: "$materialdata.pmName",
                    uom: "$materialdata.pmUOM"
                }
            },
            {
                $project: {
                    partyData: 0,
                    materialdata: 0
                }
            },
            {
                $limit: 1
            }
        ]);
        let data = await testReportPMModel(dbYear);
        let flag = await data.findOne({ sampleEntryPMId: new ObjectId(sampleEntryPMId), isDeleted: false }).select({ _id: 1 })

        let response = responseItem[0] || null;
        response.isTestReportEntry = flag ? true : false;

        let responseData = encryptionAPI(response, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetch successfully",
                responseData: responseData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in getPackingMaterialSampleEntryDetailsById Api", error);
        errorHandler(error, req, res, "Error in getPackingMaterialSampleEntryDetailsById Api")
    }
};

const deletePackingMaterialSampleEntryById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let sampleEntryPMId = getRequestData(id)

        let gepdModel = await sampleEntryPMModel(dbYear);
        let response = await gepdModel.findOneAndUpdate(
            { _id: sampleEntryPMId, isDeleted: false },
            { $set: { isDeleted: true } },
            { new: true }
        );

        let responseData = encryptionAPI(response, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Deleted successfully",
                responseData: responseData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in deletePackingMaterialSampleEntryById Api", error);
        errorHandler(error, req, res, "Error in deletePackingMaterialSampleEntryById Api")
    }
};

// Finish Goods Sample Entry

const getFinishGoodsSampleEntryCount = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let seModel = await sampleEntryFGModel(dbYear)

        const lastRecord = await seModel
            .findOne({ isDeleted: false })
            .sort({ _id: -1 })
            .select("refNo");

        let newRefNo = "F0001";

        if (lastRecord && lastRecord.refNo) {
            const lastNumber = parseInt(lastRecord.refNo.replace("F", ""), 10);

            const nextNumber = lastNumber + 1;

            newRefNo = "F" + String(nextNumber).padStart(4, "0");
        }

        const response = {
            refNo: newRefNo
        };


        let encryptData = encryptionAPI(response, 1);

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetched successfully",
                responseData: encryptData,
                isEnType: true,
            },
        });

    } catch (error) {
        console.log("Error in getPackingMaterialSampleEntryCount API", error);
        errorHandler(error, req, res, "Error in getPackingMaterialSampleEntryCount API")
    }
};

const getProductionItemsByProductionNo = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;

        const psModel = await ProductionStagesModel(dbYear);
        const stage = await psModel.findOne({ productionStageId: 3, isDeleted: false, });

        let gepdModel = await productionPlanningEntryModel(dbYear);

        let response = await gepdModel.aggregate([
            {
                $match: {
                    isDeleted: false,
                    productionStageStatusId: stage._id
                }
            },
            {
                $lookup: {
                    from: "productmasters",
                    localField: "productId",
                    foreignField: "_id",
                    as: "productData"
                }
            },
            {
                $unwind: {
                    path: "$productData",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    partyId: 1,
                    productionNo: 1,
                    productionPlanningDate: {
                        $dateToString: {
                            format: "%d-%m-%Y",
                            date: "$productionPlanningDate"
                        }
                    },
                    productBatchNo: "$batchNo",
                    productQty: "$batchSize",
                    productMfgDate: "$mfgDate",
                    productExpDate: "$expDate",
                    productMfgBy: "$mfgBy",
                    productId: "$productId",
                    productName: "$productData.productName",
                }
            },
            {
                $lookup: {
                    from: "sampleentryfgs",
                    let: {
                        productionId: "$_id",
                    },
                    pipeline: [
                        {
                            $match: {
                                isDeleted: false,
                                $expr: {
                                    $and: [
                                        { $eq: ["$productionId", "$$productionId"] },
                                    ]
                                }
                            }
                        }
                    ],
                    as: "sampleDataFG"
                }
            },
            {
                $lookup: {
                    from: "testreportfgs",
                    let: {
                        productionId: "$_id",
                    },
                    pipeline: [
                        {
                            $match: {
                                isDeleted: false,
                                $expr: {
                                    $and: [
                                        { $eq: ["$productionId", "$$productionId"] },
                                    ]
                                }
                            }
                        }
                    ],
                    as: "testDataFG"
                }
            },
            {
                $match: {
                    $expr: {
                        $and: [
                            { $eq: [{ $size: { $ifNull: ["$sampleDataFG", []] } }, 0] },
                            { $eq: [{ $size: { $ifNull: ["$testDataFG", []] } }, 0] }
                        ]
                    }
                }
            }
        ])

        let responseData = encryptionAPI(response, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetch successfully",
                responseData: responseData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in getProductionItemsByProductionNo Api", error);
        errorHandler(error, req, res, "Error in getProductionItemsByProductionNo Api")
    }
};

const addEditFinishGoodsSampleEntry = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')

        if (data.sampleEntryFGId && data.sampleEntryFGId.trim() !== '') {

            let sampleFGModel = await sampleEntryFGModel(dbYear);
            const response = await sampleFGModel.findByIdAndUpdate(data.sampleEntryFGId, data, { new: true });
            if (!response) {
                res.status(200).json({
                    data: {
                        statusCode: 404,
                        Message: "Sample details not found",
                        responseData: null,
                        isEnType: true,
                    },
                });
            }

            let encryptData = encryptionAPI(response, 1);
            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Sample details updated successfully",
                    responseData: encryptData,
                    isEnType: true,
                },
            });
        } else {
            let sampleFGModel = await sampleEntryFGModel(dbYear);
            const response = new sampleFGModel(data);
            await response.save();

            let encryptData = encryptionAPI(response, 1);
            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Sample details added successfully",
                    responseData: encryptData,
                    isEnType: true,
                },
            });
        }

    } catch (error) {
        console.log("Error in addEditFinishGoodsSampleEntry Api", error);
        errorHandler(error, req, res, "Error in addEditFinishGoodsSampleEntry Api")
    }
};

const getAllFinishGoodsSampleEntry = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;

        const { id, id1, id2 } = req.query;
        let globalSearch = getRequestData(id)
        let productId = getRequestData(id1)
        let partyId = getRequestData(id2)

        let queryObject = {
            isDeleted: false,
        }

        if (productId) {
            queryObject.productId = new ObjectId(productId);;
        }

        if (partyId) {
            queryObject.supplierId = new ObjectId(partyId);
        }

        let sampleFGModel = await sampleEntryFGModel(dbYear);
        let response = await sampleFGModel.aggregate([
            { $match: queryObject },
            {
                $lookup: {
                    from: "accountmasters",
                    localField: "supplierId",
                    foreignField: "_id",
                    as: "party"
                }
            },
            {
                $unwind: {
                    path: "$party",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "productmasters",
                    localField: "productId",
                    foreignField: "_id",
                    as: "product"
                }
            },
            {
                $unwind: {
                    path: "$product",
                    preserveNullAndEmptyArrays: true
                }
            },
            ...(globalSearch ? [{
                $match: {
                    $or: [
                        { refNo: { $regex: globalSearch, $options: "i" } },
                        { batchNo: { $regex: globalSearch, $options: "i" } },
                        { "party.partyName": { $regex: globalSearch, $options: "i" } },
                        { "product.productName": { $regex: globalSearch, $options: "i" } }
                    ]
                }
            }] : []),
            {
                $project: {
                    sampleEntryFGId: "$_id",
                    _id: 0,
                    refNo: 1,
                    refDate: {
                        $cond: [
                            { $ifNull: ["$refDate", false] },
                            {
                                $dateToString: {
                                    format: "%d-%m-%Y",
                                    date: "$refDate",
                                    timezone: "Asia/Kolkata"
                                }
                            },
                            null
                        ]
                    },
                    batchNo: 1,
                    partyName: "$party.partyName",
                    productName: "$product.productName",
                    prodNo: 1
                }
            }
        ]);

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Packing material sample entry fatched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in getAllFinishGoodsSampleEntry Api", error);
        errorHandler(error, req, res, "Error in getAllFinishGoodsSampleEntry Api")
    }
};

const getFinishGoodsSampleEntryDetailsById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let sampleEntryFGId = getRequestData(id)

        let gepdModel = await sampleEntryFGModel(dbYear);
        let responseItem = await gepdModel.aggregate([
            {
                $match: {
                    isDeleted: false,
                    _id: new ObjectId(sampleEntryFGId)
                }
            },
            {
                $lookup: {
                    from: "accountmasters",
                    localField: "supplierId",
                    foreignField: "_id",
                    as: "partyData"
                }
            },
            {
                $unwind: {
                    path: "$partyData",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $lookup: {
                    from: "productmasters",
                    localField: "productId",
                    foreignField: "_id",
                    as: "product"
                }
            },
            {
                $unwind: {
                    path: "$product",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $addFields: {
                    partyName: "$partyData.partyName",
                    productName: "$product.productName"
                }
            },
            {
                $project: {
                    partyData: 0,
                    product: 0
                }
            },
            {
                $limit: 1
            }
        ]);
        let data = await testReportFGModel(dbYear);
        let flag = await data.findOne({ sampleEntryFGId: new ObjectId(sampleEntryFGId), isDeleted: false }).select({ _id: 1 })

        let response = responseItem[0] || null;
        response.isTestReportEntry = flag ? true : false;


        let responseData = encryptionAPI(response, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetch successfully",
                responseData: responseData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in getFinishGoodsSampleEntryDetailsById Api", error);
        errorHandler(error, req, res, "Error in getFinishGoodsSampleEntryDetailsById Api")
    }
};

const deleteFinishGoodsSampleEntryById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let sampleEntryFGId = getRequestData(id)

        let gepdModel = await sampleEntryFGModel(dbYear);
        let response = await gepdModel.findOneAndUpdate(
            { _id: sampleEntryFGId, isDeleted: false },
            { $set: { isDeleted: true } },
            { new: true }
        );

        let responseData = encryptionAPI(response, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Deleted successfully",
                responseData: responseData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in deleteFinishGoodsSampleEntryById Api", error);
        errorHandler(error, req, res, "Error in deleteFinishGoodsSampleEntryById Api")
    }
};

// Raw Material Test Report Entry
const getAllPeningRawMaterialSampleEntry = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;

        let queryObject = {
            isDeleted: false,
        }
        let sampleRMModel = await sampleEntryRMModel(dbYear);
        let testReportModel = await testReportRMModel(dbYear);

        let usedSampleIds = await testReportModel.distinct("sampleEntryRMId", {
            isDeleted: false,
            sampleEntryRMId: { $ne: null }
        });

        let response = await sampleRMModel.aggregate([
            {
                $match: {
                    ...queryObject,
                    _id: { $nin: usedSampleIds }
                }
            },
            {
                $lookup: {
                    from: "accountmasters",
                    localField: "supplierId",
                    foreignField: "_id",
                    as: "party"
                }
            },
            {
                $unwind: {
                    path: "$party",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "rawmaterialmasters",
                    localField: "rmId",
                    foreignField: "_id",
                    as: "material"
                }
            },
            {
                $unwind: {
                    path: "$material",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    sampleEntryRMId: "$_id",
                    _id: 0,
                    refNo: 1,
                    refDate: {
                        $cond: [
                            { $ifNull: ["$refDate", false] },
                            {
                                $dateToString: {
                                    format: "%d-%m-%Y",
                                    date: "$refDate",
                                    timezone: "Asia/Kolkata"
                                }
                            },
                            null
                        ]
                    },
                    batchNo: 1,
                    partyName: "$party.partyName",
                    materialName: "$material.rmName",
                    grnNo: 1
                }
            }
        ]);

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Raw material sample entry fatched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in getAllPeningRawMaterialSampleEntry Api", error);
        errorHandler(error, req, res, "Error in getAllPeningRawMaterialSampleEntry Api")
    }
};

const addEditRawMaterialTestReport = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')

        const { tableData, ...mainTestData } = data;
        if (mainTestData.testReportRMId && mainTestData.testReportRMId.trim() !== '') {

            let testRMModel = await testReportRMModel(dbYear);
            let testRMDataModel = await testReportRMDataMappingModel(dbYear);

            const updatedTestReport = await testRMModel.findByIdAndUpdate(
                mainTestData.testReportRMId,
                mainTestData,
                { new: true, runValidators: true }
            );

            if (!updatedTestReport) {
                res.status(200).json({
                    data: {
                        statusCode: 404,
                        Message: "Test report not found",
                        responseData: null,
                        isEnType: true,
                    },
                });
            }

            if (tableData && Array.isArray(tableData)) {
                await testRMDataModel.deleteMany({
                    testReportRMId: mainTestData.testReportRMId
                });

                // Insert new test details
                if (tableData.length > 0) {
                    const testDetailsWithRef = tableData.map(detail => ({
                        ...detail,
                        testReportRMId: mainTestData.testReportRMId
                    }));
                    await testRMDataModel.insertMany(testDetailsWithRef);
                }
            }

            const completeData = {
                ...updatedTestReport.toObject(),
                testDetails: await testRMDataModel.find({
                    testReportRMId: mainTestData.testReportRMId
                })
            };

            let encryptData = encryptionAPI(completeData, 1);
            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Test report updated successfully",
                    responseData: encryptData,
                    isEnType: true,
                },
            });
        } else {
            let testRMModel = await testReportRMModel(dbYear);
            const testRMDataModel = await testReportRMDataMappingModel(dbYear);

            const newTestReport = new testRMModel(mainTestData);
            const savedTestReport = await newTestReport.save();

            let savedTestDetails = [];
            if (tableData && Array.isArray(tableData) && tableData.length > 0) {
                const testDetailsWithRef = tableData.map(detail => ({
                    ...detail,
                    testReportRMId: savedTestReport._id
                }));
                savedTestDetails = await testRMDataModel.insertMany(testDetailsWithRef);
            }

            const completeData = {
                ...savedTestReport.toObject(),
                testDetails: savedTestDetails
            };

            let encryptData = encryptionAPI(completeData, 1);
            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Test report added successfully",
                    responseData: encryptData,
                    isEnType: true,
                },
            });
        }

    } catch (error) {
        console.log("Error in addEditRawMaterialTestReport Api", error);
        errorHandler(error, req, res, "Error in addEditRawMaterialTestReport Api")
    }
};

const getAllRawMaterialTestReportEntry = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;

        const { id, id1 } = req.query;
        let globalSearch = getRequestData(id)
        let materialId = getRequestData(id1)

        let queryObject = {
            isDeleted: false,
        }

        let testRMModel = await testReportRMModel(dbYear);
        let response = await testRMModel.aggregate([
            { $match: queryObject },
            {
                $lookup: {
                    from: "sampleentryrms",
                    localField: "sampleEntryRMId",
                    foreignField: "_id",
                    as: "sampleEntry"
                }
            },
            {
                $unwind: {
                    path: "$sampleEntry",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "rawmaterialmasters",
                    localField: "sampleEntry.rmId",
                    foreignField: "_id",
                    as: "rawMaterial"
                }
            },
            {
                $unwind: {
                    path: "$rawMaterial",
                    preserveNullAndEmptyArrays: true
                }
            },
            ...(materialId ? [{
                $match: {
                    "rawMaterial._id": new ObjectId(materialId)
                }
            }] : []),
            ...(globalSearch ? [{
                $match: {
                    $or: [
                        { reportNo: { $regex: globalSearch, $options: "i" } },
                        { "rawMaterial.rmName": { $regex: globalSearch, $options: "i" } }
                    ]
                }
            }] : []),
            {
                $project: {
                    testReportRMId: "$_id",
                    _id: 0,
                    reportNo: 1,
                    reportDate: {
                        $cond: [
                            { $ifNull: ["$reportDate", false] },
                            {
                                $dateToString: {
                                    format: "%d-%m-%Y",
                                    date: "$reportDate",
                                    timezone: "Asia/Kolkata"
                                }
                            },
                            null
                        ]
                    },
                    itemName: "$rawMaterial.rmName"
                }
            }
        ]);

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Raw material sample entry fatched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in getAllRawMaterialSampleEntry Api", error);
        errorHandler(error, req, res, "Error in getAllRawMaterialSampleEntry Api")
    }
};

const getRawMaterialTestEntryDetailsById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let testReportRMId = getRequestData(id)

        let gepdModel = await testReportRMModel(dbYear);
        let testReportRMDataMapping = await testReportRMDataMappingModel(dbYear);
        let responseItem = await gepdModel.aggregate([
            {
                $match: {
                    isDeleted: false,
                    _id: new ObjectId(testReportRMId)
                }
            },
            {
                $lookup: {
                    from: "sampleentryrms",
                    localField: "sampleEntryRMId",
                    foreignField: "_id",
                    as: "sampleEntry"
                }
            },
            {
                $unwind: {
                    path: "$sampleEntry",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $lookup: {
                    from: "rawmaterialmasters",
                    localField: "sampleEntry.rmId",
                    foreignField: "_id",
                    as: "materialdata"
                }
            },
            {
                $unwind: {
                    path: "$materialdata",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $lookup: {
                    from: "accountmasters",
                    localField: "sampleEntry.supplierId",
                    foreignField: "_id",
                    as: "partyData"
                }
            },
            {
                $unwind: {
                    path: "$partyData",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $project: {
                    reportNo: 1,
                    reportDate: {
                        $cond: [
                            { $ifNull: ["$reportDate", false] },
                            {
                                $dateToString: {
                                    format: "%Y-%m-%d",
                                    date: "$reportDate",
                                    timezone: "Asia/Kolkata"
                                }
                            },
                            null
                        ]
                    },
                    analyst: 1,
                    labIncharge: 1,
                    sampleEntryRMId: 1,
                    refNo: "$sampleEntry.refNo",
                    batchNo: "$sampleEntry.batchNo",
                    mfgBy: "$sampleEntry.mfgBy",
                    grnId: "$sampleEntry.grnId",
                    labName: "$sampleEntry.labName",
                    purchaseQty: "$sampleEntry.purchaseQty",
                    materialName: "$materialdata.rmName",
                    partyName: "$partyData.partyName",
                }
            },
        ]);

        let response = responseItem[0] || null;
        if (!response) {
            return res.status(200).json({
                data: {
                    statusCode: 404,
                    Message: "Test report not found",
                    responseData: null,
                    isEnType: true
                },
            });
        }

        let tableData = await testReportRMDataMapping.aggregate([
            {
                $match: {
                    isDeleted: false,
                    testReportRMId: new ObjectId(testReportRMId)
                }
            },
            {
                $lookup: {
                    from: "monograms",
                    localField: "monogramId",
                    foreignField: "_id",
                    as: "monogramData"
                }
            },
            {
                $unwind: {
                    path: "$monogramData",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    testName: 1,
                    result: 1,
                    limit: 1,
                    monogramId: 1,
                    monogramData: 1,
                }
            }
        ]);

        let responseWithTable = {
            ...response,
            tableData: tableData
        };
        let responseData = encryptionAPI(responseWithTable, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetch successfully",
                responseData: responseData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in getRawMaterialTestEntryDetailsById Api", error);
        errorHandler(error, req, res, "Error in getRawMaterialTestEntryDetailsById Api")
    }
};

const deleteRawMaterialTestEntryById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let testReportRMId = getRequestData(id)
        let testRMDataModel = await testReportRMDataMappingModel(dbYear);

        let gepdModel = await testReportRMModel(dbYear);
        let response = await gepdModel.findOneAndUpdate(
            { _id: testReportRMId, isDeleted: false },
            { $set: { isDeleted: true } },
            { new: true }
        );

        await testRMDataModel.deleteMany({
            testReportRMId: testReportRMId
        });

        let responseData = encryptionAPI(response, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Deleted successfully",
                responseData: responseData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in deleteRawMaterialTestEntryById Api", error);
        errorHandler(error, req, res, "Error in deleteRawMaterialTestEntryById Api")
    }
};

// Packing Material Test Report Entry
const getAllPeningPackingMaterialSampleEntry = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;

        let queryObject = {
            isDeleted: false,
        }
        let samplePMModel = await sampleEntryPMModel(dbYear);
        let testReportModel = await testReportPMModel(dbYear);

        let usedSampleIds = await testReportModel.distinct("sampleEntryPMId", {
            isDeleted: false,
            sampleEntryPMId: { $ne: null }
        });

        let response = await samplePMModel.aggregate([
            {
                $match: {
                    ...queryObject,
                    _id: { $nin: usedSampleIds }
                }
            },
            {
                $lookup: {
                    from: "accountmasters",
                    localField: "supplierId",
                    foreignField: "_id",
                    as: "party"
                }
            },
            {
                $unwind: {
                    path: "$party",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "packingmaterialmasters",
                    localField: "pmId",
                    foreignField: "_id",
                    as: "material"
                }
            },
            {
                $unwind: {
                    path: "$material",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    sampleEntryPMId: "$_id",
                    _id: 0,
                    refNo: 1,
                    refDate: {
                        $cond: [
                            { $ifNull: ["$refDate", false] },
                            {
                                $dateToString: {
                                    format: "%d-%m-%Y",
                                    date: "$refDate",
                                    timezone: "Asia/Kolkata"
                                }
                            },
                            null
                        ]
                    },
                    batchNo: 1,
                    partyName: "$party.partyName",
                    materialName: "$material.pmName",
                    grnNo: 1
                }
            }
        ]);

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Packing material sample entry fatched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in getAllPeningPackingMaterialSampleEntry Api", error);
        errorHandler(error, req, res, "Error in getAllPeningPackingMaterialSampleEntry Api")
    }
};

const addEditPackingMaterialTestReport = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')

        const { tableData, ...mainTestData } = data;

        if (mainTestData.testReportPMId && mainTestData.testReportPMId.trim() !== '') {

            let testPMModel = await testReportPMModel(dbYear);
            let testPMDataModel = await testReportPMDataMappingModel(dbYear);

            const updatedTestReport = await testPMModel.findByIdAndUpdate(
                mainTestData.testReportPMId,
                mainTestData,
                { new: true, runValidators: true }
            );

            if (!updatedTestReport) {
                res.status(200).json({
                    data: {
                        statusCode: 404,
                        Message: "Test report not found",
                        responseData: null,
                        isEnType: true,
                    },
                });
            }

            if (tableData && Array.isArray(tableData)) {
                await testPMDataModel.deleteMany({
                    testReportPMId: mainTestData.testReportPMId
                });

                // Insert new test details
                if (tableData.length > 0) {
                    const testDetailsWithRef = tableData.map(detail => ({
                        ...detail,
                        testReportPMId: mainTestData.testReportPMId
                    }));
                    await testPMDataModel.insertMany(testDetailsWithRef);
                }
            }

            const completeData = {
                ...updatedTestReport.toObject(),
                testDetails: await testPMDataModel.find({
                    testReportPMId: mainTestData.testReportPMId
                })
            };

            let encryptData = encryptionAPI(completeData, 1);
            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Test report updated successfully",
                    responseData: encryptData,
                    isEnType: true,
                },
            });
        } else {
            let testPMModel = await testReportPMModel(dbYear);
            const testPMDataModel = await testReportPMDataMappingModel(dbYear);

            const newTestReport = new testPMModel(mainTestData);
            const savedTestReport = await newTestReport.save();

            let savedTestDetails = [];
            if (tableData && Array.isArray(tableData) && tableData.length > 0) {
                const testDetailsWithRef = tableData.map(detail => ({
                    ...detail,
                    testReportPMId: savedTestReport._id
                }));
                savedTestDetails = await testPMDataModel.insertMany(testDetailsWithRef);
            }

            const completeData = {
                ...savedTestReport.toObject(),
                testDetails: savedTestDetails
            };

            let encryptData = encryptionAPI(completeData, 1);
            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Test report added successfully",
                    responseData: encryptData,
                    isEnType: true,
                },
            });
        }

    } catch (error) {
        console.log("Error in addEditPackingMaterialTestReport Api", error);
        errorHandler(error, req, res, "Error in addEditPackingMaterialTestReport Api")
    }
};

const getAllPackingMaterialTestReportEntry = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;

        const { id, id1 } = req.query;
        let globalSearch = getRequestData(id)
        let materialId = getRequestData(id1)

        let queryObject = {
            isDeleted: false,
        }

        let testPMModel = await testReportPMModel(dbYear);
        let response = await testPMModel.aggregate([
            { $match: queryObject },
            {
                $lookup: {
                    from: "sampleentrypms",
                    localField: "sampleEntryPMId",
                    foreignField: "_id",
                    as: "sampleEntry"
                }
            },
            {
                $unwind: {
                    path: "$sampleEntry",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "packingmaterialmasters",
                    localField: "sampleEntry.pmId",
                    foreignField: "_id",
                    as: "packingMaterial"
                }
            },
            {
                $unwind: {
                    path: "$packingMaterial",
                    preserveNullAndEmptyArrays: true
                }
            },
            ...(materialId ? [{
                $match: {
                    "packingMaterial._id": new ObjectId(materialId)
                }
            }] : []),
            ...(globalSearch ? [{
                $match: {
                    $or: [
                        { reportNo: { $regex: globalSearch, $options: "i" } },
                        { "packingMaterial.pmName": { $regex: globalSearch, $options: "i" } }
                    ]
                }
            }] : []),
            {
                $project: {
                    testReportPMId: "$_id",
                    _id: 0,
                    reportNo: 1,
                    reportDate: {
                        $cond: [
                            { $ifNull: ["$reportDate", false] },
                            {
                                $dateToString: {
                                    format: "%d-%m-%Y",
                                    date: "$reportDate",
                                    timezone: "Asia/Kolkata"
                                }
                            },
                            null
                        ]
                    },
                    itemName: "$packingMaterial.pmName"
                }
            }
        ]);

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Packing material sample entry fatched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in getAllPackingMaterialTestReportEntry Api", error);
        errorHandler(error, req, res, "Error in getAllPackingMaterialTestReportEntry Api")
    }
};

const getPackingMaterialTestEntryDetailsById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let testReportPMId = getRequestData(id)

        let gepdModel = await testReportPMModel(dbYear);
        let testReportPMDataMapping = await testReportPMDataMappingModel(dbYear);
        let responseItem = await gepdModel.aggregate([
            {
                $match: {
                    isDeleted: false,
                    _id: new ObjectId(testReportPMId)
                }
            },
            {
                $lookup: {
                    from: "sampleentrypms",
                    localField: "sampleEntryPMId",
                    foreignField: "_id",
                    as: "sampleEntry"
                }
            },
            {
                $unwind: {
                    path: "$sampleEntry",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $lookup: {
                    from: "packingmaterialmasters",
                    localField: "sampleEntry.pmId",
                    foreignField: "_id",
                    as: "materialdata"
                }
            },
            {
                $unwind: {
                    path: "$materialdata",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $lookup: {
                    from: "accountmasters",
                    localField: "sampleEntry.supplierId",
                    foreignField: "_id",
                    as: "partyData"
                }
            },
            {
                $unwind: {
                    path: "$partyData",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $project: {
                    reportNo: 1,
                    reportDate: {
                        $cond: [
                            { $ifNull: ["$reportDate", false] },
                            {
                                $dateToString: {
                                    format: "%Y-%m-%d",
                                    date: "$reportDate",
                                    timezone: "Asia/Kolkata"
                                }
                            },
                            null
                        ]
                    },
                    analyst: 1,
                    labIncharge: 1,
                    sampleEntryPMId: 1,
                    refNo: "$sampleEntry.refNo",
                    batchNo: "$sampleEntry.batchNo",
                    mfgBy: "$sampleEntry.mfgBy",
                    grnId: "$sampleEntry.grnId",
                    labName: "$sampleEntry.labName",
                    purchaseQty: "$sampleEntry.purchaseQty",
                    materialName: "$materialdata.pmName",
                    partyName: "$partyData.partyName",
                }
            },
        ]);

        let response = responseItem[0] || null;
        if (!response) {
            return res.status(200).json({
                data: {
                    statusCode: 404,
                    Message: "Test report not found",
                    responseData: null,
                    isEnType: true
                },
            });
        }

        let tableData = await testReportPMDataMapping.aggregate([
            {
                $match: {
                    isDeleted: false,
                    testReportPMId: new ObjectId(testReportPMId)
                }
            },
            {
                $lookup: {
                    from: "monograms",
                    localField: "monogramId",
                    foreignField: "_id",
                    as: "monogramData"
                }
            },
            {
                $unwind: {
                    path: "$monogramData",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    testName: 1,
                    result: 1,
                    limit: 1,
                    monogramId: 1,
                    monogramData: 1,
                }
            }
        ]);

        let responseWithTable = {
            ...response,
            tableData: tableData
        };
        let responseData = encryptionAPI(responseWithTable, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetch successfully",
                responseData: responseData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in getPackingMaterialTestEntryDetailsById Api", error);
        errorHandler(error, req, res, "Error in getPackingMaterialTestEntryDetailsById Api")
    }
};

const deletePackingMaterialTestEntryById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let testReportPMId = getRequestData(id)
        let testPMDataModel = await testReportPMDataMappingModel(dbYear);

        let gepdModel = await testReportPMModel(dbYear);
        let response = await gepdModel.findOneAndUpdate(
            { _id: testReportPMId, isDeleted: false },
            { $set: { isDeleted: true } },
            { new: true }
        );

        await testPMDataModel.deleteMany({
            testReportPMId: testReportPMId
        });

        let responseData = encryptionAPI(response, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Deleted successfully",
                responseData: responseData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in deletePackingMaterialTestEntryById Api", error);
        errorHandler(error, req, res, "Error in deletePackingMaterialTestEntryById Api")
    }
};

// Finish Goods Test Report Entry
const getAllPeningFinishGoodsSampleEntry = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;

        let queryObject = {
            isDeleted: false,
        }
        let sampleFGModel = await sampleEntryFGModel(dbYear);
        let testReportModel = await testReportFGModel(dbYear);

        let usedSampleIds = await testReportModel.distinct("sampleEntryFGId", {
            isDeleted: false,
            sampleEntryFGId: { $ne: null }
        });

        let response = await sampleFGModel.aggregate([
            {
                $match: {
                    ...queryObject,
                    _id: { $nin: usedSampleIds }
                }
            },
            {
                $lookup: {
                    from: "accountmasters",
                    localField: "supplierId",
                    foreignField: "_id",
                    as: "party"
                }
            },
            {
                $unwind: {
                    path: "$party",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "productmasters",
                    localField: "productId",
                    foreignField: "_id",
                    as: "productData"
                }
            },
            {
                $unwind: {
                    path: "$productData",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    sampleEntryFGId: "$_id",
                    _id: 0,
                    refNo: 1,
                    refDate: {
                        $cond: [
                            { $ifNull: ["$refDate", false] },
                            {
                                $dateToString: {
                                    format: "%d-%m-%Y",
                                    date: "$refDate",
                                    timezone: "Asia/Kolkata"
                                }
                            },
                            null
                        ]
                    },
                    batchNo: 1,
                    partyName: "$party.partyName",
                    materialName: "$productData.productName"
                }
            }
        ]);

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Finish goods sample entry fatched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in getAllPeningFinishGoodsSampleEntry Api", error);
        errorHandler(error, req, res, "Error in getAllPeningFinishGoodsSampleEntry Api")
    }
};

const addEditFinishGoodsTestReport = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')

        const { tableData, ...mainTestData } = data;

        if (mainTestData.testReportFGId && mainTestData.testReportFGId.trim() !== '') {

            let testFGModel = await testReportFGModel(dbYear);
            let testFGDataModel = await testReportFGDataMappingModel(dbYear);

            const updatedTestReport = await testFGModel.findByIdAndUpdate(
                mainTestData.testReportFGId,
                mainTestData,
                { new: true, runValidators: true }
            );

            if (!updatedTestReport) {
                res.status(200).json({
                    data: {
                        statusCode: 404,
                        Message: "Test report not found",
                        responseData: null,
                        isEnType: true,
                    },
                });
            }

            if (tableData && Array.isArray(tableData)) {
                await testFGDataModel.deleteMany({
                    testReportFGId: mainTestData.testReportFGId
                });

                // Insert new test details
                if (tableData.length > 0) {
                    const testDetailsWithRef = tableData.map(detail => ({
                        ...detail,
                        testReportFGId: mainTestData.testReportFGId
                    }));
                    await testFGDataModel.insertMany(testDetailsWithRef);
                }
            }

            const completeData = {
                ...updatedTestReport.toObject(),
                testDetails: await testFGDataModel.find({
                    testReportFGId: mainTestData.testReportFGId
                })
            };

            let encryptData = encryptionAPI(completeData, 1);
            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Test report updated successfully",
                    responseData: encryptData,
                    isEnType: true,
                },
            });
        } else {
            let testFGModel = await testReportFGModel(dbYear);
            const testFGDataModel = await testReportFGDataMappingModel(dbYear);

            const newTestReport = new testFGModel(mainTestData);
            const savedTestReport = await newTestReport.save();

            let savedTestDetails = [];
            if (tableData && Array.isArray(tableData) && tableData.length > 0) {
                const testDetailsWithRef = tableData.map(detail => ({
                    ...detail,
                    testReportFGId: savedTestReport._id
                }));
                savedTestDetails = await testFGDataModel.insertMany(testDetailsWithRef);
            }

            const completeData = {
                ...savedTestReport.toObject(),
                testDetails: savedTestDetails
            };

            let encryptData = encryptionAPI(completeData, 1);
            res.status(200).json({
                data: {
                    statusCode: 200,
                    Message: "Test report added successfully",
                    responseData: encryptData,
                    isEnType: true,
                },
            });
        }

    } catch (error) {
        console.log("Error in addEditFinishGoodsTestReport Api", error);
        errorHandler(error, req, res, "Error in addEditFinishGoodsTestReport Api")
    }
};

const getAllFinishGoodsTestReportEntry = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;

        const { id, id1 } = req.query;
        let globalSearch = getRequestData(id)
        let materialId = getRequestData(id1)

        let queryObject = {
            isDeleted: false,
        }

        let testFGModel = await testReportFGModel(dbYear);
        let response = await testFGModel.aggregate([
            { $match: queryObject },
            {
                $lookup: {
                    from: "sampleentryfgs",
                    localField: "sampleEntryFGId",
                    foreignField: "_id",
                    as: "sampleEntry"
                }
            },
            {
                $unwind: {
                    path: "$sampleEntry",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "productmasters",
                    localField: "sampleEntry.productId",
                    foreignField: "_id",
                    as: "productData"
                }
            },
            {
                $unwind: {
                    path: "$productData",
                    preserveNullAndEmptyArrays: true
                }
            },
            ...(materialId ? [{
                $match: {
                    "productData._id": new ObjectId(materialId)
                }
            }] : []),
            ...(globalSearch ? [{
                $match: {
                    $or: [
                        { reportNo: { $regex: globalSearch, $options: "i" } },
                        { "productData.productName": { $regex: globalSearch, $options: "i" } }
                    ]
                }
            }] : []),
            {
                $project: {
                    testReportFGId: "$_id",
                    _id: 0,
                    reportNo: 1,
                    reportDate: {
                        $cond: [
                            { $ifNull: ["$reportDate", false] },
                            {
                                $dateToString: {
                                    format: "%d-%m-%Y",
                                    date: "$reportDate",
                                    timezone: "Asia/Kolkata"
                                }
                            },
                            null
                        ]
                    },
                    itemName: "$productData.productName"
                }
            }
        ]);

        let encryptData = encryptionAPI(response, 1)

        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Finish goods test report entry fetched successfully",
                responseData: encryptData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in getAllFinishGoodsTestReportEntry Api", error);
        errorHandler(error, req, res, "Error in getAllFinishGoodsTestReportEntry Api")
    }
};

const getFinishGoodsTestEntryDetailsById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let testReportFGId = getRequestData(id)

        let gepdModel = await testReportFGModel(dbYear);
        let testReportFGDataMapping = await testReportFGDataMappingModel(dbYear);
        let responseItem = await gepdModel.aggregate([
            {
                $match: {
                    isDeleted: false,
                    _id: new ObjectId(testReportFGId)
                }
            },
            {
                $lookup: {
                    from: "sampleentryfgs",
                    localField: "sampleEntryFGId",
                    foreignField: "_id",
                    as: "sampleEntry"
                }
            },
            {
                $unwind: {
                    path: "$sampleEntry",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $lookup: {
                    from: "productmasters",
                    localField: "sampleEntry.productId",
                    foreignField: "_id",
                    as: "productData"
                }
            },
            {
                $unwind: {
                    path: "$productData",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $lookup: {
                    from: "accountmasters",
                    localField: "sampleEntry.supplierId",
                    foreignField: "_id",
                    as: "partyData"
                }
            },
            {
                $unwind: {
                    path: "$partyData",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $project: {
                    reportNo: 1,
                    reportDate: {
                        $cond: [
                            { $ifNull: ["$reportDate", false] },
                            {
                                $dateToString: {
                                    format: "%Y-%m-%d",
                                    date: "$reportDate",
                                    timezone: "Asia/Kolkata"
                                }
                            },
                            null
                        ]
                    },
                    analyst: 1,
                    labIncharge: 1,
                    sampleEntryFGId: 1,
                    refNo: "$sampleEntry.refNo",
                    batchNo: "$sampleEntry.batchNo",
                    mfgBy: "$sampleEntry.mfgBy",
                    productionId: "$sampleEntry.productionId",
                    labName: "$sampleEntry.labName",
                    batchSize: "$sampleEntry.batchSize",
                    materialName: "$productData.productName",
                    partyName: "$partyData.partyName",
                }
            },
        ]);

        let response = responseItem[0] || null;
        if (!response) {
            return res.status(200).json({
                data: {
                    statusCode: 404,
                    Message: "Test report not found",
                    responseData: null,
                    isEnType: true
                },
            });
        }

        let tableData = await testReportFGDataMapping.aggregate([
            {
                $match: {
                    isDeleted: false,
                    testReportFGId: new ObjectId(testReportFGId)
                }
            },
            {
                $lookup: {
                    from: "monograms",
                    localField: "monogramId",
                    foreignField: "_id",
                    as: "monogramData"
                }
            },
            {
                $unwind: {
                    path: "$monogramData",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    testName: 1,
                    result: 1,
                    limit: 1,
                    monogramId: 1,
                    monogramData: 1,
                }
            }
        ]);

        let responseWithTable = {
            ...response,
            tableData: tableData
        };
        let responseData = encryptionAPI(responseWithTable, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Data fetch successfully",
                responseData: responseData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in getFinishGoodsTestEntryDetailsById Api", error);
        errorHandler(error, req, res, "Error in getFinishGoodsTestEntryDetailsById Api")
    }
};

const deleteFinishGoodsTestEntryById = async (req, res) => {
    try {
        let dbYear = req.cookies["dbyear"] || req.headers.dbyear;
        const { id } = req.query;
        let testReportFGId = getRequestData(id)
        let testFGDataModel = await testReportFGDataMappingModel(dbYear);

        let gepdModel = await testReportFGModel(dbYear);
        let response = await gepdModel.findOneAndUpdate(
            { _id: testReportFGId, isDeleted: false },
            { $set: { isDeleted: true } },
            { new: true }
        );

        await testFGDataModel.deleteMany({
            testReportFGId: testReportFGId
        });

        let responseData = encryptionAPI(response, 1)
        res.status(200).json({
            data: {
                statusCode: 200,
                Message: "Deleted successfully",
                responseData: responseData,
                isEnType: true
            },
        });

    } catch (error) {
        console.log("Error in deleteFinishGoodsTestEntryById Api", error);
        errorHandler(error, req, res, "Error in deleteFinishGoodsTestEntryById Api")
    }
};

export {
    getGRNItemsByGRNNo,

    getRawMaterialSampleEntryCount,
    addEditRawMaterialSampleEntry,
    getAllRawMaterialSampleEntry,
    getRawMaterialSampleEntryDetailsById,
    deleteRawMaterialSampleEntryById,

    getPackingMaterialSampleEntryCount,
    addEditPackingMaterialSampleEntry,
    getAllPackingMaterialSampleEntry,
    getPackingMaterialSampleEntryDetailsById,
    deletePackingMaterialSampleEntryById,

    getFinishGoodsSampleEntryCount,
    getProductionItemsByProductionNo,
    addEditFinishGoodsSampleEntry,
    getAllFinishGoodsSampleEntry,
    getFinishGoodsSampleEntryDetailsById,
    deleteFinishGoodsSampleEntryById,

    getAllPeningRawMaterialSampleEntry,
    addEditRawMaterialTestReport,
    getAllRawMaterialTestReportEntry,
    getRawMaterialTestEntryDetailsById,
    deleteRawMaterialTestEntryById,

    getAllPeningPackingMaterialSampleEntry,
    addEditPackingMaterialTestReport,
    getAllPackingMaterialTestReportEntry,
    getPackingMaterialTestEntryDetailsById,
    deletePackingMaterialTestEntryById,

    getAllPeningFinishGoodsSampleEntry,
    addEditFinishGoodsTestReport,
    getAllFinishGoodsTestReportEntry,
    getFinishGoodsTestEntryDetailsById,
    deleteFinishGoodsTestEntryById
}