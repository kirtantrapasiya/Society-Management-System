import React, { useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

const ResidencyRegister = ({ residency, onClose }) => {
  const [formData, setFormData] = useState({
    blockNo: "",
    houseNo: "",
    totalVisitors: "1",
    purpose: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.blockNo || !formData.houseNo || !formData.purpose) {
      setErrorMsg("⚠️ Please fill all required fields!");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const q = query(
        collection(db, "residency"),
        where("residencyName", "==", residency.name),
        where("blockNo", "==", formData.blockNo),
        where("houseNo", "==", formData.houseNo)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setErrorMsg("This block and house are already registered!");
        setLoading(false);
        return;
      }

      await addDoc(collection(db, "residency"), {
        residencyName: residency.name,
        blockNo: formData.blockNo,
        houseNo: formData.houseNo,
        totalVisitors: formData.totalVisitors,
        purpose: formData.purpose,
        timestamp: serverTimestamp(),
      });

      onClose(); 
    } catch (error) {
      setErrorMsg("Failed to register residency. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (!residency) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-200 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold text-gray-900 mb-1">Check In</h2>
        <p className="text-gray-600 mb-2">{residency.name}</p>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg p-3 mb-4">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Block No.
            </label>
            <input
              type="text"
              name="blockNo"
              placeholder="Enter block number"
              value={formData.blockNo}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              House No.
            </label>
            <input
              type="text"
              name="houseNo"
              placeholder="Enter house number"
              value={formData.houseNo}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Visitors
            </label>
            <select
              name="totalVisitors"
              value={formData.totalVisitors}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purpose
            </label>
            <textarea
              name="purpose"
              placeholder="Enter visit purpose"
              value={formData.purpose}
              onChange={handleChange}
              rows="3"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
            ></textarea>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-1/2 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-70"
            >
              {loading ? "Checking..." : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResidencyRegister;
