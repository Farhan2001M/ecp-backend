// controllers/productControllers.js
import Product from "../models/productModel.js";

// Create a Product
export const createProduct = async (req, res) => {
  try {
    const { name, brand, category, price, description, sku, images, videos, inStock, ratings, dimensions } = req.body;

    // Check if product name or SKU already exists in the products collection
    const existingProductByName = await Product.findOne({ name });
    if (existingProductByName) {
      return res.status(400).json({ message: "Product name already exists" });
    }

    const existingProductBySKU = await Product.findOne({ sku });
    if (existingProductBySKU) {
      return res.status(400).json({ message: "Product SKU already exists" });
    }

    // Create a new product document in the "products" collection
    const product = new Product({
      name,
      brand,
      category,
      price,
      description,
      sku,
      images: images || [],
      videos: videos || [],
      inStock: inStock !== undefined ? inStock : false,
      ratings: ratings !== undefined ? ratings : 0,
      dimensions: dimensions || "",
    });

    await product.save();
    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Fetch all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a product
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

// Update a product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, brand, category, price, description, sku, images, videos, inStock, ratings, dimensions } = req.body;

    // Find the existing product
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if new name or SKU conflicts with other products
    if (name && name !== existingProduct.name) {
      const nameExists = await Product.findOne({ name });
      if (nameExists) {
        return res.status(400).json({ message: "Product name already exists" });
      }
    }

    if (sku && sku !== existingProduct.sku) {
      const skuExists = await Product.findOne({ sku });
      if (skuExists) {
        return res.status(400).json({ message: "Product SKU already exists" });
      }
    }

    // Prepare update data
    const updateData = {
      name: name || existingProduct.name,
      brand: brand || existingProduct.brand,
      category: category || existingProduct.category,
      price: price !== undefined ? price : existingProduct.price,
      description: description || existingProduct.description,
      sku: sku || existingProduct.sku,
      images: images !== undefined ? images : existingProduct.images,
      videos: videos !== undefined ? videos : existingProduct.videos,
      inStock: inStock !== undefined ? inStock : existingProduct.inStock,
      ratings: ratings !== undefined ? ratings : existingProduct.ratings,
      dimensions: dimensions !== undefined ? dimensions : existingProduct.dimensions,
      updatedAt: Date.now(),
    };

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);

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