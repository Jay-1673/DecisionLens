const path = require("path");
require("dotenv").config({
    path: path.resolve(__dirname, "../.env")
});

const mongoose = require("mongoose");

async function check() {
    try {
        const uri =
            process.env.MONGO_URI ||
            process.env.MONGODB_URI ||
            process.env.MONGO_URL;

        console.log("\nMongo URI exists:", !!uri);

        await mongoose.connect(uri);

        console.log("MongoDB connected successfully ✅");

        const db = mongoose.connection.db;

        const collections = await db
            .listCollections()
            .toArray();

        console.log("\nCollections:");

        collections.forEach((collection) => {
            console.log("-", collection.name);
        });

        const collection = db.collection("products");

        const total = await collection.countDocuments();

        console.log("\nRaw MongoDB product count:", total);

        const sample = await collection.findOne({});

        console.log("\nFirst raw product:");
        console.log(JSON.stringify(sample, null, 2));

        const amazon2023Count = await collection.countDocuments({
            source: "Amazon Products 2023"
        });

        console.log(
            "\nAmazon Products 2023:",
            amazon2023Count
        );

        const laptops = await collection.countDocuments({
            subCategory: "Laptops"
        });

        console.log("Raw Laptops:", laptops);

        const mobiles = await collection.countDocuments({
            subCategory: "Mobiles"
        });

        console.log("Raw Mobiles:", mobiles);

        await mongoose.disconnect();

    } catch (error) {
        console.error("\nERROR:");
        console.error(error);
        process.exit(1);
    }
}

check();