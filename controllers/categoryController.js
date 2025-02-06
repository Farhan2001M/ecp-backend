import Category from "../models/category.js";

export const createCategory = async (req, res) => {
  try {
    const { name, servings } = req.body;

    // Ensure all servings are converted to strings
    const servingsAsStrings = servings.map(serving => String(serving));

    // Count the number of servings
    const servingsCount = servingsAsStrings.length;

    const category = new Category({
      name,
      servings: servingsAsStrings,
      servingsCount,
    });

    await category.save();
    res.status(201).json({ message: "Category created successfully", category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
