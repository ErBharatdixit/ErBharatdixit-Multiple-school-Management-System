import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
      LogOut, Calendar, Award, BookOpen, TrendingUp, Clock,
      IndianRupee, Megaphone, Bus, Menu, X, Users, User, MessageCircle
} from "lucide-react";
import api from "../api";

export default function ParentDashboard() {
      const { user, logout } = useAuth();
      const navigate = useNavigate();
      const [children, setChildren] = useState([]);
      const [selectedChild, setSelectedChild] = useState(null);
      const [dashboardData, setDashboardData] = useState(null);
      const [loadingChildren, setLoadingChildren] = useState(true);
      const [loadingDashboard, setLoadingDashboard] = useState(false);
      const [error, setError] = useState(null);
      const [isSidebarOpen, setIsSidebarOpen] = useState(false);
      const [activeTab, setActiveTab] = useState("overview");

      useEffect(() => {
            fetchChildren();
      }, []);

      useEffect(() => {
            if (selectedChild) {
                  fetchChildDashboard(selectedChild._id);
            }
      }, [selectedChild]);

      const fetchChildren = async () => {
            try {
                  setLoadingChildren(true);
                  const { data } = await api.get("/parent/children");
                  setChildren(data);
                  if (data.length > 0) {
                        setSelectedChild(data[0]);
                  }
            } catch (error) {
                  console.error("Failed to fetch children:", error);
                  setError("Failed to load linked students.");
            } finally {
                  setLoadingChildren(false);
            }
      };

      const fetchChildDashboard = async (studentId) => {
            try {
                  setLoadingDashboard(true);
                  setError(null);
                  const { data } = await api.get(`/parent/child/${studentId}/dashboard`);
                  setDashboardData(data);
            } catch (error) {
                  console.error("Failed to fetch child dashboard:", error);
                  setError("Failed to load dashboard data. Please try again.");
            } finally {
                  setLoadingDashboard(false);
            }
      };

      const menuItems = [
            { id: "overview", label: "Overview", icon: TrendingUp },
            { id: "attendance", label: "Attendance", icon: Calendar },
            { id: "marks", label: "Marks", icon: Award },
            { id: "fees", label: "Fees", icon: IndianRupee },
            { id: "transport", label: "Transport", icon: Bus },
            { id: "messages", label: "Messages", icon: MessageCircle },
      ];

      if (loadingChildren) {
            return (
                  <div className="min-h-screen flex items-center justify-center bg-gray-50">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
            );
      }

      if (!children.length) {
            return (
                  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md">
                              <div className="bg-yellow-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                    <User className="w-8 h-8 text-yellow-600" />
                              </div>
                              <h2 className="text-xl font-bold text-gray-900 mb-2">No Students Linked</h2>
                              <p className="text-gray-500 mb-6">
                                    There are no students linked to your parent account. Please contact the school administration.
                              </p>
                              <button onClick={logout} className="text-red-600 font-medium hover:text-red-700">
                                    Logout
                              </button>
                        </div>
                  </div>
            );
      }

      return (
            <div className="flex h-screen bg-gray-50">
                  {/* Mobile Overlay */}
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
                                          <Users className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-xl font-bold text-gray-800">Parent Portal</span>
                              </div>
                              <button className="md:hidden text-gray-500 hover:text-gray-700" onClick={() => setIsSidebarOpen(false)}>
                                    <X className="w-6 h-6" />
                              </button>
                        </div>

                        {/* Child Selector */}
                        {children.length > 1 && (
                              <div className="p-4 border-b border-gray-100">
                                    <label className="block text-sm font-medium text-gray-500 mb-2">Switch Profile</label>
                                    <div className="space-y-2">
                                          {children.map(child => (
                                                <button
                                                      key={child._id}
                                                      onClick={() => setSelectedChild(child)}
                                                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedChild?._id === child._id
                                                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                                                            : "hover:bg-gray-50 text-gray-700 border border-transparent"
                                                            }`}
                                                >
                                                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                                            {child.name[0]}
                                                      </div>
                                                      <div className="text-left overflow-hidden">
                                                            <p className="font-semibold truncate">{child.name}</p>
                                                            <p className="text-xs text-gray-500 truncate">{child.classId?.name || "Class N/A"}</p>
                                                      </div>
                                                </button>
                                          ))}
                                    </div>
                              </div>
                        )}

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

                  {/* Main Content */}
                  <div className="flex-1 flex flex-col h-screen overflow-hidden">
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
                                                Parent Dashboard
                                          </h1>
                                          <p className="text-sm text-gray-500 hidden sm:block">
                                                Welcome, {user?.name} {selectedChild && `• Viewing ${selectedChild.name}`}
                                          </p>
                                    </div>
                              </div>
                        </header>

                        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6">
                              {!dashboardData ? (
                                    <div className="flex justify-center py-20">
                                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                                    </div>
                              ) : (
                                    <>
                                          {/* Quick Stats */}
                                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                                      <p className="text-sm font-medium text-gray-500">Attendance</p>
                                                      <div className="flex items-end justify-between mt-2">
                                                            <p className="text-2xl font-extrabold text-gray-900">
                                                                  {dashboardData.attendance.stats.percentage}%
                                                            </p>
                                                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${parseFloat(dashboardData.attendance.stats.percentage) >= 75
                                                                  ? "bg-green-100 text-green-700"
                                                                  : "bg-red-100 text-red-700"
                                                                  }`}>
                                                                  {dashboardData.attendance.stats.present}/{dashboardData.attendance.stats.total} Days
                                                            </span>
                                                      </div>
                                                </div>

                                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                                      <p className="text-sm font-medium text-gray-500">Class Rank</p>
                                                      <div className="flex items-end justify-between mt-2">
                                                            <p className="text-2xl font-extrabold text-gray-900">N/A</p> {/* Placeholder */}
                                                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-bold">Top 10%</span>
                                                      </div>
                                                </div>

                                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                                      <p className="text-sm font-medium text-gray-500">Recent Grade</p>
                                                      <div className="flex items-end justify-between mt-2">
                                                            <p className="text-2xl font-extrabold text-gray-900">
                                                                  {dashboardData.marks.length > 0 ? dashboardData.marks[0].grade : "N/A"}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                  {dashboardData.marks.length > 0 ? dashboardData.marks[0].subjectId.name : "-"}
                                                            </p>
                                                      </div>
                                                </div>

                                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                                      <p className="text-sm font-medium text-gray-500">Fees Due</p>
                                                      <div className="flex items-end justify-between mt-2">
                                                            <p className="text-2xl font-extrabold text-gray-900">₹{dashboardData.fees?.stats?.due?.toLocaleString() || 0}</p>
                                                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${dashboardData.fees?.stats?.status === "Paid"
                                                                  ? "bg-green-100 text-green-700"
                                                                  : dashboardData.fees?.stats?.status === "Partial"
                                                                        ? "bg-yellow-100 text-yellow-700"
                                                                        : "bg-red-100 text-red-700"
                                                                  }`}>
                                                                  {dashboardData.fees?.stats?.status || "No Info"}
                                                            </span>
                                                      </div>
                                                </div>
                                          </div>

                                          {/* Detailed Sections */}
                                          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[400px] p-6">
                                                {activeTab === "overview" && (
                                                      <div className="space-y-6">
                                                            <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                                                            {/* Combine recent marks and attendance into a feed? For now keeping it simple */}
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                  <div className="border rounded-xl p-4">
                                                                        <h4 className="font-semibold text-gray-800 mb-4">Recent Attendance</h4>
                                                                        <div className="space-y-3">
                                                                              {dashboardData.attendance.recent.map(record => (
                                                                                    <div key={record._id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0">
                                                                                          <span className="text-gray-600">{new Date(record.date).toLocaleDateString()}</span>
                                                                                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${record.status === 'present' ? 'bg-green-100 text-green-700' :
                                                                                                record.status === 'absent' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                                                                }`}>
                                                                                                {record.status}
                                                                                          </span>
                                                                                    </div>
                                                                              ))}
                                                                              {dashboardData.attendance.recent.length === 0 && <p className="text-gray-500 text-sm">No recent records</p>}
                                                                        </div>
                                                                  </div>

                                                                  <div className="border rounded-xl p-4">
                                                                        <h4 className="font-semibold text-gray-800 mb-4">Recent Marks</h4>
                                                                        <div className="space-y-3">
                                                                              {dashboardData.marks.map(mark => (
                                                                                    <div key={mark._id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0">
                                                                                          <div>
                                                                                                <p className="font-medium text-gray-900">{mark.subjectId?.name || "Unknown Subject"}</p>
                                                                                                <p className="text-xs text-gray-500 capitalize">{mark.examType}</p>
                                                                                          </div>
                                                                                          <div className="text-right">
                                                                                                <p className="font-bold text-gray-900">{mark.marksObtained}/{mark.totalMarks}</p>
                                                                                                <p className="text-xs text-gray-500">{mark.grade}</p>
                                                                                          </div>
                                                                                    </div>
                                                                              ))}
                                                                              {dashboardData.marks.length === 0 && <p className="text-gray-500 text-sm">No recent marks</p>}
                                                                        </div>
                                                                  </div>
                                                            </div>
                                                      </div>
                                                )}

                                                {activeTab === "attendance" && (
                                                      <div>
                                                            <div className="flex justify-between items-center mb-6">
                                                                  <h3 className="text-lg font-bold text-gray-900">Attendance Overview</h3>
                                                                  <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full font-medium">
                                                                        {dashboardData.attendance.stats.percentage}% Attendance
                                                                  </span>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                                                  <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                                                                        <p className="text-sm text-green-600 font-medium">Present</p>
                                                                        <p className="text-2xl font-bold text-green-700">{dashboardData.attendance.stats.present}</p>
                                                                  </div>
                                                                  <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                                                        <p className="text-sm text-red-600 font-medium">Absent</p>
                                                                        <p className="text-2xl font-bold text-red-700">{dashboardData.attendance.stats.absent}</p>
                                                                  </div>
                                                                  <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                                                                        <p className="text-sm text-yellow-600 font-medium">Late</p>
                                                                        <p className="text-2xl font-bold text-yellow-700">{dashboardData.attendance.stats.late}</p>
                                                                  </div>
                                                            </div>

                                                            <h4 className="font-semibold text-gray-800 mb-4">Recent History</h4>
                                                            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                                                                  <table className="w-full text-left">
                                                                        <thead className="bg-gray-50 border-b border-gray-100">
                                                                              <tr>
                                                                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                                                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                                                              </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y divide-gray-100">
                                                                              {dashboardData.attendance.recent.map((record) => (
                                                                                    <tr key={record._id} className="hover:bg-gray-50">
                                                                                          <td className="p-4 text-sm text-gray-700">
                                                                                                {new Date(record.date).toLocaleDateString(undefined, {
                                                                                                      weekday: 'long',
                                                                                                      year: 'numeric',
                                                                                                      month: 'long',
                                                                                                      day: 'numeric'
                                                                                                })}
                                                                                          </td>
                                                                                          <td className="p-4">
                                                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${record.status === 'present' ? 'bg-green-100 text-green-700' :
                                                                                                      record.status === 'absent' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                                                                      }`}>
                                                                                                      {record.status}
                                                                                                </span>
                                                                                          </td>
                                                                                    </tr>
                                                                              ))}
                                                                              {dashboardData.attendance.recent.length === 0 && (
                                                                                    <tr>
                                                                                          <td colSpan="2" className="p-4 text-center text-gray-500 text-sm">No attendance records found</td>
                                                                                    </tr>
                                                                              )}
                                                                        </tbody>
                                                                  </table>
                                                            </div>
                                                      </div>
                                                )}

                                                {activeTab === "marks" && (
                                                      <div>
                                                            <h3 className="text-lg font-bold text-gray-900 mb-6">Academic Performance</h3>
                                                            <div className="space-y-4">
                                                                  {dashboardData.marks.map((mark) => (
                                                                        <div key={mark._id} className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                                              <div>
                                                                                    <div className="flex items-center gap-2 mb-1">
                                                                                          <span className="font-bold text-gray-900 text-lg">{mark.subjectId?.name || "Subject"}</span>
                                                                                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">{mark.examType}</span>
                                                                                    </div>
                                                                                    <p className="text-sm text-gray-500">
                                                                                          Recorded on {new Date(mark.createdAt).toLocaleDateString()}
                                                                                    </p>
                                                                              </div>
                                                                              <div className="flex items-center gap-6">
                                                                                    <div className="text-right">
                                                                                          <p className="text-sm text-gray-500">Score</p>
                                                                                          <p className="font-bold text-gray-900">{mark.marksObtained} / {mark.totalMarks}</p>
                                                                                    </div>
                                                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${['A', 'A+'].includes(mark.grade) ? 'bg-green-100 text-green-700' :
                                                                                          ['B', 'C'].includes(mark.grade) ? 'bg-blue-100 text-blue-700' :
                                                                                                'bg-orange-100 text-orange-700'
                                                                                          }`}>
                                                                                          {mark.grade}
                                                                                    </div>
                                                                              </div>
                                                                        </div>
                                                                  ))}
                                                                  {dashboardData.marks.length === 0 && (
                                                                        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                                              <Award className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                                                              <p className="text-gray-500">No marks recorded yet.</p>
                                                                        </div>
                                                                  )}
                                                            </div>
                                                      </div>
                                                )}

                                                {activeTab === "fees" && (
                                                      <div>
                                                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                                                                  <div>
                                                                        <h3 className="text-lg font-bold text-gray-900">Fee Status</h3>
                                                                        <p className="text-sm text-gray-500">Academic Year 2024-2025</p>
                                                                  </div>
                                                                  <div className="flex gap-3">
                                                                        <div className="bg-blue-50 px-4 py-2 rounded-xl text-right">
                                                                              <p className="text-xs text-blue-600 font-semibold uppercase">Total</p>
                                                                              <p className="font-bold text-blue-900">₹{dashboardData.fees?.stats?.total?.toLocaleString()}</p>
                                                                        </div>
                                                                        <div className="bg-red-50 px-4 py-2 rounded-xl text-right">
                                                                              <p className="text-xs text-red-600 font-semibold uppercase">Due</p>
                                                                              <p className="font-bold text-red-900">₹{dashboardData.fees?.stats?.due?.toLocaleString()}</p>
                                                                        </div>
                                                                  </div>
                                                            </div>

                                                            <h4 className="font-semibold text-gray-800 mb-4">Recent Payments</h4>
                                                            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                                                                  <table className="w-full text-left">
                                                                        <thead className="bg-gray-50 border-b border-gray-100">
                                                                              <tr>
                                                                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                                                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                                                                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Method</th>
                                                                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                                                              </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y divide-gray-100">
                                                                              {dashboardData.fees?.recentPayments?.map((payment) => (
                                                                                    <tr key={payment._id} className="hover:bg-gray-50">
                                                                                          <td className="p-4 text-sm text-gray-700">
                                                                                                {new Date(payment.paymentDate).toLocaleDateString()}
                                                                                          </td>
                                                                                          <td className="p-4 font-medium text-gray-900">
                                                                                                ₹{payment.amount.toLocaleString()}
                                                                                          </td>
                                                                                          <td className="p-4 text-sm text-gray-600">
                                                                                                {payment.method}
                                                                                          </td>
                                                                                          <td className="p-4">
                                                                                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                                                                                      {payment.status}
                                                                                                </span>
                                                                                          </td>
                                                                                    </tr>
                                                                              ))}
                                                                              {(!dashboardData.fees?.recentPayments || dashboardData.fees.recentPayments.length === 0) && (
                                                                                    <tr>
                                                                                          <td colSpan="4" className="p-4 text-center text-gray-500 text-sm">No recent payments</td>
                                                                                    </tr>
                                                                              )}
                                                                        </tbody>
                                                                  </table>
                                                            </div>
                                                      </div>
                                                )}

                                                {activeTab === "transport" && (
                                                      <div>
                                                            <h3 className="text-lg font-bold text-gray-900 mb-6">Transport Details</h3>
                                                            {dashboardData.transport ? (
                                                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                                                              <div className="flex items-center gap-4 mb-6">
                                                                                    <div className="bg-white p-3 rounded-full shadow-sm">
                                                                                          <Bus className="w-8 h-8 text-blue-600" />
                                                                                    </div>
                                                                                    <div>
                                                                                          <p className="text-sm text-gray-500">Assigned Route</p>
                                                                                          <h4 className="text-xl font-bold text-gray-900">{dashboardData.transport.routeId?.routeName || "N/A"}</h4>
                                                                                    </div>
                                                                              </div>
                                                                              <div className="space-y-4">
                                                                                    <div className="flex justify-between border-b border-blue-100 pb-2">
                                                                                          <span className="text-gray-600">Stop Name</span>
                                                                                          <span className="font-medium text-gray-900">
                                                                                                {/* Logic to find stop name from route stops array if stopId matches */}
                                                                                                {dashboardData.transport.routeId?.stops?.find(s => s._id === dashboardData.transport.stopId)?.stopName || "N/A"}
                                                                                          </span>
                                                                                    </div>
                                                                                    <div className="flex justify-between border-b border-blue-100 pb-2">
                                                                                          <span className="text-gray-600">Start Point</span>
                                                                                          <span className="font-medium text-gray-900">{dashboardData.transport.routeId?.startPoint}</span>
                                                                                    </div>
                                                                                    <div className="flex justify-between border-b border-blue-100 pb-2">
                                                                                          <span className="text-gray-600">End Point</span>
                                                                                          <span className="font-medium text-gray-900">{dashboardData.transport.routeId?.endPoint}</span>
                                                                                    </div>
                                                                              </div>
                                                                        </div>
                                                                        {/* Driver info if vehicle linked */}
                                                                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                                                                              <h4 className="font-bold text-gray-900 mb-4">Vehicle & Driver</h4>
                                                                              {dashboardData.transport.routeId?.vehicleId ? (
                                                                                    <div className="space-y-4">
                                                                                          <div className="flex items-center gap-4">
                                                                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                                                                      {dashboardData.transport.routeId.vehicleId.driverName ? dashboardData.transport.routeId.vehicleId.driverName[0] : 'D'}
                                                                                                </div>
                                                                                                <div>
                                                                                                      <p className="font-bold text-gray-900">{dashboardData.transport.routeId.vehicleId.driverName}</p>
                                                                                                      <p className="text-xs text-gray-500">Driver</p>
                                                                                                </div>
                                                                                          </div>
                                                                                          <div className="flex justify-between border-b border-gray-200 pb-2">
                                                                                                <span className="text-gray-600">Phone</span>
                                                                                                <span className="font-medium text-gray-900">{dashboardData.transport.routeId.vehicleId.driverPhone}</span>
                                                                                          </div>
                                                                                          <div className="flex justify-between border-b border-gray-200 pb-2">
                                                                                                <span className="text-gray-600">Vehicle No</span>
                                                                                                <span className="font-medium text-gray-900">{dashboardData.transport.routeId.vehicleId.vehicleNumber}</span>
                                                                                          </div>
                                                                                    </div>
                                                                              ) : (
                                                                                    <p className="text-gray-500 italic">No vehicle details assigned to this route yet.</p>
                                                                              )}
                                                                        </div>
                                                                  </div>
                                                            ) : (
                                                                  <p className="text-gray-500">No transport assigned.</p>
                                                            )}
                                                      </div>
                                                )}
                                          </div>
                                    </>
                              )}
                        </main>
                  </div>
            </div>
      );
}
