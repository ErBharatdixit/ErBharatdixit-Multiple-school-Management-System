import { useState, useEffect } from "react";
import { Check, X, Clock, AlertCircle, Calendar } from "lucide-react";
import api from "../api";

export default function MyAttendance() {
      const [attendance, setAttendance] = useState([]);
      const [loading, setLoading] = useState(true);
      const [stats, setStats] = useState({ present: 0, absent: 0, halfDay: 0, leave: 0 });

      useEffect(() => {
            fetchMyAttendance();
      }, []);

      const fetchMyAttendance = async () => {
            try {
                  const res = await api.get("/attendance/teacher/me");
                  setAttendance(res.data);
                  calculateStats(res.data);
            } catch (err) {
                  console.error("Failed to fetch attendance", err);
            } finally {
                  setLoading(false);
            }
      };

      const calculateStats = (data) => {
            const counts = { present: 0, absent: 0, halfDay: 0, leave: 0 };
            data.forEach(record => {
                  if (record.status === "present") counts.present++;
                  else if (record.status === "absent") counts.absent++;
                  else if (record.status === "half-day") counts.halfDay++;
                  else if (record.status === "leave") counts.leave++;
            });
            setStats(counts);
      };

      const getStatusColor = (status) => {
            switch (status) {
                  case "present": return "bg-green-100 text-green-700 border-green-200";
                  case "absent": return "bg-red-100 text-red-700 border-red-200";
                  case "half-day": return "bg-yellow-100 text-yellow-700 border-yellow-200";
                  case "leave": return "bg-blue-100 text-blue-700 border-blue-200";
                  default: return "bg-gray-100 text-gray-700 border-gray-200";
            }
      };

      const getStatusIcon = (status) => {
            switch (status) {
                  case "present": return <Check className="w-4 h-4" />;
                  case "absent": return <X className="w-4 h-4" />;
                  case "half-day": return <Clock className="w-4 h-4" />;
                  case "leave": return <AlertCircle className="w-4 h-4" />;
                  default: return null;
            }
      };

      return (
            <div className="space-y-6 animate-fade-in">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                              <p className="text-green-600 text-sm font-medium">Present</p>
                              <p className="text-2xl font-bold text-green-800">{stats.present}</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                              <p className="text-red-600 text-sm font-medium">Absent</p>
                              <p className="text-2xl font-bold text-red-800">{stats.absent}</p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                              <p className="text-yellow-600 text-sm font-medium">Half Days</p>
                              <p className="text-2xl font-bold text-yellow-800">{stats.halfDay}</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                              <p className="text-blue-600 text-sm font-medium">Leaves</p>
                              <p className="text-2xl font-bold text-blue-800">{stats.leave}</p>
                        </div>
                  </div>

                  {/* Attendance List */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-primary" />
                                    Attendance History
                              </h3>
                        </div>
                        <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                          <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                                          </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                          {loading ? (
                                                <tr><td colSpan="3" className="px-6 py-12 text-center text-gray-500">Loading...</td></tr>
                                          ) : attendance.length === 0 ? (
                                                <tr><td colSpan="3" className="px-6 py-12 text-center text-gray-500">No attendance records found.</td></tr>
                                          ) : (
                                                attendance.map((record) => (
                                                      <tr key={record._id} className="hover:bg-gray-50 transition">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                  {new Date(record.date).toLocaleDateString(undefined, {
                                                                        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                                                                  })}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                  <span className={`px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full border ${getStatusColor(record.status)}`}>
                                                                        {getStatusIcon(record.status)}
                                                                        {record.status.replace('-', ' ').toUpperCase()}
                                                                  </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                  {record.remarks || "-"}
                                                            </td>
                                                      </tr>
                                                ))
                                          )}
                                    </tbody>
                              </table>
                        </div>
                  </div>
            </div>
      );
}
