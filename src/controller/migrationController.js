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
import mailsender from '../utils/sendingEmail.js';
import { ErrorPass } from '../middleware/appSetting.js';

const dbYear = 'PharmaSoftware'

const importRMFormula = async (req, res) => {
    try {

        let rmFormulaList = [];

        csvtojson()
            .fromFile(req.file.path)
            .then(async (response) => {
                for (let x = 0; x < response.length; x++) {

                    let pdModel = await productDetailsModel(dbYear)
                    const product = await pdModel.findOne({ productCode: response[x].productCode });

                    let stagModel = await productionStageModel(dbYear)
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
                let rmFModel = await rmFormulaModel(dbYear)
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

                    let cIModel = await companyItems(dbYear)
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

                let pmfModel = await pmFormulaModel(dbYear)
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

        let rmModel = await rawMaterialSchema(dbYear)
        const rawMaterials = await rmModel.find(queryObject);

        await Promise.all(
            rawMaterials.map(async (rawMaterial) => {
                let rmFModel = await rmFormulaModel(dbYear)
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

        let mpModel = await packingMaterialSchema(dbYear)
        const packingMaterials = await mpModel.find(queryObject);
        let totalUpdatedRecords = 0;

        await Promise.all(
            packingMaterials.map(async (packingMaterial) => {
                let pmfModel = await pmFormulaModel(dbYear)
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

                    let cIModel = await rawMaterialSchema(dbYear)
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

                let grnModel = await grnEntryMaterialDetailsModel(dbYear)
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

                    let cIModel = await packingMaterialSchema(dbYear)
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

                let grnModel = await grnEntryMaterialDetailsModel(dbYear)
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

                    let pModel = await partyModel(dbYear)
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
                    let companyItemModel = await companyItems(dbYear)
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
                            isFromOpeningStock: true,
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

                        let batchClrModel = await batchWiseProductStockModel(dbYear)
                        const BatchData = new batchClrModel(data);
                        await BatchData.save();

                        let batchClearingModel = await batchClearingEntryModel(dbYear)
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

const sendInquiryToAdmin = async (req, res) => {
    try {

        let apiData = req.body.data
        let data = getRequestData(apiData, 'PostApi')

        let html = `<!DOCTYPE html>
                <html lang="en">

                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <!-- <script src="https://cdn.tailwindcss.com"></script> -->
                    <style>
                        /* .email {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                        } */
                        .email .email-top {
                            background-color: #53a8341a;
                            width: 100%;
                            height: fit-content;
                            padding: 50px;
                            display: flex;
                            justify-content: center;
                        }
                        .email .email-top img {
                            height: 70px;
                            width: auto;
                            margin: 0 auto;
                        }
                        .email .email-bottom {
                            width: 70%;
                            background-color: white;
                            padding: 30px;
                            margin-top: -50px;
                            border-radius: 15px;
                            margin-bottom: 50px !important;
                            margin: 0 auto;
                            /* box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px; */
                        }
                        .email .email-bottom h1 {
                            text-align: center;
                            margin-bottom: 10px;
                            font-weight: 600;
                            font-size: 24px;
                        }
                        .email .email-bottom .text {
                            font-size: 16px;
                            font-weight: 400;
                            color: #223645;
                            text-align: center;
                        }
                        .email .email-bottom .form {
                            margin-top: 20px;
                        }
                        .email .email-bottom .form .input-grp{
                            margin-bottom: 20px;
                        }
                        .email .email-bottom .form .input-grp label{
                            font-size: 14px;
                            font-weight: 700;
                            color: #6d6d6d;
                        }
                        .email .email-bottom .form .input-grp p{
                            font-size: 16px;
                            font-weight: 400;
                            line-height: 24px;
                            border-bottom: 1px solid #ebebeb;
                            color: #6d6d6d;
                        }
                    </style>
                </head>

                <body>
                    <div class="email flex flex-col items-center" >
                        <div class="email-top bg-[#53a8341a] w-full h-[25vh] p-[30px] flex justify-center" >
                            <img src="https://www.fortuneorganics.in/fortune-logo.png" alt="Fortune Organics"
                                class="h-[70px] w-auto" />
                        </div>
                        <div class="email-bottom w-[80%] bg-white p-[30px] mt-[-50px] rounded-[15px] mb-[50px]">
                            <h1 class="text-center mb-2.5 font-semibold text-[24px]">Congratulations!</h1>
                            <p class="text text-[16px] font-regular text-[#223645] text-center">You’ve received a new inquiry from your website contact
                                form. Here are the details:</p>
                            <div class="form">
                                <div class="input-grp">
                                    <label class="text-[14px] font-bold text-[#6d6d6d]">Name</label>
                                    <p class="text-[16px] font-regular leading-[24px] border-b border-b-[#ebebeb]">${data.fullName}</p>
                                </div>
                                <div class="input-grp">
                                    <label class="text-[14px] font-bold text-[#6d6d6d]">Mobile No.</label>
                                    <p class="text-[16px] font-regular leading-[24px] border-b border-b-[#ebebeb]">${data.mobileNo}</p>
                                </div>
                                <div class="input-grp">
                                    <label class="text-[14px] font-bold text-[#6d6d6d]">Subject</label>
                                    <p class="text-[16px] font-regular leading-[24px] border-b border-b-[#ebebeb]">${data.subject}</p>
                                </div>
                                <div class="input-grp">
                                    <label class="text-[14px] font-bold text-[#6d6d6d]">Message</label>
                                    <p class="text-[16px] font-regular leading-[24px] border-b border-b-[#ebebeb]">${data.message}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </body>

                </html>`

        let emaildata = {
            toMail: data.toMail.toLowerCase(),
            subject: 'Inquiry from ' + data.fullName,
            fromMail: 'zyden.itsolutions@gmail.com',
            html: html,
            pass: ErrorPass,
            contentType: "application/pdf"
        };

        mailsender(emaildata)

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
    showEntryptedData,
    sendInquiryToAdmin
};
