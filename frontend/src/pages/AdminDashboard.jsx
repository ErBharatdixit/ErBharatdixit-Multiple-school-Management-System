import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
      LayoutDashboard, Megaphone, Bus, FileText, Clock, ClipboardList, ShieldCheck,
      Briefcase, IndianRupee, Users as UsersIcon, UserCheck,
      School, BookOpen, Plus, Search, Book, Edit, Trash2, CalendarDays, Eye, Menu, X, LogOut, Users, MessageCircle
} from "lucide-react";
import api from "../api";
import AddUserModal from "../components/AddUserModal";
import AddClassModal from "../components/AddClassModal";
import AddSubjectModal from "../components/AddSubjectModal";
import ClassList from "../components/ClassList";
import SubjectList from "../components/SubjectList";
import TimetableManager from "../components/TimetableManager";
import AdminAttendanceDashboard from "../components/AdminAttendanceDashboard";
import AdminVerification from "../components/AdminVerification";
import UserProfileModal from "../components/UserProfileModal";
import ExamManager from "../components/ExamManager";
import StudentReportCardManager from "../components/StudentReportCardManager";
import FeeStructureManager from "../components/FeeStructureManager";
import LeaveManager from "../components/LeaveManager";
import NoticeBoard from "../components/NoticeBoard";
import TransportManager from "../components/transport/TransportManager";
import SalaryManager from "../components/SalaryManager";

