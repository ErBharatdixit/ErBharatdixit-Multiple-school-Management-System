import { useState, useEffect } from "react";
import { Save, Users, Award } from "lucide-react";
import api from "../api";

export default function MarkEntry({ examId, onClose }) {
      const [exam, setExam] = useState(null);
      const [students, setStudents] = useState([]);
      const [marks, setMarks] = useState({});
      const [loading, setLoading] = useState(true);
      const [saving, setSaving] = useState(false);

      useEffect(() => {
            if (examId) {
                  fetchExamDetails();
                  fetchStudents();
                  fetchExistingMarks();
            }
      }, [examId]);

      const fetchExamDetails = async () => {
            try {
                  const res = await api.get(`/exams/${examId}`);
                  setExam(res.data);
            } catch (error) {
                  console.error("Failed to fetch exam:", error);
            }
      };

      const fetchStudents = async () => {
            try {
                  const examRes = await api.get(`/exams/${examId}`);
                  const studentsRes = await api.get(`/users/students?classId=${examRes.data.classId._id}`);
                  setStudents(studentsRes.data);

                  // Initialize marks
                  const initialMarks = {};
                  studentsRes.data.forEach(student => {
                        initialMarks[student._id] = {
                              marksObtained: "",
                              remarks: ""
                        };
                  });
                  setMarks(initialMarks);
            } catch (error) {
                  console.error("Failed to fetch students:", error);
            } finally {
                  setLoading(false);
            }
      };

      const fetchExistingMarks = async () => {
            try {
                  const res = await api.get(`/exams/${examId}/marks`);
                  const existingMarks = {};
                  res.data.forEach(mark => {
                        existingMarks[mark.studentId._id] = {
                              marksObtained: mark.marksObtained,
                              remarks: mark.remarks || ""
                        };
                  });
                  setMarks(prev => ({ ...prev, ...existingMarks }));
            } catch (error) {
                  console.error("Failed to fetch marks:", error);
            }
      };

      const handleMarkChange = (studentId, value) => {
            setMarks(prev => ({
                  ...prev,
                  [studentId]: {
                        ...prev[studentId],
                        marksObtained: value
                  }
            }));
      };

      const handleRemarksChange = (studentId, value) => {
            setMarks(prev => ({
                  ...prev,
                  [studentId]: {
                        ...prev[studentId],
                        remarks: value
                  }
            }));
      };

      const handleSave = async () => {
            try {
                  setSaving(true);

                  const marksData = students
                        .filter(student => marks[student._id]?.marksObtained !== "")
                        .map(student => ({
                              studentId: student._id,
                              marksObtained: parseFloat(marks[student._id].marksObtained),
                              remarks: marks[student._id].remarks
                        }));

                  await api.post(`/exams/${examId}/marks`, { marks: marksData });
                  alert("Marks saved successfully!");
                  if (onClose) onClose();
            } catch (error) {
                  console.error("Failed to save marks:", error);
                  alert("Failed to save marks. Please try again.");
            } finally {
                  setSaving(false);
            }
      };

      const calculateGrade = (marksObtained) => {
            if (!exam || !marksObtained) return "-";
            const percentage = (marksObtained / exam.totalMarks) * 100;
            if (percentage >= 90) return "A+";
            if (percentage >= 80) return "A";
            if (percentage >= 70) return "B+";
            if (percentage >= 60) return "B";
            if (percentage >= 50) return "C+";
            if (percentage >= 40) return "C";
            if (percentage >= 33) return "D";
            return "F";
      };

      if (loading) {
            return (
                  <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
            );
      }

      return (
            <div className="space-y-6">
                  {/* Exam Info Header */}
                  {exam && (
                        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/40">
                              <h2 className="text-2xl font-bold text-gray-900 mb-2">{exam.name}</h2>
                              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                    <span><strong>Subject:</strong> {exam.subjectId?.name}</span>
                                    <span><strong>Class:</strong> {exam.classId?.name}</span>
                                    <span><strong>Total Marks:</strong> {exam.totalMarks}</span>
                                    <span><strong>Passing Marks:</strong> {exam.passingMarks}</span>
                              </div>
                        </div>
                  )}

                  {/* Marks Entry Table */}
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 overflow-hidden">
                        <div className="overflow-x-auto">
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
                                                      Marks Obtained
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                      Grade
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
                                                      <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-bold text-gray-900">{student.name}</div>
                                                            <div className="text-xs text-gray-500">{student.email}</div>
                                                      </td>
                                                      <td className="px-6 py-4 whitespace-nowrap">
                                                            <input
                                                                  type="number"
                                                                  min="0"
                                                                  max={exam?.totalMarks}
                                                                  value={marks[student._id]?.marksObtained || ""}
                                                                  onChange={(e) => handleMarkChange(student._id, e.target.value)}
                                                                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                  placeholder="0"
                                                            />
                                                            <span className="ml-2 text-sm text-gray-500">/ {exam?.totalMarks}</span>
                                                      </td>
                                                      <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${calculateGrade(marks[student._id]?.marksObtained) === 'F'
                                                                        ? 'bg-red-100 text-red-700'
                                                                        : calculateGrade(marks[student._id]?.marksObtained).includes('A')
                                                                              ? 'bg-green-100 text-green-700'
                                                                              : 'bg-yellow-100 text-yellow-700'
                                                                  }`}>
                                                                  {calculateGrade(marks[student._id]?.marksObtained)}
                                                            </span>
                                                      </td>
                                                      <td className="px-6 py-4">
                                                            <input
                                                                  type="text"
                                                                  value={marks[student._id]?.remarks || ""}
                                                                  onChange={(e) => handleRemarksChange(student._id, e.target.value)}
                                                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                  placeholder="Optional remarks"
                                                            />
                                                      </td>
                                                </tr>
                                          ))}
                                    </tbody>
                              </table>
                        </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end gap-3">
                        {onClose && (
                              <button
                                    onClick={onClose}
                                    className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                              >
                                    Cancel
                              </button>
                        )}
                        <button
                              onClick={handleSave}
                              disabled={saving}
                              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2 shadow-lg"
                        >
                              <Save className="w-4 h-4" />
                              {saving ? "Saving..." : "Save Marks"}
                        </button>
                  </div>
            </div>
      );
}
