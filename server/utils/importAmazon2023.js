const fs = require("fs");
const path = require("path");
const readline = require("readline");
const mongoose = require("mongoose");

require("dotenv").config({
    path: path.resolve(__dirname, "../.env")
});

const Product = require("../models/Product");

const FILE_PATH = path.resolve(
    __dirname,
    "../dataset/decisionlens-products.jsonl"
);

const BATCH_SIZE = 500;

function convertProduct(item) {
    return {
        name: item.name || "Unknown Product",

        brand: item.brand || "Unknown Brand",

        category: "electronics",

        subCategory:
            item.subCategory || "Other Electronics",

        description:
            typeof item.description === "string"
                ? item.description
                : "",

        price:
            typeof item.price === "number"
                ? item.price
                : 0,

        originalPrice:
            typeof item.originalPrice === "number"
                ? item.originalPrice
                : 0,

        mrp:
            typeof item.mrp === "number"
                ? item.mrp
                : 0,

        discount:
            typeof item.discount === "number"
                ? item.discount
                : 0,

        rating:
            typeof item.rating === "number"
                ? item.rating
                : 0,

        reviewCount:
            typeof item.reviewCount === "number"
                ? item.reviewCount
                : 0,

        processor: item.processor || "",
        ram: item.ram || "",
        storage: item.storage || "",
        gpu: item.gpu || "",
        battery: item.battery || "",
        display: item.display || "",
        weight: item.weight || "",

        packSize: item.packSize || "",

        offers:
            Array.isArray(item.offers)
                ? item.offers.join(", ")
                : item.offers || "",

        comboOffers:
            Array.isArray(item.comboOffers)
                ? item.comboOffers.join(", ")
                : item.comboOffers || "",

        stockAvailable:
            item.stockAvailable !== undefined
                ? item.stockAvailable
                : true,

        siteName:
            item.siteName || "Amazon",

        crawlTimestamp:
            item.crawlTimestamp !== null &&
            item.crawlTimestamp !== undefined
                ? String(item.crawlTimestamp)
                : "",

        asin:
            item.asin || "",

        productUrl:
            item.productUrl || "",

        image:
            item.image || "",

        source: "Amazon Products 2023"
    };
}

async function flushBatch(batch) {
    if (batch.length === 0) {
        return 0;
    }

    try {
        const result = await Product.insertMany(
            batch,
            {
                ordered: false
            }
        );

        return result.length;

    } catch (error) {

        // With ordered:false, MongoDB may have inserted
        // valid documents before encountering an error.

        if (
            error.name === "MongoBulkWriteError" ||
            error.writeErrors
        ) {
            const inserted =
                error.insertedDocs?.length || 0;

            console.log(
                `⚠️ Batch had ${error.writeErrors?.length || 0} rejected records`
            );

            return inserted;
        }

        throw error;
    }
}

