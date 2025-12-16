import { useState, useEffect } from "react";
import { X, BookOpen, User } from "lucide-react";
import api from "../api";

export default function AddClassModal({ isOpen, onClose, onClassAdded, initialData }) {
      const [formData, setFormData] = useState({
            name: "",
            grade: "",
            section: "",
            teacherId: ""
      });
      const [teachers, setTeachers] = useState([]);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState("");

      useEffect(() => {
            if (isOpen) {
                  fetchTeachers();
            }
            if (isOpen && initialData) {
                  setFormData({
                        name: initialData.name || "",
                        grade: initialData.grade || "",
                        section: initialData.section || "",
                        teacherId: initialData.teacherId?._id || initialData.teacherId || ""
                  });
            } else if (isOpen) {
                  setFormData({ name: "", grade: "", section: "", teacherId: "" });
            }
      }, [isOpen, initialData]);

      const fetchTeachers = async () => {
            try {
                  const response = await api.get("/users/teachers");
                  setTeachers(response.data);
            } catch (error) {
                  console.error("Failed to fetch teachers:", error);
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
                        await api.put(`/academic/class/${initialData._id}`, formData);
                  } else {
                        await api.post("/academic/class", formData);
                  }
                  onClassAdded();
                  onClose();
                  setFormData({ name: "", grade: "", section: "", teacherId: "" });
            } catch (err) {
                  setError(err.response?.data?.message || "Failed to add class");
            } finally {
                  setLoading(false);
            }
      };

      if (!isOpen) return null;

      return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
                  <div className="bg-white rounded-xl shadow-xl w-full max-w-md m-4 p-6 relative animate-slide-in">
                        <button
                              onClick={onClose}
                              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                        >
                              <X className="w-6 h-6" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                              <div className="p-2 bg-purple-100 rounded-lg">
                                    <BookOpen className="w-6 h-6 text-purple-600" />
                              </div>
                              <h2 className="text-2xl font-bold text-gray-900">{initialData ? "Edit Class" : "Add New Class"}</h2>
                        </div>

                        {error && (
                              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                                    {error}
                              </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                              <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Class Name
                                    </label>
                                    <input
                                          type="text"
                                          name="name"
                                          placeholder="e.g. Class 10 - A"
                                          required
                                          value={formData.name}
                                          onChange={handleChange}
                                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                    <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Grade
                                          </label>
                                          <input
                                                type="text"
                                                name="grade"
                                                placeholder="e.g. 10"
                                                required
                                                value={formData.grade}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                          />
                                    </div>
                                    <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Section
                                          </label>
                                          <input
                                                type="text"
                                                name="section"
                                                placeholder="e.g. A"
                                                required
                                                value={formData.section}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                          />
                                    </div>
                              </div>

                              <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Class Teacher (Optional)
                                    </label>
                                    <div className="relative">
                                          <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                          <select
                                                name="teacherId"
                                                value={formData.teacherId}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white"
                                          >
                                                <option value="">Select Teacher</option>
                                                {teachers.map((teacher) => (
                                                      <option key={teacher._id} value={teacher._id}>
                                                            {teacher.name}
                                                      </option>
                                                ))}
                                          </select>
                                    </div>
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
                                          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
                                    >
                                          {loading ? (initialData ? "Updating..." : "Adding...") : (initialData ? "Update Class" : "Add Class")}
                                    </button>
                              </div>
                        </form>
                  </div>
            </div>
      );
}
