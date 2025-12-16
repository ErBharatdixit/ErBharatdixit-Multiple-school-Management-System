import { useState, useEffect } from "react";
import { Bus, MapPin, Phone, User, Navigation } from "lucide-react";
import api from "../../api"; // Assuming we will repurpose api calls here or create new ones for student specific

export default function StudentTransport() {
      // Mock data for now since we haven't implemented student-transport assignment link fully
      // In a real app, we would fetch /student/transport-details
      const [transportDetails, setTransportDetails] = useState(null);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
            const fetchTransport = async () => {
                  try {
                        const res = await api.get("/transport/student/me");
                        setTransportDetails(res.data);
                  } catch (error) {
                        if (error.response && error.response.status === 404) {
                              setTransportDetails(null);
                        } else {
                              console.error("Failed to fetch transport", error);
                        }
                  } finally {
                        setLoading(false);
                  }
            };
            fetchTransport();
      }, []);

      if (loading) return <div className="p-8 text-center">Loading transport details...</div>;

      if (!transportDetails) {
            return (
                  <div className="bg-white/50 p-8 rounded-2xl text-center border border-dashed border-gray-300">
                        <Bus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No transport assigned.</p>
                        <p className="text-sm text-gray-400">Contact admin to subscribe to school bus service.</p>
                  </div>
            );
      }

      const { route, vehicle, stop } = transportDetails;

      return (
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                  {/* Background Decoration */}
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Bus className="w-32 h-32" />
                  </div>

                  <div className="relative z-10">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                              <Bus className="w-6 h-6" /> Your Transport
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                              {/* Vehicle Info */}
                              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                    <h3 className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-3">Vehicle Details</h3>
                                    <div className="space-y-3">
                                          <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white/20 rounded-lg">
                                                      <Bus className="w-5 h-5" />
                                                </div>
                                                <div>
                                                      <p className="text-xs text-blue-200">Bus Number</p>
                                                      <p className="font-bold text-lg">{vehicle?.vehicleNumber || "N/A"}</p>
                                                </div>
                                          </div>
                                          <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white/20 rounded-lg">
                                                      <User className="w-5 h-5" />
                                                </div>
                                                <div>
                                                      <p className="text-xs text-blue-200">Driver</p>
                                                      <p className="font-medium">{vehicle?.driverName || "N/A"}</p>
                                                </div>
                                          </div>
                                          <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white/20 rounded-lg">
                                                      <Phone className="w-5 h-5" />
                                                </div>
                                                <div>
                                                      <p className="text-xs text-blue-200">Contact</p>
                                                      <p className="font-medium">{vehicle?.driverPhone || "N/A"}</p>
                                                </div>
                                          </div>
                                    </div>
                              </div>

                              {/* Route Info */}
                              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                    <h3 className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-3">Route Details</h3>
                                    <div className="space-y-4">
                                          <div>
                                                <p className="text-xs text-blue-200 mb-1">Assigned Route</p>
                                                <div className="flex items-center gap-2">
                                                      <Navigation className="w-4 h-4 text-blue-300" />
                                                      <span className="font-bold text-lg">{route.routeName}</span>
                                                </div>
                                          </div>

                                          <div className="flex items-center gap-2 text-sm bg-blue-900/30 p-2 rounded-lg">
                                                <MapPin className="w-4 h-4 text-yellow-400" />
                                                <span>Your Stop: <strong>{stop.stopName}</strong></span>
                                          </div>

                                          <div className="flex justify-between items-center text-sm pt-2 border-t border-white/10">
                                                <span className="text-blue-200">Transport Fee</span>
                                                <span className="font-bold text-xl">₹{stop.fees}</span>
                                          </div>
                                    </div>
                              </div>

                        </div>
                  </div>
            </div>
      );
}
