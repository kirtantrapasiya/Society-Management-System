import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Loader2, User } from "lucide-react";
import { auth } from "../../firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export default function VisitorForgotPassword() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const validateEmail = (email) => {
    if (!email.trim()) return "Email address is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return "Please enter a valid email address";
    return "";
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    if (emailError) setEmailError("");
    if (error) setError("");
  };

  const startCooldown = () => {
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEmailError("");

    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase(), {
        url: window.location.origin + '/visitor-login',
        handleCodeInApp: false,
      });

      setIsEmailSent(true);
      startCooldown();

    } catch (err) {
      console.error("Password reset error:", err);
      
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      switch (err.code) {
        case "auth/user-not-found":
          errorMessage = "No visitor account found with this email address. Please check your email or create a new account.";
          break;
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many password reset requests. Please wait a few minutes before trying again.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Network error. Please check your internet connection and try again.";
          break;
        case "auth/timeout":
          errorMessage = "Request timed out. Please check your internet connection and try again.";
          break;
        default:
          errorMessage = "Failed to send password reset email. Please try again.";
          break;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = () => {
    if (resendCooldown === 0) {
      handleSubmit({ preventDefault: () => {} });
    }
  };

  const handleBackToLogin = () => {
    navigate("/visitor-login");
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Check Your Email
              </h1>
              <p className="text-gray-600 text-sm">
                We've sent a password reset link to
              </p>
              <p className="text-blue-600 font-medium mt-1">
                {email}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Next Steps:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Check your email inbox (and spam folder)</li>
                <li>• Click the reset link in the email</li>
                <li>• Create a new password</li>
                <li>• Sign in with your new password</li>
              </ul>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleResendEmail}
                disabled={resendCooldown > 0 || isLoading}
                className="w-full py-3 px-4 flex items-center justify-center text-white font-semibold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  `Resend email in ${resendCooldown}s`
                ) : (
                  <>
                    Resend Email
                  </>
                )}
              </button>

              <button
                onClick={handleBackToLogin}
                className="w-full py-3 px-4 flex items-center justify-center text-gray-600 font-medium hover:text-gray-800 transition-colors"
              >
                Back to Visitor Login
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Didn't receive the email? Check your spam folder or{" "}
                <button
                  onClick={handleResendEmail}
                  disabled={resendCooldown > 0}
                  className="text-blue-600 hover:text-blue-500 font-medium focus:outline-none focus:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  try again
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Forgot Password - Visitor
            </h1>
            <p className="text-gray-600 text-sm">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>

          {(error || emailError) ? (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <div>
                  {error && (
                    <>
                      <h3 className="text-sm font-medium text-red-800">Password Reset Failed</h3>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </>
                  )}
                  {emailError && (
                    <div className="flex items-center space-x-2 text-red-700 text-sm mt-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{emailError}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="text-center">
                <p className="text-xs text-blue-700">
                  <strong>Security Note:</strong> Password reset links are valid for 1 hour
                  and can only be used once for security reasons.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mt-6 mb-2">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your visitor email address"
                value={email}
                onChange={handleEmailChange}
                className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 border rounded-xl border-gray-300 outline-none transition"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 flex items-center justify-center text-white font-semibold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Sending Reset Link...
                </>
              ) : (
                <>
                  Send Reset Link
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleBackToLogin}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 font-medium focus:outline-none focus:underline"
            >
              Back to Visitor Login
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="text-center">
              <p className="text-sm text-gray-800 font-medium mb-1">Need Help?</p>
              <p className="text-xs text-gray-600">
                If you don't remember your email address or continue having issues,
                please contact the building management for assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}