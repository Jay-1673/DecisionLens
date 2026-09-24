import { Link } from "react-router-dom";
import "../styles/landing.css";

function Landing() {
    return (
        <div className="landing">

            {/* Navbar */}
            <nav className="landing-navbar">

                <div className="logo">
                    Decision<span>Lens</span>
                </div>

                <div className="nav-links">
                    <a href="#features">Features</a>
                    <a href="#how-it-works">How It Works</a>

                    <Link to="/login" className="nav-login">
                        Login
                    </Link>

                    <Link to="/register" className="nav-register">
                        Get Started
                    </Link>
                </div>

            </nav>


            {/* Hero Section */}
            <section className="hero">

                <div className="hero-content">

                    <div className="hero-badge">
                        🧠 Smarter Decisions. Better Outcomes.
                    </div>

                    <h1>
                        Stop Guessing.
                        <br />
                        <span>Start Deciding.</span>
                    </h1>

                    <p>
                        DecisionLens helps you compare your options,
                        evaluate what matters, and make confident
                        decisions using a structured decision-making
                        system.
                    </p>

                    <div className="hero-buttons">

                        <Link
                            to="/register"
                            className="primary-button"
                        >
                            Start Making Better Decisions →
                        </Link>

                        <a
                            href="#how-it-works"
                            className="secondary-button"
                        >
                            See How It Works
                        </a>

                    </div>

                </div>


                {/* Decision Preview */}
                <div className="decision-preview">

                    <div className="preview-header">
                        <div>
                            <small>DECISION</small>
                            <h3>Which laptop should I buy?</h3>
                        </div>

                        <span className="status">
                            Analyzing
                        </span>
                    </div>


                    <div className="option">
                        <div>
                            <strong>MacBook Air M4</strong>
                            <small>Performance • Battery • Portability</small>
                        </div>

                        <div className="score">
                            92%
                        </div>
                    </div>


                    <div className="option">
                        <div>
                            <strong>Lenovo Yoga</strong>
                            <small>Price • Performance • Display</small>
                        </div>

                        <div className="score">
                            84%
                        </div>
                    </div>


                    <div className="option">
                        <div>
                            <strong>ASUS Zenbook</strong>
                            <small>Price • Battery • Design</small>
                        </div>

                        <div className="score">
                            78%
                        </div>
                    </div>


                    <div className="recommendation">

                        <div className="recommendation-icon">
                            ✓
                        </div>

                        <div>
                            <small>RECOMMENDED</small>
                            <strong>MacBook Air M4</strong>
                        </div>

                    </div>

                </div>

            </section>


            {/* Features */}
            <section
                className="features"
                id="features"
            >

                <div className="section-heading">

                    <span>WHY DECISIONLENS?</span>

                    <h2>
                        Make decisions with
                        <br />
                        <span>clarity, not confusion.</span>
                    </h2>

                </div>


                <div className="feature-grid">

                    <div className="feature-card">
                        <div className="feature-icon">
                            ⚖️
                        </div>

                        <h3>Compare Options</h3>

                        <p>
                            Put all your choices in one place
                            and compare them objectively.
                        </p>
                    </div>


                    <div className="feature-card">
                        <div className="feature-icon">
                            🎯
                        </div>

                        <h3>Prioritize What Matters</h3>

                        <p>
                            Give importance to the factors that
                            actually matter to you.
                        </p>
                    </div>


                    <div className="feature-card">
                        <div className="feature-icon">
                            🧠
                        </div>

                        <h3>Get a Recommendation</h3>

                        <p>
                            Let our decision engine analyze
                            everything and recommend the strongest
                            option.
                        </p>
                    </div>

                </div>

            </section>


            {/* How It Works */}
            <section
                className="how-it-works"
                id="how-it-works"
            >

                <div className="section-heading">

                    <span>HOW IT WORKS</span>

                    <h2>
                        From confusion to
                        <br />
                        <span>confidence in 4 steps.</span>
                    </h2>

                </div>


                <div className="steps">

                    <div className="step">
                        <div className="step-number">
                            01
                        </div>

                        <h3>Define</h3>

                        <p>
                            Tell DecisionLens what you're
                            trying to decide.
                        </p>
                    </div>


                    <div className="step">
                        <div className="step-number">
                            02
                        </div>

                        <h3>Compare</h3>

                        <p>
                            Add the options you're considering.
                        </p>
                    </div>


                    <div className="step">
                        <div className="step-number">
                            03
                        </div>

                        <h3>Prioritize</h3>

                        <p>
                            Choose the factors that matter most.
                        </p>
                    </div>


                    <div className="step">
                        <div className="step-number">
                            04
                        </div>

                        <h3>Decide</h3>

                        <p>
                            Get a clear recommendation with
                            reasoning.
                        </p>
                    </div>

                </div>

            </section>


            {/* CTA */}
            <section className="cta">

                <h2>
                    Ready to make your
                    <br />
                    next decision smarter?
                </h2>

                <p>
                    Stop overthinking. Start deciding.
                </p>

                <Link
                    to="/register"
                    className="primary-button"
                >
                    Create Your First Decision →
                </Link>

            </section>


            {/* Footer */}
            <footer>

                <div className="logo">
                    Decision<span>Lens</span>
                </div>

                <p>
                    © 2026 DecisionLens. Make better decisions.
                </p>

            </footer>

        </div>
    );
}

export default Landing;