import { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useAuth } from "../context/AuthContext";
import {
      Download,
      Printer,
      Award,
      Calendar,
      User,
      BookOpen,
      TrendingUp,
      CheckCircle2,
      School
} from "lucide-react";
import api from "../api";

export default function ReportCard({ studentId, studentData, academicYear = "2024-2025", term = "Annual" }) {
      const { user } = useAuth();
      const [student, setStudent] = useState(studentData || null);
      const [school, setSchool] = useState(null);
      const [marks, setMarks] = useState([]);
      const [stats, setStats] = useState(null);
      const [attendance, setAttendance] = useState(null);
      const [loading, setLoading] = useState(true);
      const componentRef = useRef();

      useEffect(() => {
            fetchReportData();
      }, [studentId]);

      useEffect(() => {
            if (studentData) {
                  setStudent(studentData);
            }
      }, [studentData]);

      const fetchReportData = async () => {
            try {
                  setLoading(true);

                  // Fetch marks (either for specific student or logged-in student)
                  const marksEndpoint = studentId
                        ? `/exams/student/${studentId}/marks`
                        : "/exams/marks/me";

                  const marksRes = await api.get(marksEndpoint);
                  const fetchedMarks = marksRes.data.marks || [];

                  // Filter out invalid marks
                  const validMarks = fetchedMarks.filter(mark =>
                        mark.examId &&
                        mark.examId.subjectId &&
                        mark.marksObtained != null &&
                        mark.percentage != null
                  );

                  setMarks(validMarks);

                  // Recalculate stats from valid marks only
                  const recalculatedStats = {
                        totalExams: validMarks.length,
                        averagePercentage: validMarks.length > 0
                              ? (validMarks.reduce((sum, m) => sum + parseFloat(m.percentage), 0) / validMarks.length).toFixed(2)
                              : 0,
                        highestPercentage: validMarks.length > 0
                              ? Math.max(...validMarks.map(m => parseFloat(m.percentage)))
                              : 0,
                        lowestPercentage: validMarks.length > 0
                              ? Math.min(...validMarks.map(m => parseFloat(m.percentage)))
                              : 0
                  };

                  setStats(recalculatedStats);

                  // Fetch school data
                  const schoolId = studentData?.schoolId || user?.schoolId;
                  if (schoolId) {
                        try {
                              const schoolRes = await api.get(`/schools/${schoolId}`);
                              setSchool(schoolRes.data);
                        } catch (err) {
                              console.log("School data not available");
                        }
                  }

                  // Fetch attendance
                  const attendanceEndpoint = studentId
                        ? `/attendance/student/${studentId}`
                        : "/attendance/student/me";

                  try {
                        const attendanceRes = await api.get(attendanceEndpoint);
                        setAttendance(attendanceRes.data.stats || null);
                  } catch (err) {
                        console.log("Attendance data not available");
                  }
            } catch (error) {
                  console.error("Failed to fetch report data:", error);
            } finally {
                  setLoading(false);
            }
      };

      const handlePrint = useReactToPrint({
            content: () => componentRef.current,
            documentTitle: `Report_Card_${student?.name || 'Student'}_${academicYear}`,
      });

      const getGradeColor = (grade) => {
            if (grade?.includes('A')) return 'text-green-700';
            if (grade?.includes('B')) return 'text-blue-700';
            if (grade?.includes('C')) return 'text-yellow-700';
            if (grade === 'D') return 'text-orange-700';
            return 'text-red-700';
      };

      const getOverallGrade = (percentage) => {
            if (percentage >= 90) return "A+";
            if (percentage >= 80) return "A";
            if (percentage >= 70) return "B+";
            if (percentage >= 60) return "B";
            if (percentage >= 50) return "C+";
            if (percentage >= 40) return "C";
            if (percentage >= 33) return "D";
            return "F";
      };

      // Group marks by subject - filter out invalid marks first
      const validMarks = marks.filter(mark =>
            mark.examId &&
            mark.examId.subjectId &&
            mark.marksObtained != null &&
            mark.percentage != null
      );

      const groupedMarks = validMarks.reduce((acc, mark) => {
            const subjectName = mark.examId?.subjectId?.name || "Unknown Subject";
            if (!acc[subjectName]) {
                  acc[subjectName] = [];
            }
            acc[subjectName].push(mark);
            return acc;
      }, {});

      if (loading) {
            return (
                  <div className="flex justify-center items-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
            );
      }

      return (
            <div className="space-y-6">
                  {/* Action Buttons - Not printed */}
                  <div className="flex justify-end gap-3 print:hidden">
                        <button
                              onClick={handlePrint}
                              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition flex items-center gap-2 shadow-lg"
                        >
                              <Printer className="w-5 h-5" />
                              Print Report Card
                        </button>
                        <button
                              onClick={handlePrint}
                              className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition flex items-center gap-2 shadow-lg"
                        >
                              <Download className="w-5 h-5" />
                              Download PDF
                        </button>
                  </div>

                  {/* Report Card - Printable */}
                  <div
                        ref={componentRef}
                        className="bg-white rounded-2xl shadow-2xl border-2 border-gray-200 overflow-hidden print:shadow-none print:border-black"
                  >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 print:bg-blue-700">
                              <p className="text-xl font-bold">{academicYear}</p>
                        </div>


                        {/* Report Card Title */}
                        <div className="bg-gray-50 border-b-2 border-gray-200 py-4">
                              <h2 className="text-center text-2xl font-bold text-gray-800 uppercase tracking-wide">
                                    {term} Report Card
                              </h2>
                        </div>

                        {/* Student Information */}
                        <div className="p-8 border-b-2 border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Photo Placeholder */}
                                    <div className="flex justify-center md:justify-start">
                                          <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center border-2 border-blue-300">
                                                <User className="w-16 h-16 text-blue-600" />
                                          </div>
                                    </div>

                                    {/* Student Details */}
                                    <div className="md:col-span-2 space-y-3">
                                          <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                      <p className="text-xs font-bold text-gray-500 uppercase">Student Name</p>
                                                      <p className="text-lg font-bold text-gray-900">{student?.name || user?.name || "Student Name"}</p>
                                                </div>
                                                <div>
                                                      <p className="text-xs font-bold text-gray-500 uppercase">Roll Number</p>
                                                      <p className="text-lg font-bold text-gray-900">{student?.rollNo || user?.rollNo || "N/A"}</p>
                                                </div>
                                                <div>
                                                      <p className="text-xs font-bold text-gray-500 uppercase">Class</p>
                                                      <p className="text-lg font-bold text-gray-900">
                                                            {student?.classId?.name || user?.classId?.name || "N/A"} - Section {student?.classId?.section || user?.classId?.section || ""}
                                                      </p>
                                                </div>
                                                <div>
                                                      <p className="text-xs font-bold text-gray-500 uppercase">Date of Issue</p>
                                                      <p className="text-lg font-bold text-gray-900">{new Date().toLocaleDateString()}</p>
                                                </div>
                                          </div>
                                    </div>
                              </div>
                        </div>

                        {/* Academic Performance */}
                        <div className="p-8 border-b-2 border-gray-200">
                              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <BookOpen className="w-6 h-6 text-blue-600" />
                                    Academic Performance
                              </h3>

                              {/* Marks Table */}
                              <div className="overflow-x-auto">
                                    <table className="min-w-full border-2 border-gray-300">
                                          <thead>
                                                <tr className="bg-gray-100">
                                                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase border-r border-gray-300">
                                                            Subject
                                                      </th>
                                                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase border-r border-gray-300">
                                                            Exam Type
                                                      </th>
                                                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase border-r border-gray-300">
                                                            Marks Obtained
                                                      </th>
                                                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase border-r border-gray-300">
                                                            Total Marks
                                                      </th>
                                                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase border-r border-gray-300">
                                                            Percentage
                                                      </th>
                                                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">
                                                            Grade
                                                      </th>
                                                </tr>
                                          </thead>
                                          <tbody>
                                                {Object.entries(groupedMarks).map(([subject, subjectMarks]) => (
                                                      subjectMarks.map((mark, index) => (
                                                            <tr key={mark._id} className="border-t border-gray-300 hover:bg-gray-50">
                                                                  {index === 0 && (
                                                                        <td
                                                                              rowSpan={subjectMarks.length}
                                                                              className="px-4 py-3 font-bold text-gray-900 border-r border-gray-300 align-top"
                                                                        >
                                                                              {subject}
                                                                        </td>
                                                                  )}
                                                                  <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-300">
                                                                        {mark.examId?.examType || "N/A"}
                                                                  </td>
                                                                  <td className="px-4 py-3 text-center font-bold text-gray-900 border-r border-gray-300">
                                                                        {mark.marksObtained}
                                                                  </td>
                                                                  <td className="px-4 py-3 text-center text-gray-700 border-r border-gray-300">
                                                                        {mark.examId?.totalMarks}
                                                                  </td>
                                                                  <td className="px-4 py-3 text-center font-bold text-gray-900 border-r border-gray-300">
                                                                        {mark.percentage}%
                                                                  </td>
                                                                  <td className={`px-4 py-3 text-center font-bold ${getGradeColor(mark.grade)}`}>
                                                                        {mark.grade}
                                                                  </td>
                                                            </tr>
                                                      ))
                                                ))}
                                                {validMarks.length === 0 && (
                                                      <tr>
                                                            <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                                                  No exam records available
                                                            </td>
                                                      </tr>
                                                )}
                                          </tbody>
                                    </table>
                              </div>

                              {/* Overall Statistics */}
                              {stats && (
                                    <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                                          <h4 className="text-lg font-bold text-gray-800 mb-4">Overall Performance</h4>
                                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="text-center">
                                                      <p className="text-xs font-bold text-gray-600 uppercase">Total Exams</p>
                                                      <p className="text-2xl font-bold text-blue-600">{stats.totalExams}</p>
                                                </div>
                                                <div className="text-center">
                                                      <p className="text-xs font-bold text-gray-600 uppercase">Average %</p>
                                                      <p className="text-2xl font-bold text-blue-600">{stats.averagePercentage}%</p>
                                                </div>
                                                <div className="text-center">
                                                      <p className="text-xs font-bold text-gray-600 uppercase">Highest %</p>
                                                      <p className="text-2xl font-bold text-green-600">{stats.highestPercentage}%</p>
                                                </div>
                                                <div className="text-center">
                                                      <p className="text-xs font-bold text-gray-600 uppercase">Overall Grade</p>
                                                      <p className={`text-2xl font-bold ${getGradeColor(getOverallGrade(stats.averagePercentage))}`}>
                                                            {getOverallGrade(stats.averagePercentage)}
                                                      </p>
                                                </div>
                                          </div>
                                    </div>
                              )}
                        </div>

                        {/* Attendance Summary */}
                        {
                              attendance && (
                                    <div className="p-8 border-b-2 border-gray-200">
                                          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                                <Calendar className="w-6 h-6 text-blue-600" />
                                                Attendance Summary
                                          </h3>
                                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
                                                      <p className="text-xs font-bold text-gray-600 uppercase">Present Days</p>
                                                      <p className="text-2xl font-bold text-green-600">{attendance.presentDays || 0}</p>
                                                </div>
                                                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center">
                                                      <p className="text-xs font-bold text-gray-600 uppercase">Absent Days</p>
                                                      <p className="text-2xl font-bold text-red-600">{attendance.absentDays || 0}</p>
                                                </div>
                                                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 text-center">
                                                      <p className="text-xs font-bold text-gray-600 uppercase">Late Days</p>
                                                      <p className="text-2xl font-bold text-yellow-600">{attendance.lateDays || 0}</p>
                                                </div>
                                                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
                                                      <p className="text-xs font-bold text-gray-600 uppercase">Attendance %</p>
                                                      <p className="text-2xl font-bold text-blue-600">{attendance.percentage || 0}%</p>
                                                </div>
                                          </div>
                                    </div>
                              )
                        }

                        {/* Remarks Section */}
                        <div className="p-8 border-b-2 border-gray-200">
                              <h3 className="text-xl font-bold text-gray-800 mb-4">Remarks</h3>
                              <div className="space-y-4">
                                    <div>
                                          <p className="text-sm font-bold text-gray-600 mb-2">Class Teacher's Remarks:</p>
                                          <div className="border-2 border-gray-300 rounded-lg p-4 min-h-[80px] bg-gray-50">
                                                <p className="text-gray-600 italic">
                                                      {stats?.averagePercentage >= 75
                                                            ? "Excellent performance! Keep up the good work."
                                                            : stats?.averagePercentage >= 60
                                                                  ? "Good performance. Continue working hard."
                                                                  : stats?.averagePercentage >= 40
                                                                        ? "Satisfactory performance. More effort needed."
                                                                        : "Needs improvement. Please focus on studies."}
                                                </p>
                                          </div>
                                    </div>
                              </div>
                        </div>

                        {/* Signatures */}
                        <div className="p-8">
                              <div className="grid grid-cols-3 gap-8">
                                    <div className="text-center">
                                          <div className="border-t-2 border-gray-400 pt-2 mt-16">
                                                <p className="font-bold text-gray-700">Class Teacher</p>
                                          </div>
                                    </div>
                                    <div className="text-center">
                                          <div className="border-t-2 border-gray-400 pt-2 mt-16">
                                                <p className="font-bold text-gray-700">Parent/Guardian</p>
                                          </div>
                                    </div>
                                    <div className="text-center">
                                          <div className="border-t-2 border-gray-400 pt-2 mt-16">
                                                <p className="font-bold text-gray-700">Principal</p>
                                          </div>
                                    </div>
                              </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-100 p-4 text-center border-t-2 border-gray-200">
                              <p className="text-xs text-gray-600">
                                    This is a computer-generated report card. For any queries, please contact the school administration.
                              </p>
                        </div>
                  </div >
            </div >
      );
}
