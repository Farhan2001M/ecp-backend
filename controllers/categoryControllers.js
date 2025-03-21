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
    const { saleStartDate, saleEndDate, salePercentage, action } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    const now = new Date();
    const start = saleStartDate ? new Date(saleStartDate) : category.saleStartDate;
    const end = saleEndDate ? new Date(saleEndDate) : category.saleEndDate;
    const percentage = salePercentage ?? category.salePercentage;

    if (action === "startNow") {
      // Get the LAST pending history record
      const pendingHistory = category.saleHistory
        .filter(entry => entry.status === "Pending")
        .sort((a, b) => b.updatedAt - a.updatedAt)[0];
    
      // Update with modal values
      const newEndDate = end || pendingHistory?.endDate;
      const newPercentage = percentage || pendingHistory?.percentage;
    
      if (pendingHistory) {
        pendingHistory.startDate = now;
        pendingHistory.endDate = newEndDate;
        pendingHistory.percentage = newPercentage;
        pendingHistory.status = "Active";
        pendingHistory.updatedAt = now;
      }
    
      // Update category with modified values
      category.saleStartDate = now;
      category.saleEndDate = newEndDate;
      category.salePercentage = newPercentage;
      category.saleStatus = "Active";
    }
    else if (action === "cancelSale") {
      // Get the LAST sale history record (regardless of status)
      const lastSaleHistory = category.saleHistory[category.saleHistory.length - 1];
    
      if (lastSaleHistory) {
        // Update the last sale history record
        lastSaleHistory.status = "Cancelled"; // Update status to "Cancelled"
        lastSaleHistory.updatedAt = now; // Update the updatedAt field
      }
    
      // Reset category fields
      category.saleStartDate = null;
      category.saleEndDate = null;
      category.salePercentage = 0;
      category.saleStatus = "Inactive";

      // Log the updated category object
      console.log("Updated Category:", category);

      // Save the updated category
      await category.save();
      console.log("Category saved successfully.");
    }
    else if (action === "endNow") {
      // Find existing active sale in history and update instead of creating duplicate
      let existingHistory = category.saleHistory.find(
        (entry) => entry.status === "Active" && entry.startDate?.toISOString() === category.saleStartDate?.toISOString()
      );

      if (existingHistory) {
        existingHistory.endDate = now;
        existingHistory.status = "Concluded";
        existingHistory.updatedAt = now;
      } else {
        category.saleHistory.push({
          startDate: category.saleStartDate,
          endDate: now,
          percentage: category.salePercentage,
          status: "Concluded",
          updatedAt: now,
        });
      }

      // Reset sale fields
      category.saleStartDate = null;
      category.saleEndDate = null;
      category.salePercentage = 0;
      category.saleStatus = "Inactive";
    } 
    else if (action === "updateSale") {
      // Case 1: Sale is active, and only end date or percentage is changed (Modify existing entry)
      if (category.saleStatus === "Active" && start?.toISOString() === category.saleStartDate?.toISOString()) {
          let existingHistory = category.saleHistory.find(
              (entry) => entry.status === "Active" && entry.startDate?.toISOString() === category.saleStartDate?.toISOString()
          );
  
          if (existingHistory) {
              existingHistory.endDate = end;
              existingHistory.percentage = percentage;
              existingHistory.updatedAt = now;
          }
  
          category.saleEndDate = end;
          category.salePercentage = percentage;
      }
      // Case 2: Sale is active, and start date is changed (Conclude previous entry & create new one as Pending)
      else if (category.saleStatus === "Active" && start?.toISOString() !== category.saleStartDate?.toISOString()) {
          let existingHistory = category.saleHistory.find(
              (entry) => entry.status === "Active" && entry.startDate?.toISOString() === category.saleStartDate?.toISOString()
          );
  
          if (existingHistory) {
              existingHistory.endDate = now;
              existingHistory.status = "Concluded";
              existingHistory.updatedAt = now;
          }
  
          // Create a new pending entry
          category.saleHistory.push({
              startDate: start,
              endDate: end,
              percentage: percentage,
              status: "Pending",
              updatedAt: now,
          });
  
          // Update sale details
          category.saleStartDate = start;
          category.saleEndDate = end;
          category.salePercentage = percentage;
          category.saleStatus = "Pending";
      }
      if (category.saleStatus === "Pending") {
        // Get the LAST pending record
        const pendingHistory = category.saleHistory
          .filter(entry => entry.status === "Pending")
          .sort((a, b) => b.updatedAt - a.updatedAt)[0];
    
        if (pendingHistory) {
          // Update existing record
          pendingHistory.startDate = start;
          pendingHistory.endDate = end;
          pendingHistory.percentage = percentage;
          pendingHistory.updatedAt = now;
        }
    
        // Update category fields
        category.saleStartDate = start;
        category.saleEndDate = end;
        category.salePercentage = percentage;
        
        // Update status based on new dates
        const isActive = start <= now && end >= now;
        category.saleStatus = isActive ? "Active" : "Pending";
      }
    }
    else {
      // Handle pending or future sales
      if (end && end < now) {
        category.saleHistory.push({
          startDate: start,
          endDate: end,
          percentage,
          status: "Concluded",
          updatedAt: now,
        });

        category.saleStartDate = null;
        category.saleEndDate = null;
        category.salePercentage = 0;
        category.saleStatus = "Inactive";
      } else {
        category.saleStartDate = start;
        category.saleEndDate = end;
        category.salePercentage = percentage;

        if (start && now >= start && now <= end) {
          category.saleStatus = "Active";
        } else if (start && now < start) {
          category.saleStatus = "Pending";
        } else {
          category.saleStatus = "Inactive";
        }

        category.saleHistory.push({
          startDate: start,
          endDate: end,
          percentage,
          status: category.saleStatus,
          updatedAt: now,
        });

        if (category.saleStatus === "Inactive" && end && end < now) {
          category.saleStartDate = null;
          category.saleEndDate = null;
          category.salePercentage = 0;
        }
      }
    }

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









