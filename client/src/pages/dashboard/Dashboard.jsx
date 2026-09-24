import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/dashboard.css";

function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="dashboard">

            {/* =========================
                NAVBAR
            ========================= */}

            <nav className="dashboard-navbar">

                <Link
                    to="/"
                    className="dashboard-logo"
                >
                    Decision<span>Lens</span>
                </Link>


                <div className="dashboard-user">

                    <div className="user-info">

                        <span className="welcome-small">
                            Welcome
                        </span>

                        <strong>
                            {user?.name || "User"}
                        </strong>

                    </div>


                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </nav>


            {/* =========================
                MAIN CONTENT
            ========================= */}

            <main className="dashboard-content">


                {/* =========================
                    WELCOME SECTION
                ========================= */}

                <section className="welcome-section">

                    <div>

                        <p className="dashboard-label">
                            YOUR DECISION SPACE
                        </p>

                        <h1>
                            Hello,{" "}
                            {user?.name?.split(" ")[0] || "there"} 👋
                        </h1>

                        <p>
                            Make smarter decisions with data-driven
                            comparisons and clear insights.
                        </p>

                    </div>


                    {/* NEW DECISION */}

                    <Link
                        to="/decisions/options"
                        className="new-decision-btn"
                    >
                        + New Decision
                    </Link>

                </section>


                {/* =========================
                    STATS
                ========================= */}

                <section className="stats-grid">


                    <div className="stat-card">

                        <div className="stat-icon">
                            📊
                        </div>

                        <div>

                            <span>
                                Total Decisions
                            </span>

                            <h2>
                                0
                            </h2>

                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon">
                            ✅
                        </div>

                        <div>

                            <span>
                                Completed
                            </span>

                            <h2>
                                0
                            </h2>

                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon">
                            📝
                        </div>

                        <div>

                            <span>
                                Drafts
                            </span>

                            <h2>
                                0
                            </h2>

                        </div>

                    </div>


                </section>


                {/* =========================
                    CREATE DECISION
                ========================= */}

                <section className="create-decision-card">

                    <div className="create-icon">
                        ⚡
                    </div>


                    <div className="create-content">

                        <h2>
                            What are you deciding today?
                        </h2>

                        <p>
                            Compare different options, evaluate
                            important factors and discover which
                            choice makes the most sense for you.
                        </p>


                        <Link
                            to="/decisions/options"
                            className="start-btn"
                        >
                            Start a Decision →
                        </Link>

                    </div>

                </section>


                {/* =========================
                    RECENT DECISIONS
                ========================= */}

                <section className="recent-section">


                    <div className="section-header">

                        <div>

                            <h2>
                                Recent Decisions
                            </h2>

                            <p>
                                Your latest decision analyses
                            </p>

                        </div>

                    </div>


                    <div className="empty-decisions">

                        <div className="empty-icon">
                            🔍
                        </div>


                        <h3>
                            No decisions yet
                        </h3>


                        <p>
                            Your decision history will appear here
                            once you create your first decision.
                        </p>


                        <Link
                            to="/decisions/options"
                            className="empty-btn"
                        >
                            Create Your First Decision
                        </Link>

                    </div>


                </section>


            </main>

        </div>
    );
}

export default Dashboard;