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
            grnQueryObject.rawMaterialId = new ObjectId(item._id);
        }
        if (materialType === "Packing Material") {
            grnQueryObject.packageMaterialId = new ObjectId(item._id);
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
                            refNo: "$grnId.grnNo",
                            refDate: "$grnId.grnDate",
                            invoiceNo: "$grnId.invoiceNo",
                            partyName: "$party.partyName",
                            batchNo: "$batchNo",
                            isMonogramRecord: { $literal: true },
                            isInwardRecord: { $literal: true },
                            updatedAt: 1,
                            createdAt: 1,
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
                            refNo: "$refNo",
                            refDate: "$refDate",
                            invoiceNo: { $literal: "QC_SAMPLE" },
                            isIssuedRecord: { $literal: true },
                            partyName: "$party.partyName",
                            batchNo: "$batchNo",
                            isMonogramRecord: { $literal: true },
                            isInwardRecord: { $literal: true },
                            updatedAt: 1,
                            createdAt: 1,
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
                            refNo: "$grnId.grnNo",
                            refDate: "$grnId.grnDate",
                            partyName: "$party.partyName",
                            invoiceNo: "$grnId.invoiceNo",
                            batchNo: "$batchNo",
                            isMonogramRecord: { $literal: true },
                            isInwardRecord: { $literal: true },
                            updatedAt: 1,
                            createdAt: 1,
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
                            refNo: "$refNo",
                            refDate: "$refDate",
                            partyName: "$party.partyName",
                            invoiceNo: { $literal: "QC_SAMPLE" },
                            batchNo: "$batchNo",
                            isMonogramRecord: { $literal: true },
                            isInwardRecord: { $literal: true },
                            updatedAt: 1,
                            createdAt: 1,
                            isQCEntryRecord: { $literal: true },
                        }
                    }
                ]);
                grnRecords = [...grnInwardRecords, ...qcSampleRecords];
            }

        } else {
            const gemDetailsModel = await grnEntryMaterialDetailsModel(dbYear);

            // grnRecords = await gemDetailsModel
            //     .find(grnQueryObject)
            //     .populate({ path: "rawMaterialId", select: "rmName rmCategory" })
            //     .populate({ path: "packageMaterialId", select: "pmName pmCategory" })
            //     .populate({
            //         path: "grnEntryPartyDetailId",
            //         select: "partyId grnNo grnDate invoiceNo",
            //         populate: {
            //             path: "partyId",
            //             select: "partyName"
            //         }
            //     });

            // grnRecords = grnRecords.map(x => ({
            //     ...x._doc,
            //     qty: x.qty,
            //     isGRNRecord: true,
            //     isInwardRecord: true
            // }));
            const grnInwardRecords = await gemDetailsModel.aggregate([
                {
                    $match: grnQueryObject
                },
                {
                    $lookup: {
                        from: "rawmaterialmasters",
                        localField: "rawMaterialId",
                        foreignField: "_id",
                        as: "rawMaterialId"
                    }
                },
                {
                    $unwind: {
                        path: "$rawMaterialId",
                        preserveNullAndEmptyArrays: true
                    }
                },

                {
                    $lookup: {
                        from: "packingmaterialmasters",
                        localField: "packageMaterialId",
                        foreignField: "_id",
                        as: "packageMaterialId"
                    }
                },
                {
                    $unwind: {
                        path: "$packageMaterialId",
                        preserveNullAndEmptyArrays: true
                    }
                },

                {
                    $lookup: {
                        from: "grnentrypartydetails",
                        localField: "grnEntryPartyDetailId",
                        foreignField: "_id",
                        as: "grnEntryPartyDetailId"
                    }
                },
                {
                    $unwind: {
                        path: "$grnEntryPartyDetailId",
                        preserveNullAndEmptyArrays: true
                    }
                },

                {
                    $lookup: {
                        from: "accountmasters",
                        localField: "grnEntryPartyDetailId.partyId",
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
                    $project: {
                        _id: 0,
                        qty: 1,
                        refNo: "$grnEntryPartyDetailId.grnNo",
                        refDate: "$grnEntryPartyDetailId.grnDate",
                        partyName: "$party.partyName",
                        invoiceNo: "$grnEntryPartyDetailId.invoiceNo",
                        batchNo: 1,
                        isOpeningStock: 1,
                        isInwardRecord: { $literal: true },
                        updatedAt: 1,
                        createdAt: 1,
                    }
                }
            ]);
            const SamplePMModel = await sampleEntryPMModel(dbYear);
            const SampleModel = await sampleEntryRMModel(dbYear);
            let sampleFilter = { isDeleted: false };

            if (materialType === "Raw Material") {
                sampleFilter.rmId = new ObjectId(item._id);
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
                            refNo: "$refNo",
                            refDate: "$refDate",
                            invoiceNo: { $literal: "QC_SAMPLE" },
                            isIssuedRecord: { $literal: true },
                            partyName: "$party.partyName",
                            batchNo: "$batchNo",
                            isMonogramRecord: { $literal: true },
                            isInwardRecord: { $literal: true },
                            updatedAt: 1,
                            createdAt: 1,
                            isQCEntryRecord: { $literal: true },
                        }
                    }
                ]);

                grnRecords = [...grnInwardRecords, ...qcSampleRecords];
            } else if (materialType === "Packing Material") {
                sampleFilter.pmId = new ObjectId(item._id);
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
                            refNo: "$refNo",
                            refDate: "$refDate",
                            partyName: "$party.partyName",
                            invoiceNo: { $literal: "QC_SAMPLE" },
                            batchNo: "$batchNo",
                            isMonogramRecord: { $literal: true },
                            isInwardRecord: { $literal: true },
                            updatedAt: 1,
                            createdAt: 1,
                            isQCEntryRecord: { $literal: true },
                        }
                    }
                ]);
                grnRecords = [...grnInwardRecords, ...qcSampleRecords];
            }
        }

    }
    // 2. Additional Entry Records
    let additionalRecords = [];
    const additionalModel = await additionalEntryMaterialDetailsModel(dbYear);

    // if (materialType === "Raw Material") {
    //     additionalRecords = await additionalModel
    //         .find({ rawMaterialId: item._id, isDeleted: false })
    //         .populate({
    //             path: "additionalEntryDetailsId",
    //             select: "batchNo reqDate slipNo productName type",
    //         });
    // }
    // if (materialType === "Packing Material") {
    //     additionalRecords = await additionalModel
    //         .find({ packageMaterialId: item._id, isDeleted: false })
    //         .populate({
    //             path: "additionalEntryDetailsId",
    //             select: "batchNo reqDate slipNo productName type",
    //         });
    // }

    // additionalRecords = additionalRecords.map((x) => ({
    //     ...x._doc,
    //     issueQty: x.qty,
    //     isAdditionalEntryRecord: true,
    //     isIssuedRecord: true,
    // }));

    let matchStage = {
        isDeleted: false
    };

    if (materialType === "Raw Material") {
        matchStage.rawMaterialId = new ObjectId(item._id);
    }

    if (materialType === "Packing Material") {
        matchStage.packageMaterialId = new ObjectId(item._id);
    }

    additionalRecords = await additionalModel.aggregate([
        {
            $match: matchStage
        },

        {
            $lookup: {
                from: "additionalproductionentries",
                localField: "additionalEntryDetailsId",
                foreignField: "_id",
                as: "additionalEntryDetailsId"
            }
        },
        {
            $unwind: {
                path: "$additionalEntryDetailsId",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: 0,
                issueQty: "$qty",
                refNo: "$additionalEntryDetailsId.slipNo",
                refDate: "$additionalEntryDetailsId.reqDate",
                partyName: "$additionalEntryDetailsId.type",
                batchNo: "$additionalEntryDetailsId.batchNo",
                invoiceNo: { $literal: 'Additional Entry' },
                rawMaterialId: 1,
                packageMaterialId: 1,
                isAdditionalEntryRecord: { $literal: true },
                isIssuedRecord: { $literal: true },
                updatedAt: 1,
                createdAt: 1,
            }
        }
    ]);

    // 3. Production usage
    let productionRecords = [];

    if (materialType === "Raw Material") {
        // const prRMModel = await ProductionRequisitionRMFormulaModel(dbYear);
        // productionRecords = await prRMModel
        //     .find({ isDeleted: false, rmName: item.rmName })
        //     .populate({
        //         path: "productDetialsId",
        //         select: "partyId productionNo productionPlanningDate batchNo _id",
        //         populate: { path: "partyId", select: "partyName _id" },
        //     })
        //     .populate({ path: "productId", select: "productName" });

        const prRMModel = await ProductionRequisitionRMFormulaModel(dbYear);

        productionRecords = await prRMModel.aggregate([
            {
                $match: {
                    isDeleted: false,
                    rmName: item.rmName
                }
            },
            {
                $lookup: {
                    from: "productionentries",
                    localField: "productDetialsId",
                    foreignField: "_id",
                    as: "productDetialsId"
                }
            },
            { $unwind: { path: "$productDetialsId", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "accountmasters",
                    localField: "productDetialsId.partyId",
                    foreignField: "_id",
                    as: "productDetialsId.partyId"
                }
            },
            { $unwind: { path: "$productDetialsId.partyId", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "productmasters",
                    localField: "productId",
                    foreignField: "_id",
                    as: "productId"
                }
            },
            { $unwind: { path: "$productId", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 0,
                    issueQty: "$netQty",
                    refNo: "$productDetialsId.productionNo",
                    refDate: "$productDetialsId.productionPlanningDate",
                    batchNo: "$productDetialsId.batchNo",
                    partyName: "$productId.productName",
                    invoiceNo: { $literal: '' },
                    rawMaterialId: 1,
                    packageMaterialId: 1,
                    isIssuedRecord: { $literal: true },
                    updatedAt: 1,
                    createdAt: 1,
                }
            }
        ]);

    }
    if (materialType === "Packing Material") {
        const prPMModel = await PackingRequisitionPMFormulaModel(dbYear);
        // productionRecords = await prPMModel
        //     .find({ isDeleted: false, pmName: item.pmName })
        //     .populate({
        //         path: "productDetialsId",
        //         select: "partyId productionNo productionPlanningDate batchNo _id",
        //         populate: { path: "partyId", select: "partyName _id" },
        //     })
        //     .populate({ path: "packingItemId", select: "ItemName" });
        productionRecords = await prPMModel.aggregate([
            {
                $match: {
                    isDeleted: false,
                    pmName: item.pmName
                }
            },
            {
                $lookup: {
                    from: "productionentries",
                    localField: "productDetialsId",
                    foreignField: "_id",
                    as: "productDetialsId"
                }
            },
            { $unwind: { path: "$productDetialsId", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "accountmasters",
                    localField: "productDetialsId.partyId",
                    foreignField: "_id",
                    as: "productDetialsId.partyId"
                }
            },
            { $unwind: { path: "$productDetialsId.partyId", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "companyitems",
                    localField: "packingItemId",
                    foreignField: "_id",
                    as: "packingItemId"
                }
            },
            { $unwind: { path: "$packingItemId", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 0,
                    issueQty: "$netQty",
                    refNo: "$productDetialsId.productionNo",
                    refDate: "$productDetialsId.productionPlanningDate",
                    batchNo: "$productDetialsId.batchNo",
                    partyName: "$packingItemId.ItemName",
                    invoiceNo: { $literal: '' },
                    rawMaterialId: 1,
                    packageMaterialId: 1,
                    isIssuedRecord: { $literal: true },
                    updatedAt: 1,
                    createdAt: 1,
                }
            }
        ]);
    }
    //    productionRecords = productionRecords.map((x) => ({
    //     ...x._doc,
    //     issueQty: x.netQty,
    //     isIssuedRecord: true,
    // }));

    // 4. GST invoices
    let gstRecords = [];

    if (materialType === "Raw Material") {
        // const giRMModel = await gstinvoiceRMItemModel(dbYear);
        // gstRecords = await giRMModel
        //     .find({ itemId: item._id, isDeleted: false })
        //     .populate({
        //         path: "gstInvoiceRMID",
        //         select: "invoiceNo invoiceDate partyId",
        //         populate: { path: "partyId", select: "partyName _id" },
        //     });
        const giRMModel = await gstinvoiceRMItemModel(dbYear);

        gstRecords = await giRMModel.aggregate([
            {
                $match: {
                    itemId: new ObjectId(item._id),
                    isDeleted: false
                }
            },
            {
                $lookup: {
                    from: "gstinvoicerms",
                    localField: "gstInvoiceRMID",
                    foreignField: "_id",
                    as: "invoice"
                }
            },
            { $unwind: "$invoice" },
            {
                $lookup: {
                    from: "accountmasters",
                    localField: "invoice.partyId",
                    foreignField: "_id",
                    as: "party"
                }
            },
            { $unwind: { path: "$party", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 0,
                    issueQty: "$qty",
                    refNo: "$invoice.invoiceNo",
                    refDate: "$invoice.invoiceDate",
                    invoiceNo: "$invoice.invoiceDate",
                    partyName: "$party.partyName",
                    invoiceNo: "$invoice.invoiceNo",
                    partyId: 1,
                    isGSTInvoiceRecord: { $literal: true },
                    itemId: 1,
                    updatedAt: 1,
                    createdAt: 1,
                }
            }
        ]);
    }
    if (materialType === "Packing Material") {
        // const giPMModel = await gstInvoicePMItemModel(dbYear);
        // gstRecords = await giPMModel
        //     .find({ itemId: item._id, isDeleted: false })
        //     .populate({
        //         path: "gstInvoicePMID",
        //         select: "invoiceNo invoiceDate partyId",
        //         populate: { path: "partyId", select: "partyName _id" },
        //     });
        const giPMModel = await gstInvoicePMItemModel(dbYear);

        gstRecords = await giPMModel.aggregate([
            {
                $match: {
                    itemId: new ObjectId(item._id),
                    isDeleted: false
                }
            },
            {
                $lookup: {
                    from: "gstinvoicepms",
                    localField: "gstInvoicePMID",
                    foreignField: "_id",
                    as: "invoice"
                }
            },
            { $unwind: "$invoice" },
            {
                $lookup: {
                    from: "accountmasters",
                    localField: "invoice.partyId",
                    foreignField: "_id",
                    as: "party"
                }
            },
            { $unwind: { path: "$party", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 0,
                    issueQty: "$qty",
                    refNo: "$invoice.invoiceNo",
                    refDate: "$invoice.invoiceDate",
                    invoiceNo: "$invoice.invoiceNo",
                    partyName: "$party.partyName",
                    partyId: "$invoice.partyId",
                    isGSTInvoiceRecord: { $literal: true },
                    itemId: 1,
                    updatedAt: 1,
                    createdAt: 1
                }
            }
        ]);
    }

    // gstRecords = gstRecords.map((x) => ({
    //     ...x._doc,
    //     issueQty: x.qty,
    //     isGSTInvoiceRecord: true,
    // }));

    const combined = [
        ...grnRecords,
        ...productionRecords,
        ...gstRecords,
        ...additionalRecords,
    ];

    combined.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

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