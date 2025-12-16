import { useState, useEffect } from "react";
import { X, User, Mail, Lock, Phone, BookOpen, Hash, Building2, Briefcase, IndianRupee } from "lucide-react";
import api from "../api";

export default function AddUserModal({ isOpen, onClose, role, onUserAdded, initialData }) {
      const [formData, setFormData] = useState({
            name: "",
            email: "",
            password: "",
            phone: "",
            subject: "", // For teachers
            className: "", // This will store classId for students
            rollNo: "",    // For students
            designation: "", // For staff
            basicSalary: 0,
            allowances: 0,
            deductions: 0
      });
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState("");
      const [teachers, setTeachers] = useState([]);
      const [isExistingTeacher, setIsExistingTeacher] = useState(false);
      const [classes, setClasses] = useState([]);

      useEffect(() => {
            if (isOpen && role === "student") {
                  fetchClasses();
            }
            if (isOpen && role === "staff") {
                  fetchTeachers();
            }
            if (isOpen && initialData) {
                  setFormData({
                        name: initialData.name || "",
                        email: initialData.email || "",
                        password: "", // Leave empty for edit unless password reset is intended
                        phone: initialData.phone || "",
                        subject: initialData.subject || "",
                        className: initialData.classId?._id || initialData.classId || "",
                        rollNo: initialData.rollNo || "",
                        designation: initialData.designation || "",
                        basicSalary: initialData.salaryDetails?.basicSalary || 0,
                        allowances: initialData.salaryDetails?.allowances || 0,
                        deductions: initialData.salaryDetails?.deductions || 0,
                  });
                  setIsExistingTeacher(false); // Reset when editing specific user
            } else if (isOpen && !initialData) {
                  resetForm();
                  setIsExistingTeacher(false);
            }
      }, [isOpen, role, initialData]);

      const resetForm = () => {
            setFormData({
                  name: "",
                  email: "",
                  password: "",
                  phone: "",
                  subject: "",
                  className: "",
                  rollNo: "",
                  designation: "",
                  basicSalary: 0,
                  allowances: 0,
                  deductions: 0
            });
            setError("");
      };

      const fetchClasses = async () => {
            try {
                  const res = await api.get("/academic/classes");
                  setClasses(res.data);
            } catch (err) {
                  console.error("Failed to fetch classes", err);
            }
      };

      const fetchTeachers = async () => {
            try {
                  const res = await api.get("/users/teachers");
                  setTeachers(res.data);
            } catch (err) {
                  console.error("Failed to fetch teachers", err);
            }
      };

      if (!isOpen) return null;

      const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData({
                  ...formData,
                  [name]: ["basicSalary", "allowances", "deductions"].includes(name) ? Number(value) : value
            });
      };

      const handleTeacherSelect = (e) => {
            const teacherId = e.target.value;
            if (!teacherId) {
                  resetForm();
                  return;
            }
            const teacher = teachers.find(t => t._id === teacherId);
            if (teacher) {
                  setFormData({
                        ...formData,
                        _id: teacher._id,
                        name: teacher.name,
                        email: teacher.email,
                        phone: teacher.phone || "",
                        subject: teacher.subject || "",
                        // Pre-fill existing salary if any, else 0
                        basicSalary: teacher.salaryDetails?.basicSalary || 0,
                        allowances: teacher.salaryDetails?.allowances || 0,
                        deductions: teacher.salaryDetails?.deductions || 0,
                        designation: "Teacher" // Just for display
                  });
            }
      };

      const handleSubmit = async (e) => {
            e.preventDefault();
            setLoading(true);
            setError("");

            try {
                  let endpoint;
                  let method = "post"; // Default

                  if (isExistingTeacher && formData._id) {
                        // We are updating an existing teacher's salary
                        endpoint = `/users/teacher/${formData._id}`;
                        method = "put";
                  } else if (role === "teacher") {
                        endpoint = initialData ? `/users/teacher/${initialData._id}` : "/users/teacher";
                        method = initialData ? "put" : "post";
                  } else if (role === "student") {
                        endpoint = initialData ? `/users/student/${initialData._id}` : "/users/student";
                        method = initialData ? "put" : "post";
                  } else if (role === "staff") {
                        endpoint = initialData ? `/users/staff/${initialData._id}` : "/users/staff";
                        method = initialData ? "put" : "post";
                  }

                  // Prepare payload with salary structure
                  const payload = {
                        ...formData,
                        salaryDetails: {
                              basicSalary: formData.basicSalary,
                              allowances: formData.allowances,
                              deductions: formData.deductions
                        }
                  };

                  // For existing teacher update, we might only want to send relevant fields or all.
                  // The backend updateTeacher handles partial updates, so sending all formData is fine.

                  await api[method](endpoint, payload);

                  onUserAdded();
                  onClose();
            } catch (err) {
                  setError(err.response?.data?.message || "Failed to add user");
            } finally {
                  setLoading(false);
            }
      };

      return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
                  <div className="bg-white rounded-xl shadow-xl w-full max-w-lg m-4 p-6 relative animate-slide-in max-h-[90vh] overflow-y-auto">
                        <button
                              onClick={onClose}
                              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                        >
                              <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-bold text-gray-900 mb-6 capitalize">
                              {initialData ? "Edit" : "Add New"} {role}
                        </h2>

                        {error && (
                              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                                    {error}
                              </div>
                        )}

                        {!initialData && role === "staff" && (
                              <div className="flex p-1 bg-gray-100 rounded-lg mb-6">
                                    <button
                                          type="button"
                                          onClick={() => { setIsExistingTeacher(false); resetForm(); }}
                                          className={`flex-1 py-2 text-sm font-medium rounded-md transition ${!isExistingTeacher ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
                                    >
                                          New Staff Member
                                    </button>
                                    <button
                                          type="button"
                                          onClick={() => { setIsExistingTeacher(true); resetForm(); }}
                                          className={`flex-1 py-2 text-sm font-medium rounded-md transition ${isExistingTeacher ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
                                    >
                                          Existing Teacher
                                    </button>
                              </div>
                        )}

                        {isExistingTeacher && (
                              <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Teacher to Configure Payroll</label>
                                    <select
                                          onChange={handleTeacherSelect}
                                          className="w-full p-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-blue-50"
                                          defaultValue=""
                                    >
                                          <option value="" disabled>-- Select a Teacher --</option>
                                          {teachers.map(t => (
                                                <option key={t._id} value={t._id}>{t.name} ({t.email})</option>
                                          ))}
                                    </select>
                              </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                          <div className="relative">
                                                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                <input
                                                      type="text"
                                                      name="name"
                                                      required
                                                      value={formData.name}
                                                      onChange={handleChange}
                                                      disabled={isExistingTeacher}
                                                      className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${isExistingTeacher ? "bg-gray-100 text-gray-500" : ""}`}
                                                      placeholder="John Doe"
                                                />
                                          </div>
                                    </div>
                                    <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                          <div className="relative">
                                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                <input
                                                      type="email"
                                                      name="email"
                                                      required
                                                      value={formData.email}
                                                      onChange={handleChange}
                                                      disabled={isExistingTeacher}
                                                      className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${isExistingTeacher ? "bg-gray-100 text-gray-500" : ""}`}
                                                      placeholder="john@example.com"
                                                />
                                          </div>
                                    </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                          <div className="relative">
                                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                <input
                                                      type="password"
                                                      name="password"
                                                      required={!initialData && !isExistingTeacher}
                                                      value={formData.password}
                                                      onChange={handleChange}
                                                      disabled={isExistingTeacher}
                                                      className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${isExistingTeacher ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                                      placeholder={isExistingTeacher ? "Managed in Teachers Tab" : "******"}
                                                />
                                          </div>
                                    </div>
                                    <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                          <div className="relative">
                                                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                <input
                                                      type="text"
                                                      name="phone"
                                                      value={formData.phone}
                                                      onChange={handleChange}
                                                      disabled={isExistingTeacher}
                                                      className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${isExistingTeacher ? "bg-gray-100 text-gray-500" : ""}`}
                                                      placeholder="+1 234 567 890"
                                                />
                                          </div>
                                    </div>
                              </div>

                              {role === "teacher" && (
                                    <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                          <div className="relative">
                                                <BookOpen className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                <input
                                                      type="text"
                                                      name="subject"
                                                      value={formData.subject}
                                                      onChange={handleChange}
                                                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                      placeholder="e.g. Mathematics"
                                                />
                                          </div>
                                    </div>
                              )}

                              {role === "student" && (
                                    <div className="grid grid-cols-2 gap-4">
                                          <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                                                <div className="relative">
                                                      <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                      <select
                                                            name="className"
                                                            value={formData.className}
                                                            onChange={handleChange}
                                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                                                      >
                                                            <option value="">Select Class</option>
                                                            {classes.map((cls) => (
                                                                  <option key={cls._id} value={cls._id}>{cls.name}-{cls.section}</option>
                                                            ))}
                                                      </select>
                                                </div>
                                          </div>
                                          <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Roll No</label>
                                                <div className="relative">
                                                      <Hash className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                      <input
                                                            type="text"
                                                            name="rollNo"
                                                            value={formData.rollNo}
                                                            onChange={handleChange}
                                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                            placeholder="e.g. 15"
                                                      />
                                                </div>
                                          </div>
                                    </div>
                              )}

                              {role === "staff" && (
                                    <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                                          <div className="relative">
                                                <Briefcase className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                <input
                                                      type="text"
                                                      name="designation"
                                                      value={formData.designation}
                                                      onChange={handleChange}
                                                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                      placeholder="e.g. Driver, Peon, Guard"
                                                />
                                          </div>
                                    </div>
                              )}

                              {/* Salary Information (For Teacher and Staff) */}
                              {(role === "teacher" || role === "staff") && (
                                    <div className="bg-gray-50 p-4 rounded-xl space-y-3 border border-gray-200">
                                          <h3 className="flex items-center gap-2 font-bold text-gray-700 text-sm uppercase tracking-wider">
                                                <IndianRupee className="w-4 h-4" /> Salary Details
                                          </h3>
                                          <div className="grid grid-cols-3 gap-3">
                                                <div>
                                                      <label className="block text-xs font-semibold text-gray-500 mb-1">Basic Salary</label>
                                                      <input
                                                            type="number"
                                                            name="basicSalary"
                                                            value={formData.basicSalary}
                                                            onChange={handleChange}
                                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                            placeholder="0"
                                                      />
                                                </div>
                                                <div>
                                                      <label className="block text-xs font-semibold text-gray-500 mb-1">Allowances</label>
                                                      <input
                                                            type="number"
                                                            name="allowances"
                                                            value={formData.allowances}
                                                            onChange={handleChange}
                                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                            placeholder="0"
                                                      />
                                                </div>
                                                <div>
                                                      <label className="block text-xs font-semibold text-gray-500 mb-1">Deductions</label>
                                                      <input
                                                            type="number"
                                                            name="deductions"
                                                            value={formData.deductions}
                                                            onChange={handleChange}
                                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                            placeholder="0"
                                                      />
                                                </div>
                                          </div>
                                          <div className="text-right text-sm font-bold text-gray-800">
                                                Net Salary: ₹{(Number(formData.basicSalary) + Number(formData.allowances) - Number(formData.deductions)).toLocaleString()}
                                          </div>
                                    </div>
                              )}

                              <div className="pt-4 flex justify-end gap-3">
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
                                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-bold shadow-sm"
                                    >
                                          {loading ? (initialData ? "Updating..." : "Adding...") : (initialData ? "Update" : `Add ${role}`)}
                                    </button>
                              </div>
                        </form>
                  </div>
            </div>
      );
}
