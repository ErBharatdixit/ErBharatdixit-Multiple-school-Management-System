import { useState, useEffect } from "react";
import api from "../api";
import { Clock, CheckCircle, XCircle, Calendar } from "lucide-react";

export default function LeaveHistory({ refreshTrigger }) {
      const [leaves, setLeaves] = useState([]);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
            fetchLeaves();
      }, [refreshTrigger]);

      const fetchLeaves = async () => {
            try {
                  const response = await api.get("/leaves/my");
                  setLeaves(response.data);
            } catch (error) {
                  console.error("Failed to fetch leaves:", error);
            } finally {
                  setLoading(false);
            }
      };

      const getStatusBadge = (status) => {
            switch (status) {
                  case "Approved":
                        return <span className="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs font-bold"><CheckCircle className="w-3 h-3" /> Approved</span>;
                  case "Rejected":
                        return <span className="flex items-center gap-1 text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs font-bold"><XCircle className="w-3 h-3" /> Rejected</span>;
                  default:
                        return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs font-bold"><Clock className="w-3 h-3" /> Pending</span>;
            }
      };

      return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        My Leave History
                  </h3>

                  {loading ? (
                        <div className="flex justify-center p-4">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                  ) : leaves.length > 0 ? (
                        <div className="space-y-4">
                              {leaves.map((leave) => (
                                    <div key={leave._id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition">
                                          <div className="flex justify-between items-start mb-2">
                                                <div>
                                                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{leave.type}</span>
                                                      <p className="text-sm font-medium text-gray-900 mt-1">
                                                            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                                      </p>
                                                </div>
                                                {getStatusBadge(leave.status)}
                                          </div>
                                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded italic">"{leave.reason}"</p>
                                          {leave.status === "Rejected" && leave.rejectionReason && (
                                                <p className="mt-2 text-xs text-red-600 font-medium">Reason: {leave.rejectionReason}</p>
                                          )}
                                    </div>
                              ))}
                        </div>
                  ) : (
                        <p className="text-center text-gray-500 py-4">No leave history found.</p>
                  )}
            </div>
      );
}