export default function AdminDashboard() {
      const { user, logout } = useAuth();
      const navigate = useNavigate();
      const [activeTab, setActiveTab] = useState("teachers");
      const [teachers, setTeachers] = useState([]);
      const [students, setStudents] = useState([]);
      const [staff, setStaff] = useState([]);
      const [parents, setParents] = useState([]);
      const [isSidebarOpen, setIsSidebarOpen] = useState(false);
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [isClassModalOpen, setIsClassModalOpen] = useState(false);
      const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
      const [searchTerm, setSearchTerm] = useState("");
      const [editUser, setEditUser] = useState(null);
      const [editClass, setEditClass] = useState(null);
      const [editSubject, setEditSubject] = useState(null);
      const [viewProfileUserId, setViewProfileUserId] = useState(null);
      const [refreshTrigger, setRefreshTrigger] = useState(0);

      const fetchAllUsers = async () => {
            try {
                  const [teachersRes, studentsRes, staffRes, parentsRes] = await Promise.all([
                        api.get("/users/teachers"),
                        api.get("/users/students"),
                        api.get("/users/staff"),
                        api.get("/users/parents")
                  ]);
                  setTeachers(teachersRes.data);
                  setStudents(studentsRes.data);
                  setStaff(staffRes.data);
                  setParents(parentsRes.data);
            } catch (error) {
                  console.error("Failed to fetch dashboard data:", error);
            }
      };

      useEffect(() => {
            fetchAllUsers();
      }, [refreshTrigger]);

      const handleRefresh = () => {
            setRefreshTrigger(prev => prev + 1);
      };

      const deleteUser = async (id) => {
            if (window.confirm("Are you sure you want to delete this user?")) {
                  try {
                        await api.delete(`/users/${id}`);
                        handleRefresh();
                  } catch (error) {
                        console.error("Failed to delete user:", error);
                        alert(error.response?.data?.message || "Failed to delete user");
                  }
            }
      };

      const handleEditUser = (user) => {
            setEditUser(user);
            setIsModalOpen(true);
      };

      const filteredUsers = (activeTab === "teachers" ? teachers : activeTab === "students" ? students : activeTab === "parents" ? parents : staff).filter(u =>
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const menuItems = [
            { id: "teachers", label: "Teachers", icon: UserCheck },
            { id: "students", label: "Students", icon: UsersIcon },
            { id: "parents", label: "Parents", icon: Users },
            { id: "staff", label: "Staff", icon: Briefcase },
            { id: "classes", label: "Classes", icon: School },
            { id: "subjects", label: "Subjects", icon: BookOpen },
            { id: "exams", label: "Exams", icon: FileText },
            { id: "fees", label: "Fees", icon: IndianRupee },
            { id: "payroll", label: "Payroll", icon: IndianRupee },
            { id: "leaves", label: "Leaves", icon: CalendarDays },
            { id: "notices", label: "Notices", icon: Megaphone },
            { id: "transport", label: "Transport", icon: Bus },
            { id: "report-cards", label: "Report Cards", icon: FileText },
            { id: "timetable", label: "Timetable", icon: Clock },
            { id: "attendance", label: "Attendance", icon: ClipboardList },
            { id: "verification", label: "Verification", icon: ShieldCheck },
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
                                          <LayoutDashboard className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-xl font-bold text-gray-800">Admin Portal</span>
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
                                                      setSearchTerm("");
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
                                                Welcome, {user?.name}
                                          </p>
                                    </div>
                              </div>

                              <div className="flex items-center gap-4">
                                    <div className="hidden sm:block text-right">
                                          <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                                          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                                          {user?.name?.[0]}
                                    </div>
                              </div>
                        </header>

                        {/* Scrollable Main Content */}
                        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6">
                              {/* Stats Overview */}
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                                          <div>
                                                <p className="text-sm font-medium text-gray-500">Total Teachers</p>
                                                <p className="text-2xl font-extrabold text-gray-900 mt-1">{teachers.length}</p>
                                          </div>
                                          <div className="p-3 bg-blue-50 rounded-xl">
                                                <UserCheck className="w-6 h-6 text-blue-600" />
                                          </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                                          <div>
                                                <p className="text-sm font-medium text-gray-500">Total Students</p>
                                                <p className="text-2xl font-extrabold text-gray-900 mt-1">{students.length}</p>
                                          </div>
                                          <div className="p-3 bg-green-50 rounded-xl">
                                                <UsersIcon className="w-6 h-6 text-green-600" />
                                          </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                                          <div>
                                                <p className="text-sm font-medium text-gray-500">Total Staff</p>
                                                <p className="text-2xl font-extrabold text-gray-900 mt-1">{staff.length}</p>
                                          </div>
                                          <div className="p-3 bg-purple-50 rounded-xl">
                                                <Briefcase className="w-6 h-6 text-purple-600" />
                                          </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                                          <div>
                                                <p className="text-sm font-medium text-gray-500">Total Parents</p>
                                                <p className="text-2xl font-extrabold text-gray-900 mt-1">{parents.length}</p>
                                          </div>
                                          <div className="p-3 bg-orange-50 rounded-xl">
                                                <Users className="w-6 h-6 text-orange-600" />
                                          </div>
                                    </div>
                                    {/* Additional stats specific to active tab could go here if implemented, or generic stats */}
                              </div>

                              {/* Action Bar */}
                              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
                                    {(activeTab === "teachers" || activeTab === "students" || activeTab === "staff" || activeTab === "parents") && (
                                          <div className="relative w-full sm:w-96">
                                                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                <input
                                                      type="text"
                                                      placeholder={`Search ${activeTab}...`}
                                                      value={searchTerm}
                                                      onChange={(e) => setSearchTerm(e.target.value)}
                                                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition"
                                                />
                                          </div>
                                    )}

                                    {/* Action Buttons Spacer */}
                                    <div className="flex-1"></div>

                                    {activeTab !== "timetable" && activeTab !== "exams" && activeTab !== "fees" && activeTab !== "leaves" && activeTab !== "notices" && activeTab !== "transport" && activeTab !== "report-cards" && activeTab !== "attendance" && activeTab !== "verification" && activeTab !== "payroll" && (
                                          <button
                                                onClick={() => {
                                                      setEditUser(null);
                                                      setEditClass(null);
                                                      setEditSubject(null);
                                                      if (activeTab === "classes") setIsClassModalOpen(true);
                                                      else if (activeTab === "subjects") setIsSubjectModalOpen(true);
                                                      else setIsModalOpen(true);
                                                }}
                                                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-sm hover:shadow-md whitespace-nowrap"
                                          >
                                                <Plus className="w-5 h-5" />
                                                Add {activeTab === "staff" ? "Staff" : activeTab === "parents" ? "Parent" : activeTab.slice(0, -1).replace(/^\w/, c => c.toUpperCase())}
                                          </button>
                                    )}
                              </div>

                              {/* Content Render */}
                              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[500px]">
                                    <div className="p-6">
                                          {activeTab === "classes" ? (
                                                <ClassList
                                                      refreshTrigger={refreshTrigger}
                                                      onEdit={(cls) => {
                                                            setEditClass(cls);
                                                            setIsClassModalOpen(true);
                                                      }}
                                                />
                                          ) : activeTab === "subjects" ? (
                                                <SubjectList
                                                      refreshTrigger={refreshTrigger}
                                                      onEdit={(sub) => {
                                                            setEditSubject(sub);
                                                            setIsSubjectModalOpen(true);
                                                      }}
                                                />
                                          ) : activeTab === "exams" ? (
                                                <ExamManager />
                                          ) : activeTab === "fees" ? (
                                                <FeeStructureManager />
                                          ) : activeTab === "payroll" ? (
                                                <SalaryManager />
                                          ) : activeTab === "leaves" ? (
                                                <LeaveManager />
                                          ) : activeTab === "notices" ? (
                                                <NoticeBoard />
                                          ) : activeTab === "transport" ? (
                                                <TransportManager />
                                          ) : activeTab === "report-cards" ? (
                                                <StudentReportCardManager />
                                          ) : activeTab === "timetable" ? (
                                                <TimetableManager />
                                          ) : activeTab === "attendance" ? (
                                                <AdminAttendanceDashboard />
                                          ) : activeTab === "verification" ? (
                                                <AdminVerification />
                                          ) : (
                                                /* User Tables */
                                                <div className="overflow-x-auto rounded-xl border border-gray-100">
                                                      <table className="min-w-full divide-y divide-gray-200">
                                                            <thead className="bg-gray-50">
                                                                  <tr>
                                                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                                                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                                                                        {activeTab === "teachers" ? (
                                                                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</th>
                                                                        ) : activeTab === "staff" ? (
                                                                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Designation</th>
                                                                        ) : activeTab === "parents" ? (
                                                                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Children</th>
                                                                        ) : (
                                                                              <>
                                                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Class</th>
                                                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Roll No</th>
                                                                              </>
                                                                        )}
                                                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                                                  </tr>
                                                            </thead>
                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                                  {filteredUsers.length > 0 ? (
                                                                        filteredUsers.map((user) => (
                                                                              <tr key={user._id} className="hover:bg-gray-50 transition duration-150">
                                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                                          <div className="flex items-center">
                                                                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                                                                      {user.name.charAt(0)}
                                                                                                </div>
                                                                                                <div className="ml-4">
                                                                                                      <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                                                                                                </div>
                                                                                          </div>
                                                                                    </td>
                                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.phone || "-"}</td>
                                                                                    {activeTab === "teachers" ? (
                                                                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.subject || "-"}</td>
                                                                                    ) : activeTab === "staff" ? (
                                                                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.designation || "-"}</td>
                                                                                    ) : activeTab === "parents" ? (
                                                                                          <td className="px-6 py-4 text-sm text-gray-600">
                                                                                                <div className="flex flex-wrap gap-1">
                                                                                                      {user.children?.length > 0 ? user.children.map(child => (
                                                                                                            <span key={child._id} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                                                                                                                  {child.name} ({child.classId?.name || "?"})
                                                                                                            </span>
                                                                                                      )) : <span className="text-gray-400">No linked students</span>}
                                                                                                </div>
                                                                                          </td>
                                                                                    ) : (
                                                                                          <>
                                                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                                                                      {user.classId?.name ? <span className="px-2 py-1 bg-gray-100 rounded-md text-gray-700 font-medium">{user.classId.name} - {user.classId.section}</span> : "-"}
                                                                                                </td>
                                                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                                                                                      {user.rollNo || "-"}
                                                                                                </td>
                                                                                          </>
                                                                                    )}
                                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">Active</span>
                                                                                    </td>
                                                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                                          <div className="flex justify-end gap-2">
                                                                                                <button
                                                                                                      onClick={() => setViewProfileUserId(user._id)}
                                                                                                      className="text-white bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition shadow-sm"
                                                                                                      title="View Profile"
                                                                                                >
                                                                                                      <Eye className="w-4 h-4" />
                                                                                                </button>

                                                                                                <button
                                                                                                      onClick={() => handleEditUser(user)}
                                                                                                      className="text-white bg-indigo-600 hover:bg-indigo-700 p-2 rounded-lg transition shadow-sm"
                                                                                                      title="Edit"
                                                                                                >
                                                                                                      <Edit className="w-4 h-4" />
                                                                                                </button>
                                                                                                <button
                                                                                                      onClick={() => deleteUser(user._id)}
                                                                                                      className="text-white bg-red-600 hover:bg-red-700 p-2 rounded-lg transition shadow-sm"
                                                                                                      title="Delete"
                                                                                                >
                                                                                                      <Trash2 className="w-4 h-4" />
                                                                                                </button>
                                                                                          </div>
                                                                                    </td>
                                                                              </tr>
                                                                        ))
                                                                  ) : (
                                                                        <tr>
                                                                              <td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-medium">No {activeTab} found</td>
                                                                        </tr>
                                                                  )}
                                                            </tbody>
                                                      </table>
                                                </div>
                                          )}
                                    </div>
                              </div>
                        </main>

                        <AddUserModal
                              isOpen={isModalOpen}
                              onClose={() => { setIsModalOpen(false); setEditUser(null); }}
                              role={activeTab === "teachers" ? "teacher" : activeTab === "staff" ? "staff" : activeTab === "parents" ? "parent" : "student"}
                              onUserAdded={handleRefresh}
                              initialData={editUser}
                        />

                        <AddClassModal
                              isOpen={isClassModalOpen}
                              onClose={() => { setIsClassModalOpen(false); setEditClass(null); }}
                              onClassAdded={handleRefresh}
                              initialData={editClass}
                        />

                        <AddSubjectModal
                              isOpen={isSubjectModalOpen}
                              onClose={() => { setIsSubjectModalOpen(false); setEditSubject(null); }}
                              onSubjectAdded={handleRefresh}
                              initialData={editSubject}
                        />

                        <UserProfileModal
                              isOpen={!!viewProfileUserId}
                              onClose={() => setViewProfileUserId(null)}
                              userId={viewProfileUserId}
                        />
                  </div>
            </div>
      );
}
