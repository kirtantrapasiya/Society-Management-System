import React from "react";
import "./App.css"
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ErrorPage from "./pages/Error";
import PrivateRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard/Dashboard";
import SecretaryDashboard from "./pages/Dashboard/SecretaryDashboard";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Main Dashboard Route - Handles all room scenarios */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute
                allowedRoles={["owner", "owner_family", "renter", "renter_family"]}
              >
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/secretary-dashboard"
            element={
              <PrivateRoute allowedRoles={["secretary"]}>
                <SecretaryDashboard />
              </PrivateRoute>
            }
          />

          <Route path="/error" element={<ErrorPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;