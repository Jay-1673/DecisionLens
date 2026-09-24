const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const mongoose = require("mongoose");

require("dotenv").config();

const Product = require("../models/Product");
const connectDB = require("../config/db");


// ============================================
// CSV LOCATION
// ============================================

const csvPath = path.join(
    __dirname,
    "../dataset/amazon-products.csv"
);


// ============================================
// ELECTRONICS SUB-CATEGORIES
// ============================================

const ELECTRONICS_SUBCATEGORIES = new Set([
    "all electronics",
    "camera accessories",
    "cameras",
    "headphones",
    "speakers",
    "home entertainment systems",
    "security cameras",
    "televisions",
    "home audio & theater"
]);


// ============================================
// PRICE PARSER
// ============================================

function parsePrice(value) {

    if (!value) {
        return 0;
    }

    const cleaned = String(value)
        .replace(/₹/g, "")
        .replace(/,/g, "")
        .replace(/[^\d.]/g, "")
        .trim();

    const number = parseFloat(cleaned);

    return Number.isNaN(number)
        ? 0
        : number;
}


// ============================================
// NUMBER PARSER
// ============================================

function parseNumber(value) {

    if (!value) {
        return 0;
    }

    const cleaned = String(value)
        .replace(/,/g, "")
        .trim();

    const number = parseFloat(cleaned);

    return Number.isNaN(number)
        ? 0
        : number;
}


// ============================================
// RATING PARSER
// ============================================

function parseRating(value) {

    if (!value) {
        return 0;
    }

    const match = String(value).match(
        /(\d+(?:\.\d+)?)/
    );

    if (!match) {
        return 0;
    }

    const rating = parseFloat(match[1]);

    if (rating < 0 || rating > 5) {
        return 0;
    }

    return rating;
}


// ============================================
// DISCOUNT CALCULATOR
// ============================================

function calculateDiscount(
    actualPrice,
    discountPrice
) {

    if (
        !actualPrice ||
        !discountPrice ||
        actualPrice <= discountPrice
    ) {
        return 0;
    }

    return Math.round(
        ((actualPrice - discountPrice) /
            actualPrice) *
            100
    );
}


// ============================================
// EXTRACT ASIN
// ============================================

function extractASIN(link) {

    if (!link) {
        return "";
    }

    const match = String(link).match(
        /\/dp\/([A-Z0-9]{10})/i
    );

    if (match) {
        return match[1];
    }

    return "";
}


// ============================================
// IMPORT FUNCTION
// ============================================

