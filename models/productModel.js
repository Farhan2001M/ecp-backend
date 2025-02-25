// models/productModel.js
import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  tagline: { type: String, required: true, maxlength: 50 }, // Tagline with max 50 characters
  brand: { type: String, required: true },
  categoryID: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  price: { type: Number, required: true, min: 0 },
  totalStock: { type: Number, required: true, min: 0 },
  ratings: { type: Number, default: 0, min: 0, max: 5 }, // Allow decimal ratings
  dimensions: { type: String, default: "" }, // Optional
  description: { type: String, required: true },
  images: { type: [String], required: true }, // Store image URLs
  videos: { type: String, default: "" }, // Single video URL
  inStock: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware to update `updatedAt` before saving
ProductSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Product = mongoose.model("Product", ProductSchema, "products");

export default Product;


