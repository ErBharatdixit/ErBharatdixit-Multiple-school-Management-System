import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
      LogOut, Calendar, Award, BookOpen, TrendingUp, Clock,
      AlertCircle, CheckCircle2, FileText, IndianRupee, Megaphone,
      Bus, Menu, X, Home, MessageCircle
} from "lucide-react";
import TimetableView from "../components/TimetableView";
import ProfileForm from "../components/ProfileForm";
import ReportCard from "../components/ReportCard";
import AssignmentList from "../components/AssignmentList";
import api from "../api";
import StudentFeeStatus from "../components/StudentFeeStatus";
import LeaveApplication from "../components/LeaveApplication";
import LeaveHistory from "../components/LeaveHistory";
import NoticeBoard from "../components/NoticeBoard";
import StudentTransport from "../components/transport/StudentTransport";

export default function StudentDashboard() {
      const { user, logout } = useAuth();
      const navigate = useNavigate();
      const [activeTab, setActiveTab] = useState("attendance");
      const [isSidebarOpen, setIsSidebarOpen] = useState(false);
      const [attendanceData, setAttendanceData] = useState({ stats: {}, history: [] });
      const [marksData, setMarksData] = useState([]);
      const [loading, setLoading] = useState(true);
      const [leaveRefresh, setLeaveRefresh] = useState(0);

      useEffect(() => {
            fetchDashboardData();
      }, []);

      const fetchDashboardData = async () => {
            try {
                  setLoading(true);
                  const [attendanceRes, marksRes] = await Promise.all([
                        api.get("/attendance/student/me"),
                        api.get("/student/marks")
                  ]);
                  setAttendanceData(attendanceRes.data);
                  setMarksData(marksRes.data);
            } catch (error) {
                  console.error("Failed to fetch student data:", error);
            } finally {
                  setLoading(false);
            }
      };

      const getAttendanceColor = (percentage) => {
            if (percentage >= 75) return "text-green-600 bg-green-100";
            if (percentage >= 60) return "text-yellow-600 bg-yellow-100";
            return "text-red-600 bg-red-100";
      };

      const menuItems = [
            { id: "attendance", label: "Attendance", icon: Calendar },
            { id: "timetable", label: "Timetable", icon: Clock },
            { id: "report-card", label: "Report Card", icon: FileText },
            { id: "assignments", label: "Assignments", icon: BookOpen },
            { id: "fees", label: "Fees", icon: IndianRupee },
            { id: "leaves", label: "Leaves", icon: AlertCircle },
            { id: "notices", label: "Notices", icon: Megaphone },
            { id: "transport", label: "Transport", icon: Bus },
            { id: "profile", label: "Profile", icon: CheckCircle2 },
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
                                    <div className="bg-blue-600 p-2 rounded-lg">
                                          <TrendingUp className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-xl font-bold text-gray-800">Student Portal</span>
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
                                                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
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
                                                Welcome back, {user?.name}
                                          </p>
                                    </div>
                              </div>

                              <div className="flex items-center gap-4">
                                    <div className="hidden sm:block text-right">
                                          <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                                          <p className="text-xs text-gray-500">Roll No: {user?.rollNo || "N/A"}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                                          {user?.name?.[0]}
                                    </div>
                              </div>
                        </header>

                        {/* Scrollable Main Content */}
                        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6">
                              {/* Stats Overview - Always Visible */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                                    <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                                          <div>
                                                <p className="text-sm font-medium text-gray-500">Attendance</p>
                                                <p className={`text-2xl font-extrabold mt-1 ${getAttendanceColor(parseFloat(attendanceData.stats.percentage || 0)).split(" ")[0]}`}>
                                                      {attendanceData.stats.percentage || 0}%
                                                </p>
                                          </div>
                                          <div className={`p-3 rounded-xl ${getAttendanceColor(parseFloat(attendanceData.stats.percentage || 0)).replace("text-", "bg-opacity-20 bg-")}`}>
                                                <TrendingUp className={`w-6 h-6 ${getAttendanceColor(parseFloat(attendanceData.stats.percentage || 0)).split(" ")[0]}`} />
                                          </div>
                                    </div>
                                    <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                                          <div>
                                                <p className="text-sm font-medium text-gray-500">Exams Taken</p>
                                                <p className="text-2xl font-extrabold text-gray-900 mt-1">{marksData.length}</p>
                                          </div>
                                          <div className="p-3 bg-purple-50 rounded-xl">
                                                <Award className="w-6 h-6 text-purple-600" />
                                          </div>
                                    </div>
                                    <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                                          <div>
                                                <p className="text-sm font-medium text-gray-500">Class</p>
                                                <p className="text-lg font-bold text-gray-900 mt-1">
                                                      {user?.classId?.name || "N/A"}-{user?.classId?.section}
                                                </p>
                                          </div>
                                          <div className="p-3 bg-blue-50 rounded-xl">
                                                <BookOpen className="w-6 h-6 text-blue-600" />
                                          </div>
                                    </div>
                                    <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                                          <div>
                                                <p className="text-sm font-medium text-gray-500">Roll Number</p>
                                                <p className="text-2xl font-extrabold text-gray-900 mt-1">{user?.rollNo || "N/A"}</p>
                                          </div>
                                          <div className="p-3 bg-indigo-50 rounded-xl">
                                                <CheckCircle2 className="w-6 h-6 text-indigo-600" />
                                          </div>
                                    </div>
                              </div>

                              {/* Content Display Area */}
                              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[500px] overflow-hidden">
                                    {loading ? (
                                          <div className="flex justify-center py-20">
                                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                                          </div>
                                    ) : (
                                          <div className="h-full">
                                                {activeTab === "attendance" && (
                                                      <div className="p-6">
                                                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                                  <Calendar className="w-5 h-5 text-blue-600" />
                                                                  Attendance History
                                                            </h3>
                                                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                                                  <table className="min-w-full divide-y divide-gray-200">
                                                                        <thead className="bg-gray-50">
                                                                              <tr>
                                                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Remarks</th>
                                                                              </tr>
                                                                        </thead>
                                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                                              {attendanceData.history.length > 0 ? (
                                                                                    attendanceData.history.map((record) => (
                                                                                          <tr key={record._id} className="hover:bg-gray-50 transition">
                                                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                                                      {new Date(record.date).toLocaleDateString()}
                                                                                                </td>
                                                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                                                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${record.status === "Present" ? "bg-green-100 text-green-800 border-green-200" :
                                                                                                            record.status === "Absent" ? "bg-red-100 text-red-800 border-red-200" :
                                                                                                                  "bg-yellow-100 text-yellow-800 border-yellow-200"
                                                                                                            }`}>
                                                                                                            {record.status}
                                                                                                      </span>
                                                                                                </td>
                                                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                                                      {record.remarks || "-"}
                                                                                                </td>
                                                                                          </tr>
                                                                                    ))
                                                                              ) : (
                                                                                    <tr>
                                                                                          <td colSpan="3" className="px-6 py-12 text-center text-gray-500 font-medium">
                                                                                                No attendance records found
                                                                                          </td>
                                                                                    </tr>
                                                                              )}
                                                                        </tbody>
                                                                  </table>
                                                            </div>
                                                      </div>
                                                )}

                                                {activeTab === "timetable" && (
                                                      <div className="p-6">
                                                            <TimetableView classId={user?.classId?._id || user?.classId} />
                                                      </div>
                                                )}

                                                {activeTab === "report-card" && (
                                                      <div className="p-6">
                                                            <ReportCard />
                                                      </div>
                                                )}

                                                {activeTab === "assignments" && (
                                                      <div className="p-6">
                                                            <AssignmentList />
                                                      </div>
                                                )}

                                                {activeTab === "fees" && (
                                                      <div className="p-6">
                                                            <StudentFeeStatus />
                                                      </div>
                                                )}

                                                {activeTab === "leaves" && (
                                                      <div className="p-6 py-8">
                                                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                                                  <div className="h-full">
                                                                        <LeaveApplication onReferesh={() => setLeaveRefresh(prev => prev + 1)} />
                                                                  </div>
                                                                  <div className="h-full">
                                                                        <LeaveHistory refreshTrigger={leaveRefresh} />
                                                                  </div>
                                                            </div>
                                                      </div>
                                                )}

                                                {activeTab === "profile" && (
                                                      <div className="p-6">
                                                            <ProfileForm />
                                                      </div>
                                                )}

                                                {activeTab === "notices" && (
                                                      <div className="p-6">
                                                            <NoticeBoard />
                                                      </div>
                                                )}

                                                {activeTab === "transport" && (
                                                      <div className="p-6">
                                                            <StudentTransport />
                                                      </div>
                                                )}
                                          </div>
                                    )}
                              </div>
                        </main>
                  </div>
            </div>
      );
}
