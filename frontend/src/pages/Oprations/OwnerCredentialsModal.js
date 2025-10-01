import React, { useState, useEffect } from 'react';
import { X, Loader2, Eye, EyeOff } from 'lucide-react';

const OwnerCredentialsModal = ({ isOpen, onClose, onSubmit, renterName, renterEmail }) => {
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [renterPassword, setRenterPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showRenterPassword, setShowRenterPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAdminEmail('');
      setAdminPassword('');
      setRenterPassword('');
      setError('');
      setConfirmed(false);
      setLoading(false);
      setShowAdminPassword(false);
      setShowRenterPassword(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!adminEmail.trim() || !adminPassword.trim()) {
      setError('Please enter both admin email and password');
      return;
    }

    if (!confirmed) {
      setError('Please confirm that you want to delete this renter');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await onSubmit(adminEmail.trim(), adminPassword.trim(), renterPassword.trim());
      
      if (result && result.requiresConfirmation) {
        setError(result.message);
        setLoading(false);
        return;
      }
      
    } catch (err) {
      setError(err.message || 'An error occurred during deletion');
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Delete Renter</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div>
                <h3 className="font-medium text-red-800 mb-2">
                  You are about to delete: {renterName || 'Unknown Renter'}
                </h3>
                <div className="text-sm text-red-700 space-y-1">
                  <p>This action will:</p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>Remove the renter from the room</li>
                    <li>Delete their renter profile from database</li>
                    <li>Delete their authentication account (if password provided)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Owner Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                placeholder="Enter your owner email"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Owner Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none pr-10"
                  placeholder="Enter your owner password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showAdminPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {renterEmail && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Renter Password <span className="text-gray-400">(Optional)</span>
                </label>
                <div className="relative">
                  <input
                    type={showRenterPassword ? 'text' : 'password'}
                    value={renterPassword}
                    onChange={(e) => setRenterPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none pr-10"
                    placeholder={`Password for ${renterEmail}`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRenterPassword(!showRenterPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showRenterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Required to delete authentication account. If not provided, only database will be deleted.
                </p>
              </div>
            )}

            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="confirm-delete"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded cursor-pointer"
                disabled={loading}
              />
              <label htmlFor="confirm-delete" className="text-sm text-gray-700 cursor-pointer select-none">
                I understand that this action cannot be undone and will permanently delete{' '}
                <span className="font-semibold">{renterName || 'this renter'}</span> from the system.
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !confirmed}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Renter'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OwnerCredentialsModal;