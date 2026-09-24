const Product = require("../models/Product");

// =====================================================
// GET PRODUCTS
// Supports:
// /api/products
// /api/products?category=electronics
// /api/products?search=iphone
// /api/products?category=electronics&page=1&limit=12
// =====================================================

const getProducts = async (req, res) => {
    try {
        const {
            search = "",
            category = "",
            subCategory = "",
            page = 1,
            limit = 12
        } = req.query;

        const currentPage = Math.max(
            parseInt(page) || 1,
            1
        );

        const productsPerPage = Math.min(
            Math.max(parseInt(limit) || 12, 1),
            50
        );

        // ==========================================
        // BUILD QUERY
        // ==========================================

        const query = {};

        // Category filter
        if (
            category &&
            category.toString().trim() !== ""
        ) {
            query.category = {
                $regex: `^${escapeRegex(
                    category.toString().trim()
                )}$`,
                $options: "i"
            };
        }

        // Sub-category filter
        if (
            subCategory &&
            subCategory.toString().trim() !== ""
        ) {
            query.subCategory = {
                $regex: escapeRegex(
                    subCategory.toString().trim()
                ),
                $options: "i"
            };
        }

        // Search
        if (
            search &&
            search.toString().trim() !== ""
        ) {
            const searchTerm = escapeRegex(
                search.toString().trim()
            );

            query.$or = [
                {
                    name: {
                        $regex: searchTerm,
                        $options: "i"
                    }
                },
                {
                    brand: {
                        $regex: searchTerm,
                        $options: "i"
                    }
                },
                {
                    category: {
                        $regex: searchTerm,
                        $options: "i"
                    }
                },
                {
                    subCategory: {
                        $regex: searchTerm,
                        $options: "i"
                    }
                }
            ];
        }

        // ==========================================
        // COUNT
        // ==========================================

        const totalProducts =
            await Product.countDocuments(query);

        const totalPages =
            Math.ceil(
                totalProducts /
                    productsPerPage
            );

        // ==========================================
        // FETCH PRODUCTS
        // ==========================================

        const skip =
            (currentPage - 1) *
            productsPerPage;

        const products =
            await Product.find(query)
                .sort({
                    createdAt: -1
                })
                .skip(skip)
                .limit(productsPerPage)
                .lean();

        // ==========================================
        // RESPONSE
        // ==========================================

        res.json({
            products,
            totalProducts,
            totalPages,
            currentPage,
            limit: productsPerPage
        });

    } catch (error) {

        console.error(
            "Get products error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch products.",
            error:
                process.env.NODE_ENV ===
                "development"
                    ? error.message
                    : undefined
        });
    }
};


// =====================================================
// GET PRODUCTS BY CATEGORY
// =====================================================

const getProductsByCategory = async (
    req,
    res
) => {

    try {

        const { category } =
            req.params;

        const products =
            await Product.find({
                category: {
                    $regex: `^${escapeRegex(
                        category
                    )}$`,
                    $options: "i"
                }
            }).lean();

        res.json(products);

    } catch (error) {

        console.error(
            "Category products error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch products."
        });
    }
};


// =====================================================
// GET SINGLE PRODUCT
// =====================================================

const getProductById = async (
    req,
    res
) => {

    try {

        const product =
            await Product.findById(
                req.params.id
            ).lean();

        if (!product) {

            return res.status(404).json({
                message:
                    "Product not found."
            });
        }

        res.json(product);

    } catch (error) {

        console.error(
            "Get product error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch product."
        });
    }
};


// =====================================================
// ESCAPE REGEX
// =====================================================

function escapeRegex(value) {

    return value.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );
}


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    getProducts,
    getProductsByCategory,
    getProductById

};