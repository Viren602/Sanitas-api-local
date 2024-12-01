import HNSCodesScHema from "../model/hnsCode.js";
import ItemCategory from "../model/itemCategory.js";


const addEditItemGategory = async (req, res) => {
  try {
    let data = req.body.data
    if (data._id && data._id.trim() !== '') {
      const response = await ItemCategory.findByIdAndUpdate(data._id, data, { new: true });
      if (response) {
        res.status(200).json({ Message: "Category updated successfully", data: response });
      } else {
        res.status(404).json({ Message: "Category not found" });
      }
    } else {
      const response = new ItemCategory(data);
      await response.save();
      res.status(200).json({ Message: "Category added successfully", data: response });
    }

  } catch (error) {
    console.log("error in admin addEmployee controller", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteCategoryById = async (req, res) => {
    try {
      const { id } = req.query;
      console.log(id)
      let response = {}
      if (id) {
        response = await ItemCategory.findByIdAndDelete(id, { IsDeleted: true }, { new: true, useFindAndModify: false });
      }
      res.status(201).json({ Message: "Item has been deleted", responseContent: response });
    } catch (error) {
      console.log("error in item master controller", error);
      res.status(500).json({ error: error.message });
    }
  };

  const addEditHSNCode = async (req, res) => {
    try {
      let data = req.body.data
      if (data._id && data._id.trim() !== '') {
        const response = await HNSCodesScHema.findByIdAndUpdate(data._id, data, { new: true });
        if (response) {
          res.status(200).json({ Message: "HNSCode updated successfully", data: response });
        } else {
          res.status(404).json({ Message: "HNSCode not found" });
        }
      } else {
        const response = new HNSCodesScHema(data);
        await response.save();
        res.status(200).json({ Message: "HNSCode added successfully", data: response });
      }
  
    } catch (error) {
      console.log("error in admin addEmployee controller", error);
      res.status(500).json({ error: error.message });
    }
  };
  
  const deleteHSNCodeById = async (req, res) => {
      try {
        const { id } = req.query;
        console.log(id)
        let response = {}
        if (id) {
          response = await HNSCodesScHema.findByIdAndDelete(id, { IsDeleted: true }, { new: true, useFindAndModify: false });
        }
        res.status(201).json({ Message: "HNSCode has been deleted", responseContent: response });
      } catch (error) {
        console.log("error in item master controller", error);
        res.status(500).json({ error: error.message });
      }
    };

export {
  addEditItemGategory,
  deleteCategoryById,
  addEditHSNCode,
  deleteHSNCodeById
};
