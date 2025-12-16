import { useState, useEffect } from "react";
import { Trash2, Book, User, GraduationCap, Edit } from "lucide-react";
import api from "../api";

export default function SubjectList({ refreshTrigger, onEdit }) {
      const [subjects, setSubjects] = useState([]);
      const [loading, setLoading] = useState(true);

      const fetchSubjects = async () => {
            try {
                  const response = await api.get("/academic/subjects");
                  setSubjects(response.data);
            } catch (error) {
                  console.error("Failed to fetch subjects:", error);
            } finally {
                  setLoading(false);
            }
      };

      useEffect(() => {
            fetchSubjects();
      }, [refreshTrigger]);

      const handleDelete = async (id) => {
            if (window.confirm("Are you sure you want to delete this subject?")) {
                  try {
                        await api.delete(`/academic/subject/${id}`);
                        fetchSubjects();
                  } catch (error) {
                        console.error("Failed to delete subject:", error);
                        alert("Failed to delete subject");
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
                  {subjects.map((subject) => (
                        <div key={subject._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition group">
                              <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                                          <Book className="w-6 h-6" />
                                    </div>
                                    <div className="flex gap-1">
                                          <button
                                                onClick={() => onEdit(subject)}
                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                                                title="Edit Subject"
                                          >
                                                <Edit className="w-4 h-4" />
                                          </button>
                                          <button
                                                onClick={() => handleDelete(subject._id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                                                title="Delete Subject"
                                          >
                                                <Trash2 className="w-4 h-4" />
                                          </button>
                                    </div>
                              </div>

                              <h3 className="text-xl font-bold text-gray-900 mb-1">{subject.name}</h3>
                              <p className="text-sm font-mono text-gray-500 mb-4 bg-gray-100 inline-block px-2 py-0.5 rounded text-xs">
                                    {subject.code}
                              </p>

                              <div className="pt-4 border-t border-gray-100 space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                          <GraduationCap className="w-4 h-4 text-gray-400" />
                                          <span className="font-medium text-gray-900">
                                                {subject.classId ? subject.classId.name : "Unassigned Class"}
                                          </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                          <User className="w-4 h-4 text-gray-400" />
                                          {subject.teacherId ? (
                                                <span className="font-medium text-gray-900">{subject.teacherId.name}</span>
                                          ) : (
                                                <span className="text-gray-400 italic">No Teacher Assigned</span>
                                          )}
                                    </div>
                              </div>
                        </div>
                  ))}

                  {subjects.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
                              No subjects added yet.
                        </div>
                  )}
            </div>
      );
}
