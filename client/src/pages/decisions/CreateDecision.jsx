import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/decision.css";

function CreateDecision() {
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!title.trim()) {
            return;
        }

        // For now we are only creating the UI.
        // We will connect this to MongoDB next.

        navigate("/decisions/options", {
            state: {
                title,
                description
            }
        });
    };

    return (
        <div className="decision-page">

            {/* Navbar */}

            <nav className="decision-navbar">

                <Link
                    to="/dashboard"
                    className="decision-logo"
                >
                    Decision<span>Lens</span>
                </Link>

                <Link
                    to="/dashboard"
                    className="back-dashboard"
                >
                    ← Dashboard
                </Link>

            </nav>


            {/* Main */}

            <main className="decision-container">

                <div className="step-indicator">

                    <span className="active-step">
                        1
                    </span>

                    <div className="step-line"></div>

                    <span>
                        2
                    </span>

                    <div className="step-line"></div>

                    <span>
                        3
                    </span>

                </div>


                <div className="decision-header">

                    <p className="decision-label">
                        STEP 1 OF 3
                    </p>

                    <h1>
                        What are you deciding?
                    </h1>

                    <p>
                        Start by giving your decision a name and
                        briefly describe what you're trying to choose.
                    </p>

                </div>


                <form
                    className="decision-form"
                    onSubmit={handleSubmit}
                >

                    <div className="form-group">

                        <label>
                            Decision Title
                        </label>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) =>
                                setTitle(e.target.value)
                            }
                            placeholder="e.g. Which laptop should I buy?"
                            maxLength="100"
                            required
                        />

                        <small>
                            Give your decision a clear name.
                        </small>

                    </div>


                    <div className="form-group">

                        <label>
                            Description
                            <span> (Optional)</span>
                        </label>

                        <textarea
                            value={description}
                            onChange={(e) =>
                                setDescription(e.target.value)
                            }
                            placeholder="Tell us a little more about what you're trying to decide..."
                            rows="5"
                            maxLength="500"
                        />

                        <small>
                            Explain what matters to you about this decision.
                        </small>

                    </div>


                    <div className="example-box">

                        <div className="example-icon">
                            💡
                        </div>

                        <div>

                            <strong>
                                Example
                            </strong>

                            <p>
                                <b>Title:</b> Which laptop should I buy?
                            </p>

                            <p>
                                <b>Description:</b> I need a laptop
                                for programming, college work and
                                occasional gaming.
                            </p>

                        </div>

                    </div>


                    <div className="decision-actions">

                        <Link
                            to="/dashboard"
                            className="cancel-btn"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            className="continue-btn"
                        >
                            Continue →
                        </button>

                    </div>

                </form>

            </main>

        </div>
    );
}

export default CreateDecision;