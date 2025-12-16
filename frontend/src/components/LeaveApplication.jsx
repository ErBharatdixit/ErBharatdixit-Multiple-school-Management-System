import { useState } from "react";
import api from "../api";
import { Calendar, FileText, Send } from "lucide-react";

export default function LeaveApplication({ onReferesh }) {
      const [formData, setFormData] = useState({
            startDate: "",
            endDate: "",
            type: "Medical",
            reason: ""
      });
      const [loading, setLoading] = useState(false);
      const [message, setMessage] = useState({ type: "", text: "" });

      const handleSubmit = async (e) => {
            e.preventDefault();
            setLoading(true);
            setMessage({ type: "", text: "" });

            try {
                  await api.post("/leaves", formData);
                  setMessage({ type: "success", text: "Leave application submitted successfully!" });
                  setFormData({
                        startDate: "",
                        endDate: "",
                        type: "Medical",
                        reason: ""
                  });
                  if (onReferesh) onReferesh();
            } catch (error) {
                  setMessage({ type: "error", text: error.response?.data?.message || "Failed to submit application" });
            } finally {
                  setLoading(false);
            }
      };

      return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Send className="w-5 h-5 text-blue-600" />
                        Apply for Leave
                  </h3>

                  {message.text && (
                        <div className={`p-3 rounded-lg mb-4 text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                              {message.text}
                        </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input
                                          type="date"
                                          required
                                          value={formData.startDate}
                                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                              </div>
                              <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                    <input
                                          type="date"
                                          required
                                          value={formData.endDate}
                                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                              </div>
                        </div>

                        <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                              <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              >
                                    <option value="Medical">Medical</option>
                                    <option value="Casual">Casual</option>
                                    <option value="Emergency">Emergency</option>
                                    <option value="Other">Other</option>
                              </select>
                        </div>

                        <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                              <textarea
                                    required
                                    rows="3"
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Please provide a reason for your leave..."
                              ></textarea>
                        </div>

                        <button
                              type="submit"
                              disabled={loading}
                              className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                              {loading ? "Submitting..." : "Submit Application"}
                        </button>
                  </form>
            </div>
      );
}
