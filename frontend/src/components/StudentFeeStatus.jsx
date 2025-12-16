import { useState, useEffect } from "react";
import api from "../api";
import { IndianRupee, AlertCircle, CheckCircle, Clock, CreditCard } from "lucide-react";
import FeePaymentModal from "./FeePaymentModal";

export default function StudentFeeStatus() {
      const [feeData, setFeeData] = useState(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const [isPayModalOpen, setIsPayModalOpen] = useState(false);
      const [studentId, setStudentId] = useState(null); // Store studentId

      useEffect(() => {
            fetchFeeStatus();
      }, []);

      const fetchFeeStatus = async () => {
            try {
                  const userRes = await api.get("/auth/me");
                  const currentStudentId = userRes.data._id;
                  setStudentId(currentStudentId);
                  const response = await api.get(`/fees/status/${currentStudentId}`);
                  setFeeData(response.data);
            } catch (error) {
                  setError("Failed to load fee status.");
                  console.error(error);
            } finally {
                  setLoading(false);
            }
      };



      if (loading) return <div className="text-center py-8">Loading fee details...</div>;
      if (error) return <div className="text-red-500 text-center py-8">{error}</div>;
      if (!feeData) return <div className="p-8 text-center text-red-500">Unable to load fee information.</div>;


      return (
            <div className="space-y-6 animate-fade-in relative z-10">
                  {/* Summary Cards */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white flex justify-between items-center">
                              <div>
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                          <IndianRupee className="w-8 h-8" />
                                          Fee Status
                                    </h2>
                                    <p className="opacity-90 mt-1">Academic Year 2024-2025</p>
                              </div>
                              {feeData.pendingAmount > 0 && (
                                    <button
                                          onClick={() => setIsPayModalOpen(true)}
                                          className="bg-white text-blue-700 px-6 py-2.5 rounded-xl font-bold hover:bg-blue-50 transition shadow-lg flex items-center gap-2 animate-bounce-slow"
                                    >
                                          <CreditCard className="w-5 h-5" />
                                          Pay Now
                                    </button>
                              )}
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                    <p className="text-sm text-blue-600 font-medium uppercase tracking-wider">Total Fees</p>
                                    <p className="text-3xl font-bold text-gray-800 mt-1">₹{feeData.totalFees}</p>
                              </div>
                              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                    <p className="text-sm text-green-600 font-medium uppercase tracking-wider">Paid Amount</p>
                                    <p className="text-3xl font-bold text-gray-800 mt-1">₹{feeData.totalPaid}</p>
                              </div>
                              <div className={`p-4 rounded-xl border ${feeData.pendingAmount > 0 ? "bg-red-50 border-red-100" : "bg-gray-50 border-gray-100"}`}>
                                    <p className={`text-sm font-medium uppercase tracking-wider ${feeData.pendingAmount > 0 ? "text-red-600" : "text-gray-600"}`}>Pending Dues</p>
                                    <p className="text-3xl font-bold text-gray-800 mt-1">₹{feeData.pendingAmount}</p>
                              </div>
                        </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Fee Breakdown */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                    Fee Breakdown
                              </h3>
                              <div className="space-y-3">
                                    {feeData.feeStructures.map((fee) => (
                                          <div key={fee._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                      <p className="font-medium text-gray-800">{fee.type}</p>
                                                      <p className="text-xs text-gray-500">Due: {new Date(fee.dueDate).toLocaleDateString()}</p>
                                                </div>
                                                <span className="font-bold text-gray-700">₹{fee.amount}</span>
                                          </div>
                                    ))}
                              </div>
                        </div>

                        {/* Recent Payments */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    Payment History
                              </h3>
                              {feeData.payments.length > 0 ? (
                                    <div className="space-y-3">
                                          {feeData.payments.map((payment) => (
                                                <div key={payment._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                      <div>
                                                            <p className="font-medium text-gray-800">{payment.method}</p>
                                                            <p className="text-xs text-gray-500">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                                                      </div>
                                                      <span className="font-bold text-green-600">+₹{payment.amount}</span>
                                                </div>
                                          ))}
                                    </div>
                              ) : (
                                    <div className="text-center py-8 text-gray-400">No payments recorded yet.</div>
                              )}
                        </div>
                  </div>
                  <FeePaymentModal
                        isOpen={isPayModalOpen}
                        onClose={() => setIsPayModalOpen(false)}
                        studentId={studentId}
                        pendingAmount={feeData.pendingAmount}
                        feeStructures={feeData.feeStructures || []}
                        onSuccess={() => {
                              fetchFeeStatus();
                        }}
                  />
            </div>
      );
}

