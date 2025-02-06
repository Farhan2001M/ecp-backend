import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  type: { type: String, default: "category" }, // Helps differentiate from "user" documents
  name: { type: String, required: true, unique: true },
  servings: { type: [String], required: true },
  servingsCount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});


CategorySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  
  // Ensure that all servings are saved as strings
  this.servings = this.servings.map(serving => String(serving));

  next();
});

const Category = mongoose.model("Category", CategorySchema, "general-info");

export default Category;
