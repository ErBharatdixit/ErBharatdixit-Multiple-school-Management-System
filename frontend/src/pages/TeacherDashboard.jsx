import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
      LogOut, LayoutDashboard, ClipboardList, GraduationCap, Calendar,
      Clock, UserCheck, FileText, Megaphone, Menu, X, BookOpen, Award, Users, MessageCircle
} from "lucide-react";
import TeacherAttendance from "../components/TeacherAttendance";
import TimetableView from "../components/TimetableView";
import TeacherSchedule from "../components/TeacherSchedule";
import MyAttendance from "../components/MyAttendance";
import StudentAttendanceManager from "../components/StudentAttendanceManager";
import ProfileForm from "../components/ProfileForm";
import ExamManager from "../components/ExamManager";

import StudentReportCardManager from "../components/StudentReportCardManager";
import AssignmentManager from "../components/AssignmentManager";
import LeaveManager from "../components/LeaveManager";
import LeaveApplication from "../components/LeaveApplication";
import LeaveHistory from "../components/LeaveHistory";
import NoticeBoard from "../components/NoticeBoard";
import api from "../api";

export default function TeacherDashboard() {
      const { user, logout } = useAuth();
      const navigate = useNavigate();
      const [activeTab, setActiveTab] = useState("student-attendance");
      const [classes, setClasses] = useState([]);
      const [selectedClass, setSelectedClass] = useState("");
      const [isSidebarOpen, setIsSidebarOpen] = useState(false);

      useEffect(() => {
            fetchClasses();
      }, []);

      const fetchClasses = async () => {
            try {
                  const res = await api.get("/academic/classes");
                  setClasses(res.data);
                  if (res.data.length > 0) setSelectedClass(res.data[0]._id);
            } catch (err) {
                  console.error("Failed to fetch classes", err);
            }
      };

      const menuItems = [
            { id: "student-attendance", label: "Student Attendance", icon: ClipboardList },
            { id: "exams", label: "Exam Manager", icon: FileText },
            { id: "timetable", label: "Timetable", icon: Clock },
            { id: "report-cards", label: "Report Cards", icon: Award },
            { id: "student-leaves", label: "Student Leaves", icon: Users },
            { id: "my-leaves", label: "My Leaves", icon: Calendar },
            { id: "my-attendance", label: "My Attendance", icon: UserCheck },
            { id: "assignments", label: "Assignments", icon: BookOpen },
            { id: "profile", label: "My Profile", icon: UserCheck },
            { id: "notices", label: "Notices", icon: Megaphone },
            { id: "messages", label: "Messages", icon: MessageCircle },
      ];

      return (
            <div className="flex h-screen bg-gray-50">
                  {/* Sidebar Overlay for Mobile */}
                  {isSidebarOpen && (
                        <div
                              className="fixed inset-0 bg-black/50 z-40 md:hidden"
                              onClick={() => setIsSidebarOpen(false)}
                        />
                  )}

                  {/* Sidebar */}
                  <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`}>
                        <div className="p-6 flex items-center justify-between border-b border-gray-100">
                              <div className="flex items-center gap-3">
                                    <div className="bg-indigo-600 p-2 rounded-lg">
                                          <LayoutDashboard className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-xl font-bold text-gray-800">Teacher Portal</span>
                              </div>
                              <button className="md:hidden text-gray-500 hover:text-gray-700" onClick={() => setIsSidebarOpen(false)}>
                                    <X className="w-6 h-6" />
                              </button>
                        </div>

                        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-2">
                              {menuItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                          <button
                                                key={item.id}
                                                onClick={() => {
                                                      if (item.id === "messages") {
                                                            navigate("/chat");
                                                            return;
                                                      }
                                                      setActiveTab(item.id);
                                                      setIsSidebarOpen(false);
                                                }}
                                                className={`flex items-center w-full px-4 py-3 rounded-xl text-left transition-all duration-200 font-medium ${activeTab === item.id
                                                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                                                      : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
                                                      }`}
                                          >
                                                <Icon className="w-5 h-5 mr-3" />
                                                <span>{item.label}</span>
                                          </button>
                                    );
                              })}
                        </nav>

                        <div className="p-4 border-t border-gray-100">
                              <button
                                    onClick={logout}
                                    className="flex items-center w-full px-4 py-3 rounded-xl text-left text-red-600 hover:bg-red-50 transition-colors duration-200 font-medium"
                              >
                                    <LogOut className="w-5 h-5 mr-3" />
                                    <span>Logout</span>
                              </button>
                        </div>
                  </aside>

                  {/* Main Content Area */}
                  <div className="flex-1 flex flex-col h-screen overflow-hidden">
                        {/* Top Header */}
                        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between shrink-0 z-30">
                              <div className="flex items-center gap-4">
                                    <button
                                          className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                          onClick={() => setIsSidebarOpen(true)}
                                    >
                                          <Menu className="w-6 h-6" />
                                    </button>
                                    <div>
                                          <h1 className="text-xl font-bold text-gray-800">
                                                {menuItems.find(i => i.id === activeTab)?.label || "Dashboard"}
                                          </h1>
                                          <p className="text-sm text-gray-500 hidden sm:block">
                                                Welcome, {user?.name}
                                          </p>
                                    </div>
                              </div>

                              <div className="flex items-center gap-4">
                                    <div className="hidden sm:block text-right">
                                          <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                                          <p className="text-xs text-gray-500">{user?.role}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                                          {user?.name?.[0]}
                                    </div>
                              </div>
                        </header>

                        {/* Scrollable Main Content */}
                        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6">
                              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[500px]">
                                    <div className="p-6">
                                          {activeTab === "student-attendance" ? <StudentAttendanceManager /> :
                                                activeTab === "attendance" ? <TeacherAttendance /> :
                                                      activeTab === "my-attendance" ? <MyAttendance /> :
                                                            activeTab === "profile" ? <ProfileForm /> :
                                                                  activeTab === "assignments" ? <AssignmentManager /> :
                                                                        activeTab === "exams" ? <ExamManager /> :
                                                                              activeTab === "student-leaves" ? <LeaveManager /> :
                                                                                    activeTab === "notices" ? <NoticeBoard /> :
                                                                                          activeTab === "my-leaves" ? (
                                                                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                                                                      <LeaveApplication />
                                                                                                      <LeaveHistory />
                                                                                                </div>
                                                                                          ) :
                                                                                                activeTab === "report-cards" ? <StudentReportCardManager /> : (
                                                                                                      /* Timetable with specific logic */
                                                                                                      <div className="space-y-6">
                                                                                                            <div className="flex justify-end">
                                                                                                                  <div className="bg-gray-100/80 p-1 rounded-xl inline-flex border border-gray-200">
                                                                                                                        <button
                                                                                                                              onClick={() => setSelectedClass("")} // Clear class when switching to My Schedule
                                                                                                                              className={`px-4 py-2 text-sm font-bold rounded-lg transition ${!selectedClass ? "bg-white text-indigo-600 shadow-md" : "text-gray-500 hover:text-gray-700"}`}
                                                                                                                        >
                                                                                                                              My Schedule
                                                                                                                        </button>
                                                                                                                        <button
                                                                                                                              onClick={() => {
                                                                                                                                    if (classes.length > 0) setSelectedClass(classes[0]._id);
                                                                                                                              }}
                                                                                                                              className={`px-4 py-2 text-sm font-bold rounded-lg transition ${selectedClass ? "bg-white text-indigo-600 shadow-md" : "text-gray-500 hover:text-gray-700"}`}
                                                                                                                        >
                                                                                                                              Class Schedule
                                                                                                                        </button>
                                                                                                                  </div>
                                                                                                            </div>

                                                                                                            {!selectedClass ? (
                                                                                                                  <TeacherSchedule />
                                                                                                            ) : (
                                                                                                                  <div className="space-y-4">
                                                                                                                        <div className="w-full sm:w-64">
                                                                                                                              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Select Class</label>
                                                                                                                              <div className="relative">
                                                                                                                                    <select
                                                                                                                                          value={selectedClass}
                                                                                                                                          onChange={(e) => setSelectedClass(e.target.value)}
                                                                                                                                          className="w-full pl-4 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm rounded-xl appearance-none bg-gray-50 hover:bg-white transition shadow-sm"
                                                                                                                                    >
                                                                                                                                          {classes.map(cls => (
                                                                                                                                                <option key={cls._id} value={cls._id}>{cls.name}</option>
                                                                                                                                          ))}
                                                                                                                                    </select>
                                                                                                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                                                                                                                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                                                                                                                    </div>
                                                                                                                              </div>
                                                                                                                        </div>
                                                                                                                        <TimetableView classId={selectedClass} />
                                                                                                                  </div>
                                                                                                            )}
                                                                                                      </div>
                                                                                                )}
                                    </div>
                              </div>
                        </main>
                  </div>
            </div>
      );
}
