import { useState, useEffect } from "react";
import api from "../api";
import { Check, X, Filter, User } from "lucide-react";

export default function LeaveManager() {
      const [leaves, setLeaves] = useState([]);
      const [loading, setLoading] = useState(true);
      const [filter, setFilter] = useState("Pending");

      useEffect(() => {
            fetchLeaves();
      }, [filter]);

      const fetchLeaves = async () => {
            setLoading(true);
            try {
                  const response = await api.get(`/leaves?status=${filter === "All" ? "" : filter}`);
                  setLeaves(response.data);
            } catch (error) {
                  console.error("Failed to fetch leaves:", error);
            } finally {
                  setLoading(false);
            }
      };

      const handleStatusUpdate = async (id, status, reason = "") => {
            if (status === "Rejected" && !reason) {
                  reason = prompt("Please provide a reason for rejection:");
                  if (!reason) return; // Cancel if no reason provided
            }

            try {
                  await api.put(`/leaves/${id}/status`, { status, rejectionReason: reason });
                  fetchLeaves(); // Refresh list
            } catch (error) {
                  alert(error.response?.data?.message || "Failed to update status");
            }
      };

      return (
            <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                              <User className="w-6 h-6 text-purple-600" />
                              Leave Requests
                        </h2>
                        <div className="flex items-center gap-2">
                              <Filter className="w-4 h-4 text-gray-500" />
                              <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                              >
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="All">All</option>
                              </select>
                        </div>
                  </div>

                  {loading ? (
                        <div className="flex justify-center p-12">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        </div>
                  ) : leaves.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {leaves.map((leave) => (
                                    <div key={leave._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                                          <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                                                            {leave.applicantId?.name?.charAt(0) || "?"}
                                                      </div>
                                                      <div>
                                                            <p className="font-bold text-gray-900">{leave.applicantId?.name || "Unknown"}</p>
                                                            <p className="text-xs text-gray-500 capitalize">
                                                                  {leave.applicantId?.role === "student" ?
                                                                        `${leave.applicantId?.classId?.name || "Class"} - ${leave.applicantId?.classId?.section || "?"}` :
                                                                        "Staff"
                                                                  }
                                                            </p>
                                                      </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${leave.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                                                      leave.status === "Approved" ? "bg-green-100 text-green-700" :
                                                            "bg-red-100 text-red-700"
                                                      }`}>
                                                      {leave.status}
                                                </span>
                                          </div>

                                          <div className="space-y-2 mb-4">
                                                <div className="flex justify-between text-sm">
                                                      <span className="text-gray-500">Type:</span>
                                                      <span className="font-medium">{leave.type}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                      <span className="text-gray-500">Duration:</span>
                                                      <span className="font-medium">
                                                            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                                      </span>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 italic">
                                                      "{leave.reason}"
                                                </div>
                                          </div>

                                          {leave.status === "Pending" && (
                                                <div className="flex gap-2 pt-2 border-t border-gray-100">
                                                      <button
                                                            onClick={() => handleStatusUpdate(leave._id, "Approved")}
                                                            className="flex-1 py-2 bg-green-50 text-green-700 font-bold rounded-lg hover:bg-green-100 transition flex justify-center items-center gap-2"
                                                      >
                                                            <Check className="w-4 h-4" /> Approve
                                                      </button>
                                                      <button
                                                            onClick={() => handleStatusUpdate(leave._id, "Rejected")}
                                                            className="flex-1 py-2 bg-red-50 text-red-700 font-bold rounded-lg hover:bg-red-100 transition flex justify-center items-center gap-2"
                                                      >
                                                            <X className="w-4 h-4" /> Reject
                                                      </button>
                                                </div>
                                          )}
                                    </div>
                              ))}
                        </div>
                  ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                              <p className="text-gray-500">No leave requests found.</p>
                        </div>
                  )}
            </div>
      );
}
