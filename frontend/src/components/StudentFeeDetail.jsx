import { useState, useEffect } from "react";
import api from "../api";
import { X, Check, AlertCircle, Calendar, IndianRupee } from "lucide-react";

export default function StudentFeeDetail({ studentId, onClose }) {
      const [loading, setLoading] = useState(true);
      const [data, setData] = useState(null);
      const [error, setError] = useState("");

      const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

      useEffect(() => {
            if (studentId) {
                  fetchDetails();
            }
      }, [studentId]);

      const fetchDetails = async () => {
            try {
                  const response = await api.get(`/fees/status/${studentId}`);
                  setData(response.data);
            } catch (err) {
                  console.error("Failed to fetch fee details:", err);
                  setError("Failed to load fee details.");
            } finally {
                  setLoading(false);
            }
      };

      if (!studentId) return null;

      return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
                  <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                              <div>
                                    <h2 className="text-xl font-bold text-gray-800">Fee Details</h2>
                                    {data && (
                                          <p className="text-gray-600 text-sm mt-1">
                                                {data.studentName} | Class: {data.classId?.username || "Unknown"}
                                                {/* Use username or verify class object structure from API */}
                                          </p>
                                    )}
                              </div>
                              <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
                                    <X className="w-5 h-5 text-gray-500" />
                              </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto flex-1">
                              {loading ? (
                                    <div className="flex justify-center py-10">
                                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                                    </div>
                              ) : error ? (
                                    <div className="text-center py-10 text-red-500">{error}</div>
                              ) : (
                                    <div className="space-y-8">

                                          {/* Summary Cards */}
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Total Fees</p>
                                                      <p className="text-2xl font-bold text-blue-900 mt-1">₹{data.totalFees}</p>
                                                </div>
                                                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                                      <p className="text-xs font-bold text-green-600 uppercase tracking-wide">Total Paid</p>
                                                      <p className="text-2xl font-bold text-green-900 mt-1">₹{data.totalPaid}</p>
                                                </div>
                                                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                                      <p className="text-xs font-bold text-red-600 uppercase tracking-wide">Pending</p>
                                                      <p className="text-2xl font-bold text-red-900 mt-1">₹{data.pendingAmount}</p>
                                                </div>
                                          </div>

                                          {/* Monthly Breakdown Grid */}
                                          <div>
                                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                                      <Calendar className="w-5 h-5 text-gray-500" />
                                                      Monthly Fee Status (Apr - Mar)
                                                </h3>
                                                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                                                      <table className="min-w-full divide-y divide-gray-200">
                                                            <thead className="bg-gray-50">
                                                                  <tr>
                                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky left-0 bg-gray-50 z-10">Fee Type</th>
                                                                        {months.map(m => (
                                                                              <th key={m} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase w-16">{m}</th>
                                                                        ))}
                                                                  </tr>
                                                            </thead>
                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                                  {data.feeStructures.filter(f => f.isMonthly).map(fee => {
                                                                        // Calculate how many months are covered
                                                                        const paymentsForThisFee = data.payments.filter(p => p.feeStructureId?._id === fee._id || p.feeStructureId === fee._id);
                                                                        const totalPaidForFee = paymentsForThisFee.reduce((sum, p) => sum + p.amount, 0);
                                                                        const monthsPaidCount = Math.floor(totalPaidForFee / fee.amount);

                                                                        return (
                                                                              <tr key={fee._id}>
                                                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white shadow-sm border-r border-gray-100">
                                                                                          {fee.type}
                                                                                          <div className="text-xs text-gray-500 font-normal">₹{fee.amount}/mo</div>
                                                                                    </td>
                                                                                    {months.map((m, index) => {
                                                                                          const isPaid = index < monthsPaidCount;
                                                                                          return (
                                                                                                <td key={m} className="px-2 py-3 text-center">
                                                                                                      {isPaid ? (
                                                                                                            <div className="mx-auto flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600">
                                                                                                                  <Check className="w-3.5 h-3.5" />
                                                                                                            </div>
                                                                                                      ) : (
                                                                                                            <div className="mx-auto flex items-center justify-center w-6 h-6 rounded-full bg-red-50 text-red-400">
                                                                                                                  <X className="w-3.5 h-3.5" />
                                                                                                            </div>
                                                                                                      )}
                                                                                                </td>
                                                                                          );
                                                                                    })}
                                                                              </tr>
                                                                        );
                                                                  })}
                                                            </tbody>
                                                      </table>
                                                </div>
                                                {data.feeStructures.filter(f => f.isMonthly).length === 0 && (
                                                      <p className="text-gray-500 text-sm italic mt-2">No monthly fees configured.</p>
                                                )}
                                          </div>

                                          {/* Other Fees */}
                                          <div>
                                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                                      <IndianRupee className="w-5 h-5 text-gray-500" />
                                                      One-Time / Term Fees
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                      {data.feeStructures.filter(f => !f.isMonthly).map(fee => {
                                                            const paymentsForThisFee = data.payments.filter(p => p.feeStructureId?._id === fee._id || p.feeStructureId === fee._id);
                                                            const totalPaidForFee = paymentsForThisFee.reduce((sum, p) => sum + p.amount, 0);
                                                            const isPaid = totalPaidForFee >= fee.amount;
                                                            const pending = fee.amount - totalPaidForFee;

                                                            return (
                                                                  <div key={fee._id} className={`p-4 rounded-lg border ${isPaid ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'} flex justify-between items-center`}>
                                                                        <div>
                                                                              <p className="font-medium text-gray-900">{fee.type}</p>
                                                                              <p className="text-sm text-gray-500">Due: {new Date(fee.dueDate).toLocaleDateString()}</p>
                                                                        </div>
                                                                        <div className="text-right">
                                                                              <p className="font-bold text-gray-900">₹{fee.amount}</p>
                                                                              <span className={`text-xs font-bold px-2 py-1 rounded-full ${isPaid ? 'bg-green-200 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                                                    {isPaid ? "Paid" : `Due: ₹${pending}`}
                                                                              </span>
                                                                        </div>
                                                                  </div>
                                                            )
                                                      })}
                                                      {data.feeStructures.filter(f => !f.isMonthly).length === 0 && (
                                                            <p className="text-gray-500 text-sm italic">No one-time fees configured.</p>
                                                      )}
                                                </div>
                                          </div>

                                          {/* Transaction History */}
                                          <div>
                                                <h3 className="font-bold text-gray-800 mb-4">Transaction History</h3>
                                                <div className="border border-gray-200 rounded-xl overflow-hidden">
                                                      <table className="min-w-full divide-y divide-gray-200">
                                                            <thead className="bg-gray-50">
                                                                  <tr>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Txn ID</th>
                                                                  </tr>
                                                            </thead>
                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                                  {data.payments.length > 0 ? (
                                                                        data.payments.map((payment) => (
                                                                              <tr key={payment._id}>
                                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                                          {new Date(payment.createdAt).toLocaleDateString()}
                                                                                    </td>
                                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                                          {payment.feeStructureId?.type || "General Payment"}
                                                                                    </td>
                                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                                                                                          ₹{payment.amount}
                                                                                    </td>
                                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                                          {payment.method}
                                                                                    </td>
                                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-xs text-gray-400 font-mono">
                                                                                          {payment.transactionId || "-"}
                                                                                    </td>
                                                                              </tr>
                                                                        ))
                                                                  ) : (
                                                                        <tr>
                                                                              <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No transactions found</td>
                                                                        </tr>
                                                                  )}
                                                            </tbody>
                                                      </table>
                                                </div>
                                          </div>

                                    </div>
                              )}
                        </div>
                  </div>
            </div>
      );
}
