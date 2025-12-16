import { useState, useEffect } from "react";
import { BookOpen, Calendar, CheckCircle, Clock, FileText, Upload } from "lucide-react";
import api from "../api";
import SubmissionForm from "./SubmissionForm";

export default function AssignmentList() {
      const [assignments, setAssignments] = useState([]);
      const [selectedAssignment, setSelectedAssignment] = useState(null);
      const [loading, setLoading] = useState(false);

      useEffect(() => {
            fetchAssignments();
      }, []);

      const fetchAssignments = async () => {
            try {
                  setLoading(true);
                  // Assuming backend filters by student's class
                  const res = await api.get("/assignments");
                  setAssignments(res.data);
            } catch (error) {
                  console.error("Failed to fetch assignments", error);
            } finally {
                  setLoading(false);
            }
      };

      const handleSubmissionSuccess = () => {
            setSelectedAssignment(null);
            fetchAssignments(); // Refresh to potentially show status change if we track it in list
            alert("Assignment submitted successfully!");
      };

      return (
            <div className="space-y-6 animate-fade-in">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                              <BookOpen className="w-6 h-6 text-primary" />
                              My Assignments
                        </h2>
                  </div>

                  {loading ? (
                        <div className="text-center py-12">Loading...</div>
                  ) : assignments.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">No assignments found.</div>
                  ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {assignments.map((assignment) => {
                                    const isDue = new Date() > new Date(assignment.dueDate);
                                    return (
                                          <div key={assignment._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition">
                                                <div className="flex justify-between items-start mb-2">
                                                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md">
                                                            {assignment.subjectId?.name}
                                                      </span>
                                                      <span className={`text-xs font-bold ${isDue ? "text-red-500" : "text-green-600"}`}>
                                                            {isDue ? "Past Due" : "Active"}
                                                      </span>
                                                </div>

                                                <h3 className="text-lg font-bold text-gray-900 mb-2">{assignment.title}</h3>
                                                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{assignment.description}</p>

                                                <div className="flex items-center justify-between mt-4">
                                                      <div className="text-sm text-gray-500 flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            {new Date(assignment.dueDate).toLocaleDateString()}
                                                      </div>

                                                      <button
                                                            onClick={() => setSelectedAssignment(assignment)}
                                                            className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition flex items-center gap-2"
                                                      >
                                                            <Upload className="w-4 h-4" /> View & Submit
                                                      </button>
                                                </div>
                                          </div>
                                    );
                              })}
                        </div>
                  )}

                  {selectedAssignment && (
                        <SubmissionForm
                              assignment={selectedAssignment}
                              onClose={() => setSelectedAssignment(null)}
                              onSuccess={handleSubmissionSuccess}
                        />
                  )}
            </div>
      );
}
