import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import schoolCorridor from "../assets/school_corridor.png";

export default function Login() {
      const [email, setEmail] = useState("");
      const [password, setPassword] = useState("");
      const [error, setError] = useState("");
      const [loading, setLoading] = useState(false);
      const { login } = useAuth();
      const navigate = useNavigate();

      const handleSubmit = async (e) => {
            e.preventDefault();
            setError("");
            setLoading(true);

            const result = await login(email, password);

            if (result.success) {
                  // Redirect based on role
                  const role = result.data.role;
                  if (role === "superadmin") navigate("/superadmin");
                  else if (role === "admin") navigate("/admin");
                  else if (role === "teacher") navigate("/teacher");
                  else if (role === "student") navigate("/student");
                  else if (role === "parent") navigate("/parent");
            } else {
                  setError(result.error);
            }

            setLoading(false);
      };

      return (
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
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
                  <div className="w-full max-w-md p-8 pt-10 pb-10 space-y-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl relative z-10 animate-fade-in-up">
                        <div className="text-center">
                              <h1 className="text-4xl font-bold text-white tracking-tight">Welcome Back</h1>
                              <p className="mt-2 text-blue-100">Sign in to EduManage Pro</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                              {error && (
                                    <div className="p-4 text-sm text-red-200 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
                                          {error}
                                    </div>
                              )}

                              <div className="space-y-2">
                                    <label htmlFor="email" className="block text-sm font-medium text-white/90 ml-1">
                                          Email Address
                                    </label>
                                    <input
                                          id="email"
                                          type="email"
                                          required
                                          value={email}
                                          onChange={(e) => setEmail(e.target.value)}
                                          className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-white placeholder-white/50 backdrop-blur-sm"
                                          placeholder="bharat01@gmail.com"
                                    />
                              </div>

                              <div className="space-y-2">
                                    <label htmlFor="password" className="block text-sm font-medium text-white/90 ml-1">
                                          Password
                                    </label>
                                    <input
                                          id="password"
                                          type="password"
                                          required
                                          value={password}
                                          onChange={(e) => setPassword(e.target.value)}
                                          className="w-full px-5 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-white placeholder-white/50 backdrop-blur-sm"
                                          placeholder="••••••••"
                                    />
                              </div>

                              <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                              >
                                    {loading ? (
                                          <div className="flex items-center justify-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Signing in...
                                          </div>
                                    ) : (
                                          "Sign In"
                                    )}
                              </button>
                        </form>

                        <div className="text-center text-sm">
                              <span className="text-white/60">Don't have an account? </span>
                              <Link to="/signup" className="text-blue-300 hover:text-white font-semibold transition">
                                    Create Account
                              </Link>
                        </div>
                  </div>
            </div>
      );
}
