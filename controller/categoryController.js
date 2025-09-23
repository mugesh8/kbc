const Categories = require('../model/categories'); // adjust the path if needed

// Add a new category
const addCategory = async (req, res) => {
  try {
    const { category_name } = req.body;

    if (!category_name) {
      return res.status(400).json({ success: false, msg: "Category name is required" });
    }

    const newCategory = await Categories.create({ category_name });

    return res.status(201).json({ success: true, data: newCategory, msg: "Category added successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, msg: "Server error", error: error.message });
  }
};

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Categories.findAll();
    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, msg: "Server error", error: error.message });
  }
};

// Get category by ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Categories.findByPk(id);

    if (!category) {
      return res.status(404).json({ success: false, msg: "Category not found" });
    }

    return res.status(200).json({ success: true, data: category });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, msg: "Server error", error: error.message });
  }
};

// Update category by ID
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name } = req.body;

    const category = await Categories.findByPk(id);
    if (!category) {
      return res.status(404).json({ success: false, msg: "Category not found" });
    }

    category.category_name = category_name || category.category_name;
    await category.save();

    return res.status(200).json({ success: true, data: category, msg: "Category updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, msg: "Server error", error: error.message });
  }
};

// Delete category by ID
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Categories.findByPk(id);
    if (!category) {
      return res.status(404).json({ success: false, msg: "Category not found" });
    }

    await category.destroy();

    return res.status(200).json({ success: true, msg: "Category deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, msg: "Server error", error: error.message });
  }
};

module.exports = {
  addCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};