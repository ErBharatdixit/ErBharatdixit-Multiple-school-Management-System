import { useState, useEffect } from "react";
import { X, BookOpen, Calendar, Clock, FileText } from "lucide-react";
import api from "../api";

export default function AddExamModal({ isOpen, onClose, onExamAdded, initialData }) {
      const [formData, setFormData] = useState({
            name: "",
            examType: "Mid-Term",
            subjectId: "",
            classId: "",
            date: "",
            totalMarks: "",
            passingMarks: "",
            duration: "",
            instructions: ""
      });
      const [subjects, setSubjects] = useState([]);
      const [classes, setClasses] = useState([]);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState("");

      useEffect(() => {
            if (isOpen) {
                  fetchClasses();
                  fetchSubjects();
            }
            if (isOpen && initialData) {
                  setFormData({
                        name: initialData.name || "",
                        examType: initialData.examType || "Mid-Term",
                        subjectId: initialData.subjectId?._id || initialData.subjectId || "",
                        classId: initialData.classId?._id || initialData.classId || "",
                        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : "",
                        totalMarks: initialData.totalMarks || "",
                        passingMarks: initialData.passingMarks || "",
                        duration: initialData.duration || "",
                        instructions: initialData.instructions || ""
                  });
            } else if (isOpen) {
                  setFormData({
                        name: "",
                        examType: "Mid-Term",
                        subjectId: "",
                        classId: "",
                        date: "",
                        totalMarks: "",
                        passingMarks: "",
                        duration: "",
                        instructions: ""
                  });
            }
      }, [isOpen, initialData]);

      const fetchClasses = async () => {
            try {
                  const res = await api.get("/academic/classes");
                  setClasses(res.data);
            } catch (error) {
                  console.error("Failed to fetch classes:", error);
            }
      };

      const fetchSubjects = async () => {
            try {
                  const res = await api.get("/academic/subjects");
                  setSubjects(res.data);
            } catch (error) {
                  console.error("Failed to fetch subjects:", error);
            }
      };

      const handleChange = (e) => {
            setFormData({
                  ...formData,
                  [e.target.name]: e.target.value
            });
      };

      const handleSubmit = async (e) => {
            e.preventDefault();
            setLoading(true);
            setError("");

            try {
                  if (initialData) {
                        await api.put(`/exams/${initialData._id}`, formData);
                  } else {
                        await api.post("/exams", formData);
                  }
                  onExamAdded();
                  onClose();
            } catch (err) {
                  setError(err.response?.data?.message || "Failed to save exam");
            } finally {
                  setLoading(false);
            }
      };

      if (!isOpen) return null;

      return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
                  <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl m-4 p-6 relative animate-slide-in max-h-[90vh] overflow-y-auto">
                        <button
                              onClick={onClose}
                              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                        >
                              <X className="w-6 h-6" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                    <BookOpen className="w-6 h-6 text-blue-600" />
                              </div>
                              <h2 className="text-2xl font-bold text-gray-900">
                                    {initialData ? "Edit Exam" : "Create New Exam"}
                              </h2>
                        </div>

                        {error && (
                              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                                    {error}
                              </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                              <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Exam Name
                                    </label>
                                    <input
                                          type="text"
                                          name="name"
                                          placeholder="e.g. Mid-Term Mathematics"
                                          required
                                          value={formData.name}
                                          onChange={handleChange}
                                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                    <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Exam Type
                                          </label>
                                          <select
                                                name="examType"
                                                value={formData.examType}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                          >
                                                <option value="Mid-Term">Mid-Term</option>
                                                <option value="Final">Final</option>
                                                <option value="Quiz">Quiz</option>
                                                <option value="Unit Test">Unit Test</option>
                                                <option value="Assignment">Assignment</option>
                                          </select>
                                    </div>

                                    <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Date
                                          </label>
                                          <input
                                                type="date"
                                                name="date"
                                                required
                                                value={formData.date}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                          />
                                    </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                    <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Class
                                          </label>
                                          <select
                                                name="classId"
                                                value={formData.classId}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                          >
                                                <option value="">Select Class</option>
                                                {classes.map((cls) => (
                                                      <option key={cls._id} value={cls._id}>
                                                            {cls.name} - Section {cls.section}
                                                      </option>
                                                ))}
                                          </select>
                                    </div>

                                    <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Subject
                                          </label>
                                          <select
                                                name="subjectId"
                                                value={formData.subjectId}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                          >
                                                <option value="">Select Subject</option>
                                                {subjects.map((subject) => (
                                                      <option key={subject._id} value={subject._id}>
                                                            {subject.name}
                                                      </option>
                                                ))}
                                          </select>
                                    </div>
                              </div>

                              <div className="grid grid-cols-3 gap-4">
                                    <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Total Marks
                                          </label>
                                          <input
                                                type="number"
                                                name="totalMarks"
                                                placeholder="100"
                                                required
                                                min="1"
                                                value={formData.totalMarks}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                          />
                                    </div>

                                    <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Passing Marks
                                          </label>
                                          <input
                                                type="number"
                                                name="passingMarks"
                                                placeholder="40"
                                                required
                                                min="1"
                                                value={formData.passingMarks}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                          />
                                    </div>

                                    <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Duration (mins)
                                          </label>
                                          <input
                                                type="number"
                                                name="duration"
                                                placeholder="180"
                                                required
                                                min="1"
                                                value={formData.duration}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                          />
                                    </div>
                              </div>

                              <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Instructions (Optional)
                                    </label>
                                    <textarea
                                          name="instructions"
                                          placeholder="Exam instructions..."
                                          value={formData.instructions}
                                          onChange={handleChange}
                                          rows="3"
                                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                              </div>

                              <div className="flex justify-end gap-3 pt-4">
                                    <button
                                          type="button"
                                          onClick={onClose}
                                          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                                    >
                                          Cancel
                                    </button>
                                    <button
                                          type="submit"
                                          disabled={loading}
                                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                    >
                                          {loading ? (initialData ? "Updating..." : "Creating...") : (initialData ? "Update Exam" : "Create Exam")}
                                    </button>
                              </div>
                        </form>
                  </div>
            </div>
      );
}
