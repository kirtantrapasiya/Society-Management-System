import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import logo from '../assets/logo.svg';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, userDoc } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeSection, setActiveSection] = useState('features');

  useEffect(() => {
    if (user && userDoc) {
      // Redirect based on user role
      if (userDoc.role === 'visitor') {
        navigate('/visitor-dashboard');
      } else if (userDoc.role === 'secretary') {
        navigate('/secretary-dashboard');
      } else if (['owner', 'owner_family', 'renter', 'renter_family'].includes(userDoc.role)) {
        navigate('/dashboard');
      }
    }
  }, [user, userDoc, navigate]);

  const features = [
    {
      title: "Room Management",
      description: "Manage your property rooms efficiently with detailed tracking and organization",
      color: "bg-blue-200"
    },
    {
      title: "Family & Renter Management",
      description: "Keep track of family members and renters with comprehensive profiles",
      color: "bg-purple-200"
    },
    {
      title: "Secure Access",
      description: "Role-based access control ensures data security and privacy",
      color: "bg-yellow-200"
    },
    {
      title: "Easy Authentication",
      description: "Simple and secure login system for all users",
      color: "bg-pink-200"
    },
    {
      title: "Online/Offline Maintenance",
      description: "Manage both online and offline maintenance requests, track statuses, and notify users",
      color: "bg-green-200"
    },
    {
      title: "24-Hour Maintenance Reminders",
      description: "Send automated reminders via in-app notifications, SMS, and email 24 hours before scheduled maintenance tasks",
      color: "bg-indigo-200"
    },
    {
      title: "Unpaid Maintenance Alerts",
      description: "Automatically notify residents about pending maintenance payments with timely in-app, SMS, and email alerts",
      color: "bg-orange-200"
    },
    {
      title: "Real-Time Notifications",
      description: "Instantly notify users of new events, updates, notices, and maintenance activities",
      color: "bg-teal-200"
    },
    {
      title: "Events and Updates",
      description: "Keep all residents informed with timely event notifications and updates",
      color: "bg-cyan-200"
    },
    {
      title: "Rules and Committee",
      description: "Manage society rules and committee members for effective governance",
      color: "bg-lime-200"
    },
    {
      title: "Banking",
      description: "Track and manage society funds, process transactions, generate financial reports, and integrate with online payment",
      color: "bg-amber-200"
    },
    {
      title: "Queries",
      description: "Allow residents to submit and track queries for quick resolution",
      color: "bg-rose-200"
    },
    {
      title: "Visitor Management",
      description: "Track and manage visitor entries, approvals, and visit history efficiently",
      color: "bg-violet-200"
    }
  ];

  const problems = [
    {
      problem: "Difficulty tracking maintenance requests?",
      solution: "Automate tracking and get real-time updates.",
      color: "bg-blue-200"
    },
    {
      problem: "Struggling with visitor management?",
      solution: "Track and approve visitors instantly.",
      color: "bg-purple-200"
    },
    {
      problem: "Event planning is time-consuming?",
      solution: "Easily organize and track community events.",
      color: "bg-yellow-200"
    },
    {
      problem: "Manual record keeping is error-prone?",
      solution: "Digitize all records for accuracy and easy access.",
      color: "bg-pink-200"
    },
    {
      problem: "Communication gaps with residents?",
      solution: "Send instant notifications and announcements to everyone.",
      color: "bg-green-200"
    },
    {
      problem: "Financial management is complex?",
      solution: "Automated billing, payment tracking, and financial reports.",
      color: "bg-orange-200"
    }
  ];

  const benefits = [
    "Track room occupancy and details",
    "Manage owner and renter information",
    "Add and manage family members",
    "Secure role-based access for residents and visitors",
    "Real-time data updates",
    "Clean and intuitive interface"
  ];

  const nextSlide = () => {
    const dataLength = activeSection === 'features' ? features.length : problems.length;
    setCurrentSlide((prev) => (prev + 1) % dataLength);
  };

  const prevSlide = () => {
    const dataLength = activeSection === 'features' ? features.length : problems.length;
    setCurrentSlide((prev) => (prev - 1 + dataLength) % dataLength);
  };

  const visibleItems = () => {
    const data = activeSection === 'features' ? features : problems;
    const result = [];
    for (let i = 0; i < 3; i++) {
      result.push(data[(currentSlide + i) % data.length]);
    }
    return result;
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setCurrentSlide(0);
  };

  // Navigate to choose user type page instead of direct login
  const handleGetStarted = () => {
    navigate('/choose-register-type');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className='flex justify-center items-center mb-8 gap-3'>
            <img src={logo} alt="Logo" className="h-20 w-21" />
            <div className="flex flex-col pt-2">
              <span className="font-bold text-3xl text-left text-cyan-800">Society</span>
              <p className="text-sm text-gray-500">Management System</p>
            </div>
          </div>
          
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your property management with our comprehensive system. 
            Manage rooms, residents, visitors, and family members with all secretary work in one place.
          </p>
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 p-4 rounded-lg shadow-md">
              <p className="text-red-700 font-medium">
                Please note: This project is currently under maintenance. Some features may not be available at this time.
              </p>
            </div>
          </div>   
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-cyan-700 text-white rounded-lg font-semibold hover:bg-cyan-800 transition-colors flex items-center justify-center shadow-lg hover:shadow-xl"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            
            <button
              onClick={() => navigate('/choose-login-type')}
              className="px-8 py-4 bg-white text-gray-500 border-2 border-gray-500 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Slider Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {activeSection === 'features' 
              ? 'Powerful Features We Offer' 
              : 'Common Problems We Solve'}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full bg-stone-300 hover:bg-stone-400 transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="p-2 rounded-full bg-stone-700 hover:bg-stone-900 text-white transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {activeSection === 'features' ? (
            visibleItems().map((feature, index) => (
              <div
                key={index}
                className={`${feature.color} rounded-3xl p-6 shadow-lg transition-all hover:shadow-xl h-56 w-full flex flex-col`}
              >
                <h3 className="font-bold mb-5 text-gray-900 text-xl flex-shrink-0">
                  {feature.title}
                </h3>
                <div className="flex-1 overflow-y-auto">
                  <p className="text-gray-900 leading-relaxed text-base">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))
          ) : (
            visibleItems().map((item, index) => (
              <div
                key={index}
                className={`${item.color} rounded-3xl p-6 shadow-lg transition-all hover:shadow-xl h-56 w-full flex flex-col`}
              >
                <div className="flex-1 overflow-y-auto">
                  <h3 className="font-bold text-xl text-gray-900 mb-2">Problem:</h3>
                  <p className="text-gray-900 text-base mb-6">{item.problem}</p>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">Solution:</h3>
                  <p className="text-gray-900 text-base">{item.solution}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {(activeSection === 'features' ? features : problems).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide ? 'w-8 bg-stone-800' : 'w-2 bg-stone-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button 
            onClick={() => handleSectionChange('features')}
            className={`px-8 py-3 rounded-full font-medium transition-colors ${
              activeSection === 'features'
                ? 'bg-stone-700 text-white hover:bg-stone-900'
                : 'bg-white border-2 border-gray-300 hover:bg-gray-50'
            }`}
          >
            See System in Action
          </button>
          <button 
            onClick={() => handleSectionChange('problems')}
            className={`px-8 py-3 rounded-full font-medium transition-colors ${
              activeSection === 'problems'
                ? 'bg-stone-700 text-white hover:bg-zinc-900'
                : 'bg-white border-2 border-gray-300 hover:bg-gray-50'
            }`}
          >
            How System Help
          </button>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-cyan-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">
                Why Choose Our System?
              </h2>
              <p className="text-blue-100 mb-8 text-lg">
                Built with modern technology and designed for ease of use, 
                our system helps you manage your property efficiently.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start text-white ml-4">
                    <li>
                      <span className="text-white text-lg">{benefit}</span>
                    </li>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Ready to Get Started?
              </h3>
              <p className="text-gray-600 mb-6">
                Join us today and experience seamless property management
              </p>
              <button
                onClick={() => navigate('/choose-register-type')}
                className="w-full px-6 py-4 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition-colors flex items-center justify-center"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <p className="text-center text-gray-500 mt-4">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/choose-login-type')}
                  className="text-cyan-600 hover:text-cyan-700 font-semibold"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;