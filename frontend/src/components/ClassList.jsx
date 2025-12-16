import { useState, useEffect } from "react";
import { Trash2, BookOpen, Users, User, Edit } from "lucide-react";
import api from "../api";

export default function ClassList({ refreshTrigger, onEdit }) {
      const [classes, setClasses] = useState([]);
      const [loading, setLoading] = useState(true);

      const fetchClasses = async () => {
            try {
                  const response = await api.get("/academic/classes");
                  setClasses(response.data);
            } catch (error) {
                  console.error("Failed to fetch classes:", error);
            } finally {
                  setLoading(false);
            }
      };

      useEffect(() => {
            fetchClasses();
      }, [refreshTrigger]);

      const handleDelete = async (id) => {
            if (window.confirm("Are you sure you want to delete this class?")) {
                  try {
                        await api.delete(`/academic/class/${id}`);
                        fetchClasses();
                  } catch (error) {
                        console.error("Failed to delete class:", error);
                        alert("Failed to delete class");
                  }
            }
      };

      if (loading) {
            return (
                  <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
            );
      }

      return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {classes.map((cls) => (
                        <div key={cls._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition group">
                              <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                                          <BookOpen className="w-6 h-6" />
                                    </div>
                                    <div className="flex gap-1">
                                          <button
                                                onClick={() => onEdit(cls)}
                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                                                title="Edit Class"
                                          >
                                                <Edit className="w-4 h-4" />
                                          </button>
                                          <button
                                                onClick={() => handleDelete(cls._id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                                                title="Delete Class"
                                          >
                                                <Trash2 className="w-4 h-4" />
                                          </button>
                                    </div>
                              </div>

                              <h3 className="text-xl font-bold text-gray-900 mb-1">{cls.name}</h3>
                              <p className="text-sm text-gray-500 mb-4">
                                    Grade {cls.grade} • Section {cls.section}
                              </p>

                              <div className="pt-4 border-t border-gray-100 space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                          <User className="w-4 h-4 text-gray-400" />
                                          {cls.teacherId ? (
                                                <span className="font-medium text-gray-900">{cls.teacherId.name}</span>
                                          ) : (
                                                <span className="text-gray-400 italic">No Class Teacher</span>
                                          )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                          <Users className="w-4 h-4 text-gray-400" />
                                          <span>{cls.students?.length || 0} Students</span>
                                    </div>
                              </div>
                        </div>
                  ))}

                  {classes.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
                              No classes added yet.
                        </div>
                  )}
            </div>
      );
}
