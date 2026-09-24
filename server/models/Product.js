const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        // ==============================
        // BASIC PRODUCT INFORMATION
        // ==============================

        name: {
            type: String,
            required: true,
            trim: true
        },

        brand: {
            type: String,
            default: "Unknown Brand",
            trim: true
        },

        category: {
            type: String,
            required: true,
            trim: true,
            index: true
        },

        subCategory: {
            type: String,
            default: "",
            trim: true,
            index: true
        },

        description: {
            type: String,
            default: ""
        },

        // ==============================
        // PRICE
        // ==============================

        price: {
            type: Number,
            required: true,
            default: 0
        },

        originalPrice: {
            type: Number,
            default: 0
        },

        mrp: {
            type: Number,
            default: 0
        },

        discount: {
            type: Number,
            default: 0
        },

        // ==============================
        // RATINGS & REVIEWS
        // ==============================

        rating: {
            type: Number,
            default: 0
        },

        reviewCount: {
            type: Number,
            default: 0
        },

        // ==============================
        // PRODUCT SPECIFICATIONS
        // ==============================

        processor: {
            type: String,
            default: ""
        },

        ram: {
            type: String,
            default: ""
        },

        storage: {
            type: String,
            default: ""
        },

        gpu: {
            type: String,
            default: ""
        },

        battery: {
            type: String,
            default: ""
        },

        display: {
            type: String,
            default: ""
        },

        weight: {
            type: String,
            default: ""
        },

        // ==============================
        // OLD DATASET COMPATIBILITY
        // ==============================

        packSize: {
            type: String,
            default: ""
        },

        offers: {
            type: String,
            default: ""
        },

        comboOffers: {
            type: String,
            default: ""
        },

        stockAvailable: {
            type: Boolean,
            default: true
        },

        siteName: {
            type: String,
            default: ""
        },

        crawlTimestamp: {
            type: String,
            default: ""
        },

        // ==============================
        // AMAZON INFORMATION
        // ==============================

        asin: {
            type: String,
            default: "",
            index: true
        },

        productUrl: {
            type: String,
            default: ""
        },

        image: {
            type: String,
            default: ""
        },

        source: {
            type: String,
            default: "Amazon India"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Product",
    productSchema
);