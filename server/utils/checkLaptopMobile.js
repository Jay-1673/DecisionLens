const fs = require("fs");
const csv = require("csv-parser");

const filePath = "./dataset/amazon-products.csv";

const laptopProducts = [];
const mobileProducts = [];

const laptopCategories = {};
const mobileCategories = {};

console.log("Checking Amazon dataset...\n");

fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
        const name = (row.name || "").toLowerCase().trim();
        const mainCategory = (row.main_category || "").trim();
        const subCategory = (row.sub_category || "").trim();

        // -----------------------------------
        // LAPTOP DETECTION
        // -----------------------------------

        const isLaptop =
            /\blaptop\b/i.test(name) ||
            /\bnotebook\b/i.test(name) ||
            /\bmacbook\b/i.test(name);

        if (isLaptop) {
            laptopProducts.push({
                name: row.name,
                mainCategory,
                subCategory
            });

            const key = `${mainCategory} → ${subCategory}`;

            laptopCategories[key] =
                (laptopCategories[key] || 0) + 1;
        }

        // -----------------------------------
        // MOBILE PHONE DETECTION
        // -----------------------------------

        const isMobile =
            /\bsmartphone\b/i.test(name) ||
            /\bmobile phone\b/i.test(name) ||
            /\bcell phone\b/i.test(name) ||
            /\biphone\b/i.test(name) ||
            /\bgalaxy\b/i.test(name) ||
            /\bredmi\b/i.test(name) ||
            /\boneplus\b/i.test(name) ||
            /\bpoco\b/i.test(name) ||
            /\bvivo\b/i.test(name) ||
            /\boppo\b/i.test(name) ||
            /\brealme\b/i.test(name) ||
            /\bmotorola\b/i.test(name) ||
            /\bnokia\b/i.test(name);

        if (isMobile) {
            mobileProducts.push({
                name: row.name,
                mainCategory,
                subCategory
            });

            const key = `${mainCategory} → ${subCategory}`;

            mobileCategories[key] =
                (mobileCategories[key] || 0) + 1;
        }
    })
    .on("end", () => {

        // -----------------------------------
        // LAPTOP RESULTS
        // -----------------------------------

        console.log("\n=================================");
        console.log("LAPTOP PRODUCTS");
        console.log("=================================");

        console.log(
            "Possible laptop products:",
            laptopProducts.length
        );

        console.log("\nCategories:");

        Object.entries(laptopCategories)
            .sort((a, b) => b[1] - a[1])
            .forEach(([category, count]) => {
                console.log(`${count} → ${category}`);
            });

        console.log("\nSample laptop products:");

        laptopProducts
            .slice(0, 30)
            .forEach((product, index) => {
                console.log(
                    `\n${index + 1}. ${product.name}`
                );
                console.log(
                    `   Category: ${product.mainCategory}`
                );
                console.log(
                    `   Sub Category: ${product.subCategory}`
                );
            });

        // -----------------------------------
        // MOBILE RESULTS
        // -----------------------------------

        console.log("\n\n=================================");
        console.log("MOBILE PHONE PRODUCTS");
        console.log("=================================");

        console.log(
            "Possible mobile products:",
            mobileProducts.length
        );

        console.log("\nCategories:");

        Object.entries(mobileCategories)
            .sort((a, b) => b[1] - a[1])
            .forEach(([category, count]) => {
                console.log(`${count} → ${category}`);
            });

        console.log("\nSample mobile products:");

        mobileProducts
            .slice(0, 30)
            .forEach((product, index) => {
                console.log(
                    `\n${index + 1}. ${product.name}`
                );
                console.log(
                    `   Category: ${product.mainCategory}`
                );
                console.log(
                    `   Sub Category: ${product.subCategory}`
                );
            });

        console.log("\n=================================");
        console.log("CHECK COMPLETE");
        console.log("=================================");
    })
    .on("error", (error) => {
        console.error("Error reading CSV:", error);
    });