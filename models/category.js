import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  isactive: { type: Boolean, default: false }, 
  highlighted: { type: Boolean, default: false }, 
  servings: { type: [String], required: true },
  servingsCount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware to update `updatedAt` and ensure servings are strings
CategorySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  this.servings = this.servings.map(serving => String(serving));
  next();
});

// Middleware to set default status to "disabled" on new category creation
CategorySchema.pre("validate", function(next) {
    if (this.isNew) { // Check if it's a new document
      this.status = false; // Set default status to false
      this.highlighted = false; // Set default highlight to false
    }
    next();
});

// Store categories in a separate collection named "categories"
const Category = mongoose.model("Category", CategorySchema, "categories");

export default Category;