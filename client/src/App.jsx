import { Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Options from "./pages/decisions/Options";
import DecisionResult from "./pages/decisions/DecisionResult";
import DecisionDetails from "./pages/decisions/DecisionDetails";
function App() {
    return (
        <Routes>

            <Route
                path="/"
                element={<Landing />}
            />

            <Route
                path="/register"
                element={<Register />}
            />

            <Route
                path="/login"
                element={<Login />}
            />

            <Route 
            path="/dashboard" 
            element={<Dashboard />} />

            <Route
            path="/decisions/options"
            element={<Options />}
            />

            <Route
            path="/decisions/details"
            element={<DecisionDetails />}
            />

            <Route
            path="/decisions/result"
            element={<DecisionResult />}
            />

        </Routes>
    );
}

export default App;