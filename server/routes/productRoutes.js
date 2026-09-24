const express = require("express");

const {
    getProducts,
    getProductsByCategory,
    getProductById,
} = require("../controllers/productController");

const router = express.Router();


// GET all products
router.get("/", getProducts);


// GET products by category
router.get(
    "/category/:category",
    getProductsByCategory
);


// GET single product
router.get(
    "/:id",
    getProductById
);


module.exports = router;