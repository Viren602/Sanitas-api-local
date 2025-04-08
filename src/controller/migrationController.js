import csvtojson from 'csvtojson'
import rmFormulaModel from '../model/rmFormulaModel.js'
import productDetailsModel from '../model/productDetailsModel.js';
import companyItems from '../model/companyItems.js';
import pmFormulaModel from '../model/pmFormulaModel.js';
import rawMaterialSchema from '../model/rawMaterialModel.js';
import packingMaterialSchema from '../model/packingMaterialModel.js';
import errorHandler from '../server/errorHandle.js';
import grnEntryMaterialDetailsModel from '../model/InventoryModels/grnEntryMaterialDetailsModel.js';
import partyModel from '../model/partiesModel.js';
import batchClearingEntryModel from '../model/ProductionModels/batchClearingEntryModel.js';
import batchWiseProductStockModel from '../model/Despatch/batchWiseProductStockModel.js';
import productionStageModel from '../model/productionStageModel.js';
import { getRequestData } from '../middleware/encryption.js';

const importRMFormula = async (req, res) => {
    try {

        let rmFormulaList = [];

        csvtojson()
            .fromFile(req.file.path)
            .then(async (response) => {
                for (let x = 0; x < response.length; x++) {

                    let pdModel = await productDetailsModel()
                    const product = await pdModel.findOne({ productCode: response[x].productCode });

                    let stagModel = await productionStageModel()
                    const stageDetails = await stagModel.findOne({ seqNo: Number(response[x].stageId) });

                    if (product) {
                        rmFormulaList.push({
                            ID: response[x].ID,
                            productCode: response[x].productCode,
                            productId: product._id,
                            batchSize: response[x].batchSize,
                            weight: response[x].weight,
                            stageId: stageDetails?._id || null,
                            itemCode: response[x].itemCode,
                            qty: response[x].qty,
                            netQty: response[x].netQty,
                            lcQty: response[x].lcQty,
                            lcUOM: response[x].lcUOM,
                            lcPer: response[x].lcPer,
                            uom: response[x].uom,
                            loss: response[x].loss,
                            entDate: response[x].entDate,
                            rmName: response[x].rmName,
                            stageName: response[x].stageName,
                            stCode: response[x].stCode,
                            stkCode: response[x].stkCode,
                            stkName: response[x].stkName,
                        })
                        console.log(`${x + 1}`)
                    } else {
                        console.log(`${x + 1} ProductCode ${response[x].productCode} not found in ProductModel`);
                    }
                }
                let rmFModel = await rmFormulaModel()
                await rmFModel.insertMany(rmFormulaList)
            })
        res.send({ status: 200, success: true, msg: 'RM Formula CSV Imported Successfully' })
    } catch (error) {
        res.send({ status: 400, success: false, msg: error.message })
    }
}

const importPMFormula = async (req, res) => {
    try {

        let pmFormulaList = [];

        csvtojson()
            .fromFile(req.file.path)
            .then(async (response) => {
                for (let x = 0; x < response.length; x++) {

                    let cIModel = await companyItems()
                    const item = await cIModel.findOne({ ItemCode: response[x].itemCode });
                    if (item) {
                        pmFormulaList.push({
                            itemId: item._id,
                            ID: response[x].ID,
                            itemCode: response[x].itemCode,
                            batchSize: response[x].batchSize,
                            weight: response[x].weight,
                            stageId: response[x].stageId,
                            pmCode: response[x].pmCode,
                            qty: response[x].qty,
                            uom: response[x].uom,
                            loss: response[x].loss,
                            netQty: response[x].netQty,
                            entDate: response[x].entDate,
                            pmName: response[x].pmName,
                            stageName: response[x].stageName,
                            stat: response[x].stat,
                        })
                        console.log(`${x + 1}`)
                    } else {
                        console.log(`${x + 1} ItemCode ${response[x].itemCode} not found in ItemModel`);
                    }
                }

                let pmfModel = await pmFormulaModel()
                await pmfModel.insertMany(pmFormulaList)
            })
        res.send({ status: 200, success: true, msg: 'PM Formula CSV Imported Successfully' })
    } catch (error) {
        res.send({ status: 400, success: false, msg: error.message })
    }
}

