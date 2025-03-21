// routes/categoryRoutes.js
import express from "express";
import { getCategories, createCategory, deleteCategory , updateCategory , updateSaleStatus } from "../controllers/categoryControllers.js";

const router = express.Router();

router.get("/categories", getCategories);
router.post("/categories", createCategory);
router.delete("/categories/:id", deleteCategory);
router.put("/categories/:id", updateCategory);

router.put("/categories/:id/update-sale", updateSaleStatus);

export default router;
