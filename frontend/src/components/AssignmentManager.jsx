import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, FileText, Calendar, Paperclip, X, Download } from "lucide-react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function AssignmentManager() {
      const [assignments, setAssignments] = useState([]);
      const [classes, setClasses] = useState([]);
      const [subjects, setSubjects] = useState([]);
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [loading, setLoading] = useState(false);
      const [formData, setFormData] = useState({
            title: "",
            description: "",
            classId: "",
            subjectId: "",
            dueDate: "",
            totalPoints: 100,
            files: []
      });
      const navigate = useNavigate();

      useEffect(() => {
            fetchAssignments();
            fetchClasses();
            fetchSubjects();
      }, []);

      const fetchAssignments = async () => {
            try {
                  const res = await api.get("/assignments");
                  setAssignments(res.data);
            } catch (error) {
                  console.error("Failed to fetch assignments", error);
            }
      };

      const fetchClasses = async () => {
            try {
                  const res = await api.get("/academic/classes");
                  setClasses(res.data);
            } catch (error) {
                  console.error("Failed to fetch classes", error);
            }
      };

      const fetchSubjects = async () => {
            try {
                  const res = await api.get("/academic/subjects");
                  setSubjects(res.data);
            } catch (error) {
                  console.error("Failed to fetch subjects", error);
            }
      };

      const handleFileChange = (e) => {
            setFormData({ ...formData, files: Array.from(e.target.files) });
      };

      const handleSubmit = async (e) => {
            e.preventDefault();
            setLoading(true);

            const data = new FormData();
            data.append("title", formData.title);
            data.append("description", formData.description);
            data.append("classId", formData.classId);
            data.append("subjectId", formData.subjectId);
            data.append("dueDate", formData.dueDate);
            data.append("totalPoints", formData.totalPoints);

            formData.files.forEach((file) => {
                  data.append("files", file);
            });

            try {
                  await api.post("/assignments", data, {
                        headers: { "Content-Type": "multipart/form-data" }
                  });
                  setIsModalOpen(false);
                  setFormData({
                        title: "", description: "", classId: "", subjectId: "", dueDate: "", totalPoints: 100, files: []
                  });
                  alert("Assignment created successfully!");
                  fetchAssignments();
            } catch (error) {
                  console.error("Failed to create assignment", error);
                  alert("Failed to create assignment");
            } finally {
                  setLoading(false);
            }
      };

      const handleDelete = async (id) => {
            if (!window.confirm("Are you sure? This will delete all student submissions too.")) return;
            try {
                  await api.delete(`/assignments/${id}`);
                  setAssignments(assignments.filter(a => a._id !== id));
            } catch (error) {
                  console.error("Failed to delete", error);
            }
      };

      return (
            <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                              <FileText className="w-6 h-6 text-primary" />
                              Assignment Management
                        </h2>
                        <button
                              onClick={() => setIsModalOpen(true)}
                              className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition flex items-center gap-2 shadow-sm"
                        >
                              <Plus className="w-4 h-4" /> Create Assignment
                        </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {assignments.map((assignment) => (
                              <div key={assignment._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                                    <div className="p-5">
                                          <div className="flex justify-between items-start mb-3">
                                                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md">
                                                      {assignment.subjectId?.name || "Subject"}
                                                </span>
                                                <div className="flex gap-2">
                                                      <button
                                                            onClick={() => navigate(`/teacher/assignments/${assignment._id}/submissions`)}
                                                            className="p-2 text-gray-400 hover:text-blue-600 transition bg-transparent hover:bg-blue-50 rounded-full"
                                                            title="View Submissions"
                                                      >
                                                            <FileText className="w-4 h-4" />
                                                      </button>
                                                      <button
                                                            onClick={() => handleDelete(assignment._id)}
                                                            className="p-2 text-gray-400 hover:text-red-500 transition bg-transparent hover:bg-red-50 rounded-full"
                                                            title="Delete"
                                                      >
                                                            <Trash2 className="w-4 h-4" />
                                                      </button>
                                                </div>
                                          </div>

                                          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{assignment.title}</h3>
                                          <p className="text-gray-500 text-sm mb-4 line-clamp-2">{assignment.description}</p>

                                          <div className="flex flex-col gap-2 text-sm text-gray-500">
                                                <div className="flex items-center gap-2">
                                                      <Calendar className="w-4 h-4" />
                                                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                      <Paperclip className="w-4 h-4" />
                                                      {assignment.attachments?.length || 0} Attachments
                                                </div>
                                          </div>
                                    </div>
                                    <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 text-xs font-medium text-gray-500 flex justify-between items-center">
                                          <span>Class: {assignment.classId?.name} - {assignment.classId?.section}</span>
                                          <span>{assignment.totalPoints} pts</span>
                                    </div>
                              </div>
                        ))}
                  </div>

                  {isModalOpen && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                              <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
                                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                                          <h3 className="text-lg font-bold text-gray-800">Create New Assignment</h3>
                                          <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                                                <X className="w-6 h-6" />
                                          </button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                          <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                                      <input
                                                            type="text"
                                                            required
                                                            value={formData.title}
                                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                                      />
                                                </div>
                                                <div>
                                                      <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                                      <input
                                                            type="date"
                                                            required
                                                            value={formData.dueDate}
                                                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                                      />
                                                </div>
                                          </div>

                                          <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                      <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                                                      <select
                                                            required
                                                            value={formData.classId}
                                                            onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                                      >
                                                            <option value="">Select Class</option>
                                                            {classes.map(c => (
                                                                  <option key={c._id} value={c._id}>{c.name} - {c.section}</option>
                                                            ))}
                                                      </select>
                                                </div>
                                                <div>
                                                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                                      <select
                                                            required
                                                            value={formData.subjectId}
                                                            onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                                      >
                                                            <option value="">Select Subject</option>
                                                            {subjects.map(s => (
                                                                  <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                                                            ))}
                                                      </select>
                                                </div>
                                          </div>

                                          <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                                <textarea
                                                      required
                                                      rows="4"
                                                      value={formData.description}
                                                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                                ></textarea>
                                          </div>

                                          <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Points</label>
                                                      <input
                                                            type="number"
                                                            required
                                                            value={formData.totalPoints}
                                                            onChange={(e) => setFormData({ ...formData, totalPoints: e.target.value })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                                      />
                                                </div>
                                                <div>
                                                      <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
                                                      <input
                                                            type="file"
                                                            multiple
                                                            onChange={handleFileChange}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                      />
                                                </div>
                                          </div>

                                          <div className="flex justify-end pt-4 gap-3">
                                                <button
                                                      type="button"
                                                      onClick={() => setIsModalOpen(false)}
                                                      className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition"
                                                >
                                                      Cancel
                                                </button>
                                                <button
                                                      type="submit"
                                                      disabled={loading}
                                                      className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition shadow-lg disabled:opacity-50"
                                                >
                                                      {loading ? "Creating..." : "Create Assignment"}
                                                </button>
                                          </div>
                                    </form>
                              </div>
                        </div>
                  )}
            </div>
      );
}