const importRMFormulaWithRMId = async (req, res) => {
    try {
        let queryObject = {
            isDeleted: false,
        };

        let rmModel = await rawMaterialSchema()
        const rawMaterials = await rmModel.find(queryObject);

        await Promise.all(
            rawMaterials.map(async (rawMaterial) => {
                let rmFModel = await rmFormulaModel()
                const updateResult = await rmFModel.updateMany(
                    { itemCode: rawMaterial.rmCode },
                    { $set: { rmId: rawMaterial._id } }
                );

                if (updateResult.matchedCount > 0) {
                    console.log(`Updated ${updateResult.modifiedCount} records in rmFormulaModel for rmName: ${rawMaterial.rmName}`);
                } else {
                    console.log(`No matching records found in rmFormulaModel for rmName: ${rawMaterial.rmName}`);
                }
            })
        );

        res.json({
            message: "All updates completed",
        });

    } catch (error) {
        console.log("error in inventory controller", error);
        res.status(500).json({ error: error.message });
    }
};

const importPMFormulaWithRMId = async (req, res) => {
    try {
        let queryObject = {
            isDeleted: false,
        };

        let mpModel = await packingMaterialSchema()
        const packingMaterials = await mpModel.find(queryObject);
        let totalUpdatedRecords = 0;

        await Promise.all(
            packingMaterials.map(async (packingMaterial) => {
                let pmfModel = await pmFormulaModel()
                const updateResult = await pmfModel.updateMany(
                    { pmCode: packingMaterial.pmCode },
                    { $set: { packageMaterialId: packingMaterial._id } }
                );

                if (updateResult.matchedCount > 0) {
                    totalUpdatedRecords += updateResult.modifiedCount;
                    console.log(`Updated ${updateResult.modifiedCount} records in pmFormulaModel for pmName: ${packingMaterial.pmName}`);
                } else {
                    console.log(`No matching records found in pmFormulaModel for pmName: ${packingMaterial.pmName}`);
                }
            })
        );

        console.log(`Total updated records with packingMaterialId: ${totalUpdatedRecords}`);

        res.json({
            message: "All updates completed",
        });

    } catch (error) {
        console.log("Error in Migration controller", error);
        errorHandler(error, req, res, "Error in Migration controller")
    }
};

const rawMaterialOpeningStock = async (req, res) => {
    try {

        let openingStockList = [];
        csvtojson()
            .fromFile(req.file.path)
            .then(async (response) => {
                for (let x = 0; x < response.length; x++) {

                    let cIModel = await rawMaterialSchema()
                    const item = await cIModel.findOne({ rmName: response[x].rmName });
                    if (item) {
                        openingStockList.push({
                            rawMaterialId: item._id,
                            packageMaterialId: null,
                            grnEntryPartyDetailId: null,
                            batchNo: '-',
                            qty: response[x].stock,
                            rate: response[x].rate,
                            amount: response[x].amount,
                            mfgBy: '-',
                            mfgDate: null,
                            expDate: null,
                            packing: '-',
                            isPurchaseOrderEntry: null,
                            isGSTPurchaseEntryRMPM: null,
                            purchaseOrderId: null,
                            purchaseOrdermaterialId: null,
                            isOpeningStock: true,
                            openingStockDate: new Date(),
                            isDeleted: false,
                        })
                        console.log(`Inserted ${x + 1}`)
                    } else {
                        console.log(`${x + 1} raw material name ${response[x].rmName} not found in ItemModel`);
                    }
                }

                let grnModel = await grnEntryMaterialDetailsModel()
                await grnModel.insertMany(openingStockList)
                console.log('Updated')
            })
        res.send({ status: 200, success: true, msg: 'Opening Stock RM CSV Imported Successfully' })
    } catch (error) {
        res.send({ status: 400, success: false, msg: error.message })
    }
}

