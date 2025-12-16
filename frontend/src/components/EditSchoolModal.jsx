import { useState, useEffect } from "react";
import { X, Building2, MapPin, Phone, Mail } from "lucide-react";
import api from "../api";

export default function EditSchoolModal({ isOpen, onClose, school, onSchoolUpdated }) {
      const [formData, setFormData] = useState({
            name: "",
            address: "",
            city: "",
            state: "",
            pincode: "",
            phone: "",
            email: ""
      });
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState("");

      useEffect(() => {
            if (school) {
                  setFormData({
                        name: school.name || "",
                        address: school.address || "",
                        city: school.city || "",
                        state: school.state || "",
                        pincode: school.pincode || "",
                        phone: school.phone || "",
                        email: school.email || ""
                  });
            }
      }, [school]);

      if (!isOpen || !school) return null;

      const handleChange = (e) => {
            setFormData({
                  ...formData,
                  [e.target.name]: e.target.value
            });
      };

      const handleSubmit = async (e) => {
            e.preventDefault();
            setLoading(true);
            setError("");

            try {
                  await api.put(`/schools/${school._id}`, formData);
                  onSchoolUpdated();
                  onClose();
            } catch (err) {
                  setError(err.response?.data?.message || "Failed to update school");
            } finally {
                  setLoading(false);
            }
      };

      return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
                  <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl m-4 p-6 relative animate-slide-in">
                        <button
                              onClick={onClose}
                              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                        >
                              <X className="w-6 h-6" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                    <Building2 className="w-6 h-6 text-blue-600" />
                              </div>
                              <h2 className="text-2xl font-bold text-gray-900">Edit School</h2>
                        </div>

                        {error && (
                              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                                    {error}
                              </div>
                        )}

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                          School Name
                                    </label>
                                    <input
                                          type="text"
                                          name="name"
                                          required
                                          value={formData.name}
                                          onChange={handleChange}
                                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                              </div>

                              <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Address
                                    </label>
                                    <div className="relative">
                                          <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                          <input
                                                type="text"
                                                name="address"
                                                required
                                                value={formData.address}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                          />
                                    </div>
                              </div>

                              <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                          City
                                    </label>
                                    <input
                                          type="text"
                                          name="city"
                                          required
                                          value={formData.city}
                                          onChange={handleChange}
                                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                              </div>

                              <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                          State
                                    </label>
                                    <input
                                          type="text"
                                          name="state"
                                          required
                                          value={formData.state}
                                          onChange={handleChange}
                                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                              </div>

                              <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Pincode
                                    </label>
                                    <input
                                          type="text"
                                          name="pincode"
                                          required
                                          value={formData.pincode}
                                          onChange={handleChange}
                                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                              </div>

                              <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Phone
                                    </label>
                                    <div className="relative">
                                          <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                          <input
                                                type="text"
                                                name="phone"
                                                required
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                          />
                                    </div>
                              </div>

                              <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Email
                                    </label>
                                    <div className="relative">
                                          <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                          <input
                                                type="email"
                                                name="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                          />
                                    </div>
                              </div>

                              <div className="col-span-2 flex justify-end gap-3 mt-4 border-t pt-4">
                                    <button
                                          type="button"
                                          onClick={onClose}
                                          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                                    >
                                          Cancel
                                    </button>
                                    <button
                                          type="submit"
                                          disabled={loading}
                                          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
                                    >
                                          {loading ? "Updating..." : "Update School"}
                                    </button>
                              </div>
                        </form>
                  </div>
            </div>
      );
}
