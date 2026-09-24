const fs = require("fs");
const path = require("path");
const readline = require("readline");

const FILE_PATH = path.resolve(
    __dirname,
    "dataset/decisionlens-products.jsonl"
);

async function checkFile() {
    console.log("==============================================");
    console.log("CHECKING DECISIONLENS JSONL FILE");
    console.log("==============================================");

    console.log("\nFile path:");
    console.log(FILE_PATH);

    // Check file existence
    if (!fs.existsSync(FILE_PATH)) {
        console.log("\n❌ FILE DOES NOT EXIST");
        return;
    }

    console.log("\n✅ File exists");

    // File information
    const stats = fs.statSync(FILE_PATH);

    console.log("\nFile size:");
    console.log((stats.size / 1024 / 1024).toFixed(2), "MB");

    if (stats.size === 0) {
        console.log("\n❌ FILE IS EMPTY");
        return;
    }

    console.log("\nReading JSONL...\n");

    const fileStream = fs.createReadStream(FILE_PATH, {
        encoding: "utf8"
    });

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let totalLines = 0;
    let validJson = 0;
    let invalidJson = 0;

    let firstProduct = null;

    for await (const line of rl) {
        if (!line.trim()) {
            continue;
        }

        totalLines++;

        try {
            const product = JSON.parse(line);

            validJson++;

            if (!firstProduct) {
                firstProduct = product;
            }

        } catch (error) {
            invalidJson++;

            if (invalidJson <= 5) {
                console.log("❌ Invalid JSON at line:", totalLines);
                console.log(error.message);
                console.log("Line:");
                console.log(line.substring(0, 500));
                console.log("----------------------------------------------");
            }
        }
    }

    console.log("\n==============================================");
    console.log("JSONL CHECK RESULT");
    console.log("==============================================");

    console.log("Total non-empty lines:", totalLines);
    console.log("Valid JSON:", validJson);
    console.log("Invalid JSON:", invalidJson);

    if (firstProduct) {
        console.log("\n==============================================");
        console.log("FIRST PRODUCT");
        console.log("==============================================");

        console.log(
            JSON.stringify(firstProduct, null, 2)
        );
    }

    console.log("\n==============================================");

    if (validJson > 0) {
        console.log("✅ JSONL FILE IS VALID");
    } else {
        console.log("❌ NO VALID JSON PRODUCTS FOUND");
    }

    console.log("==============================================");
}

checkFile();