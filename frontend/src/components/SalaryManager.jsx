import { useState, useEffect } from "react";
import { UserCheck, IndianRupee, Calendar, Search, CheckCircle, AlertCircle } from "lucide-react";
import api from "../api";

export default function SalaryManager() {
      const [employees, setEmployees] = useState([]); // Teachers & Staff
      const [salaryHistory, setSalaryHistory] = useState([]);
      const [loading, setLoading] = useState(true);
      const [month, setMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
      const [year, setYear] = useState(new Date().getFullYear());
      const [statusFilter, setStatusFilter] = useState("All");

      useEffect(() => {
            fetchSalaryHistory();
      }, [month, year]);

      const fetchSalaryHistory = async () => {
            try {
                  setLoading(true);
                  const res = await api.get(`/salary/history?month=${month}&year=${year}`);
                  setSalaryHistory(res.data);
            } catch (error) {
                  console.error("Failed to fetch salary history", error);
            } finally {
                  setLoading(false);
            }
      };

      const handleProcessSalary = async () => {
            if (!window.confirm(`Process salary for ${month} ${year}? This will generate records for all active employees.`)) return;

            try {
                  const res = await api.post("/salary/process", { month, year });
                  alert(res.data.message);
                  fetchSalaryHistory();
            } catch (error) {
                  alert("Failed to process salary: " + (error.response?.data?.message || "Unknown error"));
            }
      };

      const markAsPaid = async (id) => {
            if (!window.confirm("Mark this salary as PAID?")) return;
            try {
                  await api.put(`/salary/${id}/pay`);
                  fetchSalaryHistory(); // Refresh to show updated status
            } catch (error) {
                  alert("Failed to update status");
            }
      };

      const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
      ];

      return (
            <div className="space-y-6">
                  {/* Controls */}
                  <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                              <select
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                              >
                                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                              </select>
                              <select
                                    value={year}
                                    onChange={(e) => setYear(Number(e.target.value))}
                                    className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                              >
                                    <option value={2024}>2024</option>
                                    <option value={2025}>2025</option>
                              </select>
                        </div>

                        <div className="flex gap-2">
                              <button
                                    onClick={handleProcessSalary}
                                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-sm"
                              >
                                    <IndianRupee className="w-5 h-5" />
                                    Generate Payroll
                              </button>
                        </div>
                  </div>

                  {/* Stats Summary for Selected Month */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                              <p className="text-gray-500 text-sm font-medium">Total Payout</p>
                              <p className="text-2xl font-bold text-gray-900 mt-1">
                                    ₹{salaryHistory.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                              </p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                              <p className="text-gray-500 text-sm font-medium">Pending Payments</p>
                              <p className="text-2xl font-bold text-orange-600 mt-1">
                                    {salaryHistory.filter(s => s.status === "Pending").length}
                              </p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                              <p className="text-gray-500 text-sm font-medium">Completed Payments</p>
                              <p className="text-2xl font-bold text-green-600 mt-1">
                                    {salaryHistory.filter(s => s.status === "Paid").length}
                              </p>
                        </div>
                  </div>

                  {/* Salary Table */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                          <tr>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Employee</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Designation</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Breakdown</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total Amount</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                          </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                          {salaryHistory.length > 0 ? (
                                                salaryHistory.map((record) => (
                                                      <tr key={record._id} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                  <div className="text-sm font-bold text-gray-900">{record.userId?.name}</div>
                                                                  <div className="text-xs text-gray-500">{record.userId?.email}</div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                                                                  {record.userId?.role}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                                  {record.userId?.designation || "-"}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                                                  <div>Basic: ₹{record.breakdown?.basicSalary || 0}</div>
                                                                  <div className="text-green-600">+ Allow: ₹{record.breakdown?.allowances || 0}</div>
                                                                  <div className="text-red-600">- Ded: ₹{record.breakdown?.deductions || 0}</div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                                  ₹{record.amount}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${record.status === "Paid"
                                                                              ? "bg-green-100 text-green-800 border border-green-200"
                                                                              : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                                                        }`}>
                                                                        {record.status}
                                                                  </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                                  {record.status === "Pending" && (
                                                                        <button
                                                                              onClick={() => markAsPaid(record._id)}
                                                                              className="text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-200 px-3 py-1 rounded-lg hover:bg-blue-50 transition"
                                                                        >
                                                                              Mark Paid
                                                                        </button>
                                                                  )}
                                                                  {record.status === "Paid" && (
                                                                        <span className="text-gray-400 text-xs flex items-center justify-end gap-1">
                                                                              <CheckCircle className="w-3 h-3" /> Paid
                                                                        </span>
                                                                  )}
                                                            </td>
                                                      </tr>
                                                ))
                                          ) : (
                                                <tr>
                                                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                                            No records found for {month} {year}. Click "Generate Payroll" to process.
                                                      </td>
                                                </tr>
                                          )}
                                    </tbody>
                              </table>
                        </div>
                  </div>
            </div>
      );
}
