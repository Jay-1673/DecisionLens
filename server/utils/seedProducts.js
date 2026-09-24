const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("../models/Product");

dotenv.config();

const products = [
    {
        name: "MacBook Air M4",
        brand: "Apple",
        category: "laptop",
        price: 99999,
        processor: "Apple M4",
        ram: "16 GB",
        storage: "512 GB SSD",
        gpu: "Integrated",
        battery: "18 hours",
        display: "13.6 inch Retina",
        weight: "1.24 kg"
    },

    {
        name: "MacBook Pro M4",
        brand: "Apple",
        category: "laptop",
        price: 149999,
        processor: "Apple M4 Pro",
        ram: "18 GB",
        storage: "512 GB SSD",
        gpu: "Integrated",
        battery: "20 hours",
        display: "14.2 inch Liquid Retina XDR",
        weight: "1.55 kg"
    },

    {
        name: "Dell XPS 13",
        brand: "Dell",
        category: "laptop",
        price: 119999,
        processor: "Intel Core Ultra 7",
        ram: "16 GB",
        storage: "512 GB SSD",
        gpu: "Intel Arc",
        battery: "18 hours",
        display: "13.4 inch FHD+",
        weight: "1.19 kg"
    },

    {
        name: "Lenovo Yoga 7",
        brand: "Lenovo",
        category: "laptop",
        price: 84999,
        processor: "AMD Ryzen 7",
        ram: "16 GB",
        storage: "512 GB SSD",
        gpu: "Integrated Radeon",
        battery: "14 hours",
        display: "14 inch OLED",
        weight: "1.49 kg"
    },

    {
        name: "ASUS Zenbook 14",
        brand: "ASUS",
        category: "laptop",
        price: 89999,
        processor: "Intel Core Ultra 7",
        ram: "16 GB",
        storage: "1 TB SSD",
        gpu: "Intel Arc",
        battery: "15 hours",
        display: "14 inch OLED",
        weight: "1.20 kg"
    },

    {
        name: "HP Pavilion Plus",
        brand: "HP",
        category: "laptop",
        price: 74999,
        processor: "Intel Core i7",
        ram: "16 GB",
        storage: "512 GB SSD",
        gpu: "Intel Iris Xe",
        battery: "12 hours",
        display: "14 inch IPS",
        weight: "1.41 kg"
    }
];

const seedProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        await Product.deleteMany();

        await Product.insertMany(products);

        console.log("Products inserted successfully!");

        await mongoose.connection.close();

    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
};

seedProducts();