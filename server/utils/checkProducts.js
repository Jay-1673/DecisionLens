const path = require("path");
require("dotenv").config({
    path: path.resolve(__dirname, "../.env")
});

const Product = require("../models/Product");
const connectDB = require("../config/db");

async function checkProducts() {
    try {
        await connectDB();

        console.log("\n========== PRODUCT DATABASE CHECK ==========\n");

        const total = await Product.countDocuments();

        console.log("Total products:", total);

        const electronics = await Product.countDocuments({
            category: "electronics"
        });

        console.log("Electronics:", electronics);

        const laptops = await Product.countDocuments({
            subCategory: "Laptops"
        });

        console.log("Laptops:", laptops);

        const mobiles = await Product.countDocuments({
            subCategory: "Mobiles"
        });

        console.log("Mobiles:", mobiles);

        console.log("\n========== SAMPLE PRODUCT ==========\n");

        const sample = await Product.findOne({
            source: "Amazon Products 2023"
        }).lean();

        console.log(sample);

        console.log("\n========== LAPTOP SAMPLE ==========\n");

        const laptop = await Product.findOne({
            source: "Amazon Products 2023",
            subCategory: "Laptops"
        }).lean();

        console.log(laptop);

        console.log("\n========== MOBILE SAMPLE ==========\n");

        const mobile = await Product.findOne({
            source: "Amazon Products 2023",
            subCategory: "Mobiles"
        }).lean();

        console.log(mobile);

        process.exit(0);

    } catch (error) {
        console.error("\nERROR:");
        console.error(error);
        process.exit(1);
    }
}

checkProducts();