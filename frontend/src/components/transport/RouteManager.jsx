import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, MapPin, Bus, Navigation, DollarSign } from "lucide-react";
import api from "../../api";

export default function RouteManager({ onUpdate }) {
      const [routes, setRoutes] = useState([]);
      const [vehicles, setVehicles] = useState([]);
      const [loading, setLoading] = useState(true);
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [currentRoute, setCurrentRoute] = useState(null);

      const [formData, setFormData] = useState({
            routeName: "",
            startPoint: "",
            endPoint: "",
            vehicleId: "",
            stops: [] // Array of { stopName, fees }
      });

      // Helper for stops input
      const [tempStop, setTempStop] = useState({ stopName: "", fees: "" });

      useEffect(() => {
            fetchData();
      }, []);

      const fetchData = async () => {
            try {
                  const [routesRes, vehiclesRes] = await Promise.all([
                        api.get("/transport/routes"),
                        api.get("/transport/vehicles")
                  ]);
                  setRoutes(routesRes.data);
                  setVehicles(vehiclesRes.data);
            } catch (error) {
                  console.error("Failed to fetch route data", error);
            } finally {
                  setLoading(false);
            }
      };

      const handleAddStop = () => {
            if (!tempStop.stopName || !tempStop.fees) return;
            setFormData({
                  ...formData,
                  stops: [...formData.stops, { ...tempStop, fees: Number(tempStop.fees) }]
            });
            setTempStop({ stopName: "", fees: "" });
      };

      const handleRemoveStop = (index) => {
            const newStops = [...formData.stops];
            newStops.splice(index, 1);
            setFormData({ ...formData, stops: newStops });
      };

      const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                  if (currentRoute) {
                        await api.put(`/transport/routes/${currentRoute._id}`, formData);
                  } else {
                        await api.post("/transport/routes", formData);
                  }
                  setIsModalOpen(false);
                  fetchData();
                  onUpdate();
                  resetForm();
            } catch (error) {
                  alert("Failed to save route: " + (error.response?.data?.message || error.message));
            }
      };

      const handleDelete = async (id) => {
            if (window.confirm("Delete this route?")) {
                  try {
                        await api.delete(`/transport/routes/${id}`);
                        fetchData();
                        onUpdate();
                  } catch (error) {
                        alert("Failed to delete route");
                  }
            }
      };

      const openModal = (route = null) => {
            if (route) {
                  setCurrentRoute(route);
                  setFormData({
                        routeName: route.routeName,
                        startPoint: route.startPoint,
                        endPoint: route.endPoint,
                        vehicleId: route.vehicleId?._id || "",
                        stops: route.stops || []
                  });
            } else {
                  resetForm();
            }
            setIsModalOpen(true);
      };

      const resetForm = () => {
            setCurrentRoute(null);
            setFormData({
                  routeName: "",
                  startPoint: "",
                  endPoint: "",
                  vehicleId: "",
                  stops: []
            });
            setTempStop({ stopName: "", fees: "" });
      };

      return (
            <div className="space-y-6">
                  <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Route Management</h2>
                        <button
                              onClick={() => openModal()}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm font-medium"
                        >
                              <Plus className="w-4 h-4" /> Add Route
                        </button>
                  </div>

                  {loading ? (
                        <div className="text-center py-12">Loading routes...</div>
                  ) : routes.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-gray-500">No routes defined yet.</p>
                        </div>
                  ) : (
                        <div className="grid grid-cols-1 gap-4">
                              {routes.map((route) => (
                                    <div key={route._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                                          <div className="flex flex-col md:flex-row justify-between gap-4">
                                                <div className="flex-1">
                                                      <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="text-lg font-bold text-gray-900">{route.routeName}</h3>
                                                            {route.vehicleId && (
                                                                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                                                                        <Bus className="w-3 h-3" /> {route.vehicleId.vehicleNumber}
                                                                  </span>
                                                            )}
                                                      </div>

                                                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                                                            <span className="font-medium">{route.startPoint}</span>
                                                            <Navigation className="w-4 h-4 text-gray-400" />
                                                            <span className="font-medium">{route.endPoint}</span>
                                                      </div>

                                                      {/* Stops Visualizer */}
                                                      {route.stops && route.stops.length > 0 && (
                                                            <div className="flex flex-wrap gap-2">
                                                                  {route.stops.map((stop, i) => (
                                                                        <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                                                              <MapPin className="w-3 h-3" /> {stop.stopName} (₹{stop.fees})
                                                                        </span>
                                                                  ))}
                                                            </div>
                                                      )}
                                                </div>

                                                <div className="flex items-start gap-2">
                                                      <button onClick={() => openModal(route)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                                                            <Edit className="w-4 h-4" />
                                                      </button>
                                                      <button onClick={() => handleDelete(route._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                                                            <Trash2 className="w-4 h-4" />
                                                      </button>
                                                </div>
                                          </div>
                                    </div>
                              ))}
                        </div>
                  )}

                  {/* Modal */}
                  {isModalOpen && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                              <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                                          {currentRoute ? "Edit Route" : "Create New Route"}
                                    </h3>
                                    <form onSubmit={handleSubmit} className="space-y-4">

                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                      <label className="block text-sm font-medium text-gray-700 mb-1">Route Name</label>
                                                      <input
                                                            type="text"
                                                            required
                                                            value={formData.routeName}
                                                            onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                            placeholder="Route A - North City"
                                                      />
                                                </div>
                                                <div>
                                                      <label className="block text-sm font-medium text-gray-700 mb-1">Assign Vehicle</label>
                                                      <select
                                                            value={formData.vehicleId}
                                                            onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                      >
                                                            <option value="">Select Vehicle</option>
                                                            {vehicles.filter(v => v.status === 'Active').map(v => (
                                                                  <option key={v._id} value={v._id}>
                                                                        {v.vehicleNumber} ({v.capacity} seats)
                                                                  </option>
                                                            ))}
                                                      </select>
                                                </div>
                                          </div>

                                          <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Point</label>
                                                      <input
                                                            type="text"
                                                            required
                                                            value={formData.startPoint}
                                                            onChange={(e) => setFormData({ ...formData, startPoint: e.target.value })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                      />
                                                </div>
                                                <div>
                                                      <label className="block text-sm font-medium text-gray-700 mb-1">End Point</label>
                                                      <input
                                                            type="text"
                                                            required
                                                            value={formData.endPoint}
                                                            onChange={(e) => setFormData({ ...formData, endPoint: e.target.value })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                      />
                                                </div>
                                          </div>

                                          {/* Stops Manager */}
                                          <div className="border-t pt-4 mt-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Stops & Fees</label>
                                                <div className="flex gap-2 mb-3">
                                                      <input
                                                            type="text"
                                                            placeholder="Stop Name (e.g. Main Market)"
                                                            value={tempStop.stopName}
                                                            onChange={(e) => setTempStop({ ...tempStop, stopName: e.target.value })}
                                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                      />
                                                      <input
                                                            type="number"
                                                            placeholder="Fee (₹)"
                                                            value={tempStop.fees}
                                                            onChange={(e) => setTempStop({ ...tempStop, fees: e.target.value })}
                                                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                      />
                                                      <button
                                                            type="button"
                                                            onClick={handleAddStop}
                                                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                                      >
                                                            Add
                                                      </button>
                                                </div>

                                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                                      {formData.stops.map((stop, index) => (
                                                            <div key={index} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg text-sm">
                                                                  <span className="font-medium text-gray-700">{stop.stopName}</span>
                                                                  <div className="flex items-center gap-3">
                                                                        <span className="text-gray-500">₹{stop.fees}</span>
                                                                        <button
                                                                              type="button"
                                                                              onClick={() => handleRemoveStop(index)}
                                                                              className="text-red-500 hover:text-red-700"
                                                                        >
                                                                              <Trash2 className="w-3 h-3" />
                                                                        </button>
                                                                  </div>
                                                            </div>
                                                      ))}
                                                </div>
                                          </div>

                                          <div className="flex justify-end gap-3 pt-4 border-t">
                                                <button
                                                      type="button"
                                                      onClick={() => setIsModalOpen(false)}
                                                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition"
                                                >
                                                      Cancel
                                                </button>
                                                <button
                                                      type="submit"
                                                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
                                                >
                                                      Save Route
                                                </button>
                                          </div>
                                    </form>
                              </div>
                        </div>
                  )}
            </div>
      );
}
