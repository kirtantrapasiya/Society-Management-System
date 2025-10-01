import React from 'react';
import { useNavigate } from 'react-router-dom';
import {ArrowRight} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import logo from '../assets/logo.svg'

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
  {
    title: "Room Management",
    description: "Manage your property rooms efficiently with detailed tracking and organization"
  },
  {
    title: "Family & Renter Management",
    description: "Keep track of family members and renters with comprehensive profiles"
  },
  {
    title: "Secure Access",
    description: "Role-based access control ensures data security and privacy"
  },
  {
    title: "Easy Authentication",
    description: "Simple and secure login system for all users"
  },
  {
    title: "Online/Offline Maintenance",
    description: "Manage both online and offline maintenance requests, track statuses, and notify users"
  },
  {
    title: "Events and Updates",
    description: "Keep all residents informed with timely event notifications and updates"
  },
  {
    title: "Rules and Committee",
    description: "Manage society rules and committee members for effective governance"
  },
  {
  title: "Banking",
  description: "Track and manage society funds, process transactions, generate financial reports, and integrate with online payment"
  },
  {
    title: "Queries",
    description: "Allow residents to submit and track queries for quick resolution"
  }
  ];

  const benefits = [
    "Track room occupancy and details",
    "Manage owner and renter information",
    "Add and manage family members",
    "Secure role-based access",
    "Real-time data updates",
    "Clean and intuitive interface"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className='flex justify-center items-center mb-8'>
              <img src={logo} alt="Logo" className="h-20 w-22" />
              <div className="flex flex-col pt-2">
                <span className="font-bold text-2xl text-gray-900">Residence</span>
                <p className="text-sm text-gray-500 pl-5">Management System</p>
              </div>
          </div>
          
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your property management with our comprehensive system. 
            Manage rooms, residents, and family members with all secretary work in one place.
          </p>
          <p className="text-red-600 mb-8 font-semibold text-center p-4 border bg-red-50 border-red-500 rounded-xl shadow-md">
            The remaining features are under maintenance...
          </p>   
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-cyan-700 text-white rounded-lg font-semibold hover:bg-cyan-800 transition-colors flex items-center justify-center shadow-lg hover:shadow-xl"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-white text-gray-500 border-2 border-gray-500 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to manage your residence efficiently
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow border border-gray-100"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

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
                onClick={() => navigate('/register')}
                className="w-full px-6 py-4 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition-colors flex items-center justify-center"
              >
                Create Account
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <p className="text-center text-gray-500 mt-4">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
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
