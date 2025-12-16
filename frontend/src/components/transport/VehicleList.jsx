import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Bus, Phone, User, Users, CheckCircle, AlertCircle } from "lucide-react";
import api from "../../api";

export default function VehicleList({ onUpdate }) {
      const [vehicles, setVehicles] = useState([]);
      const [loading, setLoading] = useState(true);
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [currentVehicle, setCurrentVehicle] = useState(null);

      // Form State
      const [formData, setFormData] = useState({
            vehicleNumber: "",
            driverName: "",
            driverPhone: "",
            capacity: "",
            status: "Active"
      });

      useEffect(() => {
            fetchVehicles();
      }, []);

      const fetchVehicles = async () => {
            try {
                  const res = await api.get("/transport/vehicles");
                  setVehicles(res.data);
            } catch (error) {
                  console.error("Failed to fetch vehicles", error);
            } finally {
                  setLoading(false);
            }
      };

      const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                  if (currentVehicle) {
                        await api.put(`/transport/vehicles/${currentVehicle._id}`, formData);
                  } else {
                        await api.post("/transport/vehicles", formData);
                  }
                  setIsModalOpen(false);
                  fetchVehicles();
                  onUpdate(); // Update dashboard stats
                  resetForm();
            } catch (error) {
                  alert("Failed to save vehicle: " + (error.response?.data?.message || error.message));
            }
      };

      const handleDelete = async (id) => {
            if (window.confirm("Are you sure? This will delete the vehicle.")) {
                  try {
                        await api.delete(`/transport/vehicles/${id}`);
                        fetchVehicles();
                        onUpdate();
                  } catch (error) {
                        alert("Failed to delete vehicle");
                  }
            }
      };

      const openModal = (vehicle = null) => {
            if (vehicle) {
                  setCurrentVehicle(vehicle);
                  setFormData({
                        vehicleNumber: vehicle.vehicleNumber,
                        driverName: vehicle.driverName,
                        driverPhone: vehicle.driverPhone,
                        capacity: vehicle.capacity,
                        status: vehicle.status
                  });
            } else {
                  resetForm();
            }
            setIsModalOpen(true);
      };

      const resetForm = () => {
            setCurrentVehicle(null);
            setFormData({
                  vehicleNumber: "",
                  driverName: "",
                  driverPhone: "",
                  capacity: "",
                  status: "Active"
            });
      };

      return (
            <div className="space-y-6">
                  <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Fleet Management</h2>
                        <button
                              onClick={() => openModal()}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm font-medium"
                        >
                              <Plus className="w-4 h-4" /> Add Vehicle
                        </button>
                  </div>

                  {loading ? (
                        <div className="text-center py-12">Loading fleet data...</div>
                  ) : vehicles.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                              <Bus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-gray-500">No vehicles in the fleet yet.</p>
                        </div>
                  ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {vehicles.map((vehicle) => (
                                    <div key={vehicle._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                                          <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                      <div className="p-2 bg-blue-50 rounded-lg">
                                                            <Bus className="w-6 h-6 text-blue-600" />
                                                      </div>
                                                      <div>
                                                            <h3 className="font-bold text-gray-900">{vehicle.vehicleNumber}</h3>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full border ${vehicle.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                                                                  'bg-red-50 text-red-700 border-red-200'
                                                                  }`}>
                                                                  {vehicle.status}
                                                            </span>
                                                      </div>
                                                </div>
                                                <div className="flex gap-1">
                                                      <button onClick={() => openModal(vehicle)} className="p-1.5 text-gray-400 hover:text-blue-600 transition">
                                                            <Edit className="w-4 h-4" />
                                                      </button>
                                                      <button onClick={() => handleDelete(vehicle._id)} className="p-1.5 text-gray-400 hover:text-red-600 transition">
                                                            <Trash2 className="w-4 h-4" />
                                                      </button>
                                                </div>
                                          </div>

                                          <div className="space-y-2 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                      <User className="w-4 h-4 text-gray-400" />
                                                      <span className="font-medium">Driver:</span> {vehicle.driverName}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                      <Phone className="w-4 h-4 text-gray-400" />
                                                      <span className="font-medium">Contact:</span> {vehicle.driverPhone}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                      <Users className="w-4 h-4 text-gray-400" />
                                                      <span className="font-medium">Capacity:</span> {vehicle.capacity} Seats
                                                </div>
                                          </div>
                                    </div>
                              ))}
                        </div>
                  )}

                  {/* Modal */}
                  {isModalOpen && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                              <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-scale-in">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                                          {currentVehicle ? "Edit Vehicle" : "Add New Vehicle"}
                                    </h3>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                          <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                                                <input
                                                      type="text"
                                                      required
                                                      value={formData.vehicleNumber}
                                                      onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                      placeholder="AB-01-CD-1234"
                                                />
                                          </div>
                                          <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                      <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name</label>
                                                      <input
                                                            type="text"
                                                            required
                                                            value={formData.driverName}
                                                            onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                      />
                                                </div>
                                                <div>
                                                      <label className="block text-sm font-medium text-gray-700 mb-1">Driver Phone</label>
                                                      <input
                                                            type="text"
                                                            required
                                                            value={formData.driverPhone}
                                                            onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                      />
                                                </div>
                                          </div>
                                          <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                      <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                                                      <input
                                                            type="number"
                                                            required
                                                            value={formData.capacity}
                                                            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                      />
                                                </div>
                                                <div>
                                                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                                      <select
                                                            value={formData.status}
                                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                      >
                                                            <option value="Active">Active</option>
                                                            <option value="Maintenance">Maintenance</option>
                                                            <option value="Inactive">Inactive</option>
                                                      </select>
                                                </div>
                                          </div>

                                          <div className="flex justify-end gap-3 pt-4">
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
                                                      Save Vehicle
                                                </button>
                                          </div>
                                    </form>
                              </div>
                        </div>
                  )}
            </div>
      );
}
