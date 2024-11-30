import HNSCodesScHema from "../model/hnsCode.js";
import ItemCategory from "../model/itemCategory.js";

const getAllItemCategory = async (req, res) => {
    try {
        let response = await ItemCategory.find({});
        res.status(201).json({ Message: "Data fetch successfully", responseContent: response });
    } catch (error) {
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllHSNCode = async (req, res) => {
    try {
        let response = await HNSCodesScHema.find({});
        res.status(201).json({ Message: "Data fetch successfully", responseContent: response });
    } catch (error) {
        console.log("error in admin addEmployee controller", error);
        res.status(500).json({ error: error.message });
    }
};



export {
    getAllItemCategory,
    getAllHSNCode
};
