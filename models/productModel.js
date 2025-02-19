// models/productModel.js
import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  brand: { type: String, required: true },
  categoryID: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  price: { type: Number, required: true, min: 0 },
  description: { type: String, required: true },
  totalStock: { type: Number, required: true, min: 0 },
  images: { type: [String], required: true }, // Store image URLs
  videos: { type: [String], default: [] }, // Optional videos URLs
  inStock: { type: Boolean, default: false },
  ratings: { type: Number, default: 0 },
  dimensions: { type: String, default: "" }, // Optional
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




// // Middleware to set default values on new product creation
// ProductSchema.pre("validate", function (next) {
//   if (this.isNew) {
//     this.inStock = false; // Default to out of stock
//     this.ratings = 0; // Default rating
//     this.dimensions = ""; // Default dimensions
//   }
//   next();
// });
