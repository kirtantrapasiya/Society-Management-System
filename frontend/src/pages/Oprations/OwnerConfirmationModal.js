import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

const OwnerConfirmation = ({ onConfirm, onCancel, loading, error }) => {
  const [ownerCredentials, setOwnerCredentials] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: ''
  });

  const handleChange = (field, value) => {
    setOwnerCredentials((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (localError) setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setFieldErrors({ email: '', password: '' });

    const newFieldErrors = { email: '', password: '' };

    if (!ownerCredentials.email.trim()) {
      newFieldErrors.email = 'Please enter your email address.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(ownerCredentials.email)) {
        newFieldErrors.email = 'Please enter a valid email address.';
      }
    }

    if (!ownerCredentials.password.trim()) {
      newFieldErrors.password = 'Please enter your password.';
    }

    setFieldErrors(newFieldErrors);

    if (Object.values(newFieldErrors).some((error) => error)) {
      return;
    }

    try {
      await onConfirm(ownerCredentials);
    } catch (error) {
      console.error('Owner verification error:', error);
      
      const errorMessage = error?.message || 'An error occurred during verification';
      setLocalError(errorMessage);
    }
  };

  const displayError = error || localError;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Secure Identity Verification</h3>
        <p className="text-gray-600 text-sm leading-relaxed max-w-md mx-auto">
          Please verify your owner credentials to proceed with renter creation.
        </p>
      </div>

      {(displayError || fieldErrors.email || fieldErrors.password) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              {displayError && (
                <div>
                  <p className="font-semibold text-red-800 mb-1">Verification Failed</p>
                  <p className="text-red-700">{displayError}</p>
                </div>
              )}

              {fieldErrors.email && (
                <p className="text-red-600 mt-2">{fieldErrors.email}</p>
              )}

              {fieldErrors.password && (
                <p className="text-red-600 mt-2">{fieldErrors.password}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Owner Email Address *
          </label>
          <input
            type="email"
            value={ownerCredentials.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="Enter your owner email address"
            className="w-full px-4 py-3 border rounded-lg outline-none transition-colors border-gray-300"
            required
            disabled={loading}
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Owner Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={ownerCredentials.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="Enter your owner password"
              className="w-full px-4 py-3 pr-12 border rounded-lg outline-none transition-colors border-gray-300"
              required
              disabled={loading}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700 focus:outline-none disabled:cursor-not-allowed"
              disabled={loading}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-sm">
            <p className="font-semibold text-blue-800 mb-2">Security Checkpoint</p>
            <ul className="list-disc list-inside text-blue-700 space-y-1">
              <li>This ensures only the owner can create renter accounts</li>
              <li>Your credentials will be verified before proceeding</li>
              <li>Non-owner accounts cannot perform this action</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-center space-x-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors w-1/2"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white font-medium text-center rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center w-1/2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                <span>Verifying...</span>
              </>
            ) : (
              <span>Verify & Continue</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OwnerConfirmation;