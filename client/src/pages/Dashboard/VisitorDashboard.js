import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { User, Calendar, Bell, Home, LogOut, Settings } from "lucide-react";

export default function VisitorDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (auth.currentUser) {
          const visitorDoc = await getDoc(doc(db, "visitors", auth.currentUser.uid));
          if (visitorDoc.exists()) {
            setUser(visitorDoc.data());
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const stats = [
    { label: 'Total Visits', value: '12', icon: Calendar, color: 'bg-blue-500' },
    { label: 'Pending Requests', value: '3', icon: Bell, color: 'bg-yellow-500' },
    { label: 'Approved Visits', value: '9', icon: Home, color: 'bg-green-500' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-t-4 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User size={24} className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Visitor Portal</h1>
                <p className="text-sm text-gray-600">Welcome, {user?.name || 'Visitor'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition duration-200"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon size={28} className="text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition duration-200">
              <Calendar size={24} className="text-blue-600" />
              <div className="text-left">
                <p className="font-semibold text-gray-800">Request Visit</p>
                <p className="text-sm text-gray-600">Schedule a new visit</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition duration-200">
              <Settings size={24} className="text-indigo-600" />
              <div className="text-left">
                <p className="font-semibold text-gray-800">Profile Settings</p>
                <p className="text-sm text-gray-600">Update your information</p>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Visits */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Visits</h2>
          <div className="space-y-3">
            {[1, 2, 3].map((_, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200">
                <div>
                  <p className="font-semibold text-gray-800">Building A, Flat 101</p>
                  <p className="text-sm text-gray-600">Oct {5 - idx}, 2025 • 2:30 PM</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  idx === 0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {idx === 0 ? 'Completed' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}