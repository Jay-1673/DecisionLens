import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/decision.css";

function DecisionResult() {

    const location = useLocation();
    const navigate = useNavigate();

    const products =
        location.state?.options || [];


    // =====================================================
    // HELPERS
    // =====================================================

    const normalize = (
        value,
        min,
        max
    ) => {

        if (max === min) {
            return 10;
        }

        return (
            ((value - min) /
                (max - min)) *
            10
        );
    };


    const clamp = (
        value,
        min = 0,
        max = 10
    ) => {

        return Math.min(
            Math.max(value, min),
            max
        );
    };


    // =====================================================
    // AUTOMATIC ANALYSIS
    // =====================================================

    const analysis = useMemo(() => {

        if (!products.length) {
            return null;
        }


        const prices =
            products.map(
                product =>
                    Number(product.price) || 0
            );

        const ratings =
            products.map(
                product =>
                    Number(product.rating) || 0
            );

        const reviews =
            products.map(
                product =>
                    Number(product.reviewCount) || 0
            );

        const discounts =
            products.map(
                product =>
                    Number(product.discount) || 0
            );


        const minPrice =
            Math.min(...prices);

        const maxPrice =
            Math.max(...prices);

        const minReviews =
            Math.min(...reviews);

        const maxReviews =
            Math.max(...reviews);

        const minDiscount =
            Math.min(...discounts);

        const maxDiscount =
            Math.max(...discounts);


        const scoredProducts =
            products.map(product => {

                const price =
                    Number(product.price) || 0;

                const rating =
                    Number(product.rating) || 0;

                const reviewCount =
                    Number(
                        product.reviewCount
                    ) || 0;

                const discount =
                    Number(product.discount) || 0;


                // -----------------------------------------
                // PRICE VALUE
                // Lower price = higher score
                // -----------------------------------------

                let priceScore;

                if (
                    maxPrice === minPrice
                ) {

                    priceScore = 10;

                } else {

                    priceScore =
                        10 -
                        normalize(
                            price,
                            minPrice,
                            maxPrice
                        );
                }


                priceScore =
                    clamp(priceScore);


                // -----------------------------------------
                // RATING
                // -----------------------------------------

                const ratingScore =
                    clamp(
                        (rating / 5) * 10
                    );


                // -----------------------------------------
                // REVIEW CONFIDENCE
                // Logarithmic scale
                // -----------------------------------------

                let reviewScore;

                if (
                    maxReviews ===
                    minReviews
                ) {

                    reviewScore = 10;

                } else {

                    reviewScore =
                        normalize(
                            Math.log10(
                                reviewCount + 1
                            ),
                            Math.log10(
                                minReviews + 1
                            ),
                            Math.log10(
                                maxReviews + 1
                            )
                        );
                }

                reviewScore =
                    clamp(reviewScore);


                // -----------------------------------------
                // DISCOUNT
                // -----------------------------------------

                let discountScore;

                if (
                    maxDiscount ===
                    minDiscount
                ) {

                    discountScore = 10;

                } else {

                    discountScore =
                        normalize(
                            discount,
                            minDiscount,
                            maxDiscount
                        );
                }

                discountScore =
                    clamp(discountScore);


                // -----------------------------------------
                // INFORMATION COMPLETENESS
                // -----------------------------------------

                let informationPoints = 0;

                if (product.name)
                    informationPoints++;

                if (product.image)
                    informationPoints++;

                if (product.productUrl)
                    informationPoints++;

                if (product.subCategory)
                    informationPoints++;

                if (product.rating > 0)
                    informationPoints++;

                if (product.reviewCount > 0)
                    informationPoints++;


                const informationScore =
                    clamp(
                        (informationPoints /
                            6) *
                        10
                    );


                // -----------------------------------------
                // FINAL SCORE
                // -----------------------------------------

                const finalScore =
                    (
                        priceScore * 0.30 +
                        ratingScore * 0.30 +
                        reviewScore * 0.15 +
                        discountScore * 0.10 +
                        informationScore * 0.15
                    );


                return {

                    ...product,

                    scores: {

                        price:
                            Number(
                                priceScore.toFixed(1)
                            ),

                        rating:
                            Number(
                                ratingScore.toFixed(1)
                            ),

                        reviews:
                            Number(
                                reviewScore.toFixed(1)
                            ),

                        discount:
                            Number(
                                discountScore.toFixed(1)
                            ),

                        information:
                            Number(
                                informationScore.toFixed(1)
                            ),

                        overall:
                            Number(
                                finalScore.toFixed(1)
                            )
                    }

                };

            });


        scoredProducts.sort(
            (a, b) =>
                b.scores.overall -
                a.scores.overall
        );


        const winner =
            scoredProducts[0];


        return {

            products:
                scoredProducts,

            winner,

            factors: [

                {
                    label: "Price Value",
                    score:
                        winner.scores.price,
                    icon: "₹"
                },

                {
                    label: "Customer Rating",
                    score:
                        winner.scores.rating,
                    icon: "★"
                },

                {
                    label: "Review Confidence",
                    score:
                        winner.scores.reviews,
                    icon: "✓"
                },

                {
                    label: "Discount",
                    score:
                        winner.scores.discount,
                    icon: "%"
                },

                {
                    label: "Product Information",
                    score:
                        winner.scores.information,
                    icon: "i"
                }

            ]

        };

    }, [products]);


    // =====================================================
    // EMPTY STATE
    // =====================================================

    if (!analysis) {

        return (

            <div className="result-page">

                <div className="result-empty">

                    <div className="result-empty-icon">
                        📊
                    </div>

                    <h1>
                        No comparison found
                    </h1>

                    <p>
                        Select at least two
                        electronics products
                        before starting an analysis.
                    </p>

                    <button
                        className="result-primary-button"
                        onClick={() =>
                            navigate(
                                "/decisions/options"
                            )
                        }
                    >
                        Choose Products →
                    </button>

                </div>

            </div>
        );
    }


    const {
        winner,
        products: rankedProducts,
        factors
    } = analysis;


    // =====================================================
    // WHY WINNER
    // =====================================================

    const getWinnerReason =
        () => {

            const reasons = [];

            if (
                winner.scores.price >= 8
            ) {
                reasons.push(
                    "strong price value"
                );
            }

            if (
                winner.scores.rating >= 8
            ) {
                reasons.push(
                    "excellent customer rating"
                );
            }

            if (
                winner.scores.reviews >= 8
            ) {
                reasons.push(
                    "strong review confidence"
                );
            }

            if (
                winner.scores.discount >= 8
            ) {
                reasons.push(
                    "competitive discount"
                );
            }

            if (
                winner.scores.information >= 8
            ) {
                reasons.push(
                    "complete product information"
                );
            }

            if (!reasons.length) {
                return "balanced performance across the comparison factors.";
            }

            if (reasons.length === 1) {
                return reasons[0] + ".";
            }

            return (
                reasons
                    .slice(0, -1)
                    .join(", ") +
                " and " +
                reasons[reasons.length - 1] +
                "."
            );
        };


    // =====================================================
    // FORMAT PRICE
    // =====================================================

    const formatPrice = (
        price
    ) => {

        if (!price) {
            return "Price unavailable";
        }

        return `₹${Number(
            price
        ).toLocaleString(
            "en-IN"
        )}`;
    };


    // =====================================================
    // IMAGE
    // =====================================================

    const imageFallback = (
        e
    ) => {

        e.currentTarget.style.display =
            "none";
    };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="result-page">

            <main className="result-container">

                {/* =========================================
                    STEPS
                ========================================= */}

                <div className="result-steps">

                    <div className="result-step completed">

                        <span>✓</span>

                        <small>
                            SELECT
                        </small>

                    </div>

                    <div className="result-step-line"></div>

                    <div className="result-step active">

                        <span>2</span>

                        <small>
                            ANALYZE
                        </small>

                    </div>

                    <div className="result-step-line"></div>

                    <div className="result-step">

                        <span>3</span>

                        <small>
                            RESULT
                        </small>

                    </div>

                </div>


                {/* =========================================
                    HERO
                ========================================= */}

                <section className="result-hero">

                    <div className="result-eyebrow">
                        DECISIONLENS ANALYSIS
                    </div>

                    <h1>
                        Your Best Choice
                    </h1>

                    <p>
                        We analyzed{" "}
                        <strong>
                            {products.length}
                        </strong>{" "}
                        products using price,
                        customer ratings,
                        review volume,
                        discounts and
                        available product information.
                    </p>

                </section>


                {/* =========================================
                    WINNER
                ========================================= */}

                <section className="winner-card">

                    <div className="winner-top">

                        <div className="winner-badge">
                            🏆 BEST CHOICE
                        </div>

                        <span className="winner-badge-text">
                            Automatic DecisionLens Score
                        </span>

                    </div>


                    <div className="winner-content">

                        {/* IMAGE */}

                        <div className="winner-image-wrapper">

                            <div className="winner-image-glow"></div>

                            <div className="winner-image">

                                {winner.image ? (

                                    <img
                                        src={
                                            winner.image
                                        }
                                        alt={
                                            winner.name
                                        }
                                        onError={
                                            imageFallback
                                        }
                                    />

                                ) : (

                                    <span className="image-placeholder">
                                        📦
                                    </span>

                                )}

                            </div>

                        </div>


                        {/* DETAILS */}

                        <div className="winner-details">

                            <span className="winner-brand">

                                {winner.brand &&
                                winner.brand !==
                                    "Unknown"
                                    ? winner.brand
                                    : "Amazon Electronics"}

                            </span>

                            <h2>
                                {winner.name}
                            </h2>

                            <div className="winner-price">
                                {formatPrice(
                                    winner.price
                                )}
                            </div>

                            <p className="winner-description">

                                DecisionLens selected
                                this product because
                                it achieved the highest
                                combined score across
                                the comparison factors.

                            </p>


                            <div className="winner-tags">

                                {winner.rating >
                                    0 && (

                                    <span>
                                        ★{" "}
                                        {Number(
                                            winner.rating
                                        ).toFixed(1)}{" "}
                                        Rating
                                    </span>

                                )}

                                {winner.reviewCount >
                                    0 && (

                                    <span>
                                        {Number(
                                            winner.reviewCount
                                        ).toLocaleString(
                                            "en-IN"
                                        )}{" "}
                                        Reviews
                                    </span>

                                )}

                                {winner.discount >
                                    0 && (

                                    <span>
                                        {Math.round(
                                            winner.discount
                                        )}% Discount
                                    </span>

                                )}

                            </div>

                        </div>


                        {/* SCORE */}

                        <div className="winner-score-card">

                            <span>
                                DECISIONLENS SCORE
                            </span>

                            <strong>
                                {
                                    winner
                                        .scores
                                        .overall
                                }
                            </strong>

                            <small>
                                /10
                            </small>

                            <div className="winner-score-label">
                                Highest overall score
                            </div>

                        </div>

                    </div>

                </section>


                {/* =========================================
                    WHY
                ========================================= */}

                <section className="why-section">

                    <div className="result-section-header">

                        <div>

                            <div className="result-section-number">
                                01
                            </div>

                            <div>

                                <h2>
                                    Why this product scored highest
                                </h2>

                                <p>
                                    Breakdown of the
                                    automatic analysis
                                </p>

                            </div>

                        </div>

                    </div>


                    <div className="score-card">

                        {factors.map(
                            factor => (

                            <div
                                key={
                                    factor.label
                                }
                                className="result-score-row"
                            >

                                <div className="result-score-info">

                                    <div className="score-label-wrapper">

                                        <span className="score-icon">
                                            {
                                                factor.icon
                                            }
                                        </span>

                                        {
                                            factor.label
                                        }

                                    </div>

                                    <strong>
                                        {
                                            factor.score
                                        }/10
                                    </strong>

                                </div>


                                <div className="result-score-track">

                                    <div
                                        className="result-score-fill"
                                        style={{
                                            width:
                                                `${factor.score * 10}%`
                                        }}
                                    ></div>

                                </div>

                            </div>

                        ))}

                    </div>

                </section>


                {/* =========================================
                    RANKING
                ========================================= */}

                <section className="ranking-section">

                    <div className="result-section-header">

                        <div>

                            <div className="result-section-number">
                                02
                            </div>

                            <div>

                                <h2>
                                    Product Ranking
                                </h2>

                                <p>
                                    All selected products
                                    ranked by their
                                    DecisionLens score
                                </p>

                            </div>

                        </div>

                    </div>


                    <div className="ranking-list">

                        {rankedProducts.map(
                            (
                                product,
                                index
                            ) => (

                            <div
                                key={
                                    product._id
                                }
                                className={`ranking-card ${
                                    index === 0
                                        ? "ranking-winner"
                                        : ""
                                }`}
                            >

                                <div className="rank-number">

                                    {index === 0
                                        ? "🏆"
                                        : `#${index + 1}`}

                                </div>


                                <div className="rank-image">

                                    {product.image ? (

                                        <img
                                            src={
                                                product.image
                                            }
                                            alt=""
                                            onError={
                                                imageFallback
                                            }
                                        />

                                    ) : (

                                        <span>
                                            📦
                                        </span>

                                    )}

                                </div>


                                <div className="rank-info">

                                    <span>
                                        {product.subCategory ||
                                            "Electronics"}
                                    </span>

                                    <h3
                                        title={
                                            product.name
                                        }
                                    >
                                        {
                                            product.name
                                        }
                                    </h3>

                                    <strong>
                                        {formatPrice(
                                            product.price
                                        )}
                                    </strong>

                                </div>


                                <div className="rank-score">

                                    <div className="rank-score-number">

                                        <strong>
                                            {
                                                product
                                                    .scores
                                                    .overall
                                            }
                                        </strong>

                                        <span>
                                            /10
                                        </span>

                                    </div>

                                    <div className="rank-score-track">

                                        <div
                                            className="rank-score-fill"
                                            style={{
                                                width:
                                                    `${product.scores.overall * 10}%`
                                            }}
                                        ></div>

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                </section>


                {/* =========================================
                    WHY
                ========================================= */}

                <section className="analysis-info">

                    <div className="analysis-info-icon">
                        ✨
                    </div>

                    <div>

                        <span className="analysis-info-label">
                            HOW DECISIONLENS WORKS
                        </span>

                        <h3>
                            Automatic, explainable comparison
                        </h3>

                        <p>
                            The score combines five
                            measurable factors from the
                            available product data:
                            price value, customer rating,
                            review confidence, discount
                            and information completeness.
                            Each factor is normalized before
                            producing the final score.
                        </p>

                    </div>

                </section>


                {/* =========================================
                    ACTIONS
                ========================================= */}

                <div className="result-actions">

                    <button
                        className="result-secondary-button"
                        onClick={() =>
                            navigate(
                                "/decisions/options"
                            )
                        }
                    >
                        ← Compare Different Products
                    </button>

                    {winner.productUrl && (

                        <button
                            className="result-primary-button"
                            onClick={() =>
                                window.open(
                                    winner.productUrl,
                                    "_blank",
                                    "noopener,noreferrer"
                                )
                            }
                        >
                            View Product →
                        </button>

                    )}
                    <button
                        className="result-primary-button"
                        onClick={() =>
                        navigate(
                        "/dashboard"
                    )
                    }
                >
                 ✓ Finish Decision
                </button>
                </div>

            </main>

        </div>
    );
}

export default DecisionResult;