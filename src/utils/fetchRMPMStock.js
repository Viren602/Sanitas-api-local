import gstInvoicePMItemModel from "../model/Despatch/gstInvoicePMItemsModel.js";
import gstinvoiceRMItemModel from "../model/Despatch/gstInvoiceRMItemsModel.js";
import additionalEntryMaterialDetailsModel from "../model/InventoryModels/additionalEntryMaterialDetailsModel.js";
import grnEntryMaterialDetailsModel from "../model/InventoryModels/grnEntryMaterialDetailsModel.js";
import PackingRequisitionPMFormulaModel from "../model/InventoryModels/packingRequisitionPMFormulaModel.js";
import ProductionRequisitionRMFormulaModel from "../model/InventoryModels/productionRequisitionRMFormulaModel.js";
import monoGramModel from "../model/monogramModel.js";
import sampleEntryPMModel from "../model/QC/sampleEntryPM.js";
import sampleEntryRMModel from "../model/QC/sampleEntryRM.js";
import mongoose from "mongoose";
import rawMaterialSchema from "../model/rawMaterialModel.js";
import packingMaterialSchema from "../model/packingMaterialModel.js";
const { ObjectId } = mongoose.Types;

export const fetchAllRecords = async (dbYear, item, materialType, options = {}) => {
    // 1. GRN Records
    let isLabTestRequire = false;
    if (materialType === 'Raw Material') {
        let rawMaterialModel = await rawMaterialSchema(dbYear)
        const rm = await rawMaterialModel.findOne(
            { _id: item._id },
            { labTestRequire: 1 }
        );
        isLabTestRequire = rm?.labTestRequire ?? false;
    } else if (materialType === 'Packing Material') {
        let packingMaterialModel = await packingMaterialSchema(dbYear)
        const pm = await packingMaterialModel.findOne(
            { _id: item._id },
            { labTestRequire: 1 }
        );
        isLabTestRequire = pm?.labTestRequire ?? false;
    }

    let grnRecords = [];
    if (options.grnRecords) {
        grnRecords = options.grnRecords;
    } else {
        const grnQueryObject = { isDeleted: false };

        if (materialType === "Raw Material") {
            grnQueryObject.rawMaterialId = item._id;
        }
        if (materialType === "Packing Material") {
            grnQueryObject.packageMaterialId = item._id;
        }

        if (isLabTestRequire === true) {
            const SamplePMModel = await sampleEntryPMModel(dbYear);
            const SampleModel = await sampleEntryRMModel(dbYear);

            let sampleFilter = { isDeleted: false };

            if (materialType === "Raw Material") {
                sampleFilter.rmId = new ObjectId(item._id);

                const grnInwardRecords = await SampleModel.aggregate([
                    {
                        $match: sampleFilter
                    },
                    {
                        $lookup: {
                            from: "testreportrms",
                            let: { sampleEntryRMId: "$_id" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                { $eq: ["$sampleEntryRMId", "$$sampleEntryRMId"] },
                                                { $eq: ["$isDeleted", false] }
                                            ]
                                        }
                                    }
                                }
                            ],
                            as: "testReport"
                        }
                    },
                    {
                        $match: {
                            "testReport.0": { $exists: true }
                        }
                    },
                    {
                        $lookup: {
                            from: "grnentrypartydetails",
                            localField: "grnId",
                            foreignField: "_id",
                            as: "grnId"
                        }
                    },
                    { $unwind: { path: "$grnId", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "accountmasters",
                            localField: "grnId.partyId",
                            foreignField: "_id",
                            as: "party"
                        }
                    },
                    { $unwind: { path: "$party", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "rawmaterialmasters",
                            localField: "rmId",
                            foreignField: "_id",
                            as: "rm"
                        }
                    },
                    { $unwind: { path: "$rm", preserveNullAndEmptyArrays: true } },
                    {
                        $project: {
                            _id: 0,
                            qty: "$purchaseQty",
                            grnNo: "$grnId.grnNo",
                            grnDate: "$grnId.grnDate",
                            invoiceNo: "$grnId.invoiceNo",
                            partyName: "$party.partyName",
                            batchNo: "$batchNo",
                            isMonogramRecord: { $literal: true },
                            isInwardRecord: { $literal: true },
                            updatedAt: 1
                        }
                    }
                ]);

                const qcSampleRecords = await SampleModel.aggregate([
                    {
                        $match: sampleFilter
                    },
                    {
                        $lookup: {
                            from: "testreportrms",
                            let: { sampleEntryRMId: "$_id" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                { $eq: ["$sampleEntryRMId", "$$sampleEntryRMId"] },
                                                { $eq: ["$isDeleted", false] }
                                            ]
                                        }
                                    }
                                }
                            ],
                            as: "testReport"
                        }
                    },
                    {
                        $match: {
                            "testReport.0": { $exists: true }
                        }
                    },
                    {
                        $lookup: {
                            from: "grnentrypartydetails",
                            localField: "grnId",
                            foreignField: "_id",
                            as: "grnId"
                        }
                    },
                    { $unwind: { path: "$grnId", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "accountmasters",
                            localField: "grnId.partyId",
                            foreignField: "_id",
                            as: "party"
                        }
                    },
                    { $unwind: { path: "$party", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "rawmaterialmasters",
                            localField: "rmId",
                            foreignField: "_id",
                            as: "rm"
                        }
                    },
                    { $unwind: { path: "$rm", preserveNullAndEmptyArrays: true } },
                    {
                        $project: {
                            _id: 0,
                            issueQty: "$sampleQty",
                            grnNo: "$refNo",
                            grnDate: "$refDate",
                            invoiceNo: { $literal: "QC_SAMPLE" },
                            isIssuedRecord: { $literal: true },
                            partyName: "$party.partyName",
                            batchNo: "$batchNo",
                            isMonogramRecord: { $literal: true },
                            isInwardRecord: { $literal: true },
                            updatedAt: 1,
                            isQCEntryRecord: { $literal: true },
                        }
                    }
                ]);

                grnRecords = [...grnInwardRecords, ...qcSampleRecords];
            } else if (materialType === "Packing Material") {
                sampleFilter.pmId = new ObjectId(item._id);
                const grnInwardRecords = await SamplePMModel.aggregate([
                    {
                        $match: sampleFilter
                    },
                    {
                        $lookup: {
                            from: "testreportpms",
                            let: { sampleEntryPMId: "$_id" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                { $eq: ["$sampleEntryPMId", "$$sampleEntryPMId"] },
                                                { $eq: ["$isDeleted", false] }
                                            ]
                                        }
                                    }
                                }
                            ],
                            as: "testReport"
                        }
                    },
                    {
                        $match: {
                            "testReport.0": { $exists: true }
                        }
                    },
                    {
                        $lookup: {
                            from: "grnentrypartydetails",
                            localField: "grnId",
                            foreignField: "_id",
                            as: "grnId"
                        }
                    },
                    { $unwind: { path: "$grnId", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "accountmasters",
                            localField: "grnId.partyId",
                            foreignField: "_id",
                            as: "party"
                        }
                    },
                    { $unwind: { path: "$party", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "packingmaterialmasters",
                            localField: "pmId",
                            foreignField: "_id",
                            as: "pm"
                        }
                    },
                    { $unwind: { path: "$pm", preserveNullAndEmptyArrays: true } },
                    {
                        $project: {
                            _id: 0,
                            qty: "$purchaseQty",
                            grnNo: "$grnId.grnNo",
                            grnDate: "$grnId.grnDate",
                            partyName: "$party.partyName",
                            invoiceNo: "$grnId.invoiceNo",
                            batchNo: "$batchNo",
                            isMonogramRecord: { $literal: true },
                            isInwardRecord: { $literal: true },
                            updatedAt: 1
                        }
                    }
                ]);

                const qcSampleRecords = await SamplePMModel.aggregate([
                    {
                        $match: sampleFilter
                    },
                    {
                        $lookup: {
                            from: "testreportpms",
                            let: { sampleEntryPMId: "$_id" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                { $eq: ["$sampleEntryPMId", "$$sampleEntryPMId"] },
                                                { $eq: ["$isDeleted", false] }
                                            ]
                                        }
                                    }
                                }
                            ],
                            as: "testReport"
                        }
                    },
                    {
                        $match: {
                            "testReport.0": { $exists: true }
                        }
                    },
                    {
                        $lookup: {
                            from: "grnentrypartydetails",
                            localField: "grnId",
                            foreignField: "_id",
                            as: "grnId"
                        }
                    },
                    { $unwind: { path: "$grnId", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "accountmasters",
                            localField: "grnId.partyId",
                            foreignField: "_id",
                            as: "party"
                        }
                    },
                    { $unwind: { path: "$party", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "packingmaterialmasters",
                            localField: "pmId",
                            foreignField: "_id",
                            as: "pm"
                        }
                    },
                    { $unwind: { path: "$pm", preserveNullAndEmptyArrays: true } },
                    {
                        $project: {
                            _id: 0,
                            issueQty: "$sampleQty",
                            grnNo: "$refNo",
                            grnDate: "$refDate",
                            partyName: "$party.partyName",
                            invoiceNo: { $literal: "QC_SAMPLE" },
                            batchNo: "$batchNo",
                            isMonogramRecord: { $literal: true },
                            isInwardRecord: { $literal: true },
                            updatedAt: 1,
                            isQCEntryRecord: { $literal: true },
                        }
                    }
                ]);
                grnRecords = [...grnInwardRecords, ...qcSampleRecords];
            }

        } else {
            const gemDetailsModel = await grnEntryMaterialDetailsModel(dbYear);

            grnRecords = await gemDetailsModel
                .find(grnQueryObject)
                .populate({ path: "rawMaterialId", select: "rmName rmCategory" })
                .populate({ path: "packageMaterialId", select: "pmName pmCategory" })
                .populate({
                    path: "grnEntryPartyDetailId",
                    select: "partyId grnNo grnDate invoiceNo",
                    populate: {
                        path: "partyId",
                        select: "partyName"
                    }
                });

            grnRecords = grnRecords.map(x => ({
                ...x._doc,
                qty: x.qty,
                isGRNRecord: true,
                isInwardRecord: true
            }));
            // grnRecords = await gemDetailsModel.aggregate([
            //     {
            //         $match: grnQueryObject
            //     },

            //     // ---------- RAW MATERIAL ----------
            //     // {
            //     //     $lookup: {
            //     //         from: "RawMaterialMasters",
            //     //         localField: "rawMaterialId",
            //     //         foreignField: "_id",
            //     //         as: "rawMaterialId"
            //     //     }
            //     // },
            //     // {
            //     //     $unwind: {
            //     //         path: "$rawMaterialId",
            //     //         preserveNullAndEmptyArrays: true
            //     //     }
            //     // },

            //     // // ---------- PACKING MATERIAL ----------
            //     // {
            //     //     $lookup: {
            //     //         from: "PackingMaterialMaster",
            //     //         localField: "packageMaterialId",
            //     //         foreignField: "_id",
            //     //         as: "packageMaterialId"
            //     //     }
            //     // },
            //     // {
            //     //     $unwind: {
            //     //         path: "$packageMaterialId",
            //     //         preserveNullAndEmptyArrays: true
            //     //     }
            //     // },

            //     // // ---------- GRN PARTY DETAIL ----------
            //     // {
            //     //     $lookup: {
            //     //         from: "GRNEntryPartyDetail",
            //     //         localField: "grnEntryPartyDetailId",
            //     //         foreignField: "_id",
            //     //         as: "grnEntryPartyDetailId"
            //     //     }
            //     // },
            //     // {
            //     //     $unwind: {
            //     //         path: "$grnEntryPartyDetailId",
            //     //         preserveNullAndEmptyArrays: true
            //     //     }
            //     // },

            //     // // ---------- ACCOUNT MASTER (partyName) ----------
            //     // {
            //     //     $lookup: {
            //     //         from: "AccountMasters",
            //     //         localField: "grnEntryPartyDetailId.partyId",
            //     //         foreignField: "_id",
            //     //         as: "party"
            //     //     }
            //     // },
            //     // {
            //     //     $unwind: {
            //     //         path: "$party",
            //     //         preserveNullAndEmptyArrays: true
            //     //     }
            //     // },

            //     // // ---------- ADD FLAGS ----------
            //     // {
            //     //     $addFields: {
            //     //         "grnEntryPartyDetailId.partyId": {
            //     //             _id: "$party._id",
            //     //             partyName: "$party.partyName"
            //     //         },
            //     //         isGRNRecord: true,
            //     //         isInwardRecord: true
            //     //     }
            //     // }
            // ]);

            console.log(grnRecords)
        }

    }
    // 2. Additional Entry Records
    let additionalRecords = [];
    const additionalModel = await additionalEntryMaterialDetailsModel(dbYear);

    if (materialType === "Raw Material") {
        additionalRecords = await additionalModel
            .find({ rawMaterialId: item._id, isDeleted: false })
            .populate({
                path: "additionalEntryDetailsId",
                select: "batchNo reqDate slipNo productName type",
            });
    }
    if (materialType === "Packing Material") {
        additionalRecords = await additionalModel
            .find({ packageMaterialId: item._id, isDeleted: false })
            .populate({
                path: "additionalEntryDetailsId",
                select: "batchNo reqDate slipNo productName type",
            });
    }

    additionalRecords = additionalRecords.map((x) => ({
        ...x._doc,
        issueQty: x.qty,
        isAdditionalEntryRecord: true,
        isIssuedRecord: true,
    }));

    // 3. Production usage
    let productionRecords = [];

    if (materialType === "Raw Material") {
        const prRMModel = await ProductionRequisitionRMFormulaModel(dbYear);
        productionRecords = await prRMModel
            .find({ isDeleted: false, rmName: item.rmName })
            .populate({
                path: "productDetialsId",
                select: "partyId productionNo productionPlanningDate batchNo _id",
                populate: { path: "partyId", select: "partyName _id" },
            })
            .populate({ path: "productId", select: "productName" });
    }
    if (materialType === "Packing Material") {
        const prPMModel = await PackingRequisitionPMFormulaModel(dbYear);
        productionRecords = await prPMModel
            .find({ isDeleted: false, pmName: item.pmName })
            .populate({
                path: "productDetialsId",
                select: "partyId productionNo productionPlanningDate batchNo _id",
                populate: { path: "partyId", select: "partyName _id" },
            })
            .populate({ path: "packingItemId", select: "ItemName" });
    }

    productionRecords = productionRecords.map((x) => ({
        ...x._doc,
        issueQty: x.netQty,
        isIssuedRecord: true,
    }));

    // 4. GST invoices
    let gstRecords = [];

    if (materialType === "Raw Material") {
        const giRMModel = await gstinvoiceRMItemModel(dbYear);
        gstRecords = await giRMModel
            .find({ itemId: item._id, isDeleted: false })
            .populate({
                path: "gstInvoiceRMID",
                select: "invoiceNo invoiceDate partyId",
                populate: { path: "partyId", select: "partyName _id" },
            });
    }
    if (materialType === "Packing Material") {
        const giPMModel = await gstInvoicePMItemModel(dbYear);
        gstRecords = await giPMModel
            .find({ itemId: item._id, isDeleted: false })
            .populate({
                path: "gstInvoicePMID",
                select: "invoiceNo invoiceDate partyId",
                populate: { path: "partyId", select: "partyName _id" },
            });
    }

    gstRecords = gstRecords.map((x) => ({
        ...x._doc,
        issueQty: x.qty,
        isGSTInvoiceRecord: true,
    }));

    const combined = [
        ...grnRecords,
        ...productionRecords,
        ...gstRecords,
        ...additionalRecords,
    ];

    combined.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));

    const filtered = combined.filter((record) => {
        if (record.isIssuedRecord || record.isGSTInvoiceRecord) {
            return (record.issueQty || 0) > 0;
        }
        return (record.qty || 0) > 0;
    });
    return filtered;
};

export const calculateStock = (records) => {

    const totalQty = records.reduce((sum, record) => {
        const isIssued = record.isIssuedRecord === true;
        const isGST = record.isGSTInvoiceRecord === true;
        return !isIssued && !isGST ? sum + (record.qty || 0) : sum;
    }, 0);

    const totalProductionUsage = records.reduce((sum, record) => {
        return record.isIssuedRecord === true ? sum + (record.issueQty || 0) : sum;
    }, 0);

    const totalGSTInvoice = records.reduce((sum, record) => {
        return record.isGSTInvoiceRecord === true ? sum + (record.issueQty || 0) : sum;
    }, 0);

    const totalIssue = totalProductionUsage + totalGSTInvoice;
    const totalStock = totalQty - totalIssue;

    return {
        totalQty: totalQty.toFixed(3),
        totalProductionUsage: totalProductionUsage.toFixed(3),
        totalGSTInvoice: totalGSTInvoice.toFixed(3),
        totalIssue: totalIssue.toFixed(3),
        totalStock: totalStock.toFixed(3),
    };
};