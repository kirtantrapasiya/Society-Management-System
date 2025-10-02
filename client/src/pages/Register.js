import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, arrayUnion } from "firebase/firestore";
import { Eye, EyeOff } from "lucide-react";
import logo from "../assets/logo.svg";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    roomNumber: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    contactNo: "",
    relationship: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [roomInfo, setRoomInfo] = useState(null);
  const [registrationType, setRegistrationType] = useState("");
  const [role, setRole] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'roomNumber' && roomInfo !== null) {
      setRoomInfo(null);
      setRegistrationType("");
      setRole("");
      setError("");
    }
  };

  const capitalizeFullName = (name) => {
    return name.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const checkRoom = async (roomId) => {
    try {
      const roomRef = doc(db, "rooms", roomId);
      const roomSnap = await getDoc(roomRef);
      
      if (!roomSnap.exists()) {
        setRoomInfo({ empty: true });
        setRegistrationType("owner");
        setError("");
        return true;
      }
      
      const roomData = roomSnap.data();
      setRoomInfo(roomData);
      
      if (!roomData.owner) {
        setRegistrationType("owner");
        setRole("owner");
      } else if (roomData.isOwner === true && roomData.isRenterFamily === false) {
        setRegistrationType("owner_family");
        setRole("owner_family");
      } else if (roomData.isOwner === false && roomData.rent === true) {
        setRegistrationType("renter_family");
        setRole("renter_family");
      } else if (roomData.rent === true && roomData.isRenterFamily === false) {
        setError("Only room owner can add renter. Please contact room owner.");
        setRoomInfo(null);
        return false;
      }
      
      setError("");
      return true;
    } catch (err) {
      console.error("Error checking room:", err);
      setError("Failed to check room. Please try again.");
      return false;
    }
  };

  const handleRoomCheck = async () => {
    const roomId = formData.roomNumber.trim();
    if (roomId) {
      await checkRoom(roomId);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { roomNumber, fullName, email, password, confirmPassword, contactNo, relationship } = formData;
    const roomId = roomNumber.trim();

    if (!roomNumber || !fullName || !email || !password || !confirmPassword || !contactNo) {
      setError("Please fill all required fields.");
      setLoading(false);
      return;
    }

    if ((registrationType === "owner_family" || registrationType === "renter_family") && !relationship) {
      setError("Please specify your relationship.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      if (!(await checkRoom(roomId))) {
        setLoading(false);
        return;
      }

      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );
      const uid = userCredential.user.uid;

      const baseUserData = {
        uid,
        fullName: capitalizeFullName(fullName.trim()),
        email: email.trim().toLowerCase(),
        contactNo: contactNo.trim(),
        roomNumber: roomId,
        createdAt: serverTimestamp(),
        isActive: true,
      };

      if (registrationType === "owner") {
        // 1. Owner Registration
        const userData = {
          ...baseUserData,
          role: role,
        };

        await setDoc(doc(db, "users", uid), userData);

        await setDoc(doc(db, "rooms", roomId), {
          roomNumber: roomId,
          owner: uid,
          ownerName: capitalizeFullName(fullName.trim()),
          ownerEmail: email.trim().toLowerCase(),
          ownerContact: contactNo.trim(),
          rent: null,
          familyMembers: [],
          renterUid: null,
          isOwner: true,
          isRenterFamily: false,
          renterFamilyMembers: [],
          status: "active",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        console.log("Owner registered successfully");

      } else if (registrationType === "owner_family") {
        // 2. Owner Family Registration
        const userData = {
          ...baseUserData,
          role: role,
          relationship: relationship.trim(),
          ownerUid: roomInfo.owner,
        };

        await setDoc(doc(db, "users", uid), userData);

        await updateDoc(doc(db, "rooms", roomId), {
          familyMembers: arrayUnion({
            uid,
            name: capitalizeFullName(fullName.trim()),
            email: email.trim().toLowerCase(),
            contact: contactNo.trim(),
            relationship: relationship.trim(),
            addedAt: new Date().toISOString()
          }),
          updatedAt: serverTimestamp(),
        });

        console.log("Owner family member registered successfully");

      } else if (registrationType === "renter_family") {
        // 4. Renter Family Registration
        const userData = {
          ...baseUserData,
          role: role,
          relationship: relationship.trim(),
          renterUid: roomInfo.renterUid,
        };

        await setDoc(doc(db, "users", uid), userData);

        await updateDoc(doc(db, "rooms", roomId), {
          renterFamilyMembers: arrayUnion({
            uid,
            name: capitalizeFullName(fullName.trim()),
            email: email.trim().toLowerCase(),
            contact: contactNo.trim(),
            relationship: relationship.trim(),
            addedAt: new Date().toISOString()
          }),
          updatedAt: serverTimestamp(),
        });

        console.log("Renter family member registered successfully");
      }

      navigate("/dashboard");

    } catch (err) {
      console.error("Registration error:", err);

      let errorMessage = "Registration failed. Please try again.";

      if (err.code === "auth/email-already-in-use") {
        errorMessage = "An account with this email already exists.";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please choose a stronger password.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getRegistrationTypeText = () => {
    switch (registrationType) {
      case "owner": return "Room Owner";
      case "owner_family": return "Owner's Family Member";
      case "renter": return "Renter";
      case "renter_family": return "Renter's Family Member";
      default: return "Room Owner";
    }
  };

  const getRoomStatusDisplay = () => {
    if (!roomInfo) {
      return (
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 text-white">
          <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-4">Room Number: {formData.roomNumber || "___"}</h3>
          <p className="text-white/80 text-sm md:text-base">Please enter room number and click Check to see status.</p>
        </div>
      );
    }

    if (roomInfo.empty) {
      return (
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 text-white">
          <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-4">Room Status: #{formData.roomNumber}</h3>
          <div className="space-y-1 md:space-y-2 text-xs md:text-sm">
            <p><span className="text-white/80">Owner:</span> Available</p>
            <p><span className="text-white/80">Living Status:</span> Available</p>
            <p><span className="text-white/80">Rent Status:</span> Available</p>
            <p><span className="text-white/80">Family Members:</span> 0</p>
          </div>
          <p className="text-white font-medium mt-2 md:mt-4 bg-white/20 rounded-lg p-2 text-xs md:text-sm">
            You can register as: Room Owner
          </p>
        </div>
      );
    }

    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 text-white">
        <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-4">Room Status: {roomInfo.roomNumber}</h3>
        <div className="space-y-1 md:space-y-2 text-xs md:text-sm">
          <p><span className="text-white/80">Owner:</span> {roomInfo.ownerName}</p>
          <p><span className="text-white/80">Living Status:</span> {roomInfo.isOwner ? "Owner Living" : "Owner Not Living"}</p>
          <p><span className="text-white/80">Rent Status:</span> {roomInfo.rent ? "Rented" : "Not Rented"}</p>
          <p><span className="text-white/80">Family Members:</span> {roomInfo.familyMembers?.length || 0}</p>
          
          {roomInfo.renterUid && (
            <p><span className="text-white/80">Renter Family:</span> {roomInfo.renterFamilyMembers?.length || 0}</p>
          )}
        </div>
        <p className="text-white font-medium mt-2 md:mt-4 bg-white/20 rounded-lg p-2 text-xs md:text-sm">
          You can register as: {getRegistrationTypeText()}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-7xl flex flex-col lg:flex-row">
        <div className="flex-1 bg-gradient-to-br from-[#1D4ED8] via-[#0080e8] to-neutral-400 p-6 md:p-8 flex flex-col justify-center items-center text-white relative overflow-hidden min-h-[300px] lg:min-h-auto">
          <div className="relative z-10 text-center max-w-md w-full">
            <div className="mb-6 p-4 md:mb-10 flex justify-center items-center bg-white rounded-full shadow-lg gap-3">
              <img src={logo} alt="Logo" className="h-20 w-21" />
              <div className="flex flex-col pt-2">
                <span className="font-bold text-3xl text-left text-cyan-800">Society</span>
                <p className="flex flex-col text-sm text-left text-gray-500">Management System</p>
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-4">Welcome to The Building</h1>
            <p className="text-base md:text-lg lg:text-xl text-white/90 mb-4 md:mb-8">
              To continue, please check your room status and fill out the registration form.
            </p>
            {getRoomStatusDisplay()}
          </div>
        </div>

        <div className="flex-1 bg-white p-6 md:p-8 flex flex-col justify-center">
          <div className="max-w-lg mx-auto w-full">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Create Your Account</h2>
              <p className="text-gray-600 text-sm md:text-base">Join us and become a resident.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 md:mb-6 text-sm md:text-base">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                  <input
                    name="fullName"
                    placeholder="Full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-xl outline-none text-gray-900 text-sm md:text-base"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-xl outline-none text-gray-900 text-sm md:text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number *</label>
                <input
                  name="contactNo"
                  placeholder="+91 22 1234 5678"
                  value={formData.contactNo}
                  onChange={handleChange}
                  required
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-xl outline-none text-gray-900 text-sm md:text-base"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-xl outline-none text-gray-900 text-sm md:text-base pr-10 md:pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-9 md:top-10 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password *</label>
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-xl outline-none text-gray-900 text-sm md:text-base pr-10 md:pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    className="absolute right-3 top-9 md:top-10 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Room Number *</label>
                  <div className="flex gap-2">
                    <input
                      name="roomNumber"
                      placeholder="e.g., 101"
                      value={formData.roomNumber}
                      onChange={handleChange}
                      required
                      className="w-full flex-1 px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-xl outline-none text-gray-900 text-sm md:text-base"
                    />
                    <button
                      type="button"
                      onClick={handleRoomCheck}
                      className="px-3 md:px-6 py-2 md:py-3 bg-neutral-800 text-white rounded-xl hover:bg-neutral-900 transition-colors font-medium text-sm md:text-base whitespace-nowrap"
                    >
                      Check
                    </button>
                  </div>
                </div>

                {(registrationType === "owner_family" || registrationType === "renter_family") && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Relationship *
                    </label>
                    <input
                      name="relationship"
                      placeholder="e.g., Son, Daughter"
                      value={formData.relationship}
                      onChange={handleChange}
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-xl outline-none  text-gray-900 text-sm md:text-base"
                    />
                  </div>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 md:px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
                >
                  {loading ? "Registering..." : `Register as ${getRegistrationTypeText()}`}
                </button>
                
                <div className="text-center mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-600 hover:text-blue-500 font-semibold">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;