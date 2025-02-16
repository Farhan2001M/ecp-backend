// controllers/productControllers.js
import Product from "../models/productModel.js";

// Create a Product
export const createProduct = async (req, res) => {
  try {
    const { name, brand, categoryID, price, description, totalStock, images, videos, dimensions } = req.body;

    // Check if the product name already exists
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(400).json({ message: "Product with this name already exists" });
    }

    // Create new product
    const product = new Product({
      name,
      brand,
      categoryID,
      price,
      description,
      totalStock,
      images,
      videos: videos || [], // If videos are not provided, default to an empty array
      inStock: totalStock > 0,
      ratings: 0, // Default to 0 ratings
      dimensions: dimensions || "", // Default to empty string if not provided
    });

    await product.save();
    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Fetch all Products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("categoryID", "name"); // Populates category name
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a Product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a Product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, brand, categoryID, price, description, totalStock, images, videos, dimensions } = req.body;

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if name is changing and already exists
    if (name && name !== existingProduct.name) {
      const nameExists = await Product.findOne({ name });
      if (nameExists) {
        return res.status(400).json({ message: "Product name already exists" });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name: name || existingProduct.name,
        brand: brand || existingProduct.brand,
        categoryID: categoryID || existingProduct.categoryID,
        price: price !== undefined ? price : existingProduct.price,
        description: description || existingProduct.description,
        totalStock: totalStock !== undefined ? totalStock : existingProduct.totalStock,
        images: images || existingProduct.images,
        videos: videos || existingProduct.videos,
        dimensions: dimensions || existingProduct.dimensions,
        inStock: totalStock > 0,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
