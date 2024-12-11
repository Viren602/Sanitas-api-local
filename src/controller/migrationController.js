import csvtojson from 'csvtojson'
import rmFormulaModel from '../model/rmFormulaModel.js'
import productDetailsModel from '../model/productDetailsModel.js';

const importRMFormula = async (req, res) => {
    try {

        let rmFormulaList = [];

        csvtojson()
            .fromFile(req.file.path)
            .then(async (response) => {
                for (let x = 0; x < response.length; x++) {

                    const product = await productDetailsModel.findOne({ productCode: response[x].productCode });

                    if (product) {
                        rmFormulaList.push({
                            ID: response[x].ID,
                            productCode: response[x].productCode,
                            productId: product._id,
                            batchSize: response[x].batchSize,
                            weight: response[x].weight,
                            stageId: response[x].stageId,
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
                    } else {
                        console.log(`${x + 1} ProductCode ${response[x].productCode} not found in ProductModel`);
                    }
                }
                await rmFormulaModel.insertMany(rmFormulaList)
            })
        res.send({ status: 200, success: true, msg: 'CSV Imported Successfully' })
    } catch (error) {
        res.send({ status: 400, success: false, msg: error.message })
    }
}

export {
    importRMFormula
};
