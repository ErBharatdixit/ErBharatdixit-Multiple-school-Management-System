import { useState, useEffect } from "react";
import { X, CreditCard, Wallet, IndianRupee, Banknote } from "lucide-react";
import api from "../api";

// Helper to load Razorpay script
const loadRazorpayScript = () => {
      return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
      });
};

export default function FeePaymentModal({ isOpen, onClose, studentId, pendingAmount, feeStructures, onSuccess }) {
      const [amount, setAmount] = useState("");
      const [loading, setLoading] = useState(false);
      const [selectedFeeId, setSelectedFeeId] = useState("");
      const [duration, setDuration] = useState("1"); // 1, 3, 6, 12
      const [remarks, setRemarks] = useState("");

      useEffect(() => {
            if (feeStructures && feeStructures.length > 0) {
                  setSelectedFeeId(feeStructures[0]._id);
            }
      }, [feeStructures]);

      useEffect(() => {
            const fee = feeStructures?.find(f => f._id === selectedFeeId);
            if (fee) {
                  if (fee.isMonthly) {
                        setAmount((fee.amount * parseInt(duration)).toString());
                  } else {
                        // If not monthly, maybe default to full amount or allow edit. 
                        // For now, let's just set it to the fee amount but allow edit if needed or keep fixed.
                        // However, user request specifically focused on fixing amount for monthly.
                        // Let's assume standard fees are one-time payments.
                        setAmount(fee.amount.toString());
                  }
            }
      }, [selectedFeeId, duration, feeStructures]);

      if (!isOpen) return null;

      const handlePayment = async (e) => {
            e.preventDefault();
            setLoading(true);

            try {
                  const res = await loadRazorpayScript();
                  if (!res) {
                        alert("Razorpay SDK failed to load. Are you online?");
                        setLoading(false);
                        return;
                  }

                  // 1. Create Order
                  const orderRes = await api.post("/fees/order", { amount });
                  const { id: order_id, currency } = orderRes.data;

                  // 2. Open Razorpay
                  const options = {
                        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                        amount: orderRes.data.amount,
                        currency: currency,
                        name: "School Management System",
                        description: "Fee Payment",
                        order_id: order_id,
                        handler: async function (response) {
                              try {
                                    // 3. Verify & Save Payment
                                    await api.post("/fees/pay", {
                                          studentId,
                                          feeStructureId: selectedFeeId,
                                          amount: Number(amount),
                                          method: "Online",
                                          transactionId: response.razorpay_payment_id,
                                          razorpay_order_id: response.razorpay_order_id,
                                          razorpay_payment_id: response.razorpay_payment_id,
                                          razorpay_signature: response.razorpay_signature,
                                          remarks: remarks || `Online Payment (${duration} Month/s)`
                                    });

                                    alert("Payment Successful!");
                                    onSuccess();
                                    onClose();
                              } catch (error) {
                                    console.error("Payment verification failed", error);
                                    alert("Payment verification failed: " + error.message);
                              }
                        },
                        prefill: {},
                        theme: {
                              color: "#2563eb",
                        },
                  };

                  const paymentObject = new window.Razorpay(options);
                  paymentObject.open();

            } catch (error) {
                  console.error("Payment initiation failed:", error);
                  alert("Payment initiation failed: " + (error.response?.data?.message || error.message));
            } finally {
                  setLoading(false);
            }
      };

      const selectedFee = feeStructures?.find(f => f._id === selectedFeeId);
      const isMonthly = selectedFee?.isMonthly;

      return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-blue-600" />
                                    Pay Fees
                              </h3>
                              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition">
                                    <X className="w-5 h-5" />
                              </button>
                        </div>

                        <form onSubmit={handlePayment} className="p-6 space-y-6">

                              <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Fee</label>
                                    <select
                                          value={selectedFeeId}
                                          onChange={(e) => setSelectedFeeId(e.target.value)}
                                          className="block w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    >
                                          {feeStructures?.map(fee => (
                                                <option key={fee._id} value={fee._id}>
                                                      {fee.type} {fee.isMonthly ? "(Monthly)" : ""}
                                                </option>
                                          ))}
                                    </select>
                              </div>

                              {isMonthly && (
                                    <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Duration</label>
                                          <select
                                                value={duration}
                                                onChange={(e) => setDuration(e.target.value)}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                          >
                                                <option value="1">1 Month</option>
                                                <option value="3">3 Months (Quarterly)</option>
                                                <option value="6">6 Months (Half Yearly)</option>
                                                <option value="12">12 Months (Full Year)</option>
                                          </select>
                                    </div>
                              )}

                              <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Pay</label>
                                    <div className="relative">
                                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <IndianRupee className="h-5 w-5 text-gray-400" />
                                          </div>
                                          <input
                                                type="number"
                                                readOnly={isMonthly} // Read only if monthly, as it is auto-calculated
                                                required
                                                min="1"
                                                value={amount}
                                                onChange={(e) => !isMonthly && setAmount(e.target.value)}
                                                className={`block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm text-lg font-semibold text-gray-900 ${isMonthly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                          />
                                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500 sm:text-sm">INR</span>
                                          </div>
                                    </div>
                              </div>

                              <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
                                    <textarea
                                          value={remarks}
                                          onChange={(e) => setRemarks(e.target.value)}
                                          rows="2"
                                          className="block w-full border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 shadow-sm p-3"
                                          placeholder="e.g. September Fees"
                                    ></textarea>
                              </div>

                              <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transform transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                              >
                                    {loading ? (
                                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                          <>
                                                <Wallet className="w-5 h-5" />
                                                Pay With Razorpay
                                          </>
                                    )}
                              </button>
                        </form>
                  </div>
            </div>
      );
}
