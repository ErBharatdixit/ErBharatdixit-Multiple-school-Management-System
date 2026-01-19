import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import schoolCorridor from "../assets/school_corridor.png";

export default function Signup() {
      const [formData, setFormData] = useState({
            name: "",
            email: "",
            password: "",
            role: "superadmin",
            schoolId: ""
      });
      const [schools, setSchools] = useState([]);
      const [error, setError] = useState("");
      const [loading, setLoading] = useState(false);
      const { register } = useAuth();
      const navigate = useNavigate();

      useEffect(() => {
            const fetchSchools = async () => {
                  try {
                        const response = await api.get("/schools/list");
                        setSchools(response.data);
                  } catch (err) {
                        console.error("Failed to fetch schools:", err);
                  }
            };
            fetchSchools();
      }, []);

      const handleChange = (e) => {
            setFormData({
                  ...formData,
                  [e.target.name]: e.target.value
            });
      };

      const handleSubmit = async (e) => {
            e.preventDefault();
            setError("");
            setLoading(true);

            if (formData.role !== "superadmin" && !formData.schoolId) {
                  setError("Please select a school");
                  setLoading(false);
                  return;
            }

            const payload = { ...formData };
            if (formData.role === "superadmin") {
                  delete payload.schoolId;
            }

            const result = await register(payload);

            if (result.success) {
                  const role = result.data.role;
                  if (role === "superadmin") navigate("/superadmin");
                  else if (role === "admin") navigate("/admin");
                  else if (role === "teacher") navigate("/teacher");
                  else if (role === "student") navigate("/student");
            } else {
                  setError(result.error);
            }

            setLoading(false);
      };

      return (
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12">
                  {/* Background Image */}
                  <div className="absolute inset-0 z-0">
                        <img
                              src={schoolCorridor}
                              alt="Background"
                              className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
                  </div>

                  {/* Glassmorphism Card */}
                  <div className="w-full max-w-md p-8 relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl animate-fade-in-up">
                        <div className="text-center mb-8">
                              <h1 className="text-3xl font-bold text-white tracking-tight">Join Schools</h1>
                              <p className="mt-2 text-blue-100">Create your new account</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                              {error && (
                                    <div className="p-4 text-sm text-red-200 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
                                          {error}
                                    </div>
                              )}

                              <div className="space-y-1">
                                    <label htmlFor="name" className="block text-sm font-medium text-white/90 ml-1">
                                          Full Name
                                    </label>
                                    <input
                                          id="name"
                                          name="name"
                                          type="text"
                                          required
                                          value={formData.name}
                                          onChange={handleChange}
                                          className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-white placeholder-white/50 backdrop-blur-sm"
                                          placeholder="Bharat Dixit"
                                    />
                              </div>

                              <div className="space-y-1">
                                    <label htmlFor="email" className="block text-sm font-medium text-white/90 ml-1">
                                          Email Address
                                    </label>
                                    <input
                                          id="email"
                                          name="email"
                                          type="email"
                                          required
                                          value={formData.email}
                                          onChange={handleChange}
                                          className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-white placeholder-white/50 backdrop-blur-sm"
                                          placeholder="bharat01@gmail.com"
                                    />
                              </div>

                              <div className="space-y-1">
                                    <label htmlFor="password" className="block text-sm font-medium text-white/90 ml-1">
                                          Password
                                    </label>
                                    <input
                                          id="password"
                                          name="password"
                                          type="password"
                                          required
                                          value={formData.password}
                                          onChange={handleChange}
                                          className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-white placeholder-white/50 backdrop-blur-sm"
                                          placeholder="••••••••"
                                    />
                              </div>

                              <div className="space-y-1">
                                    <label htmlFor="role" className="block text-sm font-medium text-white/90 ml-1">
                                          Select Role
                                    </label>
                                    <select
                                          id="role"
                                          name="role"
                                          value={formData.role}
                                          onChange={handleChange}
                                          className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-white backdrop-blur-sm [option]:text-gray-900"
                                    >
                                          <option value="superadmin">Super Admin</option>
                                          <option value="admin">School Admin</option>
                                    </select>
                              </div>

                              {formData.role !== "superadmin" && (
                                    <div className="space-y-1">
                                          <label htmlFor="schoolId" className="block text-sm font-medium text-white/90 ml-1">
                                                Select School
                                          </label>
                                          <select
                                                id="schoolId"
                                                name="schoolId"
                                                value={formData.schoolId}
                                                onChange={handleChange}
                                                required={formData.role !== "superadmin"}
                                                className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-white backdrop-blur-sm [option]:text-gray-900"
                                          >
                                                <option value="" className="text-gray-500">Select a School</option>
                                                {schools.map((school) => (
                                                      <option key={school._id} value={school._id}>
                                                            {school.name}
                                                      </option>
                                                ))}
                                          </select>
                                    </div>
                              )}

                              <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full mt-4 py-4 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                              >
                                    {loading ? (
                                          <div className="flex items-center justify-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Creating account...
                                          </div>
                                    ) : (
                                          "Create Account"
                                    )}
                              </button>
                        </form>

                        <div className="text-center text-sm mt-6">
                              <span className="text-white/60">Already have an account? </span>
                              <Link to="/login" className="text-blue-300 hover:text-white font-semibold transition">
                                    Sign In
                              </Link>
                        </div>
                  </div>
            </div>
      );
}
