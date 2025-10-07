import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight } from "lucide-react";
import ResidencyRegister from "./ResidencyRegister";

const SelectResidency = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResidency, setSelectedResidency] = useState(null);

  const residencies = [
    { id: 1, name: "Trilok Glory", address: "trilok glory, 602, opp. manilal party plot, GIDC Bhat, Ahmedabad, Gujarat" },
    { id: 2, name: "Park View", address: "Park View, Bodakdev, Ahmedabad, Gujarat" },
    { id: 3, name: "Shree Residency co.op.Service society Ltd.", address: "97, Dindoli - Kharvasa Rd, Surat, Gujarat" },
    { id: 4, name: "Binori Bungalows", address: "Binori Bungalows, Aarohi Club Rd, Bopal, Ahmedabad, Gujarat" },
    { id: 5, name: "Ayodhya Nagari", address: "Ayodhya Nagri Rd, Mansarovar Society, Surat, Gujarat" },
  ];

  const filteredResidencies = residencies.filter(
    (residency) =>
      residency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      residency.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleResidencyClick = (residency) => {
    setSelectedResidency(residency); 
  };

  const handleCloseModal = () => {
    setSelectedResidency(null); 
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <button
              onClick={() => navigate("/visitor-home")}
              className="hover:text-blue-600 transition-colors"
            >
              Home
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">Search Residency</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
            Find Your Perfect Visit: Tailored Accommodations for Every visit and manage seamless entries
          </h1>

          <div className="mt-6 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search residency..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredResidencies.map((residency) => (
            <div
              key={residency.id}
              onClick={() => handleResidencyClick(residency)}
              className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer group"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 transition-colors">
                  {residency.name}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-4 leading-relaxed">
                  {residency.address}
                </p>
              </div>
            </div>
          ))}
        </div>

        {filteredResidencies.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No residencies found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search to find what you're looking for
            </p>
          </div>
        )}
      </div>

      {selectedResidency && (
        <ResidencyRegister
          residency={selectedResidency}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default SelectResidency;
