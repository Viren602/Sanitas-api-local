import batchWiseProductStockModel from "../model/Despatch/batchWiseProductStockModel.js";

export const fetchBatchWiseProductStock = async (dbYear, match = {}, options = {}) => {
    const { populateProduct = true, sort = null, groupByProduct = false } = options;
    const batchStockModel = await batchWiseProductStockModel(dbYear);
    return batchStockModel.aggregate([
        {
            $match: {
                isDeleted: false,
                ...match
            }
        },
        ...(populateProduct
            ? [
                {
                    $lookup: {
                        from: "companyitems",
                        localField: "productId",
                        foreignField: "_id",
                        as: "productId"
                    }
                },
                { $unwind: "$productId" }
            ]
            : []),

        ...(groupByProduct
            ? [
                {
                    $group: {
                        _id: "$productId",
                        productId: { $first: "$productId" },
                        itemName: { $first: "$productId.ItemName" },
                        totalQty: { $sum: "$quantity" },
                        items: { $push: "$$ROOT" }
                    }
                }
            ]
            : []),

        ...(sort ? [{ $sort: sort }] : [])
    ]);
};