async function importElectronics() {

    try {

        console.log("");
        console.log(
            "=============================================="
        );
        console.log(
            "     DECISIONLENS ELECTRONICS IMPORTER"
        );
        console.log(
            "=============================================="
        );
        console.log("");


        // ========================================
        // CHECK CSV
        // ========================================

        if (!fs.existsSync(csvPath)) {

            console.error(
                "ERROR: CSV file not found."
            );

            console.error("");
            console.error(
                "Expected:"
            );

            console.error(
                csvPath
            );

            process.exit(1);
        }


        // ========================================
        // CONNECT MONGODB
        // ========================================

        await connectDB();

        console.log(
            "MongoDB connected successfully."
        );

        console.log("");


        // ========================================
        // REMOVE PREVIOUS ELECTRONICS
        // ========================================

        console.log(
            "Removing previous electronics data..."
        );

        const deleteResult =
            await Product.deleteMany({
                category: "electronics"
            });

        console.log(
            `Removed ${deleteResult.deletedCount} old electronics products.`
        );

        console.log("");


        // ========================================
        // COUNTERS
        // ========================================

        let totalRows = 0;

        let electronicsRows = 0;

        let skippedRows = 0;

        let insertedRows = 0;

        let batch = [];

        const BATCH_SIZE = 1000;


        // ========================================
        // TRACK SUB-CATEGORIES
        // ========================================

        const categoryCounts = {};


        // ========================================
        // TRACK ASINS
        // ========================================

        const importedASINs = new Set();


        // ========================================
        // START CSV STREAM
        // ========================================

        console.log(
            "Reading Amazon products CSV..."
        );

        console.log("");


        const stream = fs
            .createReadStream(csvPath)
            .pipe(csv());


        // ========================================
        // READ CSV
        // ========================================

        for await (const row of stream) {

            totalRows++;


            // ------------------------------------
            // GET SUB CATEGORY
            // ------------------------------------

            const subCategory =
                String(
                    row.sub_category || ""
                ).trim();

            const normalizedSubCategory =
                subCategory.toLowerCase();


            // ------------------------------------
            // CHECK ELECTRONICS CATEGORY
            // ------------------------------------

            if (
                !ELECTRONICS_SUBCATEGORIES.has(
                    normalizedSubCategory
                )
            ) {
                continue;
            }


            electronicsRows++;


            // ------------------------------------
            // PRODUCT NAME
            // ------------------------------------

            const name =
                String(
                    row.name || ""
                ).trim();


            // ------------------------------------
            // AMAZON LINK
            // ------------------------------------

            const productUrl =
                String(
                    row.link || ""
                ).trim();


            // ------------------------------------
            // IMAGE
            // ------------------------------------

            const image =
                String(
                    row.image || ""
                ).trim();


            // ------------------------------------
            // ASIN
            // ------------------------------------

            const asin =
                extractASIN(
                    productUrl
                );


            // ------------------------------------
            // AVOID DUPLICATES
            // ------------------------------------

            if (
                asin &&
                importedASINs.has(asin)
            ) {
                continue;
            }

            if (asin) {
                importedASINs.add(asin);
            }


            // ------------------------------------
            // PRICES
            // ------------------------------------

            const price =
                parsePrice(
                    row.discount_price
                );

            const originalPrice =
                parsePrice(
                    row.actual_price
                );


            // ------------------------------------
            // VALID PRODUCT CHECK
            // ------------------------------------

            if (
                !name ||
                price <= 0
            ) {

                skippedRows++;

                continue;
            }


            // ------------------------------------
            // RATING
            // ------------------------------------

            const rating =
                parseRating(
                    row.ratings
                );


            // ------------------------------------
            // REVIEW COUNT
            // ------------------------------------

            const reviewCount =
                parseNumber(
                    row.no_of_ratings
                );


            // ------------------------------------
            // DISCOUNT
            // ------------------------------------

            const discount =
                calculateDiscount(
                    originalPrice,
                    price
                );


            // ------------------------------------
            // CATEGORY COUNT
            // ------------------------------------

            categoryCounts[subCategory] =
                (
                    categoryCounts[subCategory] ||
                    0
                ) + 1;


            // ------------------------------------
            // PRODUCT OBJECT
            // ------------------------------------

            const product = {

                name,

                brand:
                    "Amazon Product",

                category:
                    "electronics",

                subCategory,

                description:
                    "",

                price,

                originalPrice,

                mrp:
                    originalPrice,

                discount,

                rating,

                reviewCount,

                processor:
                    "",

                ram:
                    "",

                storage:
                    "",

                gpu:
                    "",

                battery:
                    "",

                display:
                    "",

                weight:
                    "",

                packSize:
                    "",

                offers:
                    "",

                comboOffers:
                    "",

                stockAvailable:
                    true,

                siteName:
                    "Amazon India",

                crawlTimestamp:
                    "",

                asin,

                productUrl,

                image,

                source:
                    "Amazon India"
            };


            batch.push(product);


            // ------------------------------------
            // INSERT BATCH
            // ------------------------------------

            if (
                batch.length >=
                BATCH_SIZE
            ) {

                await Product.insertMany(
                    batch,
                    {
                        ordered: false
                    }
                );

                insertedRows +=
                    batch.length;

                batch = [];


                console.log(
                    `Imported ${insertedRows} electronics products...`
                );
            }
        }


        // ========================================
        // INSERT REMAINING
        // ========================================

        if (
            batch.length > 0
        ) {

            await Product.insertMany(
                batch,
                {
                    ordered: false
                }
            );

            insertedRows +=
                batch.length;
        }


        // ========================================
        // FINAL REPORT
        // ========================================

        console.log("");

        console.log(
            "=============================================="
        );

        console.log(
            "          IMPORT COMPLETED"
        );

        console.log(
            "=============================================="
        );

        console.log("");

        console.log(
            `Total CSV rows:        ${totalRows}`
        );

        console.log(
            `Electronics rows:     ${electronicsRows}`
        );

        console.log(
            `Skipped rows:         ${skippedRows}`
        );

        console.log(
            `Imported products:    ${insertedRows}`
        );

        console.log("");

        console.log(
            "SUB-CATEGORY BREAKDOWN"
        );

        console.log(
            "----------------------------------------------"
        );


        Object.entries(categoryCounts)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            )
            .forEach(
                ([category, count]) => {

                    console.log(
                        `${category} : ${count}`
                    );
                }
            );


        console.log("");

        console.log(
            "DecisionLens category:"
        );

        console.log(
            "electronics"
        );

        console.log("");

    } catch (error) {

        console.error("");

        console.error(
            "=============================================="
        );

        console.error(
            "IMPORT ERROR"
        );

        console.error(
            "=============================================="
        );

        console.error("");

        console.error(
            error
        );

    } finally {

        await mongoose.connection.close();

        process.exit();
    }
}


// ============================================
// START
// ============================================

importElectronics();