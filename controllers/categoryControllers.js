// controllers/categoryControllers.js

import Category from "../models/categoryModel.js";

// Create a Category
export const createCategory = async (req, res) => {
  try {
    const { name, servings } = req.body;

    // Check if category already exists 
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    // Convert all servings to strings
    const servingsAsStrings = servings.map(serving => String(serving));
    const servingsCount = servingsAsStrings.length;

    // Create a new category document in the "categories" collection
    const category = new Category({
      name,
      servings: servingsAsStrings,
      servingsCount,
      productCount: 0, // Explicitly set productCount to 0 (though the schema default already handles this)
      saleStatus: "Inactive", // Default status
      saleHistory: [], // Empty history
    });

    await category.save();
    res.status(201).json({ message: "Category created successfully", category });
    
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// controllers/categoryController.js
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, servings, isactive, highlighted } = req.body;

    // Find the existing category
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if new name conflicts with other categories
    if (name && name !== existingCategory.name) {
      const nameExists = await Category.findOne({ name });
      if (nameExists) {
        return res.status(400).json({ message: "Category name already exists" });
      }
    }

    // Prepare update data
    const updateData = {
      name: name || existingCategory.name,
      servings: servings ? servings.map(String) : existingCategory.servings,
      isactive: typeof isactive !== 'undefined' ? isactive : existingCategory.isactive,
      highlighted: typeof highlighted !== 'undefined' ? highlighted : existingCategory.highlighted,
      servingsCount: servings ? servings.length : existingCategory.servingsCount,
      updatedAt: Date.now()
    };

    // Update the category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Category updated successfully",
      category: updatedCategory
    });

  } catch (error) {
    console.error("Error updating category:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: "Validation error",
        error: error.message
      });
    }
    
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};



export const updateSaleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { saleStartDate, saleEndDate, salePercentage } = req.body;

    if (!saleStartDate || !saleEndDate || salePercentage === undefined) {
      return res.status(400).json({ message: "All sale fields are required." });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    const startDate = new Date(saleStartDate);
    const endDate = new Date(saleEndDate);

    // Determine new sale status
    const now = new Date();
    let newStatus = "Inactive";
    if (now >= startDate && now <= endDate) {
      newStatus = "Active";
    } else if (now < startDate) {
      newStatus = "Pending";
    }

    // Update sale history
    category.saleHistory.push({
      startDate,
      endDate,
      percentage: salePercentage,
      status: newStatus,
      updatedAt: new Date(),
    });

    // Set latest values in category
    category.saleStatus = newStatus;
    category.saleStartDate = startDate;
    category.saleEndDate = endDate;
    category.salePercentage = salePercentage;

    await category.save();

    res.status(200).json({ message: "Sale updated successfully", category });
  } catch (error) {
    console.error("Error updating sale:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};




// Fetch all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Delete a category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};









