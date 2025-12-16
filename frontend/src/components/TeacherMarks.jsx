import { useState, useEffect } from "react";
import api from "../api";
import { Save, AlertCircle, Check } from "lucide-react";

export default function TeacherMarks() {
      const [classes, setClasses] = useState([]);
      const [subjects, setSubjects] = useState([]);
      const [selectedClass, setSelectedClass] = useState("");
      const [selectedSubject, setSelectedSubject] = useState("");
      const [examType, setExamType] = useState("quiz");
      const [students, setStudents] = useState([]);
      const [marksData, setMarksData] = useState({});
      const [totalMarks, setTotalMarks] = useState(100);
      const [loading, setLoading] = useState(false);
      const [saving, setSaving] = useState(false);
      const [message, setMessage] = useState({ type: "", text: "" });

      useEffect(() => {
            fetchClasses();
      }, []);

      useEffect(() => {
            if (selectedClass) {
                  fetchSubjects(selectedClass);
            } else {
                  setSubjects([]);
            }
      }, [selectedClass]);

      useEffect(() => {
            if (selectedClass && selectedSubject && examType) {
                  fetchStudentsAndMarks();
            }
      }, [selectedClass, selectedSubject, examType]);

      const fetchClasses = async () => {
            try {
                  const res = await api.get("/academic/classes");
                  setClasses(res.data);
            } catch (err) {
                  console.error(err);
            }
      };

      const fetchSubjects = async (classId) => {
            try {
                  const res = await api.get(`/academic/subjects?classId=${classId}`);
                  setSubjects(res.data);
            } catch (err) {
                  console.error(err);
            }
      };

      const fetchStudentsAndMarks = async () => {
            setLoading(true);
            setStudents([]);
            try {
                  // 1. Get Students
                  const allStudentsRes = await api.get("/users/students");
                  const classStudents = allStudentsRes.data.filter(s => s.classId === selectedClass || s.classId?._id === selectedClass);
                  setStudents(classStudents);

                  // 2. Get Marks
                  const marksRes = await api.get(`/teacher/marks/${selectedClass}/${selectedSubject}?examType=${examType}`);

                  const initialData = {};
                  classStudents.forEach(s => {
                        initialData[s._id] = { obtained: "", remarks: "" };
                  });

                  marksRes.data.forEach(m => {
                        initialData[m.studentId._id] = {
                              obtained: m.marksObtained,
                              remarks: m.remarks || ""
                        };
                        if (m.totalMarks) setTotalMarks(m.totalMarks);
                  });

                  setMarksData(initialData);

            } catch (err) {
                  console.error(err);
                  setMessage({ type: "error", text: "Failed to load data" });
            } finally {
                  setLoading(false);
            }
      };

      const handleMarkChange = (studentId, value) => {
            setMarksData(prev => ({
                  ...prev,
                  [studentId]: { ...prev[studentId], obtained: value }
            }));
      };

      const handleRemarkChange = (studentId, value) => {
            setMarksData(prev => ({
                  ...prev,
                  [studentId]: { ...prev[studentId], remarks: value }
            }));
      };

      const handleSave = async (studentId) => {
            // Save individual student mark
            const data = marksData[studentId];
            if (data.obtained === "" || isNaN(data.obtained)) {
                  alert("Please enter valid marks");
                  return;
            }

            try {
                  await api.post("/teacher/marks", {
                        studentId,
                        subjectId: selectedSubject,
                        classId: selectedClass,
                        examType,
                        marksObtained: Number(data.obtained),
                        totalMarks: Number(totalMarks),
                        remarks: data.remarks
                  });
                  // Show mini success indicator?
                  // For now just console or alert?
                  // Maybe toast?
            } catch (err) {
                  console.error(err);
                  alert("Failed to save marks");
            }
      };

      const handleSaveAll = async () => {
            setSaving(true);
            setMessage({ type: "", text: "" });
            try {
                  // Loop save all (parallel)
                  const promises = students.map(student => {
                        const data = marksData[student._id];
                        if (data && data.obtained !== "") {
                              return api.post("/teacher/marks", {
                                    studentId: student._id,
                                    subjectId: selectedSubject,
                                    classId: selectedClass,
                                    examType,
                                    marksObtained: Number(data.obtained),
                                    totalMarks: Number(totalMarks),
                                    remarks: data.remarks
                              });
                        }
                        return Promise.resolve();
                  });

                  await Promise.all(promises);
                  setMessage({ type: "success", text: "All marks saved successfully" });
            } catch (err) {
                  console.error(err);
                  setMessage({ type: "error", text: "Failed to save some marks" });
            } finally {
                  setSaving(false);
            }
      };

      return (
            <div className="space-y-6 animate-fade-in">
                  {/* Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                              <select
                                    value={selectedClass}
                                    onChange={(e) => { setSelectedClass(e.target.value); setSelectedSubject(""); }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                              >
                                    <option value="">-- Class --</option>
                                    {classes.map((cls) => (
                                          <option key={cls._id} value={cls._id}>{cls.name}</option>
                                    ))}
                              </select>
                        </div>
                        <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                              <select
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    disabled={!selectedClass}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-100"
                              >
                                    <option value="">-- Subject --</option>
                                    {subjects.map((sub) => (
                                          <option key={sub._id} value={sub._id}>{sub.name}</option>
                                    ))}
                              </select>
                        </div>
                        <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                              <select
                                    value={examType}
                                    onChange={(e) => setExamType(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                              >
                                    <option value="quiz">Quiz</option>
                                    <option value="midterm">Midterm</option>
                                    <option value="final">Final</option>
                                    <option value="assignment">Assignment</option>
                                    <option value="project">Project</option>
                              </select>
                        </div>
                        <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                              <input
                                    type="number"
                                    value={totalMarks}
                                    onChange={(e) => setTotalMarks(e.target.value)}
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

                  {/* Marks Table */}
                  {selectedClass && selectedSubject ? (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                              <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                          <thead className="bg-gray-50">
                                                <tr>
                                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks (/{totalMarks})</th>
                                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                                                </tr>
                                          </thead>
                                          <tbody className="bg-white divide-y divide-gray-200">
                                                {loading ? (
                                                      <tr>
                                                            <td colSpan="4" className="px-6 py-12 text-center text-gray-500">Loading...</td>
                                                      </tr>
                                                ) : students.length === 0 ? (
                                                      <tr>
                                                            <td colSpan="4" className="px-6 py-12 text-center text-gray-500">No students found.</td>
                                                      </tr>
                                                ) : (
                                                      students.map((student) => {
                                                            const data = marksData[student._id] || { obtained: "", remarks: "" };
                                                            const percentage = data.obtained && totalMarks ? ((data.obtained / totalMarks) * 100).toFixed(1) : "-";

                                                            return (
                                                                  <tr key={student._id} className="hover:bg-gray-50">
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                              <input
                                                                                    type="number"
                                                                                    min="0"
                                                                                    max={totalMarks}
                                                                                    value={data.obtained}
                                                                                    onChange={(e) => handleMarkChange(student._id, e.target.value)}
                                                                                    className="w-24 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500"
                                                                              />
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                              <span className={`font-bold ${percentage >= 50 ? 'text-green-600' : percentage !== "-" ? 'text-red-500' : ''
                                                                                    }`}>
                                                                                    {percentage}%
                                                                              </span>
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                              <input
                                                                                    type="text"
                                                                                    placeholder="Remarks..."
                                                                                    value={data.remarks}
                                                                                    onChange={(e) => handleRemarkChange(student._id, e.target.value)}
                                                                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500"
                                                                              />
                                                                        </td>
                                                                  </tr>
                                                            );
                                                      })
                                                )}
                                          </tbody>
                                    </table>
                              </div>

                              <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                                    <button
                                          onClick={handleSaveAll}
                                          disabled={saving || students.length === 0}
                                          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
                                    >
                                          <Save className="w-4 h-4" />
                                          {saving ? "Saving..." : "Save All Marks"}
                                    </button>
                              </div>
                        </div>
                  ) : (
                        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                              Select Class and Subject to enter marks.
                        </div>
                  )}
            </div>
      );
}
