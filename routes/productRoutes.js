// routes/productRoutes.js
import express from "express";
import { fetchProducts , createProduct, deleteProduct, updateProduct } from "../controllers/productControllers.js";

const router = express.Router();

router.get("/products", fetchProducts );
router.post("/products", createProduct);
router.delete("/products/:id", deleteProduct);
router.put("/products/:id", updateProduct);

export default router;
