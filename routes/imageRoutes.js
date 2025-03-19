// routes/imageRoutes.js
import express from "express";
import { fetchImages, updateImageOrder } from "../controllers/imageController.js";

const router = express.Router();

// Fetch the list of image URLs
router.get("/images", fetchImages);

// Update the list of image URLs
router.put("/images/order", updateImageOrder);

export default router;