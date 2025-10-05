import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import {User} from '../context/AuthContext'
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

export default function VisitorRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Create Firebase Authentication user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Check if already registered in visitors collection
      const existingDoc = await getDoc(doc(db, "visitors", userCredential.user.uid));
      if (existingDoc.exists()) {
        setError('Account already exists. Please login instead.');
        setLoading(false);
        return;
      }

      // Store visitor data in Firestore 'visitors' collection
      await setDoc(doc(db, "visitors", userCredential.user.uid), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: 'visitor',
        createdAt: new Date().toISOString(),
        uid: userCredential.user.uid
      });

      // Redirect to visitor dashboard
      navigate('/visitor-dashboard');
    } catch (err) {
      console.error("Registration error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already registered. Please login instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger password.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else {
        setError('Registration failed. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
            <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Visitor Registration</h2>
            <p className="text-gray-600 mt-2">Create your visitor account</p>
            </div>

            {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
            </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="John Doe"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="visitor@example.com"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="+91 98765 43210"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Creating Account...' : 'Register'}
            </button>
            </form>

            <div className="mt-6 text-center space-y-3">
            <p className="text-gray-600">
                Already have an account?{' '}
                <button
                onClick={() => navigate('/visitor-login')}
                className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                Login here
                </button>
            </p>
            </div>
        </div>
    </div>
  );
}