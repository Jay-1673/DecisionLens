const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const csvPath = path.join(
    __dirname,
    "../dataset/amazon-products.csv"
);

const categories = {};

let totalRows = 0;
let matchingRows = 0;

console.log("");
console.log("======================================");
console.log("DECISIONLENS ELECTRONICS CATEGORY CHECK");
console.log("======================================");
console.log("");

const stream = fs
    .createReadStream(csvPath)
    .pipe(csv());

stream.on("data", (row) => {

    totalRows++;

    const mainCategory =
        String(row.main_category || "")
            .trim()
            .toLowerCase();

    /*
     * Check the Amazon categories that are
     * potentially useful for DecisionLens.
     */

    const allowedMainCategories = [
        "tv, audio & cameras",
        "accessories"
    ];

    if (
        !allowedMainCategories.includes(
            mainCategory
        )
    ) {
        return;
    }

    matchingRows++;

    const subCategory =
        String(row.sub_category || "")
            .trim();

    if (!subCategory) {
        return;
    }

    categories[subCategory] =
        (categories[subCategory] || 0) + 1;
});

stream.on("end", () => {

    console.log(
        `Total CSV rows scanned: ${totalRows}`
    );

    console.log(
        `Matching electronics-related rows: ${matchingRows}`
    );

    console.log("");
    console.log("SUB CATEGORIES");
    console.log("--------------------------------------");

    Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .forEach(([category, count]) => {

            console.log(
                `${category} : ${count}`
            );
        });

    console.log("");
    console.log("======================================");
    console.log("CHECK COMPLETED");
    console.log("======================================");
});