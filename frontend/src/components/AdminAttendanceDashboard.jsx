import { useState } from "react";
import { Users, BookOpen } from "lucide-react";
import AdminTeacherAttendance from "./AdminTeacherAttendance";
import StudentAttendanceManager from "./StudentAttendanceManager";

export default function AdminAttendanceDashboard() {
      const [activeTab, setActiveTab] = useState("teachers");

      return (
            <div className="space-y-6">
                  <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 inline-flex">
                        <button
                              onClick={() => setActiveTab("teachers")}
                              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${activeTab === "teachers"
                                          ? "bg-blue-600 text-white shadow-md"
                                          : "text-gray-600 hover:bg-gray-100"
                                    }`}
                        >
                              <BookOpen className="w-4 h-4" />
                              Teacher Attendance
                        </button>
                        <button
                              onClick={() => setActiveTab("students")}
                              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${activeTab === "students"
                                          ? "bg-blue-600 text-white shadow-md"
                                          : "text-gray-600 hover:bg-gray-100"
                                    }`}
                        >
                              <Users className="w-4 h-4" />
                              Student Attendance
                        </button>
                  </div>

                  <div className="animate-fade-in">
                        {activeTab === "teachers" ? (
                              <AdminTeacherAttendance />
                        ) : (
                              <StudentAttendanceManager />
                        )}
                  </div>
            </div>
      );
}
