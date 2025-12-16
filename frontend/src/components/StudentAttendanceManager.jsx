import { useState, useEffect } from "react";
import { Calendar, Save, Users, CheckCircle, XCircle, Clock, AlertCircle, Grid, List } from "lucide-react";
import api from "../api";

export default function StudentAttendanceManager({ schoolId }) {
      const [viewMode, setViewMode] = useState("daily"); // "daily" or "monthly"
      const [classes, setClasses] = useState([]);
      const [selectedClass, setSelectedClass] = useState("");
      const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
      const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM
      const [students, setStudents] = useState([]);
      const [attendance, setAttendance] = useState({});
      const [monthlyAttendance, setMonthlyAttendance] = useState({}); // { studentId: { day: status } }
      const [loading, setLoading] = useState(false);
      const [saving, setSaving] = useState(false);

      useEffect(() => {
            fetchClasses();
      }, []);

      useEffect(() => {
            if (selectedClass) {
                  if (viewMode === "daily") {
                        fetchStudentsOnly();
                        fetchExistingAttendance();
                  } else {
                        fetchMonthlyData();
                  }
            }
      }, [selectedClass, selectedDate, selectedMonth, viewMode]);

      const fetchClasses = async () => {
            try {
                  const res = await api.get("/academic/classes");
                  setClasses(res.data);
            } catch (error) {
                  console.error("Failed to fetch classes:", error);
            }
      };

      const fetchStudentsOnly = async () => {
            try {
                  setLoading(true);
                  const res = await api.get(`/users/students?classId=${selectedClass}`);
                  setStudents(res.data);

                  // Reset attendance if switching classes
                  const defaultAttendance = {};
                  res.data.forEach((student) => {
                        defaultAttendance[student._id] = {
                              status: "present",
                              remarks: ""
                        };
                  });
                  setAttendance(defaultAttendance);

            } catch (error) {
                  console.error("Failed to fetch students", error);
            } finally {
                  setLoading(false);
            }
      };

      const fetchExistingAttendance = async () => {
            try {
                  const res = await api.get(`/attendance/student?date=${selectedDate}&classId=${selectedClass}`);

                  // Update attendance state with existing records
                  const existingAttendance = {};
                  res.data.forEach((record) => {
                        existingAttendance[record.studentId._id] = {
                              status: record.status,
                              remarks: record.remarks || ""
                        };
                  });

                  setAttendance((prev) => ({ ...prev, ...existingAttendance }));
            } catch (error) {
                  console.error("Failed to fetch existing attendance:", error);
            }
      };

      const fetchMonthlyData = async () => {
            try {
                  setLoading(true);
                  const [studentsRes, attendanceRes] = await Promise.all([
                        api.get(`/users/students?classId=${selectedClass}`),
                        api.get(`/attendance/student/monthly?classId=${selectedClass}&month=${selectedMonth}`)
                  ]);

                  setStudents(studentsRes.data);

                  // Process monthly data: { studentId: { day: status } }
                  const processedData = {};
                  attendanceRes.data.forEach((record) => {
                        if (!record.date || !record.studentId) return;

                        // studentId might be populated object or ID string
                        const sId = record.studentId._id || record.studentId;

                        // Parse date (Student model uses Date object, not string)
                        const dateObj = new Date(record.date);
                        const day = dateObj.getDate();

                        if (!processedData[sId]) processedData[sId] = {};
                        processedData[sId][day] = record.status;
                  });

                  setMonthlyAttendance(processedData);

            } catch (error) {
                  console.error("Failed to fetch monthly data", error);
            } finally {
                  setLoading(false);
            }
      };

      const handleStatusChange = (studentId, status) => {
            setAttendance((prev) => ({
                  ...prev,
                  [studentId]: { ...prev[studentId], status }
            }));
      };

      const handleRemarksChange = (studentId, remarks) => {
            setAttendance((prev) => ({
                  ...prev,
                  [studentId]: { ...prev[studentId], remarks }
            }));
      };

      const handleBulkAction = (status) => {
            const bulkUpdate = {};
            students.forEach((student) => {
                  bulkUpdate[student._id] = {
                        status,
                        remarks: attendance[student._id]?.remarks || ""
                  };
            });
            setAttendance(bulkUpdate);
      };

      const handleSave = async () => {
            try {
                  setSaving(true);
                  const records = students.map((student) => ({
                        studentId: student._id,
                        status: attendance[student._id]?.status || "present",
                        remarks: attendance[student._id]?.remarks || ""
                  }));

                  await api.post("/attendance/student", {
                        date: selectedDate,
                        classId: selectedClass,
                        records
                  });

                  alert("Attendance saved successfully!");
            } catch (error) {
                  console.error("Failed to save attendance:", error);
                  alert("Failed to save attendance. Please try again.");
            } finally {
                  setSaving(false);
            }
      };

      const getStatusColor = (status) => {
            switch (status) {
                  case "present": return "bg-green-100 text-green-800 border-green-300";
                  case "absent": return "bg-red-100 text-red-800 border-red-300";
                  case "late": return "bg-yellow-100 text-yellow-800 border-yellow-300";
                  case "excused": return "bg-blue-100 text-blue-800 border-blue-300";
                  default: return "bg-gray-100 text-gray-800 border-gray-300";
            }
      };

      const getStatusColorShort = (status) => {
            switch (status) {
                  case 'present': return 'bg-green-100 text-green-800';
                  case 'absent': return 'bg-red-100 text-red-800';
                  case 'late': return 'bg-yellow-100 text-yellow-800';
                  case 'excused': return 'bg-blue-100 text-blue-800';
                  default: return 'bg-gray-100 text-gray-400';
            }
      };

      const getStatusLabelShort = (status) => {
            switch (status) {
                  case 'present': return 'P';
                  case 'absent': return 'A';
                  case 'late': return 'L';
                  case 'excused': return 'E';
                  default: return '-';
            }
      };

      const getStatusIcon = (status) => {
            switch (status) {
                  case "present": return <CheckCircle className="w-4 h-4" />;
                  case "absent": return <XCircle className="w-4 h-4" />;
                  case "late": return <Clock className="w-4 h-4" />;
                  case "excused": return <AlertCircle className="w-4 h-4" />;
                  default: return null;
            }
      };

      const daysInMonth = (y, m) => new Date(y, m, 0).getDate();
      const currentYear = parseInt(selectedMonth.split('-')[0]);
      const currentMonthIndex = parseInt(selectedMonth.split('-')[1]);
      const totalDays = daysInMonth(currentYear, currentMonthIndex);
      const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

      return (
            <div className="space-y-6">
                  {/* Header Controls */}
                  <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/40">
                        <div className="flex justify-between items-center mb-6">
                              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Users className="w-6 h-6 text-primary" />
                                    {viewMode === "daily" ? "Daily Student Attendance" : "Monthly Student Report"}
                              </h2>
                              <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                                    <button
                                          onClick={() => setViewMode("daily")}
                                          className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-1 transition ${viewMode === "daily" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                    >
                                          <List className="w-4 h-4" /> Daily
                                    </button>
                                    <button
                                          onClick={() => setViewMode("monthly")}
                                          className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-1 transition ${viewMode === "monthly" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                    >
                                          <Grid className="w-4 h-4" /> Monthly
                                    </button>
                              </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                          <Users className="w-4 h-4 inline mr-2" />
                                          Select Class
                                    </label>
                                    <select
                                          value={selectedClass}
                                          onChange={(e) => setSelectedClass(e.target.value)}
                                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                                    >
                                          <option value="">-- Select Class --</option>
                                          {classes.map((cls) => (
                                                <option key={cls._id} value={cls._id}>
                                                      {cls.name} - Section {cls.section}
                                                </option>
                                          ))}
                                    </select>
                              </div>

                              <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                          <Calendar className="w-4 h-4 inline mr-2" />
                                          {viewMode === "daily" ? "Date" : "Month"}
                                    </label>
                                    {viewMode === "daily" ? (
                                          <input
                                                type="date"
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                                          />
                                    ) : (
                                          <input
                                                type="month"
                                                value={selectedMonth}
                                                onChange={(e) => setSelectedMonth(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                                          />
                                    )}
                              </div>

                              {viewMode === "daily" && (
                                    <div className="flex items-end">
                                          <button
                                                onClick={handleSave}
                                                disabled={!selectedClass || students.length === 0 || saving}
                                                className="w-full px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-lg"
                                          >
                                                <Save className="w-4 h-4" />
                                                {saving ? "Saving..." : "Save Attendance"}
                                          </button>
                                    </div>
                              )}
                        </div>

                        {/* Bulk Actions (Daily View Only) */}
                        {viewMode === "daily" && selectedClass && students.length > 0 && (
                              <div className="mt-4 flex gap-2 flex-wrap">
                                    <button
                                          onClick={() => handleBulkAction("present")}
                                          className="px-4 py-2 bg-green-100 text-green-700 font-bold rounded-lg hover:bg-green-200 transition border border-green-300 text-sm"
                                    >
                                          Mark All Present
                                    </button>
                                    <button
                                          onClick={() => handleBulkAction("absent")}
                                          className="px-4 py-2 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200 transition border border-red-300 text-sm"
                                    >
                                          Mark All Absent
                                    </button>
                                    <button
                                          onClick={() => handleBulkAction("late")}
                                          className="px-4 py-2 bg-yellow-100 text-yellow-700 font-bold rounded-lg hover:bg-yellow-200 transition border border-yellow-300 text-sm"
                                    >
                                          Mark All Late
                                    </button>
                              </div>
                        )}
                  </div>

                  {/* Student List / Grid */}
                  {loading ? (
                        <div className="flex justify-center py-12">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                  ) : selectedClass && students.length > 0 ? (
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 overflow-hidden">
                              <div className="overflow-x-auto">
                                    {viewMode === "daily" ? (
                                          <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50/80">
                                                      <tr>
                                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                                  Roll No.
                                                            </th>
                                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                                  Student Name
                                                            </th>
                                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                                  Status
                                                            </th>
                                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                                  Remarks
                                                            </th>
                                                      </tr>
                                                </thead>
                                                <tbody className="bg-white/60 divide-y divide-gray-200">
                                                      {students.map((student) => (
                                                            <tr key={student._id} className="hover:bg-blue-50/50 transition">
                                                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                        {student.rollNumber || "-"}
                                                                  </td>
                                                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                                        {student.name}
                                                                        <span className="block text-xs font-normal text-gray-500">{student.email}</span>
                                                                  </td>
                                                                  <td className="px-6 py-4 whitespace-nowrap">
                                                                        <div className="flex gap-2">
                                                                              {["present", "absent", "late", "excused"].map((status) => (
                                                                                    <button
                                                                                          key={status}
                                                                                          onClick={() => handleStatusChange(student._id, status)}
                                                                                          className={`px-3 py-1 rounded-lg text-xs font-bold border-2 transition flex items-center gap-1 ${attendance[student._id]?.status === status
                                                                                                ? getStatusColor(status)
                                                                                                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                                                                                                }`}
                                                                                    >
                                                                                          {attendance[student._id]?.status === status && getStatusIcon(status)}
                                                                                          {status.charAt(0).toUpperCase() + status.slice(1)}
                                                                                    </button>
                                                                              ))}
                                                                        </div>
                                                                  </td>
                                                                  <td className="px-6 py-4 whitespace-nowrap">
                                                                        <input
                                                                              type="text"
                                                                              value={attendance[student._id]?.remarks || ""}
                                                                              onChange={(e) => handleRemarksChange(student._id, e.target.value)}
                                                                              placeholder="Optional remarks"
                                                                              className="w-full px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                        />
                                                                  </td>
                                                            </tr>
                                                      ))}
                                                </tbody>
                                          </table>
                                    ) : (
                                          /* MONTHLY VIEW */
                                          <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                      <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 border-r border-gray-200">
                                                                  Student
                                                            </th>
                                                            {daysArray.map(day => (
                                                                  <th key={day} className="px-2 py-3 text-center text-xs font-medium text-gray-500 w-10">
                                                                        {day}
                                                                  </th>
                                                            ))}
                                                      </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                      {students.map(student => (
                                                            <tr key={student._id} className="hover:bg-gray-50 transition">
                                                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white border-r border-gray-200 z-10">
                                                                        {student.name}
                                                                        <div className="text-xs text-gray-500">Roll: {student.rollNumber || "-"}</div>
                                                                  </td>
                                                                  {daysArray.map(day => {
                                                                        const status = monthlyAttendance[student._id]?.[day];
                                                                        return (
                                                                              <td key={day} className="px-1 py-3 text-center">
                                                                                    {status && (
                                                                                          <div
                                                                                                className={`w-6 h-6 mx-auto rounded flex items-center justify-center text-xs font-bold ${getStatusColorShort(status)}`}
                                                                                                title={status}
                                                                                          >
                                                                                                {getStatusLabelShort(status)}
                                                                                          </div>
                                                                                    )}
                                                                              </td>
                                                                        );
                                                                  })}
                                                            </tr>
                                                      ))}
                                                </tbody>
                                          </table>
                                    )}
                              </div>
                        </div>
                  ) : selectedClass ? (
                        <div className="bg-white/80 backdrop-blur-md p-12 rounded-2xl shadow-lg border border-white/40 text-center">
                              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-500 font-medium">No students found in this class</p>
                        </div>
                  ) : (
                        <div className="bg-white/80 backdrop-blur-md p-12 rounded-2xl shadow-lg border border-white/40 text-center">
                              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-500 font-medium">Select a class to mark attendance</p>
                        </div>
                  )}
            </div>
      );
}
