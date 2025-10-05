import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { auth, db } from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";

const ResidentLogin = () => {
  const navigate = useNavigate();
  const { userDoc, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (!authLoading && userDoc) {
      const role = userDoc.role;
      if (role === "secretary") navigate("/secretary-dashboard", { replace: true });
      else if (["owner", "owner_family", "renter", "renter_family"].includes(role)) {
        navigate("/resident-dashboard", { replace: true });
      }
    }
  }, [userDoc, authLoading, navigate]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email.trim(),
        formData.password.trim()
      );
      const user = userCredential.user;

      const userDocSnap = await getDoc(doc(db, "users", user.uid));
      if (!userDocSnap.exists()) throw new Error("User data not found");

      const role = userDocSnap.data().role;

      if (role === "secretary") navigate("/secretary-dashboard", { replace: true });
      else if (["owner", "owner_family", "renter", "renter_family"].includes(role)) {
        navigate("/dashboard", { replace: true });
      } else setError("Role not found. Please contact admin.");
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid credentials or user not found.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => navigate("/resident-forgot-password");

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1 mt-4">
              Sign in
            </h1>
            <p className="text-sm text-gray-600">
              Welcome back! Please enter your details.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 text-gray-900 placeholder-gray-500 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 text-sm text-gray-600">
                  Remember me
                </label>
              </div>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                Forgot your password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 flex items-center justify-center text-white font-semibold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sign In
            </button>
          </form>

          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Don’t have an account?{" "}
              <Link to="/resident-register" className="text-blue-600 hover:text-blue-500 font-semibold">
                Sign up
              </Link>
            </p>
            <button
              onClick={() => navigate('/')}
              className="flex items-center mt-3 justify-center gap-2 mx-auto text-gray-500 hover:text-gray-700 text-sm"
            >
              <ArrowLeft size={16} />
              Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResidentLogin;