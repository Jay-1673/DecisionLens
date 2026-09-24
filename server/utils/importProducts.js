const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const Product = require("../models/Product");

const CSV_FILE = path.join(
    __dirname,
    "../dataset/marketing_sample_for_amazon_in-ecommerce__20191001_20191031__30k_data.csv"
);


// Convert value into a number
function parseNumber(value) {
    if (value === undefined || value === null) {
        return 0;
    }

    const cleaned = String(value)
        .replace(/₹/g, "")
        .replace(/,/g, "")
        .replace(/%/g, "")
        .trim();

    const number = parseFloat(cleaned);

    return Number.isNaN(number) ? 0 : number;
}


// Convert YES/NO into Boolean
function parseBoolean(value) {
    if (!value) {
        return false;
    }

    const normalized = String(value)
        .trim()
        .toLowerCase();

    return (
        normalized === "yes" ||
        normalized === "true" ||
        normalized === "1" ||
        normalized === "in stock"
    );
}


// Get first useful Amazon image
function getFirstImage(value) {
    if (!value) {
        return "";
    }

    const images = String(value)
        .split("|")
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

    // Remove Amazon transparent pixel image
    const usefulImage = images.find(
        (url) =>
            !url.includes("transparent-pixel") &&
            url.startsWith("http")
    );

    return usefulImage || "";
}


// Parse discount percentage
function parseDiscount(offers) {
    if (!offers) {
        return 0;
    }

    const match = String(offers).match(/(\d+(?:\.\d+)?)\s*%/);

    if (!match) {
        return 0;
    }

    return parseFloat(match[1]);
}


// Import CSV
async function importProducts() {
    try {
        console.log("Connecting to MongoDB...");

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected successfully.");

        console.log("Clearing existing Product collection...");

        await Product.deleteMany({});

        console.log("Existing products removed.");

        const products = [];

        let rowCount = 0;
        let skippedCount = 0;

        console.log("Reading CSV...");

        fs.createReadStream(CSV_FILE)
            .pipe(csv())
            .on("data", (row) => {
                rowCount++;

                const name = row["Product Title"]?.trim();
                const category = row["Category"]?.trim();

                // Skip invalid products
                if (!name || !category) {
                    skippedCount++;
                    return;
                }

                const mrp = parseNumber(row["Mrp"]);
                const price = parseNumber(row["Price"]);

                const discount =
                    parseDiscount(row["Offers"]) ||
                    (mrp > 0 && price > 0
                        ? Math.round(((mrp - price) / mrp) * 100)
                        : 0);

                const product = {
                    uniqId: row["Uniq Id"]?.trim() || undefined,

                    name,

                    description:
                        row["Product Description"]?.trim() || "",

                    brand:
                        row["Brand"]?.trim() || "Unknown",

                    category:
                        category.toLowerCase(),

                    mrp,

                    price,

                    discount,

                    packSize:
                        row["Pack Size Or Quantity"]?.trim() || "",

                    offers:
                        row["Offers"]?.trim() || "",

                    comboOffers:
                        row["Combo Offers"]?.trim() || "",

                    stockAvailable:
                        parseBoolean(row["Stock Availibility"]),

                    asin:
                        row["Product Asin"]?.trim() || "",

                    siteName:
                        row["Site Name"]?.trim() || "Amazon In",

                    crawlTimestamp:
                        row["Crawl Timestamp"]
                            ? new Date(row["Crawl Timestamp"])
                            : null,

                    image:
                        getFirstImage(row["Image Urls"])
                };

                products.push(product);
            })

            .on("end", async () => {
                try {
                    console.log("");
                    console.log(`CSV rows found: ${rowCount}`);
                    console.log(`Valid products: ${products.length}`);
                    console.log(`Skipped rows: ${skippedCount}`);
                    console.log("");

                    console.log("Inserting products into MongoDB...");

                    // Insert in batches
                    const batchSize = 1000;

                    for (
                        let i = 0;
                        i < products.length;
                        i += batchSize
                    ) {
                        const batch = products.slice(
                            i,
                            i + batchSize
                        );

                        await Product.insertMany(batch, {
                            ordered: false
                        });

                        console.log(
                            `Inserted ${Math.min(
                                i + batchSize,
                                products.length
                            )} / ${products.length}`
                        );
                    }

                    console.log("");
                    console.log(
                        "======================================"
                    );
                    console.log(
                        "Amazon products imported successfully!"
                    );
                    console.log(
                        "======================================"
                    );

                    console.log(
                        `Total products: ${products.length}`
                    );

                    await mongoose.connection.close();

                    process.exit(0);
                } catch (error) {
                    console.error(
                        "Error inserting products:",
                        error
                    );

                    await mongoose.connection.close();

                    process.exit(1);
                }
            })

            .on("error", async (error) => {
                console.error(
                    "CSV reading error:",
                    error
                );

                await mongoose.connection.close();

                process.exit(1);
            });

    } catch (error) {
        console.error(
            "Database connection/import error:",
            error
        );

        process.exit(1);
    }
}


importProducts();