import { useState, useEffect } from "react";
import api from "../api";
import { Search, Filter, IndianRupee, CheckCircle, AlertCircle, Clock, Eye } from "lucide-react";
import StudentFeeDetail from "./StudentFeeDetail";

export default function AdminFeeStatus() {
      const [classes, setClasses] = useState([]);
      const [selectedClass, setSelectedClass] = useState("");
      const [students, setStudents] = useState([]);
      const [loading, setLoading] = useState(false);
      const [searchTerm, setSearchTerm] = useState("");
      const [selectedStudentId, setSelectedStudentId] = useState(null);

      useEffect(() => {
            fetchClasses();
      }, []);

      useEffect(() => {
            if (selectedClass) {
                  fetchClassFeeStatus(selectedClass);
            } else {
                  setStudents([]);
            }
      }, [selectedClass]);

      const fetchClasses = async () => {
            try {
                  const response = await api.get("/academic/classes");
                  setClasses(response.data);
            } catch (error) {
                  console.error("Failed to fetch classes:", error);
            }
      };

      const fetchClassFeeStatus = async (classId) => {
            setLoading(true);
            try {
                  const response = await api.get(`/fees/class/${classId}`);
                  setStudents(response.data);
            } catch (error) {
                  console.error("Failed to fetch fee status:", error);
            } finally {
                  setLoading(false);
            }
      };

      const filteredStudents = students.filter(student =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.rollNo && student.rollNo.toString().includes(searchTerm))
      );

      const getStatusColor = (status) => {
            switch (status) {
                  case "Paid": return "bg-green-100 text-green-800 border-green-200";
                  case "Partial": return "bg-yellow-100 text-yellow-800 border-yellow-200";
                  case "Pending": return "bg-red-100 text-red-800 border-red-200";
                  default: return "bg-gray-100 text-gray-800";
            }
      };

      return (
            <div className="space-y-6 animate-fade-in relative">
                  {selectedStudentId && (
                        <StudentFeeDetail
                              studentId={selectedStudentId}
                              onClose={() => setSelectedStudentId(null)}
                        />
                  )}

                  <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <div className="w-full md:w-1/3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
                              <select
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                    <option value="">-- Select Class --</option>
                                    {classes.map((cls) => (
                                          <option key={cls._id} value={cls._id}>
                                                {cls.name} - Section {cls.section} (Grade {cls.grade})
                                          </option>
                                    ))}
                              </select>
                        </div>

                        {selectedClass && (
                              <div className="w-full md:w-1/3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Search Student</label>
                                    <div className="relative">
                                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Search className="h-5 w-5 text-gray-400" />
                                          </div>
                                          <input
                                                type="text"
                                                placeholder="Search by name, roll no..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                          />
                                    </div>
                              </div>
                        )}
                  </div>

                  {loading ? (
                        <div className="flex justify-center p-12">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                  ) : selectedClass && filteredStudents.length > 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                              <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                          <thead className="bg-gray-50">
                                                <tr>
                                                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                                                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Roll No</th>
                                                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total Fees</th>
                                                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Paid</th>
                                                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pending</th>
                                                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                                </tr>
                                          </thead>
                                          <tbody className="bg-white divide-y divide-gray-200">
                                                {filteredStudents.map((student) => (
                                                      <tr key={student._id} className="hover:bg-gray-50 transition">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                  <div className="flex items-center">
                                                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                                                                              {student.name.charAt(0)}
                                                                        </div>
                                                                        <div>
                                                                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                                                              <div className="text-xs text-gray-500">{student.email}</div>
                                                                        </div>
                                                                  </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                  {student.rollNo || "-"}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                  ₹{student.totalFees}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                                                  ₹{student.totalPaid}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                                                                  {student.pendingAmount > 0 ? `₹${student.pendingAmount}` : "-"}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(student.status)}`}>
                                                                        {student.status}
                                                                  </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                  <button
                                                                        onClick={() => setSelectedStudentId(student._id)}
                                                                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                                                                  >
                                                                        <Eye className="w-4 h-4" />
                                                                        View Details
                                                                  </button>
                                                            </td>
                                                      </tr>
                                                ))}
                                          </tbody>
                                    </table>
                              </div>
                        </div>
                  ) : selectedClass ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                              <p className="text-gray-500">No students found for this class.</p>
                        </div>
                  ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                              <p className="text-gray-500">Please select a class to view fee status.</p>
                        </div>
                  )}
            </div>
      );
}
