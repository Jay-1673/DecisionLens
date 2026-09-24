import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/decision.css";

function DecisionDetails() {
    const location = useLocation();
    const navigate = useNavigate();

    const { decision, options } = location.state || {};

    const [priorities, setPriorities] = useState({
        performance: 40,
        price: 20,
        battery: 20,
        portability: 20,
    });

    const handlePriorityChange = (name, value) => {
        value = Number(value);

        const otherKeys = Object.keys(priorities).filter(
            (key) => key !== name
        );

        const currentOtherTotal = otherKeys.reduce(
            (total, key) => total + priorities[key],
            0
        );

        const remaining = 100 - value;

        if (remaining < 0) {
            return;
        }

        let newPriorities = {
            ...priorities,
            [name]: value,
        };

        /*
         * Automatically distribute the remaining
         * percentage among the other priorities.
         */

        if (currentOtherTotal > 0) {
            otherKeys.forEach((key) => {
                newPriorities[key] = Math.round(
                    (priorities[key] / currentOtherTotal) *
                    remaining
                );
            });
        }

        /*
         * Fix rounding difference so total is exactly 100.
         */

        const total = Object.values(newPriorities).reduce(
            (sum, value) => sum + value,
            0
        );

        const difference = 100 - total;

        if (difference !== 0) {
            const adjustKey = otherKeys[otherKeys.length - 1];

            if (adjustKey) {
                newPriorities[adjustKey] += difference;
            }
        }

        setPriorities(newPriorities);
    };


    const handleContinue = () => {

        if (!decision || !options || options.length < 2) {
            alert("Decision information is missing.");
            return;
        }

        navigate("/decisions/result", {
            state: {
                decision,
                options,
                priorities,
            },
        });
    };


    return (
        <div className="decision-page">

            <div className="decision-container details-container">

                {/* Header */}

                <div className="decision-header">

                    <div className="decision-badge">
                        STEP 3 OF 4
                    </div>

                    <h1>
                        What matters most to you?
                    </h1>

                    <p>
                        Adjust the importance of each factor.
                        DecisionLens will use your priorities
                        to determine the best option.
                    </p>

                </div>


                {/* Decision Summary */}

                {decision && (
                    <div className="decision-summary">

                        <div>

                            <span>
                                YOUR DECISION
                            </span>

                            <h3>
                                {decision.title}
                            </h3>

                        </div>

                        <div className="summary-category">
                            {decision.category}
                        </div>

                    </div>
                )}


                {/* Priority Card */}

                <div className="priority-card">

                    <div className="priority-heading">

                        <div>
                            <h2>
                                Set your priorities
                            </h2>

                            <p>
                                Higher percentage = more important
                            </p>
                        </div>

                        <div className="priority-total">
                            {Object.values(priorities).reduce(
                                (sum, value) => sum + value,
                                0
                            )}
                            %
                        </div>

                    </div>


                    {/* Performance */}

                    <div className="priority-item">

                        <div className="priority-label">

                            <div>
                                <strong>
                                    ⚡ Performance
                                </strong>

                                <span>
                                    Speed, power and overall capability
                                </span>
                            </div>

                            <b>
                                {priorities.performance}%
                            </b>

                        </div>

                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={priorities.performance}
                            onChange={(e) =>
                                handlePriorityChange(
                                    "performance",
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    {/* Price */}

                    <div className="priority-item">

                        <div className="priority-label">

                            <div>
                                <strong>
                                    💰 Price
                                </strong>

                                <span>
                                    Affordability and value for money
                                </span>
                            </div>

                            <b>
                                {priorities.price}%
                            </b>

                        </div>

                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={priorities.price}
                            onChange={(e) =>
                                handlePriorityChange(
                                    "price",
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    {/* Battery */}

                    <div className="priority-item">

                        <div className="priority-label">

                            <div>
                                <strong>
                                    🔋 Battery
                                </strong>

                                <span>
                                    Battery life and endurance
                                </span>
                            </div>

                            <b>
                                {priorities.battery}%
                            </b>

                        </div>

                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={priorities.battery}
                            onChange={(e) =>
                                handlePriorityChange(
                                    "battery",
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    {/* Portability */}

                    <div className="priority-item">

                        <div className="priority-label">

                            <div>
                                <strong>
                                    🎒 Portability
                                </strong>

                                <span>
                                    Weight, size and ease of carrying
                                </span>
                            </div>

                            <b>
                                {priorities.portability}%
                            </b>

                        </div>

                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={priorities.portability}
                            onChange={(e) =>
                                handlePriorityChange(
                                    "portability",
                                    e.target.value
                                )
                            }
                        />

                    </div>

                </div>


                {/* Priority Explanation */}

                <div className="priority-tip">

                    <div className="tip-icon">
                        💡
                    </div>

                    <div>

                        <strong>
                            How does this work?
                        </strong>

                        <p>
                            DecisionLens gives more influence
                            to the factors you consider important.
                            For example, if performance is 50%,
                            it will have more impact on the final
                            recommendation than a factor weighted
                            at 10%.
                        </p>

                    </div>

                </div>


                {/* Options Preview */}

                <div className="comparison-preview">

                    <div className="preview-heading">

                        <h2>
                            Options being analyzed
                        </h2>

                        <span>
                            {options?.length || 0} devices
                        </span>

                    </div>


                    <div className="preview-options">

                        {options?.map((option, index) => (

                            <div
                                className="preview-option"
                                key={option.id}
                            >

                                <div className="preview-number">
                                    {index + 1}
                                </div>

                                <div>
                                    <strong>
                                        {option.name}
                                    </strong>

                                    <span>
                                        ₹
                                        {Number(
                                            option.price
                                        ).toLocaleString("en-IN")}
                                    </span>
                                </div>

                            </div>

                        ))}

                    </div>

                </div>


                {/* Actions */}

                <div className="decision-actions">

                    <button
                        type="button"
                        className="decision-back"
                        onClick={() =>
                            navigate(
                                "/decisions/options",
                                {
                                    state: {
                                        decision,
                                    },
                                }
                            )
                        }
                    >
                        ← Back
                    </button>


                    <button
                        type="button"
                        className="decision-continue"
                        onClick={handleContinue}
                    >
                        Analyze Decision
                        <span>→</span>
                    </button>

                </div>

            </div>

        </div>
    );
}

export default DecisionDetails;