// models/productModel.js
import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  images: { type: [String], default: [] }, // Assuming images are stored as URLs
  videos: { type: [String], default: [] }, // Assuming videos are stored as URLs
  inStock: { type: Boolean, default: false },
  ratings: { type: Number, default: 0 },
  dimensions: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware to update `updatedAt`
ProductSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Middleware to set default values on new product creation
ProductSchema.pre("validate", function (next) {
  if (this.isNew) {
    this.inStock = false; // Default to out of stock
    this.ratings = 0; // Default rating
    this.dimensions = ""; // Default dimensions
  }
  next();
});

// Store products in a separate collection named "products"
const Product = mongoose.model("Product", ProductSchema, "products");
export default Product;