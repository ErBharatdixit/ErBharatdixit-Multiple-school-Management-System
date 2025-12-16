import { useState, useEffect } from "react";
import { UserCheck, MapPin, Bus, Search, Save, AlertCircle } from "lucide-react";
import api from "../../api";

export default function TransportAssignment() {
      const [students, setStudents] = useState([]);
      const [routes, setRoutes] = useState([]);
      const [loading, setLoading] = useState(true);

      const [selectedStudent, setSelectedStudent] = useState("");
      const [selectedRoute, setSelectedRoute] = useState("");
      const [selectedStop, setSelectedStop] = useState("");

      const [message, setMessage] = useState({ type: "", text: "" });
      const [searchTerm, setSearchTerm] = useState("");

      useEffect(() => {
            fetchData();
      }, []);

      const fetchData = async () => {
            try {
                  setLoading(true);
                  const [studentsRes, routesRes] = await Promise.all([
                        api.get("/users/students"), // Assuming this endpoint returns all students
                        api.get("/transport/routes")
                  ]);
                  setStudents(studentsRes.data);
                  setRoutes(routesRes.data);
            } catch (error) {
                  console.error("Failed to fetch data", error);
                  setMessage({ type: "error", text: "Failed to load students or routes." });
            } finally {
                  setLoading(false);
            }
      };

      const handleAssign = async (e) => {
            e.preventDefault();
            if (!selectedStudent || !selectedRoute || !selectedStop) {
                  setMessage({ type: "error", text: "Please select all fields." });
                  return;
            }

            try {
                  const res = await api.post("/transport/assign", {
                        studentId: selectedStudent,
                        routeId: selectedRoute,
                        stopId: selectedStop
                  });

                  setMessage({ type: "success", text: res.data.message });
                  // Optional: Refresh data or clear selection
                  setSelectedStudent("");
                  setSelectedRoute("");
                  setSelectedStop("");
            } catch (error) {
                  setMessage({ type: "error", text: error.response?.data?.message || "Assignment failed." });
            }
      };

      // Filter students by search term
      const filteredStudents = students.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Get stops for selected route
      const getStopsForRoute = () => {
            const route = routes.find(r => r._id === selectedRoute);
            return route ? route.stops : [];
      };

      if (loading) return <div>Loading...</div>;

      return (
            <div className="space-y-6">
                  <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                              <UserCheck className="w-6 h-6 text-blue-600" />
                              Assign Transport to Student
                        </h2>
                  </div>

                  {message.text && (
                        <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                              <AlertCircle className="w-5 h-5" />
                              <p>{message.text}</p>
                        </div>
                  )}

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <form onSubmit={handleAssign} className="flex flex-col gap-6">

                              {/* Student Selection */}
                              <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Select Student</label>
                                    <div className="relative">
                                          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                          <input
                                                type="text"
                                                placeholder="Search student by name..."
                                                className="w-full pl-10 pr-4 py-2 mb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                          />
                                    </div>
                                    <select
                                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50 hover:bg-white"
                                          value={selectedStudent}
                                          onChange={(e) => setSelectedStudent(e.target.value)}
                                          size={5} // Show multiple options
                                    >
                                          {filteredStudents.length === 0 && <option disabled>No students found</option>}
                                          {filteredStudents.map(student => (
                                                <option key={student._id} value={student._id} className="p-2 hover:bg-blue-50 cursor-pointer rounded">
                                                      {student.name} ({student.email}) - Class: {student.classId?.name || "N/A"}
                                                </option>
                                          ))}
                                    </select>
                                    <p className="text-xs text-gray-500">Select a student from the list above.</p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Route Selection */}
                                    <div className="space-y-2">
                                          <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Select Route</label>
                                          <div className="relative">
                                                <Bus className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                                <select
                                                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white transition"
                                                      value={selectedRoute}
                                                      onChange={(e) => {
                                                            setSelectedRoute(e.target.value);
                                                            setSelectedStop(""); // Reset stop when route changes
                                                      }}
                                                >
                                                      <option value="">-- Choose Route --</option>
                                                      {routes.map(route => (
                                                            <option key={route._id} value={route._id}>
                                                                  {route.routeName} ({route.vehicleId?.vehicleNumber || "No Vehicle"})
                                                            </option>
                                                      ))}
                                                </select>
                                          </div>
                                    </div>

                                    {/* Stop Selection */}
                                    <div className="space-y-2">
                                          <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Select Stop</label>
                                          <div className="relative">
                                                <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                                <select
                                                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white transition"
                                                      value={selectedStop}
                                                      onChange={(e) => setSelectedStop(e.target.value)}
                                                      disabled={!selectedRoute}
                                                >
                                                      <option value="">-- Choose Stop --</option>
                                                      {getStopsForRoute().map(stop => (
                                                            <option key={stop._id} value={stop._id}>
                                                                  {stop.stopName} - ₹{stop.fees}
                                                            </option>
                                                      ))}
                                                </select>
                                          </div>
                                    </div>
                              </div>

                              <div className="pt-4">
                                    <button
                                          type="submit"
                                          className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2"
                                    >
                                          <Save className="w-5 h-5" />
                                          Assign Transport
                                    </button>
                              </div>

                        </form>
                  </div>
            </div>
      );
}
