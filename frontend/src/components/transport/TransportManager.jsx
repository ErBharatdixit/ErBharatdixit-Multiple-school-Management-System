
import { useState, useEffect } from "react";
import { Bus, MapPin, Activity } from "lucide-react";
import api from "../../api";
import VehicleList from "./VehicleList";
import RouteManager from "./RouteManager";
import TransportAssignment from "./TransportAssignment";

export default function TransportManager() {
      const [activeTab, setActiveTab] = useState("vehicles");
      const [stats, setStats] = useState({
            totalVehicles: 0,
            totalRoutes: 0,
            activeVehicles: 0
      });
      const [loading, setLoading] = useState(true);

      useEffect(() => {
            fetchStats();
      }, []);

      const fetchStats = async () => {
            try {
                  const [vehiclesRes, routesRes] = await Promise.all([
                        api.get("/transport/vehicles"),
                        api.get("/transport/routes")
                  ]);

                  setStats({
                        totalVehicles: vehiclesRes.data.length,
                        totalRoutes: routesRes.data.length,
                        activeVehicles: vehiclesRes.data.filter(v => v.status === 'Active').length
                  });
            } catch (error) {
                  console.error("Failed to fetch transport stats:", error);
            } finally {
                  setLoading(false);
            }
      };

      return (
            <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                              <div>
                                    <p className="text-sm font-medium text-gray-500">Total Vehicles</p>
                                    <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalVehicles}</p>
                              </div>
                              <div className="p-3 bg-blue-50 rounded-xl">
                                    <Bus className="w-6 h-6 text-blue-600" />
                              </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                              <div>
                                    <p className="text-sm font-medium text-gray-500">Active Routes</p>
                                    <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalRoutes}</p>
                              </div>
                              <div className="p-3 bg-green-50 rounded-xl">
                                    <MapPin className="w-6 h-6 text-green-600" />
                              </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                              <div>
                                    <p className="text-sm font-medium text-gray-500">Operational Fleet</p>
                                    <p className="text-3xl font-bold text-purple-600 mt-2">{stats.activeVehicles}</p>
                              </div>
                              <div className="p-3 bg-purple-50 rounded-xl">
                                    <Activity className="w-6 h-6 text-purple-600" />
                              </div>
                        </div>
                  </div>

                  {/* Navigation Tabs and Content */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="flex border-b border-gray-200">
                              <button
                                    className={`flex-1 py-4 text-center font-bold text-sm transition-colors ${activeTab === "vehicles" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                                    onClick={() => setActiveTab("vehicles")}
                              >
                                    Vehicle List
                              </button>
                              <button
                                    className={`flex-1 py-4 text-center font-bold text-sm transition-colors ${activeTab === "routes" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                                    onClick={() => setActiveTab("routes")}
                              >
                                    Route Manager
                              </button>
                              <button
                                    className={`flex-1 py-4 text-center font-bold text-sm transition-colors ${activeTab === "assignment" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                                    onClick={() => setActiveTab("assignment")}
                              >
                                    Student Assignment
                              </button>
                        </div>

                        <div className="p-6">
                              {activeTab === "vehicles" && <VehicleList stats={stats} refreshStats={fetchStats} />}
                              {activeTab === "routes" && <RouteManager stats={stats} refreshStats={fetchStats} />}
                              {activeTab === "assignment" && <TransportAssignment />}
                        </div>
                  </div>
            </div>
      );
}
