// controllers/productControllers.js
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js"; 

// Create a Product
export const createProduct = async (req, res) => {
  try {
    const { name, tagline, brand, categoryID, price, totalStock , ratings , dimensions , description, images, videos } = req.body;

    // Check if the product name already exists
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(400).json({ message: "Product with this name already exists" });
    }

    // Create new product
    const product = new Product({ 
      name,
      tagline, 
      brand,
      categoryID,
      price,
      totalStock, 
      ratings,
      dimensions: dimensions || "",  
      description, 
      images,
      videos: videos || "", // Single video URL
      inStock: totalStock > 0,
    });
    
    // ✅ Increment productCount in the respective category
    await Category.findByIdAndUpdate(categoryID, { $inc: { productCount: 1 } });
    await product.save();

    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Fetch all Products
export const fetchProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("categoryID", "name"); // ✅ Populate category name
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
    // Find the product before deleting to get the categoryID
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    await Product.findByIdAndDelete(id);
    // ✅ Decrement productCount in the respective category
    await Category.findByIdAndUpdate(product.categoryID, { $inc: { productCount: -1 } });
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
    const { name, tagline, brand, categoryID , price, totalStock, ratings, dimensions, description, images, videos} = req.body;

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
        tagline: tagline || existingProduct.tagline,
        brand: brand || existingProduct.brand,
        categoryID: categoryID || existingProduct.categoryID,
        price: price !== undefined ? price : existingProduct.price,
        totalStock: totalStock !== undefined ? totalStock : existingProduct.totalStock,
        ratings: ratings !== undefined ? ratings : existingProduct.ratings,
        dimensions: dimensions || existingProduct.dimensions,
        description: description || existingProduct.description,
        images: images || existingProduct.images,
        videos: videos || existingProduct.videos, // Single video URL
        inStock: totalStock > 0,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    // ✅ If category changed, update product counts
    if (categoryID && categoryID !== existingProduct.categoryID.toString()) {
      await Category.findByIdAndUpdate(existingProduct.categoryID, { $inc: { productCount: -1 } });
      await Category.findByIdAndUpdate(categoryID, { $inc: { productCount: 1 } });
    }

    res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