const packingMaterialOpeningStock = async (req, res) => {
    try {

        let openingStockList = [];
        csvtojson()
            .fromFile(req.file.path)
            .then(async (response) => {
                for (let x = 0; x < response.length; x++) {

                    let cIModel = await packingMaterialSchema()
                    const item = await cIModel.findOne({ pmName: response[x].pmName });
                    if (item) {
                        openingStockList.push({
                            rawMaterialId: null,
                            packageMaterialId: item._id,
                            grnEntryPartyDetailId: null,
                            batchNo: '-',
                            qty: response[x].stock,
                            rate: response[x].rate,
                            amount: response[x].amount,
                            mfgBy: '-',
                            mfgDate: null,
                            expDate: null,
                            packing: '-',
                            isPurchaseOrderEntry: null,
                            isGSTPurchaseEntryRMPM: null,
                            purchaseOrderId: null,
                            purchaseOrdermaterialId: null,
                            isOpeningStock: true,
                            openingStockDate: new Date(),
                            isDeleted: false,
                        })
                        console.log(`Inserted ${x + 1}`)
                    } else {
                        console.log(`${x + 1} Packing material name ${response[x].pmName} not found in ItemModel`);
                    }
                }

                let grnModel = await grnEntryMaterialDetailsModel()
                await grnModel.insertMany(openingStockList)
                console.log('Updated')
            })
        res.send({ status: 200, success: true, msg: 'Opening Stock PM CSV Imported Successfully' })
    } catch (error) {
        res.send({ status: 400, success: false, msg: error.message })
    }
}

const partyOpeningBalance = async (req, res) => {
    try {
        csvtojson()
            .fromFile(req.file.path)
            .then(async (response) => {
                for (let x = 0; x < response.length; x++) {

                    let pModel = await partyModel()
                    const party = await pModel.findOne({ partyName: response[x].partyName });
                    if (party) {
                        let DRCR = response[x].closingBalanceDRCR === 'D' ? 'DR' : response[x].closingBalanceDRCR === 'C' ? 'CR' : ''
                        await pModel.findOneAndUpdate(
                            { partyName: party.partyName },
                            { openBalance: response[x].closingBalance, openBalanceDRCR: DRCR },
                            { new: true })
                    } else {
                        console.log(`${x + 1} Party Name ${response[x].partyName} not found`);
                    }
                }
                console.log('Updated')
            })
        res.send({ status: 200, success: true, msg: 'Opening Stock PM CSV Imported Successfully' })
    } catch (error) {
        res.send({ status: 400, success: false, msg: error.message })
    }
}

const productOpeningStock = async (req, res) => {
    try {
        csvtojson()
            .fromFile(req.file.path)
            .then(async (response) => {
                for (let x = 0; x < response.length; x++) {
                    let companyItemModel = await companyItems()
                    const item = await companyItemModel.findOne({ ItemName: response[x].itemName });
                    if (item) {
                        let data = {
                            productionNo: 0,
                            batchClearingEntryId: null,
                            productId: item._id,
                            batchNo: response[x].batchNo,
                            expDate: response[x].expDate,
                            mfgDate: '',
                            quantity: response[x].quantity,
                            mrp: response[x].mrp,
                        }

                        let batchClearingData = {
                            productDetialsId: null,
                            packingItemId: item._id,
                            packing: '',
                            quantity: response[x].quantity,
                            retainSample: 0,
                            testQty: 0,
                            mrp: response[x].mrp,
                            pending: 0,
                            netQuantity: response[x].quantity,
                            clearBatch: true,
                            isFromOpeningStock: true,
                        }

                        let batchClrModel = await batchWiseProductStockModel()
                        const BatchData = new batchClrModel(data);
                        await BatchData.save();

                        let batchClearingModel = await batchClearingEntryModel()
                        const BatchClearData = new batchClearingModel(batchClearingData);
                        await BatchClearData.save();
                        console.log('found')
                    } else {
                        console.log(`${x + 1} Item Name ${response[x].itemName} not found`);
                    }
                }
                console.log('Updated')
            })
        res.send({ status: 200, success: true, msg: 'Product CSV Imported Successfully' })
    } catch (error) {
        res.send({ status: 400, success: false, msg: error.message })
    }
}

const showEntryptedData = async (req, res) => {
    try {

        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')
        res.send({ status: 200, success: true, data: data })
    } catch (error) {
        res.send({ status: 400, success: false, msg: error.message })
    }
}

export {
    importRMFormula,
    importPMFormula,
    importRMFormulaWithRMId,
    importPMFormulaWithRMId,
    rawMaterialOpeningStock,
    packingMaterialOpeningStock,
    partyOpeningBalance,
    productOpeningStock,
    showEntryptedData
};
