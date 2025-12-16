import { useState, useEffect } from "react";
import { Edit, Trash2, Search, Building2, MapPin, Phone, Mail } from "lucide-react";
import api from "../api";

export default function SchoolList({ refreshTrigger, onEdit }) {
      const [schools, setSchools] = useState([]);
      const [searchTerm, setSearchTerm] = useState("");
      const [loading, setLoading] = useState(true);

      const fetchSchools = async () => {
            try {
                  const response = await api.get("/schools");
                  setSchools(response.data);
            } catch (error) {
                  console.error("Failed to fetch schools:", error);
            } finally {
                  setLoading(false);
            }
      };

      useEffect(() => {
            fetchSchools();
      }, [refreshTrigger]);

      const handleDelete = async (id) => {
            if (window.confirm("Are you sure you want to delete this school? This action cannot be undone.")) {
                  try {
                        await api.delete(`/schools/${id}`);
                        fetchSchools();
                  } catch (error) {
                        console.error("Failed to delete school:", error);
                        alert("Failed to delete school");
                  }
            }
      };

      const filteredSchools = schools.filter(school =>
            school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            school.city.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (loading) {
            return (
                  <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
            );
      }

      return (
            <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <Search className="w-5 h-5 text-gray-400" />
                        <input
                              type="text"
                              placeholder="Search schools by name or city..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="flex-1 outline-none text-gray-700 bg-transparent"
                        />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSchools.map((school) => (
                              <div key={school._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition group">
                                    <div className="p-6">
                                          <div className="flex justify-between items-start mb-4">
                                                <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                                                      <Building2 className="w-6 h-6" />
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                      {onEdit && (
                                                            <button
                                                                  onClick={() => onEdit(school)}
                                                                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                                  title="Edit School"
                                                            >
                                                                  <Edit className="w-4 h-4" />
                                                            </button>
                                                      )}
                                                      <button
                                                            onClick={() => handleDelete(school._id)}
                                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                            title="Delete School"
                                                      >
                                                            <Trash2 className="w-4 h-4" />
                                                      </button>
                                                </div>
                                          </div>

                                          <h3 className="text-lg font-bold text-gray-900 mb-1">{school.name}</h3>
                                          <div className="text-sm text-gray-500 mb-4 space-y-1">
                                                <p className="flex items-start gap-1">
                                                      <MapPin className="w-3 h-3 mt-1 flex-shrink-0" />
                                                      <span>
                                                            {school.address}
                                                            <br />
                                                            {school.city}, {school.state} - {school.pincode}
                                                      </span>
                                                </p>
                                          </div>

                                          <div className="space-y-2 pt-4 border-t border-gray-100">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                      <Phone className="w-4 h-4 text-gray-400" />
                                                      {school.phone}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                      <Mail className="w-4 h-4 text-gray-400" />
                                                      {school.email}
                                                </div>
                                          </div>
                                    </div>
                              </div>
                        ))}

                        {filteredSchools.length === 0 && (
                              <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                                    No schools found matching your search.
                              </div>
                        )}
                  </div>
            </div>
      );
}