async function importProducts() {

    let insertedCount = 0;
    let skippedCount = 0;
    let invalidCount = 0;

    try {

        console.log("=".repeat(70));
        console.log(
            "DECISIONLENS - AMAZON PRODUCTS 2023 IMPORT"
        );
        console.log("=".repeat(70));

        // ------------------------------------------
        // CONNECT MONGODB
        // ------------------------------------------

        await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log(
            "\nMongoDB connected successfully ✅"
        );

        console.log(
            "Database:",
            mongoose.connection.db.databaseName
        );

        console.log(
            "Collection:",
            Product.collection.name
        );

        // ------------------------------------------
        // CHECK FILE
        // ------------------------------------------

        console.log(
            "\nJSONL file:",
            FILE_PATH
        );

        if (!fs.existsSync(FILE_PATH)) {

            throw new Error(
                `JSONL file not found:\n${FILE_PATH}`
            );
        }

        const fileSize =
            fs.statSync(FILE_PATH).size /
            1024 /
            1024;

        console.log(
            `File size: ${fileSize.toFixed(2)} MB`
        );

        // ------------------------------------------
        // REMOVE PREVIOUS AMAZON 2023 IMPORT
        // ------------------------------------------

        const previousCount =
            await Product.countDocuments({
                source: "Amazon Products 2023"
            });

        console.log(
            `\nExisting Amazon Products 2023 records: ${previousCount}`
        );

        if (previousCount > 0) {

            const deleted =
                await Product.deleteMany({
                    source: "Amazon Products 2023"
                });

            console.log(
                `Removed previous import: ${deleted.deletedCount}`
            );
        }

        // ------------------------------------------
        // READ JSONL
        // ------------------------------------------

        const fileStream =
            fs.createReadStream(
                FILE_PATH,
                {
                    encoding: "utf8"
                }
            );

        const rl =
            readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity
            });

        let batch = [];

        let lineNumber = 0;

        const categoryCounts = {};

        console.log(
            "\nStarting import...\n"
        );

        for await (const line of rl) {

            lineNumber++;

            if (!line.trim()) {
                continue;
            }

            let item;

            try {

                item = JSON.parse(line);

            } catch (error) {

                invalidCount++;

                continue;
            }

            // --------------------------------------
            // CONVERT PRODUCT
            // --------------------------------------

            const product =
                convertProduct(item);

            // --------------------------------------
            // TRACK CATEGORIES
            // --------------------------------------

            const category =
                product.subCategory;

            categoryCounts[category] =
                (categoryCounts[category] || 0) + 1;

            batch.push(product);

            // --------------------------------------
            // INSERT BATCH
            // --------------------------------------

            if (batch.length >= BATCH_SIZE) {

                const count =
                    await flushBatch(batch);

                insertedCount += count;

                console.log(
                    `Inserted: ${insertedCount}`
                );

                batch = [];
            }
        }

        // ------------------------------------------
        // INSERT FINAL BATCH
        // ------------------------------------------

        if (batch.length > 0) {

            const count =
                await flushBatch(batch);

            insertedCount += count;
        }

        // ------------------------------------------
        // FINAL RESULTS
        // ------------------------------------------

        console.log("\n");
        console.log("=".repeat(70));
        console.log("IMPORT COMPLETE");
        console.log("=".repeat(70));

        console.log(
            `Valid products processed: ${insertedCount}`
        );

        console.log(
            `Invalid JSON lines skipped: ${invalidCount}`
        );

        console.log("\nDecisionLens categories:");

        Object.entries(categoryCounts)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            )
            .forEach(
                ([category, count]) => {

                    console.log(
                        `  ${category.padEnd(25)} ${count}`
                    );
                }
            );

        // ------------------------------------------
        // DATABASE VERIFICATION
        // ------------------------------------------

        console.log("\n");
        console.log(
            "========== DATABASE VERIFICATION =========="
        );

        const totalProducts =
            await Product.countDocuments();

        const electronics =
            await Product.countDocuments({
                category: "electronics"
            });

        const amazon2023 =
            await Product.countDocuments({
                source: "Amazon Products 2023"
            });

        const laptops =
            await Product.countDocuments({
                source: "Amazon Products 2023",
                subCategory: "Laptops"
            });

        const mobiles =
            await Product.countDocuments({
                source: "Amazon Products 2023",
                subCategory: "Mobiles"
            });

        const audio =
            await Product.countDocuments({
                source: "Amazon Products 2023",
                subCategory: "Audio"
            });

        const cameras =
            await Product.countDocuments({
                source: "Amazon Products 2023",
                subCategory: "Cameras"
            });

        console.log(
            "Total products:",
            totalProducts
        );

        console.log(
            "Electronics:",
            electronics
        );

        console.log(
            "Amazon Products 2023:",
            amazon2023
        );

        console.log(
            "Laptops:",
            laptops
        );

        console.log(
            "Mobiles:",
            mobiles
        );

        console.log(
            "Audio:",
            audio
        );

        console.log(
            "Cameras:",
            cameras
        );

        // ------------------------------------------
        // SAMPLE LAPTOP
        // ------------------------------------------

        const laptopSample =
            await Product.findOne({
                source: "Amazon Products 2023",
                subCategory: "Laptops"
            }).lean();

        console.log(
            "\nLaptop sample:"
        );

        if (laptopSample) {
            console.log({
                name: laptopSample.name,
                brand: laptopSample.brand,
                price: laptopSample.price,
                rating: laptopSample.rating,
                reviewCount:
                    laptopSample.reviewCount,
                subCategory:
                    laptopSample.subCategory,
                asin: laptopSample.asin
            });
        } else {
            console.log("No laptop found.");
        }

        // ------------------------------------------
        // SAMPLE MOBILE
        // ------------------------------------------

        const mobileSample =
            await Product.findOne({
                source: "Amazon Products 2023",
                subCategory: "Mobiles"
            }).lean();

        console.log(
            "\nMobile sample:"
        );

        if (mobileSample) {
            console.log({
                name: mobileSample.name,
                brand: mobileSample.brand,
                price: mobileSample.price,
                rating: mobileSample.rating,
                reviewCount:
                    mobileSample.reviewCount,
                subCategory:
                    mobileSample.subCategory,
                asin: mobileSample.asin
            });
        } else {
            console.log("No mobile found.");
        }

        console.log("\n");
        console.log(
            "MongoDB import completed successfully ✅"
        );

    } catch (error) {

        console.log("\n");
        console.log(
            "IMPORT FAILED ❌"
        );

        console.error(error);

    } finally {

        await mongoose.disconnect();

        console.log(
            "\nMongoDB connection closed."
        );
    }
}

importProducts();