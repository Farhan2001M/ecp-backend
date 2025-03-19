// models/imageModel.js

import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
  urls: { type: [String], required: true }, // Array of image URLs
  updatedAt: { type: Date, default: Date.now }, // Timestamp for last update
});

const Image = mongoose.model("Image", ImageSchema, "images");

export default Image;