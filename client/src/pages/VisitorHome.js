import React from "react";
import { useNavigate } from "react-router-dom";
import { Building2, ArrowRight } from "lucide-react";

const VisitorHome = () => {
  const navigate = useNavigate();

  const handleSelectResidency = () => {
    navigate("/select-residency");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-200px)]">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Find{" "}
                <span className="text-blue-600">nearby residencies</span>{" "}
              </h1>
            </div>

            <p className="text-lg text-gray-600 max-w-xl">
              Discover and visit nearby residential societies with ease. 
              Pre-register your visit and get instant access.
            </p>

            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md border border-gray-100">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Select Residency
                    </h3>
                    <p className="text-sm text-gray-500">
                      Choose your destination society
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSelectResidency}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl group"
                >
                  <span>Select Residency</span>
                </button>

                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 text-center">
                    Select from available residential societies in your area
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">500+</div>
                <div className="text-sm text-gray-600">Societies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">24/7</div>
                <div className="text-sm text-gray-600">Access</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">Fast</div>
                <div className="text-sm text-gray-600">Check-in</div>
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <img></img>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorHome;