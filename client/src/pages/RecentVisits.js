import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";

const RecentVisits = () => {
  const [visits, setVisits] = useState([]);
  const [filteredVisits, setFilteredVisits] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 10;

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const q = query(collection(db, "residency"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVisits(data);
        setFilteredVisits(data);
      } catch (error) {
        console.error("Error fetching visits:", error);
      }
    };

    fetchVisits();
  }, []);

  useEffect(() => {
    let result = visits;

    if (search.trim() !== "") {
      result = result.filter((v) =>
        v.residencyName.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "All") {
      result = result.filter((v) => v.status === statusFilter);
    }

    setFilteredVisits(result);
    setCurrentPage(1);
  }, [search, statusFilter, visits]);

  const indexOfLast = currentPage * resultsPerPage;
  const indexOfFirst = indexOfLast - resultsPerPage;
  const currentVisits = filteredVisits.slice(indexOfFirst, indexOfLast);

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredVisits.length / resultsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Recent Visits</h1>
      </div>

      <div className="flex flex-wrap gap-3 items-center mb-6">
        <input
          type="text"
          placeholder="Search Residency Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[250px] border border-gray-300 rounded-lg px-4 py-2 outline-none"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 outline-none"
        >
          <option value="All">Status</option>
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
          <option value="Rejected">Rejected</option>
        </select>

        <button className="border border-gray-300 rounded-lg px-4 py-2 text-gray-600">
          Date Range
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-4 py-3 text-sm text-gray-600 border-b">
          Total {filteredVisits.length} Members
        </div>

        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 font-medium">
            <tr>
              <th className="px-4 py-3">Residency Name</th>
              <th className="px-4 py-3">House/Flat No.</th>
              <th className="px-4 py-3">In–Out Time</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {currentVisits.length > 0 ? (
              currentVisits.map((visit) => (
                <tr
                  key={visit.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 capitalize">{visit.residencyName}</td>
                  <td className="px-4 py-3">C - {visit.houseNo}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {visit.timestamp?.toDate
                      ? new Date(visit.timestamp.toDate()).toLocaleTimeString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${
                        visit.status === "Approved"
                          ? "bg-green-50 text-green-700"
                          : visit.status === "Pending"
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {visit.status || "Approved"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="px-4 py-6 text-center text-gray-500 italic"
                >
                  No visits found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <select
            value={resultsPerPage}
            disabled
            className="border border-gray-300 rounded-lg px-2 py-1"
          >
            <option value="10">10</option>
          </select>
          <span>Result per page</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg border ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Back
          </button>
          <span className="px-3 py-1 bg-black text-white rounded-lg text-sm">
            {currentPage}
          </span>
          <button
            onClick={nextPage}
            disabled={indexOfLast >= filteredVisits.length}
            className={`px-4 py-2 rounded-lg border ${
              indexOfLast >= filteredVisits.length
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentVisits;
