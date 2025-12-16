import { useState, useEffect } from "react";
import { X, Book, Link } from "lucide-react";
import api from "../api";

export default function AddSubjectModal({ isOpen, onClose, onSubjectAdded, initialData }) {
      const [formData, setFormData] = useState({
            name: "",
            code: "",
            classId: "",
            teacherId: ""
      });
      const [classes, setClasses] = useState([]);
      const [teachers, setTeachers] = useState([]);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState("");

      useEffect(() => {
            if (isOpen) {
                  fetchClasses();
                  fetchTeachers();
            }
            if (isOpen && initialData) {
                  setFormData({
                        name: initialData.name || "",
                        code: initialData.code || "",
                        classId: initialData.classId?._id || initialData.classId || "",
                        teacherId: initialData.teacherId?._id || initialData.teacherId || ""
                  });
            } else if (isOpen) {
                  setFormData({ name: "", code: "", classId: "", teacherId: "" });
            }
      }, [isOpen, initialData]);

      const fetchClasses = async () => {
            try {
                  const res = await api.get("/academic/classes");
                  setClasses(res.data);
            } catch (err) {
                  console.error(err);
            }
      };

      const fetchTeachers = async () => {
            try {
                  const res = await api.get("/users/teachers");
                  setTeachers(res.data);
            } catch (err) {
                  console.error(err);
            }
      };

      const handleChange = (e) => {
            setFormData({ ...formData, [e.target.name]: e.target.value });
      };

      const handleSubmit = async (e) => {
            e.preventDefault();
            setLoading(true);
            setError("");

            try {
                  if (initialData) {
                        await api.put(`/academic/subject/${initialData._id}`, formData);
                  } else {
                        await api.post("/academic/subject", formData);
                  }
                  onSubjectAdded();
                  onClose();
                  setFormData({ name: "", code: "", classId: "", teacherId: "" });
            } catch (err) {
                  setError(err.response?.data?.message || "Failed to add subject");
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
                              <div className="p-2 bg-indigo-100 rounded-lg">
                                    <Book className="w-6 h-6 text-indigo-600" />
                              </div>
                              <h2 className="text-2xl font-bold text-gray-900">{initialData ? "Edit Subject" : "Add New Subject"}</h2>
                        </div>

                        {error && (
                              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                              <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                                    <input
                                          type="text"
                                          name="name"
                                          required
                                          value={formData.name}
                                          onChange={handleChange}
                                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                              </div>

                              <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code</label>
                                    <input
                                          type="text"
                                          name="code"
                                          required
                                          value={formData.code}
                                          onChange={handleChange}
                                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                              </div>

                              <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
                                    <select
                                          name="classId"
                                          required
                                          value={formData.classId}
                                          onChange={handleChange}
                                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                                    >
                                          <option value="">Select Class</option>
                                          {classes.map((cls) => (
                                                <option key={cls._id} value={cls._id}>
                                                      {cls.name} (Grade {cls.grade})
                                                </option>
                                          ))}
                                    </select>
                              </div>

                              <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject Teacher</label>
                                    <select
                                          name="teacherId"
                                          value={formData.teacherId}
                                          onChange={handleChange}
                                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                                    >
                                          <option value="">Select Teacher (Optional)</option>
                                          {teachers.map((t) => (
                                                <option key={t._id} value={t._id}>
                                                      {t.name}
                                                </option>
                                          ))}
                                    </select>
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
                                          {loading ? (initialData ? "Updating..." : "Adding...") : (initialData ? "Update Subject" : "Add Subject")}
                                    </button>
                              </div>
                        </form>
                  </div>
            </div>
      );
}
