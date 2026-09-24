import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "../../styles/decision.css";

function Options() {

    const navigate = useNavigate();

    // =====================================================
    // STATE
    // =====================================================

    const [products, setProducts] = useState([]);

    const [selectedProducts, setSelectedProducts] =
        useState([]);

    const [search, setSearch] = useState("");

    const [category] =
        useState("electronics");

    const [subCategory, setSubCategory] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [page, setPage] =
        useState(1);

    const [pagination, setPagination] =
        useState({
            totalProducts: 0,
            totalPages: 0
        });


    // =====================================================
    // ELECTRONICS CATEGORIES
    // IMPORTANT:
    // These values must exactly match MongoDB subCategory
    // =====================================================

    const categories = [
        {
            name: "",
            label: "All Electronics",
            icon: "⚡"
        },
        {
            name: "Laptops",
            label: "Laptops",
            icon: "💻"
        },
        {
            name: "Mobiles",
            label: "Mobiles",
            icon: "📱"
        },
        {
            name: "Audio",
            label: "Audio",
            icon: "🎧"
        },
        {
            name: "Cameras",
            label: "Cameras",
            icon: "📷"
        },
        {
            name: "TV",
            label: "TV",
            icon: "📺"
        },
        {
            name: "Wearables",
            label: "Wearables",
            icon: "⌚"
        },
        {
            name: "Accessories",
            label: "Accessories",
            icon: "🔌"
        }
    ];


    // =====================================================
    // FETCH PRODUCTS
    // =====================================================

    useEffect(() => {

        const fetchProducts = async () => {

            try {

                setLoading(true);
                setError("");

                const params = {
                    category,
                    page,
                    limit: 12
                };

                // Only send subCategory when one is selected
                if (subCategory) {
                    params.subCategory = subCategory;
                }

                // Only send search when user entered something
                if (search.trim()) {
                    params.search = search.trim();
                }

                console.log(
                    "Fetching products with:",
                    params
                );

                const response = await API.get(
                    "/products",
                    {
                        params
                    }
                );

                const data = response.data;

                console.log(
                    "Products API response:",
                    data
                );

                setProducts(
                    data.products || []
                );

                setPagination({
                    totalProducts:
                        Number(
                            data.totalProducts
                        ) || 0,

                    totalPages:
                        Number(
                            data.totalPages
                        ) || 0
                });

            } catch (err) {

                console.error(
                    "Product fetch error:",
                    err
                );

                setProducts([]);

                setPagination({
                    totalProducts: 0,
                    totalPages: 0
                });

                setError(
                    err.response?.data?.message ||
                    "Unable to load electronics."
                );

            } finally {

                setLoading(false);

            }
        };

        fetchProducts();

    }, [
        search,
        category,
        subCategory,
        page
    ]);


    // =====================================================
    // SELECT PRODUCT
    // =====================================================

    const toggleProduct = (product) => {

        const alreadySelected =
            selectedProducts.some(
                item =>
                    item._id === product._id
            );

        if (alreadySelected) {

            setSelectedProducts(
                selectedProducts.filter(
                    item =>
                        item._id !== product._id
                )
            );

            return;
        }

        if (selectedProducts.length >= 4) {

            alert(
                "You can compare maximum 4 products."
            );

            return;
        }

        setSelectedProducts([
            ...selectedProducts,
            product
        ]);
    };


    // =====================================================
    // CATEGORY CHANGE
    // =====================================================

    const handleCategoryChange = (
        newSubCategory
    ) => {

        setSubCategory(
            newSubCategory
        );

        setPage(1);
    };


    // =====================================================
    // SEARCH
    // =====================================================

    const handleSearchChange = (e) => {

        setSearch(
            e.target.value
        );

        setPage(1);
    };


    // =====================================================
    // COMPARE
    // =====================================================

    const handleContinue = () => {

        if (
            selectedProducts.length < 2
        ) {

            alert(
                "Please select at least 2 products to compare."
            );

            return;
        }

        navigate(
            "/decisions/result",
            {
                state: {
                    options:
                        selectedProducts,

                    title:
                        "Electronics Comparison"
                }
            }
        );
    };


    // =====================================================
    // PRICE
    // =====================================================

    const formatPrice = (price) => {

        if (
            price === undefined ||
            price === null ||
            Number(price) <= 0
        ) {
            return "Price unavailable";
        }

        return `₹${Number(price).toLocaleString(
            "en-IN"
        )}`;
    };


    // =====================================================
    // IMAGE
    // =====================================================

    const getProductImage = (
        product
    ) => {

        if (product.image) {
            return product.image;
        }

        return "";
    };


    // =====================================================
    // RATING
    // =====================================================

    const renderRating = (
        rating
    ) => {

        const value =
            Number(rating) || 0;

        return (
            <div className="product-rating">

                <span className="rating-stars">
                    ★
                </span>

                <strong>
                    {value > 0
                        ? value.toFixed(1)
                        : "N/A"}
                </strong>

                {value > 0 && (
                    <span>
                        / 5
                    </span>
                )}

            </div>
        );
    };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="decision-page">

            {/* =========================================
                HEADER
            ========================================= */}

            <header className="decision-header">

                <div className="step-number">
                    STEP 2 OF 4
                </div>

                <h1>
                    Choose Your Electronics
                </h1>

                <p>
                    Compare real Amazon product data
                    and let DecisionLens automatically
                    analyze price, ratings, reviews
                    and value.
                </p>

            </header>


            {/* =========================================
                CATEGORY NAVIGATION
            ========================================= */}

            <div className="product-controls">

                <div className="category-list">

                    {categories.map(
                        item => (

                            <button
                                key={
                                    item.label
                                }
                                className={`category-button ${
                                    subCategory ===
                                    item.name
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    handleCategoryChange(
                                        item.name
                                    )
                                }
                            >

                                <span>
                                    {item.icon}
                                </span>

                                {item.label}

                            </button>

                        )
                    )}

                </div>


                {/* SEARCH */}

                <div className="search-wrapper">

                    <span className="search-icon">
                        ⌕
                    </span>

                    <input
                        type="text"
                        value={search}
                        onChange={
                            handleSearchChange
                        }
                        placeholder="Search laptops, phones, headphones, cameras..."
                        className="product-search"
                    />

                </div>

            </div>


            {/* =========================================
                TOOLBAR
            ========================================= */}

            <div className="product-toolbar">

                <div className="result-count">

                    {loading
                        ? "Finding products..."
                        : (
                            <>
                                <strong>
                                    {pagination
                                        .totalProducts
                                        .toLocaleString(
                                            "en-IN"
                                        )}
                                </strong>{" "}
                                products found
                            </>
                        )}

                </div>


                {selectedProducts.length >
                    0 && (

                    <div className="selected-info">

                        <span>

                            <strong>
                                {
                                    selectedProducts.length
                                }
                            </strong>

                            {" "}of 4 selected

                        </span>

                        <button
                            onClick={() =>
                                setSelectedProducts(
                                    []
                                )
                            }
                        >
                            Clear
                        </button>

                    </div>

                )}

            </div>


            {/* =========================================
                ERROR
            ========================================= */}

            {error && (

                <div className="error-message">

                    {error}

                </div>

            )}


            {/* =========================================
                LOADING
            ========================================= */}

            {loading && (

                <div className="products-container">

                    <div className="loading">

                        <div className="loading-spinner"></div>

                        <span>
                            Loading Amazon products...
                        </span>

                    </div>

                </div>

            )}


            {/* =========================================
                EMPTY
            ========================================= */}

            {!loading &&
                !error &&
                products.length === 0 && (

                    <div className="no-products">

                        <div className="no-products-icon">
                            🔎
                        </div>

                        <h3>
                            No electronics found
                        </h3>

                        <p>
                            Try another product name
                            or category.
                        </p>

                    </div>

                )}


            {/* =========================================
                PRODUCTS
            ========================================= */}

            {!loading &&
                products.length > 0 && (

                <div className="products-container">

                    {products.map(
                        product => {

                            const isSelected =
                                selectedProducts.some(
                                    item =>
                                        item._id ===
                                        product._id
                                );

                            return (

                                <article
                                    key={
                                        product._id
                                    }
                                    className={`product-card ${
                                        isSelected
                                            ? "selected"
                                            : ""
                                    }`}
                                >

                                    {/* IMAGE */}

                                    <div className="product-image-wrapper">

                                        {product.discount >
                                            0 && (

                                            <div className="product-discount">

                                                {Math.round(
                                                    product.discount
                                                )}% OFF

                                            </div>

                                        )}

                                        {product.image ? (

                                            <img
                                                src={
                                                    getProductImage(
                                                        product
                                                    )
                                                }
                                                alt={
                                                    product.name
                                                }
                                                className="product-image"
                                                onError={e => {
                                                    e.currentTarget.style.display =
                                                        "none";
                                                }}
                                            />

                                        ) : (

                                            <div className="product-image-placeholder">
                                                📦
                                            </div>

                                        )}


                                        {/* SELECT */}

                                        <button
                                            className={`product-select-check ${
                                                isSelected
                                                    ? "checked"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                toggleProduct(
                                                    product
                                                )
                                            }
                                        >

                                            {isSelected
                                                ? "✓"
                                                : "+"}

                                        </button>

                                    </div>


                                    {/* INFORMATION */}

                                    <div className="product-info">

                                        <div className="product-brand">

                                            {product.brand &&
                                            product.brand !==
                                                "Unknown" &&
                                            product.brand !==
                                                "Unknown Brand"
                                                ? product.brand
                                                : "Amazon Product"}

                                        </div>


                                        <h2
                                            title={
                                                product.name
                                            }
                                        >
                                            {
                                                product.name
                                            }
                                        </h2>


                                        {/* RATING */}

                                        <div className="product-meta">

                                            {renderRating(
                                                product.rating
                                            )}

                                            {product.reviewCount >
                                                0 && (

                                                <span className="review-count">

                                                    (
                                                    {Number(
                                                        product.reviewCount
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}{" "}
                                                    reviews)

                                                </span>

                                            )}

                                        </div>


                                        {/* PRICE */}

                                        <div className="product-price">

                                            {formatPrice(
                                                product.price
                                            )}

                                        </div>


                                        {/* ORIGINAL PRICE */}

                                        <div className="price-details">

                                            {product.originalPrice >
                                                product.price && (

                                                <span className="product-mrp">

                                                    ₹
                                                    {Number(
                                                        product.originalPrice
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}

                                                </span>

                                            )}

                                            {product.discount >
                                                0 && (

                                                <span className="discount-badge">

                                                    {Math.round(
                                                        product.discount
                                                    )}
                                                    % OFF

                                                </span>

                                            )}

                                        </div>


                                        {/* CATEGORY */}

                                        <div className="product-category">

                                            {product.subCategory ||
                                                "Electronics"}

                                        </div>


                                        {/* DETAILS */}

                                        <div className="product-detail">

                                            <span>
                                                Reviews
                                            </span>

                                            <strong>
                                                {product.reviewCount >
                                                0
                                                    ? Number(
                                                        product.reviewCount
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )
                                                    : "Not available"}
                                            </strong>

                                        </div>


                                        <div className="product-detail">

                                            <span>
                                                Source
                                            </span>

                                            <strong>
                                                Amazon
                                            </strong>

                                        </div>


                                        {/* BUTTON */}

                                        <button
                                            className={`select-product ${
                                                isSelected
                                                    ? "selected-button"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                toggleProduct(
                                                    product
                                                )
                                            }
                                        >

                                            {isSelected
                                                ? "✓ Selected"
                                                : "Add to Comparison"}

                                        </button>

                                    </div>

                                </article>

                            );

                        }
                    )}

                </div>

            )}


            {/* =========================================
                PAGINATION
            ========================================= */}

            {!loading &&
                pagination.totalPages > 1 && (

                <div className="pagination">

                    <button
                        disabled={
                            page === 1
                        }
                        onClick={() =>
                            setPage(
                                previous =>
                                    previous - 1
                            )
                        }
                    >
                        ← Previous
                    </button>


                    <span>
                        Page{" "}
                        <strong>
                            {page}
                        </strong>{" "}
                        of{" "}
                        <strong>
                            {
                                pagination.totalPages
                            }
                        </strong>
                    </span>


                    <button
                        disabled={
                            page >=
                            pagination.totalPages
                        }
                        onClick={() =>
                            setPage(
                                previous =>
                                    previous + 1
                            )
                        }
                    >
                        Next →
                    </button>

                </div>

            )}


            {/* =========================================
                COMPARE BAR
            ========================================= */}

            {selectedProducts.length >=
                2 && (

                <div className="compare-bar">

                    <div className="compare-selected">

                        <div className="mini-product-stack">

                            {selectedProducts
                                .slice(0, 4)
                                .map(product => (

                                    <div
                                        key={
                                            product._id
                                        }
                                        className="mini-product"
                                    >

                                        {product.image ? (

                                            <img
                                                src={
                                                    product.image
                                                }
                                                alt=""
                                            />

                                        ) : (

                                            "📦"

                                        )}

                                    </div>

                                ))}

                        </div>

                        <div>

                            <strong>
                                {
                                    selectedProducts.length
                                }{" "}
                                products selected
                            </strong>

                            <span>
                                Ready for automatic analysis
                            </span>

                        </div>

                    </div>


                    <button
                        onClick={
                            handleContinue
                        }
                    >
                        Analyze Comparison
                        <span>→</span>
                    </button>

                </div>

            )}

        </div>
    );
}

export default Options;