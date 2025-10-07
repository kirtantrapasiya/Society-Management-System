import React from "react";
import "./App.css"
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import ResidentLogin from "./pages/Login/ResidentLogin";
import ResidentRegister from "./pages/Register/ResidentRegister";
import ErrorPage from "./pages/Error";
import PrivateRoute from "./components/ProtectedRoute";
import ResidentDashboard from "./pages/Dashboard/ResidentDashboard";
import SecretaryDashboard from "./pages/Dashboard/SecretaryDashboard";
import VisitorForgotPassword from "./pages/ForgotPassword/VisitorForgotPassword";
import ResidentForgotPassword from "./pages/ForgotPassword/ResidentForgotPassword";
import VisitorDashboard from "./pages/Dashboard/VisitorDashboard";
import VisitorLogin from "./pages/Login/VisitorLogin";
import VisitorRegister from "./pages/Register/VisitorRegister";
import RegisterChooseUserType from "./pages/Oprations/RegisterChooseUserType";
import ProtectedRoute from "./components/ProtectedRoute";
import VisitorHome from "./pages/VisitorHome";
import SelectResidency from './pages/SelectResidency';
import RecentVisits from './pages/RecentVisits';
import LoginChooseUserType from "./pages/Oprations/LoginChooseUserType";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/visitor-login" element={<VisitorLogin />} />
          <Route path="/visitor-register" element={<VisitorRegister />} />
          <Route path="/resident-login" element={<ResidentLogin />} />
          <Route path="/choose-login-type" element={<LoginChooseUserType />} />
          <Route path="/choose-register-type" element={<RegisterChooseUserType />} />
          <Route path="/resident-register" element={<ResidentRegister />} />
          <Route path="/visitor-forgot-password" element={<VisitorForgotPassword />} />
          <Route path="/resident-forgot-password" element={<ResidentForgotPassword />} />
          <Route path="/visitor-home" element={<VisitorHome />} />
          <Route path="/select-residency" element={<SelectResidency />} />
          <Route path="/residency" element={<RecentVisits />} />
          
          {/* Main Dashboard Route - Handles all room scenarios */}
          <Route
            path="/resident-dashboard"
            element={
              <PrivateRoute
                allowedRoles={["owner", "owner_family", "renter", "renter_family"]}
              >
                <ResidentDashboard />
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

          <Route
          path="/visitor-dashboard"
          element={
            <ProtectedRoute allowedRoles={['visitor']}>
              <VisitorDashboard />
            </ProtectedRoute>
          }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;