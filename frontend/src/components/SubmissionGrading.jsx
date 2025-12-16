import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, X, FileText, ExternalLink, ArrowLeft, Save } from "lucide-react";
import api from "../api";

export default function SubmissionGrading() {
      const { id } = useParams(); // Assignment ID
      const [submissions, setSubmissions] = useState([]);
      const [assignment, setAssignment] = useState(null);
      const [loading, setLoading] = useState(true);
      const [selectedSubmission, setSelectedSubmission] = useState(null);
      const [gradeData, setGradeData] = useState({ grade: "", feedback: "" });
      const navigate = useNavigate();

      useEffect(() => {
            fetchData();
      }, [id]);

      const fetchData = async () => {
            try {
                  const [assignRes, submissionsRes] = await Promise.all([
                        api.get(`/assignments/${id}`),
                        api.get(`/assignments/${id}/submissions`)
                  ]);

                  setAssignment(assignRes.data);
                  setSubmissions(submissionsRes.data);
            } catch (error) {
                  console.error("Failed to fetch data", error);
            } finally {
                  setLoading(false);
            }
      };

      const handleGradeSubmit = async (e) => {
            e.preventDefault();
            if (!selectedSubmission) return;

            try {
                  // Backend: router.route("/submissions/:id/grade")
                  await api.put(`/assignments/submissions/${selectedSubmission._id}/grade`, {
                        grade: gradeData.grade,
                        feedback: gradeData.feedback
                  });

                  // Update local state
                  setSubmissions(submissions.map(s =>
                        s._id === selectedSubmission._id
                              ? { ...s, grade: gradeData.grade, feedback: gradeData.feedback, status: "graded" }
                              : s
                  ));

                  setSelectedSubmission(null);
                  alert("Graded successfully");
            } catch (error) {
                  console.error("Grading failed", error);
                  alert("Failed to save grade");
            }
      };

      const openGrading = (submission) => {
            setSelectedSubmission(submission);
            setGradeData({
                  grade: submission.grade || "",
                  feedback: submission.feedback || ""
            });
      };

      if (loading) return <div className="p-8 text-center">Loading...</div>;

      return (
            <div className="space-y-6 animate-fade-in p-6">
                  <div className="flex items-center gap-4 mb-6">
                        <button onClick={() => navigate("/teacher/assignments")} className="p-2 hover:bg-gray-100 rounded-full transition">
                              <ArrowLeft className="w-5 h-5 text-gray-500" />
                        </button>
                        <div>
                              <h2 className="text-xl font-bold text-gray-800">{assignment?.title}</h2>
                              <p className="text-gray-500 text-sm">Total Points: {assignment?.totalPoints}</p>
                        </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Submission List */}
                        <div className="lg:col-span-2 space-y-4">
                              <h3 className="font-bold text-gray-700">Student Submissions ({submissions.length})</h3>
                              {submissions.length === 0 ? (
                                    <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500">
                                          No submissions yet.
                                    </div>
                              ) : (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                          <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                      <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                                                      </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                      {submissions.map((sub) => (
                                                            <tr key={sub._id} className="hover:bg-gray-50">
                                                                  <td className="px-6 py-4 whitespace-nowrap">
                                                                        <div className="font-medium text-gray-900">{sub.studentId?.name}</div>
                                                                        <div className="text-xs text-gray-500">{sub.studentId?.rollNumber}</div>
                                                                  </td>
                                                                  <td className="px-6 py-4 whitespace-nowrap">
                                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${sub.status === 'graded' ? 'bg-green-100 text-green-800' :
                                                                              sub.status === 'late' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                                                              }`}>
                                                                              {sub.status}
                                                                        </span>
                                                                  </td>
                                                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                        {sub.grade !== undefined ? `${sub.grade}/${assignment.totalPoints}` : "-"}
                                                                  </td>
                                                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                        <button
                                                                              onClick={() => openGrading(sub)}
                                                                              className="text-primary hover:text-blue-900"
                                                                        >
                                                                              Grade
                                                                        </button>
                                                                  </td>
                                                            </tr>
                                                      ))}
                                                </tbody>
                                          </table>
                                    </div>
                              )}
                        </div>

                        {/* Grading Panel */}
                        <div className="lg:col-span-1">
                              {selectedSubmission ? (
                                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-6">
                                          <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-bold text-gray-800">Grading: {selectedSubmission.studentId?.name}</h3>
                                                <button onClick={() => setSelectedSubmission(null)} className="text-gray-400 hover:text-gray-600">
                                                      <X className="w-5 h-5" />
                                                </button>
                                          </div>

                                          <div className="space-y-4">
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                      <p className="text-sm font-medium text-gray-700 mb-2">Student Submission:</p>
                                                      <p className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200 mb-3 whitespace-pre-wrap">
                                                            {selectedSubmission.content || "No text content."}
                                                      </p>

                                                      {selectedSubmission.attachments?.length > 0 && (
                                                            <div className="space-y-2">
                                                                  <p className="text-xs font-bold text-gray-500 uppercase">Attachments</p>
                                                                  {selectedSubmission.attachments.map((file, i) => (
                                                                        <a
                                                                              key={i}
                                                                              href={file.url}
                                                                              target="_blank"
                                                                              rel="noopener noreferrer"
                                                                              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                                                                        >
                                                                              <ExternalLink className="w-3 h-3" /> {file.name || "File"}
                                                                        </a>
                                                                  ))}
                                                            </div>
                                                      )}
                                                </div>

                                                <form onSubmit={handleGradeSubmit} className="space-y-4 border-t border-gray-100 pt-4">
                                                      <div>
                                                            <label className="block text-sm font-bold text-gray-700 mb-1">Grade (out of {assignment.totalPoints})</label>
                                                            <input
                                                                  type="number"
                                                                  max={assignment.totalPoints}
                                                                  min="0"
                                                                  required
                                                                  value={gradeData.grade}
                                                                  onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
                                                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                                            />
                                                      </div>
                                                      <div>
                                                            <label className="block text-sm font-bold text-gray-700 mb-1">Feedback</label>
                                                            <textarea
                                                                  rows="3"
                                                                  value={gradeData.feedback}
                                                                  onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                                                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                                                  placeholder="Optional feedback..."
                                                            ></textarea>
                                                      </div>
                                                      <button
                                                            type="submit"
                                                            className="w-full py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition flex items-center justify-center gap-2"
                                                      >
                                                            <Save className="w-4 h-4" /> Save Grade
                                                      </button>
                                                </form>
                                          </div>
                                    </div>
                              ) : (
                                    <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500 flex flex-col items-center justify-center min-h-[300px]">
                                          <FileText className="w-12 h-12 text-gray-300 mb-3" />
                                          <p className="font-medium text-gray-600">No submission selected</p>
                                          <p className="text-sm">Click the <span className="text-primary font-bold">"Grade"</span> button next to a student to view their work here.</p>
                                    </div>
                              )}
                        </div>
                  </div>
            </div>
      );
}
