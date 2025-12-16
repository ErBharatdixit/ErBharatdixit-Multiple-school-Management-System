import { useState, useEffect } from "react";
import { Check, X, Clock, AlertCircle, Save, Calendar, Edit2, Grid, List, Plus } from "lucide-react";
import api from "../api";
import AddUserModal from "./AddUserModal";

export default function AdminTeacherAttendance() {
      const [viewMode, setViewMode] = useState("daily"); // "daily" or "monthly"
      const [teachers, setTeachers] = useState([]);
      const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
      const [month, setMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM
      const [attendanceData, setAttendanceData] = useState({});
      const [monthlyData, setMonthlyData] = useState({});
      const [loading, setLoading] = useState(false);
      const [saving, setSaving] = useState(false);
      const [message, setMessage] = useState({ type: "", text: "" });
      const [isEditing, setIsEditing] = useState(false);
      const [attendanceExists, setAttendanceExists] = useState(false);
      const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);

      useEffect(() => {
            if (viewMode === "daily") {
                  fetchTeachersAndAttendance();
            } else {
                  fetchMonthlyAttendance();
            }
      }, [date, month, viewMode]);

      const fetchTeachersAndAttendance = async () => {
            setLoading(true);
            setIsEditing(false); // Reset edit mode on date change
            try {
                  const teachersRes = await api.get("/users/teachers");
                  setTeachers(teachersRes.data);

                  const attendanceRes = await api.get(`/attendance/teacher?date=${date}`);

                  // Check if any attendance exists for this date
                  const exists = attendanceRes.data.length > 0;
                  setAttendanceExists(exists);

                  // If attendance exists, we are not in edit mode initially. 
                  // If it doesn't exist, we are by default "editing" (creating new).
                  if (!exists) {
                        setIsEditing(true);
                  }

                  const initialData = {};
                  // Default to present for everyone initially if no record exists
                  teachersRes.data.forEach(t => {
                        initialData[t._id] = { status: "present", remarks: "" };
                  });

                  // Overwrite with existing records
                  attendanceRes.data.forEach(record => {
                        if (record.teacherId) {
                              const tId = record.teacherId._id || record.teacherId;
                              initialData[tId] = {
                                    status: record.status,
                                    remarks: record.remarks || ""
                              };
                        }
                  });

                  setAttendanceData(initialData);

            } catch (err) {
                  console.error("Failed to fetch data", err);
                  setMessage({ type: "error", text: "Failed to load data" });
            } finally {
                  setLoading(false);
            }
      };

      const fetchMonthlyAttendance = async () => {
            setLoading(true);
            try {
                  const [teachersRes, monthlyRes] = await Promise.all([
                        api.get("/users/teachers"),
                        api.get(`/attendance/teacher/monthly?month=${month}`)
                  ]);

                  setTeachers(teachersRes.data);

                  // Process monthly data: { teacherId: { day: status } }
                  const processedData = {};
                  monthlyRes.data.forEach(record => {
                        if (!record.date || !record.teacherId) return;
                        const tId = record.teacherId._id || record.teacherId;
                        const day = parseInt(record.date.split('-')[2]);

                        if (!processedData[tId]) processedData[tId] = {};
                        processedData[tId][day] = record.status;
                  });

                  setMonthlyData(processedData);

            } catch (err) {
                  console.error("Failed to fetch monthly data", err);
                  setMessage({ type: "error", text: "Failed to load monthly report" });
            } finally {
                  setLoading(false);
            }
      };

      const handleUserAdded = () => {
            if (viewMode === "daily") {
                  fetchTeachersAndAttendance();
            } else {
                  fetchMonthlyAttendance();
            }
            setMessage({ type: "success", text: "Teacher added successfully" });
      };

      const handleStatusChange = (teacherId, status) => {
            if (!isEditing) return;
            setAttendanceData(prev => ({
                  ...prev,
                  [teacherId]: { ...prev[teacherId], status }
            }));
      };

      const handleRemarkChange = (teacherId, remarks) => {
            if (!isEditing) return;
            setAttendanceData(prev => ({
                  ...prev,
                  [teacherId]: { ...prev[teacherId], remarks }
            }));
      };

      const handleSubmit = async () => {
            setSaving(true);
            setMessage({ type: "", text: "" });
            try {
                  const records = Object.keys(attendanceData).map(teacherId => ({
                        teacherId,
                        status: attendanceData[teacherId].status,
                        remarks: attendanceData[teacherId].remarks
                  }));

                  await api.post("/attendance/teacher", {
                        date,
                        records
                  });

                  setMessage({ type: "success", text: "Attendance saved successfully" });
                  setAttendanceExists(true);
                  setIsEditing(false); // Lock after save
            } catch (err) {
                  setMessage({ type: "error", text: "Failed to save attendance" });
            } finally {
                  setSaving(false);
            }
      };

      const daysInMonth = (y, m) => new Date(y, m, 0).getDate();
      const currentYear = parseInt(month.split('-')[0]);
      const currentMonthIndex = parseInt(month.split('-')[1]);
      const totalDays = daysInMonth(currentYear, currentMonthIndex);
      const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

      const getStatusColorShort = (status) => {
            switch (status) {
                  case 'present': return 'bg-green-100 text-green-800';
                  case 'absent': return 'bg-red-100 text-red-800';
                  case 'half-day': return 'bg-yellow-100 text-yellow-800';
                  case 'leave': return 'bg-blue-100 text-blue-800';
                  default: return 'bg-gray-100 text-gray-400';
            }
      };

      const getStatusLabelShort = (status) => {
            switch (status) {
                  case 'present': return 'P';
                  case 'absent': return 'A';
                  case 'half-day': return 'H';
                  case 'leave': return 'L';
                  default: return '-';
            }
      };

      return (
            <div className="space-y-6 animate-fade-in">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex flex-col gap-1">
                              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-primary" />
                                    {viewMode === "daily" ? "Daily Teacher Attendance" : "Monthly Attendance Report"}
                              </h2>
                              <button
                                    onClick={() => setIsAddTeacherOpen(true)}
                                    className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                              >
                                    <Plus className="w-4 h-4" /> Add New Teacher
                              </button>
                        </div>

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

                        <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">
                                    {viewMode === "daily" ? "Date:" : "Month:"}
                              </span>
                              {viewMode === "daily" ? (
                                    <input
                                          type="date"
                                          value={date}
                                          onChange={(e) => setDate(e.target.value)}
                                          className="border border-gray-300 rounded-md shadow-sm px-3 py-1.5 focus:ring-primary focus:border-primary"
                                    />
                              ) : (
                                    <input
                                          type="month"
                                          value={month}
                                          onChange={(e) => setMonth(e.target.value)}
                                          className="border border-gray-300 rounded-md shadow-sm px-3 py-1.5 focus:ring-primary focus:border-primary"
                                    />
                              )}
                        </div>
                  </div>

                  {message.text && (
                        <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                              {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                              {message.text}
                        </div>
                  )}

                  {viewMode === "daily" ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                              <div className="p-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
                                    <div className="text-sm text-blue-800">
                                          {attendanceExists
                                                ? isEditing
                                                      ? "Editing previously marked attendance."
                                                      : "Attendance already marked for this date. Click 'Edit' to modify."
                                                : "Marking new attendance for this date."
                                          }
                                    </div>
                                    {attendanceExists && !isEditing && (
                                          <button
                                                onClick={() => setIsEditing(true)}
                                                className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition flex items-center gap-1"
                                          >
                                                <Edit2 className="w-3 h-3" /> Edit Mode
                                          </button>
                                    )}
                              </div>
                              <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                          <thead className="bg-gray-50">
                                                <tr>
                                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                                                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                                                </tr>
                                          </thead>
                                          <tbody className="bg-white divide-y divide-gray-200">
                                                {loading ? (
                                                      <tr><td colSpan="3" className="px-6 py-12 text-center text-gray-500">Loading...</td></tr>
                                                ) : teachers.length === 0 ? (
                                                      <tr><td colSpan="3" className="px-6 py-12 text-center text-gray-500">No teachers found.</td></tr>
                                                ) : (
                                                      teachers.map(teacher => (
                                                            <tr key={teacher._id} className="hover:bg-gray-50 transition">
                                                                  <td className="px-6 py-4 whitespace-nowrap">
                                                                        <div className="font-medium text-gray-900">{teacher.name}</div>
                                                                        <div className="text-xs text-gray-500">{teacher.email}</div>
                                                                  </td>
                                                                  <td className="px-6 py-4 whitespace-nowrap">
                                                                        <div className={`flex justify-center gap-2 ${!isEditing ? "opacity-50 pointer-events-none" : ""}`}>
                                                                              {[
                                                                                    { value: "present", label: "Present", icon: Check, color: "green" },
                                                                                    { value: "absent", label: "Absent", icon: X, color: "red" },
                                                                                    { value: "half-day", label: "Half Day", icon: Clock, color: "yellow" },
                                                                                    { value: "leave", label: "Leave", icon: AlertCircle, color: "blue" },
                                                                              ].map(opt => (
                                                                                    <button
                                                                                          key={opt.value}
                                                                                          onClick={() => handleStatusChange(teacher._id, opt.value)}
                                                                                          className={`p-2 rounded-lg transition border ${attendanceData[teacher._id]?.status === opt.value
                                                                                                ? `bg-${opt.color}-50 border-${opt.color}-200 text-${opt.color}-700 ring-1 ring-${opt.color}-500`
                                                                                                : "bg-white border-transparent text-gray-400 hover:bg-gray-100"
                                                                                                }`}
                                                                                          title={opt.label}
                                                                                          disabled={!isEditing}
                                                                                    >
                                                                                          <opt.icon className="w-4 h-4" />
                                                                                    </button>
                                                                              ))}
                                                                        </div>
                                                                  </td>
                                                                  <td className="px-6 py-4 whitespace-nowrap">
                                                                        <input
                                                                              type="text"
                                                                              placeholder="Optional remarks"
                                                                              value={attendanceData[teacher._id]?.remarks || ""}
                                                                              onChange={(e) => handleRemarkChange(teacher._id, e.target.value)}
                                                                              disabled={!isEditing}
                                                                              className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
                                                                        />
                                                                  </td>
                                                            </tr>
                                                      ))
                                                )}
                                          </tbody>
                                    </table>
                              </div>
                              {isEditing && (
                                    <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                                          <button
                                                onClick={handleSubmit}
                                                disabled={saving || loading}
                                                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition shadow-sm flex items-center gap-2 disabled:opacity-50"
                                          >
                                                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                                                Save Attendance
                                          </button>
                                    </div>
                              )}
                        </div>
                  ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                              <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                          <thead className="bg-gray-50">
                                                <tr>
                                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 border-r border-gray-200">
                                                            Teacher
                                                      </th>
                                                      {daysArray.map(day => (
                                                            <th key={day} className="px-2 py-3 text-center text-xs font-medium text-gray-500 w-10">
                                                                  {day}
                                                            </th>
                                                      ))}
                                                </tr>
                                          </thead>
                                          <tbody className="bg-white divide-y divide-gray-200">
                                                {loading ? (
                                                      <tr><td colSpan={totalDays + 1} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr>
                                                ) : teachers.length === 0 ? (
                                                      <tr><td colSpan={totalDays + 1} className="px-6 py-12 text-center text-gray-500">No teachers found.</td></tr>
                                                ) : (
                                                      teachers.map(teacher => (
                                                            <tr key={teacher._id} className="hover:bg-gray-50 transition">
                                                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white border-r border-gray-200 z-10">
                                                                        {teacher.name}
                                                                  </td>
                                                                  {daysArray.map(day => {
                                                                        const status = monthlyData[teacher._id]?.[day];
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
                                                      ))
                                                )}
                                          </tbody>
                                    </table>
                              </div>
                        </div>
                  )}

                  <AddUserModal
                        isOpen={isAddTeacherOpen}
                        onClose={() => setIsAddTeacherOpen(false)}
                        role="teacher"
                        onUserAdded={handleUserAdded}
                  />
            </div>
      );
}
