
import { useState, useEffect } from "react";
import api from "../api";
import { Plus, IndianRupee, Calendar, Trash2, FileText, Settings } from "lucide-react";
import AdminFeeStatus from "./AdminFeeStatus";

export default function FeeStructureManager() {
      const [structures, setStructures] = useState([]);
      const [loading, setLoading] = useState(true);
      const [classes, setClasses] = useState([]);
      const [activeView, setActiveView] = useState("structures"); // "structures" or "report"
      const [editId, setEditId] = useState(null);

      const [formData, setFormData] = useState({
            classId: "",
            type: "",
            amount: "",
            dueDate: "",
            description: "",
            academicYear: "2024-2025",
            isMonthly: false
      });

      useEffect(() => {
            fetchStructures();
            fetchClasses();
      }, []);

      const fetchStructures = async () => {
            try {
                  const response = await api.get("/fees/structure");
                  setStructures(response.data);
            } catch (error) {
                  console.error("Failed to fetch structures:", error);
            } finally {
                  setLoading(false);
            }
      };

      const fetchClasses = async () => {
            try {
                  const response = await api.get("/academic/classes");
                  setClasses(response.data);
            } catch (error) {
                  console.error("Failed to fetch classes:", error);
            }
      };

      const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                  if (editId) {
                        await api.put(`/fees/structure/${editId}`, formData);
                        alert("Fee structure updated successfully!");
                        setEditId(null);
                  } else {
                        await api.post("/fees/structure", formData);
                        alert("Fee structure created successfully!");
                  }
                  fetchStructures();
                  setFormData({
                        classId: "",
                        type: "",
                        amount: "",
                        dueDate: "",
                        description: "",
                        academicYear: "2024-2025",
                        isMonthly: false
                  });
            } catch (error) {
                  console.error("Failed to save fee structure:", error);
                  alert(error.response?.data?.message || "Failed to save fee structure");
            }
      };

      const handleEdit = (fee) => {

            setEditId(fee._id);

            let formattedDate = "";
            if (fee.dueDate) {
                  try {
                        formattedDate = new Date(fee.dueDate).toISOString().split('T')[0];
                  } catch (e) {
                        console.error("Invalid date:", fee.dueDate);
                  }
            }

            setFormData({
                  classId: fee.classId?._id || "",
                  type: fee.type,
                  amount: fee.amount,
                  dueDate: formattedDate,
                  description: fee.description || "",
                  academicYear: fee.academicYear,
                  isMonthly: fee.isMonthly || false
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
      };

      const handleCancelEdit = () => {
            setEditId(null);
            setFormData({
                  classId: "",
                  type: "",
                  amount: "",
                  dueDate: "",
                  description: "",
                  academicYear: "2024-2025",
                  isMonthly: false
            });
      };

      const handleDelete = async (id) => {
            if (window.confirm("Are you sure you want to delete this fee structure? This cannot be undone.")) {
                  try {
                        await api.delete(`/fees/structure/${id}`);
                        alert("Fee structure deleted.");
                        fetchStructures();
                  } catch (error) {
                        console.error("Failed to delete:", error);
                        alert(error.response?.data?.message || "Failed to delete");
                  }
            }
      };

      return (
            <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                              <IndianRupee className="w-6 h-6 text-green-600" />
                              Fee Management
                        </h2>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                              <button
                                    onClick={() => setActiveView("structures")}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${activeView === "structures" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                              >
                                    <Settings className="w-4 h-4" />
                                    Manage Structures
                              </button>
                              <button
                                    onClick={() => setActiveView("report")}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${activeView === "report" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                              >
                                    <FileText className="w-4 h-4" />
                                    Fee Reports
                              </button>
                        </div>
                  </div>

                  {activeView === "report" ? (
                        <AdminFeeStatus />
                  ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              {/* Create/Edit Form */}
                              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-1 h-fit">
                                    <h3 className="font-bold text-gray-700 mb-4">{editId ? "Edit Fee Structure" : "Set New Fee"}</h3>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                          <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                                                <select
                                                      required
                                                      value={formData.classId}
                                                      onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                                >
                                                      <option value="">Select Class</option>
                                                      {classes.map(c => (
                                                            <option key={c._id} value={c._id}>{c.name} - {c.section}</option>
                                                      ))}
                                                </select>
                                          </div>
                                          <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Fee Type</label>
                                                <input
                                                      type="text"
                                                      required
                                                      placeholder="e.g. Tuition Fee"
                                                      value={formData.type}
                                                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                                />
                                          </div>
                                          <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                                <input
                                                      type="number"
                                                      required
                                                      value={formData.amount}
                                                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                                />
                                                <div className="mt-2 flex items-center">
                                                      <input
                                                            type="checkbox"
                                                            id="isMonthly"
                                                            checked={formData.isMonthly || false}
                                                            onChange={(e) => setFormData({ ...formData, isMonthly: e.target.checked })}
                                                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                                      />
                                                      <label htmlFor="isMonthly" className="ml-2 block text-sm text-gray-900">
                                                            Is this a Monthly Fee?
                                                      </label>
                                                </div>
                                          </div>
                                          <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                                <input
                                                      type="date"
                                                      required
                                                      value={formData.dueDate}
                                                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                                />
                                          </div>
                                          <div className="flex gap-2">
                                                {editId && (
                                                      <button
                                                            type="button"
                                                            onClick={handleCancelEdit}
                                                            className="flex-1 py-2 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 transition"
                                                      >
                                                            Cancel
                                                      </button>
                                                )}
                                                <button
                                                      type="submit"
                                                      disabled={loading}
                                                      className="flex-1 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition"
                                                >
                                                      {loading ? "Saving..." : editId ? "Update Fee" : "Create Fee"}
                                                </button>
                                          </div>
                                    </form>
                              </div>

                              {/* Fee List */}
                              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
                                    <h3 className="font-bold text-gray-700 mb-4">Existing Fee Structures</h3>
                                    <div className="overflow-x-auto">
                                          <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                      <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                                      </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                      {structures.map((fee) => (
                                                            <tr key={fee._id}>
                                                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                        {fee.classId?.name} - {fee.classId?.section}
                                                                  </td>
                                                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                        {fee.type} {fee.isMonthly && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full ml-2">Monthly</span>}
                                                                  </td>
                                                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">₹{fee.amount}</td>
                                                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                        {new Date(fee.dueDate).toLocaleDateString()}
                                                                  </td>
                                                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                                                                        <button
                                                                              onClick={() => handleEdit(fee)}
                                                                              className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded"
                                                                        >
                                                                              Edit
                                                                        </button>
                                                                        <button
                                                                              onClick={() => handleDelete(fee._id)}
                                                                              className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                                                                        >
                                                                              <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                  </td>
                                                            </tr>
                                                      ))}
                                                </tbody>
                                          </table>
                                    </div>
                              </div>
                        </div>
                  )}
            </div>
      );
}
