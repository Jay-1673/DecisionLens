const fs = require("fs");
const path = require("path");
const readline = require("readline");
const mongoose = require("mongoose");

require("dotenv").config({
    path: path.resolve(__dirname, ".env")
});

const Product = require("./models/Product");

const FILE_PATH = path.resolve(
    __dirname,
    "dataset/decisionlens-products.jsonl"
);

async function testInsert() {
    try {
        console.log("==============================================");
        console.log("DECISIONLENS MONGODB INSERT TEST");
        console.log("==============================================");

        await mongoose.connect(process.env.MONGO_URI);

        console.log("\nMongoDB connected ✅");
        console.log("Database:", mongoose.connection.db.databaseName);
        console.log("Collection:", Product.collection.name);

        const fileStream = fs.createReadStream(FILE_PATH, {
            encoding: "utf8"
        });

        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let product = null;

        for await (const line of rl) {
            if (!line.trim()) continue;

            try {
                product = JSON.parse(line);
                break;
            } catch (error) {
                continue;
            }
        }

        if (!product) {
            throw new Error("Could not find a valid JSON product.");
        }

        console.log("\nFirst valid product:");
        console.log(product.name);

        const mongoProduct = {
            name: product.name || "Unknown Product",
            brand: product.brand || "Unknown Brand",
            category: "electronics",
            subCategory: product.subCategory || "Other Electronics",
            description: product.description || "",

            price:
                typeof product.price === "number"
                    ? product.price
                    : 0,

            originalPrice:
                typeof product.originalPrice === "number"
                    ? product.originalPrice
                    : 0,

            mrp:
                typeof product.mrp === "number"
                    ? product.mrp
                    : 0,

            discount:
                typeof product.discount === "number"
                    ? product.discount
                    : 0,

            rating:
                typeof product.rating === "number"
                    ? product.rating
                    : 0,

            reviewCount:
                typeof product.reviewCount === "number"
                    ? product.reviewCount
                    : 0,

            processor: product.processor || "",
            ram: product.ram || "",
            storage: product.storage || "",
            gpu: product.gpu || "",
            battery: product.battery || "",
            display: product.display || "",
            weight: product.weight || "",

            packSize: product.packSize || "",
            offers: Array.isArray(product.offers)
                ? product.offers.join(", ")
                : product.offers || "",

            comboOffers: Array.isArray(product.comboOffers)
                ? product.comboOffers.join(", ")
                : product.comboOffers || "",

            stockAvailable:
                product.stockAvailable !== undefined
                    ? product.stockAvailable
                    : true,

            siteName: product.siteName || "Amazon",

            crawlTimestamp:
                product.crawlTimestamp
                    ? String(product.crawlTimestamp)
                    : "",

            asin: product.asin || "",
            productUrl: product.productUrl || "",
            image: product.image || "",

            source: "Amazon Products 2023"
        };

        console.log("\nAttempting MongoDB insert...");

        const inserted = await Product.create(mongoProduct);

        console.log("\n==============================================");
        console.log("INSERT SUCCESSFUL ✅");
        console.log("==============================================");

        console.log("MongoDB ID:", inserted._id);
        console.log("Name:", inserted.name);
        console.log("Category:", inserted.category);
        console.log("SubCategory:", inserted.subCategory);
        console.log("Source:", inserted.source);

        const count = await Product.countDocuments({
            source: "Amazon Products 2023"
        });

        console.log(
            "\nAmazon Products 2023 count:",
            count
        );

        await mongoose.disconnect();

    } catch (error) {
        console.log("\n==============================================");
        console.log("INSERT FAILED ❌");
        console.log("==============================================");

        console.error(error);

        if (error.errors) {
            console.log("\nMongoose validation errors:");

            for (const [field, detail] of Object.entries(error.errors)) {
                console.log(
                    `${field}: ${detail.message}`
                );
            }
        }

        await mongoose.disconnect();
    }
}

testInsert();