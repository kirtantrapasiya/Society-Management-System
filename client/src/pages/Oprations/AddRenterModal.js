import React, { useState } from 'react';
import { X, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import OwnerConfirmation from './OwnerConfirmationModal';
import { useNavigate } from 'react-router-dom';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '../../firebase';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const AddRenterModal = ({ ownerUid, ownerRoomNumber, onSuccess, onClose }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('confirmation');
  const [ownerCredentials, setOwnerCredentials] = useState(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNo: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (error) {
      setError('');
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading && !verificationLoading) {
      onClose();
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = 'Please enter a valid email address';
      }
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.contactNo.trim()) {
      errors.contactNo = 'Contact number is required';
    } else if (formData.contactNo.trim().length < 10) {
      errors.contactNo = 'Please enter a valid contact number';
    }

    return errors;
  };

  const handleOwnerConfirmation = async (credentials) => {
    setVerificationLoading(true);
    setVerificationError('');
    
    try {
      const response = await fetch(`${API_URL}/api/renters/verify-owner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerEmail: credentials.email,
          ownerPassword: credentials.password,
          currentOwnerUid: ownerUid
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      setOwnerCredentials(credentials);
      setCurrentStep('form');
      setVerificationError('');
      
    } catch (error) {
      console.error('Owner verification error:', error);
      setVerificationError(error.message);
      throw error; 
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleRenterSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setLoading(true);
    setError('');
    setFieldErrors({});
    
    try {
      if (!ownerUid || !ownerRoomNumber || !ownerCredentials) {
        throw new Error('Missing required information');
      }

      const response = await fetch(`${API_URL}/api/renters/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerEmail: ownerCredentials.email,
          ownerPassword: ownerCredentials.password,
          ownerUid: ownerUid,
          ownerRoomNumber: ownerRoomNumber,
          renterData: {
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
            contactNo: formData.contactNo
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create renter account');
      }

      if (data.data.ownerCustomToken) {
        await signInWithCustomToken(auth, data.data.ownerCustomToken);
      }

      setFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        contactNo: '',
      });
      
      setCurrentStep('confirmation');
      setOwnerCredentials(null);

      onClose();

      if (onSuccess) {
        onSuccess();
      }

      navigate('/dashboard');

    } catch (error) {
      console.error('Renter creation error:', error);
      setError(error.message || 'Failed to create renter account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (currentStep === 'form') {
      setCurrentStep('confirmation');
      setError('');
      setFieldErrors({});
    } else {
      onClose();
    }
  };

  const handleClose = () => {
    if (!loading && !verificationLoading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[95vh] overflow-hidden">
        {currentStep === 'confirmation' ? (
          <>
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Add New Renter</h2>
              <button 
                onClick={handleClose} 
                type="button" 
                disabled={verificationLoading}
                className="text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-80px)]">
              <OwnerConfirmation 
                onConfirm={handleOwnerConfirmation}
                onCancel={handleClose}
                loading={verificationLoading}
                error={verificationError}
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setCurrentStep('confirmation')}
                  className="text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed transition-colors"
                  disabled={loading}
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-bold text-gray-800">Create Renter Account</h2>
              </div>
              <button 
                onClick={handleClose} 
                type="button" 
                disabled={loading}
                className="text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(95vh-80px)]">
              <p className="text-sm text-gray-600 mb-6">
                Fill in the renter's information below to create their account.
              </p>

              {(error || Object.values(fieldErrors).some(error => error)) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  {error && (
                    <div className="text-sm text-red-700">
                      <p className="font-medium">Creation Failed</p>
                      <p>{error}</p>
                    </div>
                  )}

                  {Object.entries(fieldErrors).map(([field, fieldError]) => (
                    fieldError && (
                      <p key={field} className="text-red-600 text-sm mt-1">{fieldError}</p>
                    )
                  ))}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Renter Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter renter's full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Renter Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="renter@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password for Renter *
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg outline-none"
                      minLength="6"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed transition-colors"
                      disabled={loading}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg outline-none"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(prev => !prev)}
                      className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed transition-colors"
                      disabled={loading}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Renter Contact Number *
                  </label>
                  <input
                    type="tel"
                    name="contactNo"
                    value={formData.contactNo}
                    onChange={handleChange}
                    placeholder="Enter contact number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
                    required
                    disabled={loading}
                  />
                </div>

                {loading && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mt-0.5"></div>
                      <div className="text-sm text-blue-700 flex-1">
                        <p className="font-medium mb-2">Creating Renter Account...</p>
                        <div className="space-y-1 text-xs">
                          <p className="flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            Creating authentication account
                          </p>
                          <p className="flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            Setting up database records
                          </p>
                          <p className="flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            Updating room information
                          </p>
                        </div>
                        <p className="mt-3 text-blue-600">Please wait, do not close this window...</p>
                      </div>
                    </div>
                  </div>
                )}

                {!loading && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="text-sm">
                      <p className="font-semibold text-blue-800 mb-1">What happens next?</p>
                      <ul className="list-disc list-inside text-blue-700 space-y-1">
                        <li>Renter account will be created with login credentials</li>
                        <li>Room status will be updated to "Rented"</li>
                        <li>You'll be redirected to the owner dashboard</li>
                      </ul>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={handleCancel}
                    className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={loading}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleRenterSubmit}
                    disabled={loading}
                    className={`px-6 py-2.5 rounded-lg text-white flex items-center space-x-2 transition-colors ${
                      loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {loading && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    <span>{loading ? 'Processing...' : 'Create Renter'}</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddRenterModal;