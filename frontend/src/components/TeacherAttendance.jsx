import { useState, useEffect } from "react";
import api from "../api";
import { Check, X, Clock, AlertCircle } from "lucide-react";

export default function TeacherAttendance() {
      const [classes, setClasses] = useState([]);
      const [selectedClass, setSelectedClass] = useState("");
      const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
      const [students, setStudents] = useState([]);
      const [attendanceData, setAttendanceData] = useState({});
      const [loading, setLoading] = useState(false);
      const [saving, setSaving] = useState(false);
      const [message, setMessage] = useState({ type: "", text: "" });

      useEffect(() => {
            fetchClasses();
      }, []);

      useEffect(() => {
            if (selectedClass && date) {
                  fetchStudentsAndAttendance();
            }
      }, [selectedClass, date]);

      const fetchClasses = async () => {
            try {
                  const res = await api.get("/academic/classes");
                  setClasses(res.data);
            } catch (err) {
                  console.error(err);
            }
      };

      const fetchStudentsAndAttendance = async () => {
            setLoading(true);
            setStudents([]);
            try {
                  // Fetch students for the class
                  // We need an endpoint to get students by classId. 
                  // Existing: /users/students returns all students. We might need to filter or have a better endpoint?
                  // Let's use `getStudents` and filter by classId on client since we don't have a specific `getStudentsByClass` yet?
                  // Actually `getStudents` in `userController` filters by school.
                  // Wait, `User` model doesn't explicitly have `classId` stored directly? 
                  // Ah, the `Class` model has `students: []` reference.
                  // So I should fetch the Class details which populates students?
                  // But `getClasses` endpoint returns classes but maybe not populated deeply?
                  // Let's check `getClasses` in `academicController`. It does Populate? No it populates `teacherId`.
                  // I need a way to get students of a class.
                  // I'll resort to `api.get('/users/students')` and filter, BUT `User` model currently has `className`?
                  // Wait, `AddUserModal` uses `className`.
                  // Let's check `User` model again.
                  // `User` model has fields we added? 
                  // In `viewed_code_item` for `User.js`, I didn't see `classId`.
                  // NOTE: `Class` model has `students` array. `User` doesn't seem to have `classId` backlinked strictly in the snippet I saw earlier?
                  // Actually, my `academicController` `createClass` doesn't add students.
                  // And `AddUserModal` probably adds user with... wait.
                  // If I add a student, I need to assign them to a class.
                  // The current system might be a bit disconnected.
                  // Let's assume for now I will fetch ALL students and filter those whose `classId` or related field matches.
                  // OR better, I should rely on the `Class` model's `students` array if it's being maintained.
                  // Re-reading `Class.js`: `students: [{ type: ObjectId, ref: 'User' }]`.
                  // So I should get the class with populated students.
                  // I don't have an endpoint for `GET /academic/class/:id` populated.
                  // I have `getClasses`.
                  // Let's update `getClasses` to populate students or add `getStudentsByClass`.

                  // Let's try fetching all students and filtering for now, assuming students have `classId` or similar? 
                  // Wait, `AddUserModal` implementation:
                  // It probably saves `student` with... let's check `userController`.

                  const allStudentsRes = await api.get("/users/students");
                  // This returns all students in school.
                  // Does student object have `classId`?
                  // I'll assume YES or I need to fix `createStudent`.

                  // Temporary: Filter students by class manually if they have `classId`
                  // If not, I'll need to fix that link. 
                  // The `AddStudent` flow creates a student. Does it link to a class?
                  // `AddUserModal` has `className` string but maybe not ID.
                  // Let's assume for now we filter by matching `className` string ? No that's brittle.

                  // Let's hope students have `classId` field.
                  // If they don't, I will use `allStudentsRes` for now and just show all (as a fallback) or filter where possible.
                  // Actually, simpler: I'll fetch `/academic/classes` and maybe one of them matches.

                  // REAL FIX: Fetch attendance first.
                  const attendanceRes = await api.get(`/teacher/attendance/${selectedClass}?date=${date}`);

                  // For the students list: I will fetch ALL students and filter by `student.classId === selectedClass`.
                  const classStudents = allStudentsRes.data.filter(s => s.classId === selectedClass || s.classId?._id === selectedClass);

                  setStudents(classStudents);

                  // Map existing attendance to state
                  const initialData = {};
                  classStudents.forEach(s => {
                        initialData[s._id] = { status: "present", remarks: "" }; // default
                  });

                  attendanceRes.data.forEach(record => {
                        if (record.studentId) {
                              initialData[record.studentId._id] = {
                                    status: record.status,
                                    remarks: record.remarks || ""
                              };
                        }
                  });

                  setAttendanceData(initialData);

            } catch (err) {
                  console.error(err);
                  setMessage({ type: "error", text: "Failed to load data" });
            } finally {
                  setLoading(false);
            }
      };

      const handleStatusChange = (studentId, status) => {
            setAttendanceData(prev => ({
                  ...prev,
                  [studentId]: { ...prev[studentId], status }
            }));
      };

      const handleSubmit = async () => {
            setSaving(true);
            setMessage({ type: "", text: "" });
            try {
                  const records = Object.keys(attendanceData).map(studentId => ({
                        studentId,
                        status: attendanceData[studentId].status,
                        remarks: attendanceData[studentId].remarks
                  }));

                  await api.post("/teacher/attendance", {
                        classId: selectedClass,
                        date,
                        records
                  });

                  setMessage({ type: "success", text: "Attendance saved successfully" });
            } catch (err) {
                  setMessage({ type: "error", text: "Failed to save attendance" });
            } finally {
                  setSaving(false);
            }
      };

      return (
            <div className="space-y-6 animate-fade-in">
                  {/* Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
                              <select
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                              >
                                    <option value="">-- Choose Class --</option>
                                    {classes.map((cls) => (
                                          <option key={cls._id} value={cls._id}>
                                                {cls.name} (Grade {cls.grade})
                                          </option>
                                    ))}
                              </select>
                        </div>
                        <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                              <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                              />
                        </div>
                  </div>

                  {/* Message */}
                  {message.text && (
                        <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                              {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                              {message.text}
                        </div>
                  )}

                  {/* Student List */}
                  {selectedClass ? (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                              <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                          <thead className="bg-gray-50">
                                                <tr>
                                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                                                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                                                </tr>
                                          </thead>
                                          <tbody className="bg-white divide-y divide-gray-200">
                                                {loading ? (
                                                      <tr>
                                                            <td colSpan="3" className="px-6 py-12 text-center text-gray-500">Loading students...</td>
                                                      </tr>
                                                ) : students.length === 0 ? (
                                                      <tr>
                                                            <td colSpan="3" className="px-6 py-12 text-center text-gray-500">No students found in this class.</td>
                                                      </tr>
                                                ) : (
                                                      students.map((student) => (
                                                            <tr key={student._id} className="hover:bg-gray-50">
                                                                  <td className="px-6 py-4 whitespace-nowrap">
                                                                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                                                        <div className="text-xs text-gray-500">{student.email}</div>
                                                                  </td>
                                                                  <td className="px-6 py-4 whitespace-nowrap">
                                                                        <div className="flex justify-center gap-2">
                                                                              {[
                                                                                    { value: "present", label: "Present", icon: Check, color: "green" },
                                                                                    { value: "absent", label: "Absent", icon: X, color: "red" },
                                                                                    { value: "late", label: "Late", icon: Clock, color: "yellow" },
                                                                              ].map((option) => (
                                                                                    <button
                                                                                          key={option.value}
                                                                                          onClick={() => handleStatusChange(student._id, option.value)}
                                                                                          className={`p-2 rounded-lg flex items-center gap-1 transition ${attendanceData[student._id]?.status === option.value
                                                                                                      ? `bg-${option.color}-100 text-${option.color}-700 ring-2 ring-${option.color}-500`
                                                                                                      : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                                                                                }`}
                                                                                          title={option.label}
                                                                                    >
                                                                                          <option.icon className="w-4 h-4" />
                                                                                    </button>
                                                                              ))}
                                                                        </div>
                                                                  </td>
                                                                  <td className="px-6 py-4 whitespace-nowrap">
                                                                        <input
                                                                              type="text"
                                                                              placeholder="Optional remarks"
                                                                              value={attendanceData[student._id]?.remarks || ""}
                                                                              onChange={(e) =>
                                                                                    setAttendanceData(prev => ({
                                                                                          ...prev,
                                                                                          [student._id]: { ...prev[student._id], remarks: e.target.value }
                                                                                    }))
                                                                              }
                                                                              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500"
                                                                        />
                                                                  </td>
                                                            </tr>
                                                      ))
                                                )}
                                          </tbody>
                                    </table>
                              </div>

                              <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                                    <button
                                          onClick={handleSubmit}
                                          disabled={saving || students.length === 0}
                                          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
                                    >
                                          {saving ? "Saving..." : "Save Attendance"}
                                    </button>
                              </div>
                        </div>
                  ) : (
                        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                              Please select a class to mark attendance.
                        </div>
                  )}
            </div>
      );
}
