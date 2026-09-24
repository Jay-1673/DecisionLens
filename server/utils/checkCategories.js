const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const csvPath = path.join(
    __dirname,
    "../dataset/amazon-products.csv"
);

const categories = {};
const subCategories = {};

let totalRows = 0;

console.log("Reading CSV...");
console.log("");

const stream = fs
    .createReadStream(csvPath)
    .pipe(csv());

stream.on("data", (row) => {

    totalRows++;

    const mainCategory =
        String(row.main_category || "")
            .trim();

    const subCategory =
        String(row.sub_category || "")
            .trim();

    if (mainCategory) {

        categories[mainCategory] =
            (categories[mainCategory] || 0) + 1;
    }

    if (subCategory) {

        subCategories[subCategory] =
            (subCategories[subCategory] || 0) + 1;
    }
});

stream.on("end", () => {

    console.log("==============================");
    console.log("CSV CATEGORY CHECK");
    console.log("==============================");

    console.log("");
    console.log(
        `Total rows: ${totalRows}`
    );

    console.log("");
    console.log("MAIN CATEGORIES:");
    console.log("------------------------------");

    Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .forEach(([category, count]) => {

            console.log(
                `${category} : ${count}`
            );
        });

    console.log("");
    console.log("==============================");
    console.log("SUB CATEGORIES:");
    console.log("==============================");

    Object.entries(subCategories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 100)
        .forEach(([category, count]) => {

            console.log(
                `${category} : ${count}`
            );
        });

    console.log("");
    console.log("Done.");
});