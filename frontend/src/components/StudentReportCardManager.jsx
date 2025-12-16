import { useState, useEffect } from "react";
import { Search, FileText, Download } from "lucide-react";
import api from "../api";
import ReportCard from "./ReportCard";

export default function StudentReportCardManager() {
      const [students, setStudents] = useState([]);
      const [classes, setClasses] = useState([]);
      const [selectedClass, setSelectedClass] = useState("");
      const [selectedStudent, setSelectedStudent] = useState(null);
      const [searchTerm, setSearchTerm] = useState("");
      const [loading, setLoading] = useState(true);

      useEffect(() => {
            fetchClasses();
      }, []);

      useEffect(() => {
            if (selectedClass) {
                  fetchStudents();
            }
      }, [selectedClass]);

      const fetchClasses = async () => {
            try {
                  const res = await api.get("/academic/classes");
                  setClasses(res.data);
                  if (res.data.length > 0) {
                        setSelectedClass(res.data[0]._id);
                  }
            } catch (error) {
                  console.error("Failed to fetch classes:", error);
            } finally {
                  setLoading(false);
            }
      };

      const fetchStudents = async () => {
            try {
                  setLoading(true);
                  const res = await api.get(`/users/students?classId=${selectedClass}`);
                  setStudents(res.data);
            } catch (error) {
                  console.error("Failed to fetch students:", error);
            } finally {
                  setLoading(false);
            }
      };

      const filteredStudents = students.filter(student =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.rollNo && student.rollNo.toString().includes(searchTerm))
      );

      if (selectedStudent) {
            return (
                  <div className="space-y-4">
                        <button
                              onClick={() => setSelectedStudent(null)}
                              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium"
                        >
                              ← Back to Student List
                        </button>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                              <h3 className="text-lg font-bold text-gray-800">
                                    Report Card for: {selectedStudent.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                    Class: {selectedStudent.classId?.name} - Section {selectedStudent.classId?.section} | Roll No: {selectedStudent.rollNo}
                              </p>
                        </div>
                        <ReportCard studentId={selectedStudent._id} studentData={selectedStudent} />
                  </div>
            );
      }

      return (
            <div className="space-y-6">
                  {/* Header */}
                  <div>
                        <h2 className="text-2xl font-bold text-gray-900">Student Report Cards</h2>
                        <p className="text-gray-600 mt-1">Select a student to view and generate their report card</p>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-col md:flex-row gap-4">
                        {/* Class Filter */}
                        <div className="flex-1">
                              <label className="block text-sm font-bold text-gray-700 mb-2">Select Class</label>
                              <select
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                    {classes.map((cls) => (
                                          <option key={cls._id} value={cls._id}>
                                                {cls.name} - Section {cls.section}
                                          </option>
                                    ))}
                              </select>
                        </div>

                        {/* Search */}
                        <div className="flex-1">
                              <label className="block text-sm font-bold text-gray-700 mb-2">Search Student</label>
                              <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                          type="text"
                                          placeholder="Search by name, email, or roll number..."
                                          value={searchTerm}
                                          onChange={(e) => setSearchTerm(e.target.value)}
                                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                              </div>
                        </div>
                  </div>

                  {/* Student List */}
                  {loading ? (
                        <div className="flex justify-center p-12">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                  ) : (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                              <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                          <thead className="bg-gray-50">
                                                <tr>
                                                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                            Roll No
                                                      </th>
                                                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                            Student Name
                                                      </th>
                                                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                            Email
                                                      </th>
                                                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                            Class
                                                      </th>
                                                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                            Action
                                                      </th>
                                                </tr>
                                          </thead>
                                          <tbody className="bg-white divide-y divide-gray-200">
                                                {filteredStudents.length > 0 ? (
                                                      filteredStudents.map((student) => (
                                                            <tr key={student._id} className="hover:bg-blue-50 transition">
                                                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                                        {student.rollNo || "-"}
                                                                  </td>
                                                                  <td className="px-6 py-4 whitespace-nowrap">
                                                                        <div className="flex items-center">
                                                                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                                                                    {student.name.charAt(0)}
                                                                              </div>
                                                                              <div className="ml-4">
                                                                                    <div className="text-sm font-bold text-gray-900">{student.name}</div>
                                                                              </div>
                                                                        </div>
                                                                  </td>
                                                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                                        {student.email}
                                                                  </td>
                                                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                                        {student.classId?.name} - {student.classId?.section}
                                                                  </td>
                                                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                        <button
                                                                              onClick={() => setSelectedStudent(student)}
                                                                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 ml-auto"
                                                                        >
                                                                              <FileText className="w-4 h-4" />
                                                                              View Report Card
                                                                        </button>
                                                                  </td>
                                                            </tr>
                                                      ))
                                                ) : (
                                                      <tr>
                                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium">
                                                                  {searchTerm ? "No students found matching your search" : "No students in this class"}
                                                            </td>
                                                      </tr>
                                                )}
                                          </tbody>
                                    </table>
                              </div>
                        </div>
                  )}

                  {/* Stats */}
                  {filteredStudents.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                              <p className="text-sm text-blue-800">
                                    <span className="font-bold">{filteredStudents.length}</span> student{filteredStudents.length !== 1 ? 's' : ''} found
                                    {searchTerm && <span> matching "{searchTerm}"</span>}
                              </p>
                        </div>
                  )}
            </div>
      );
}
