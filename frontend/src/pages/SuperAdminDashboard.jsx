import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { School, Users, BookOpen, LogOut, Plus, LayoutDashboard } from "lucide-react";
import api from "../api";
import AddSchoolModal from "../components/AddSchoolModal";
import EditSchoolModal from "../components/EditSchoolModal";
import SchoolList from "../components/SchoolList";

export default function SuperAdminDashboard() {
      const { user, logout } = useAuth();
      const [stats, setStats] = useState({
            schools: 0,
            users: 0,
            classes: 0
      });
      const [isAddSchoolModalOpen, setIsAddSchoolModalOpen] = useState(false);
      const [isEditSchoolModalOpen, setIsEditSchoolModalOpen] = useState(false);
      const [selectedSchool, setSelectedSchool] = useState(null);
      const [refreshTrigger, setRefreshTrigger] = useState(0);

      const fetchStats = async () => {
            try {
                  const statsRes = await api.get("/schools/stats");
                  setStats(statsRes.data);
            } catch (error) {
                  console.error("Failed to fetch stats:", error);
            }
      };

      useEffect(() => {
            fetchStats();
      }, [refreshTrigger]);

      const handleSchoolAdded = () => {
            setRefreshTrigger(prev => prev + 1);
      };

      const handleEditSchool = (school) => {
            setSelectedSchool(school);
            setIsEditSchoolModalOpen(true);
      };

      const handleSchoolUpdated = () => {
            setRefreshTrigger(prev => prev + 1);
      };

      return (
            <div className="min-h-screen bg-gray-50 bg-[url('/src/assets/school_corridor.png')] bg-cover bg-fixed bg-center">
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] fixed"></div>

                  {/* Header */}
                  <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-30 shadow-lg">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg text-white backdrop-blur-sm">
                                          <LayoutDashboard className="w-6 h-6" />
                                    </div>
                                    <div>
                                          <h1 className="text-xl font-bold text-white tracking-tight">Super Admin Dashboard</h1>
                                          <p className="text-xs text-blue-100 font-medium">Manage your multi-school system</p>
                                    </div>
                              </div>
                              <div className="flex items-center gap-4">
                                    <span className="text-sm text-white/90 hidden sm:block font-medium">Welcome, {user?.name}</span>
                                    <button
                                          onClick={logout}
                                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-100 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition backdrop-blur-sm"
                                    >
                                          <LogOut className="w-4 h-4" />
                                          Logout
                                    </button>
                              </div>
                        </div>
                  </header>

                  {/* Main Content */}
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="bg-gradient-to-br from-blue-600/90 to-blue-700/90 p-6 rounded-2xl shadow-xl border border-white/10 backdrop-blur-sm text-white transform hover:scale-105 transition duration-300">
                                    <div className="flex justify-between items-start">
                                          <div>
                                                <p className="text-blue-100 text-sm font-medium mb-1">Total Schools</p>
                                                <h3 className="text-4xl font-extrabold tracking-tight">{stats.schools}</h3>
                                          </div>
                                          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md shadow-inner">
                                                <School className="w-8 h-8 text-white" />
                                          </div>
                                    </div>
                              </div>

                              <div className="bg-white/10 p-6 rounded-2xl shadow-xl border border-white/20 backdrop-blur-md transform hover:scale-105 transition duration-300">
                                    <div className="flex justify-between items-start">
                                          <div>
                                                <p className="text-blue-100 text-sm font-medium mb-1">Total Users</p>
                                                <h3 className="text-4xl font-extrabold text-white tracking-tight">{stats.users}</h3>
                                          </div>
                                          <div className="p-3 bg-green-500/20 rounded-xl backdrop-blur-md border border-green-500/30">
                                                <Users className="w-8 h-8 text-green-300" />
                                          </div>
                                    </div>
                              </div>

                              <div className="bg-white/10 p-6 rounded-2xl shadow-xl border border-white/20 backdrop-blur-md transform hover:scale-105 transition duration-300">
                                    <div className="flex justify-between items-start">
                                          <div>
                                                <p className="text-blue-100 text-sm font-medium mb-1">Total Classes</p>
                                                <h3 className="text-4xl font-extrabold text-white tracking-tight">{stats.classes}</h3>
                                          </div>
                                          <div className="p-3 bg-purple-500/20 rounded-xl backdrop-blur-md border border-purple-500/30">
                                                <BookOpen className="w-8 h-8 text-purple-300" />
                                          </div>
                                    </div>
                              </div>
                        </div>

                        {/* Schools Section */}
                        <div className="space-y-6">
                              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3 drop-shadow-md">
                                          <School className="w-6 h-6 text-blue-300" />
                                          Registered Schools
                                    </h2>
                                    <button
                                          onClick={() => setIsAddSchoolModalOpen(true)}
                                          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition shadow-lg shadow-blue-600/40 border border-white/10 backdrop-blur-sm"
                                    >
                                          <Plus className="w-5 h-5" />
                                          Add New School
                                    </button>
                              </div>

                              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 overflow-hidden">
                                    <SchoolList
                                          refreshTrigger={refreshTrigger}
                                          onEdit={handleEditSchool}
                                    />
                              </div>
                        </div>
                  </main>

                  {/* Modals */}
                  <AddSchoolModal
                        isOpen={isAddSchoolModalOpen}
                        onClose={() => setIsAddSchoolModalOpen(false)}
                        onSchoolAdded={handleSchoolAdded}
                  />

                  <EditSchoolModal
                        isOpen={isEditSchoolModalOpen}
                        onClose={() => setIsEditSchoolModalOpen(false)}
                        school={selectedSchool}
                        onSchoolUpdated={handleSchoolUpdated}
                  />
            </div>
      );
}
