import { Link } from "react-router-dom";
import {
      ArrowRight,
      BookOpen,
      Users,
      ShieldCheck,
      BarChart3,
      GraduationCap,
      LayoutDashboard,
      CheckCircle2,
      Globe,
      Award,
      Clock
} from "lucide-react";
import { motion } from "framer-motion";
import Footer from "../components/Footer";
import landingHero from "../assets/landing_hero.png";
import dashboardPreview from "../assets/dashboard_preview.png";
import studentLearning from "../assets/student_learning.png";

export default function Home() {
      const fadeInUp = {
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
      };

      const staggerContainer = {
            hidden: { opacity: 0 },
            visible: {
                  opacity: 1,
                  transition: {
                        staggerChildren: 0.2
                  }
            }
      };

      return (
            <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
                  {/* Navbar - Glassmorphism */}
                  <motion.nav
                        initial={{ y: -100 }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm"
                  >
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                              <div className="flex justify-between items-center h-20">
                                    <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
                                                E
                                          </div>
                                          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
                                                EduManage<span className="font-light text-gray-400">Pro</span>
                                          </span>
                                    </div>
                                    <div className="hidden md:flex items-center gap-8">
                                          <a href="#features" className="text-gray-600 hover:text-blue-600 font-medium transition duration-300">Features</a>
                                          <a href="#about" className="text-gray-600 hover:text-blue-600 font-medium transition duration-300">About</a>
                                          <a href="#stats" className="text-gray-600 hover:text-blue-600 font-medium transition duration-300">Impact</a>
                                    </div>
                                    <div className="flex items-center gap-4">
                                          <Link to="/login" className="text-gray-700 hover:text-blue-700 font-semibold px-4 py-2 hover:bg-gray-100/50 rounded-lg transition duration-300">
                                                Login
                                          </Link>
                                          <Link
                                                to="/signup"
                                                className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-full font-medium transition duration-300 shadow-xl shadow-gray-900/10 hover:shadow-gray-900/20 transform hover:-translate-y-0.5 active:translate-y-0"
                                          >
                                                Get Started
                                          </Link>
                                    </div>
                              </div>
                        </div>
                  </motion.nav>

                  {/* Hero Section */}
                  <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-b from-blue-50/50 to-white">
                        <div className="absolute top-0 right-0 -z-10 w-[800px] h-[800px] bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-[120px] opacity-60 translate-x-1/3 -translate-y-1/3"></div>
                        <div className="absolute bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-400/20 to-cyan-400/20 rounded-full blur-[100px] opacity-40 -translate-x-1/3 translate-y-1/3"></div>

                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                              <div className="grid lg:grid-cols-2 gap-16 items-center">

                                    {/* Hero Content */}
                                    <motion.div
                                          initial="hidden"
                                          animate="visible"
                                          variants={staggerContainer}
                                          className="space-y-8"
                                    >
                                          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-blue-100 shadow-sm text-blue-700 text-sm font-bold uppercase tracking-wide">
                                                <span className="relative flex h-3 w-3">
                                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
                                                </span>
                                                The Future of Education
                                          </motion.div>

                                          <motion.h1 variants={fadeInUp} className="text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-gray-900">
                                                Manage your <br />
                                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient-x">
                                                      School Smarter
                                                </span>
                                          </motion.h1>

                                          <motion.p variants={fadeInUp} className="text-xl text-gray-600 max-w-xl leading-relaxed font-light">
                                                Empower your institution with a comprehensive management suite. Streamline administration, engage students, and enable teachers with our modern, intuitive platform.
                                          </motion.p>

                                          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 pt-2">
                                                <Link
                                                      to="/login"
                                                      className="px-10 py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition duration-300 flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 hover:shadow-blue-600/30 transform hover:-translate-y-1"
                                                >
                                                      Start Now <ArrowRight className="w-5 h-5" />
                                                </Link>
                                                <Link
                                                      to="/login"
                                                      className="px-10 py-4 bg-white text-gray-900 border-2 border-gray-100 rounded-full font-bold hover:border-gray-300 transition duration-300 flex items-center justify-center shadow-lg shadow-gray-200/50"
                                                >
                                                      View Demo
                                                </Link>
                                          </motion.div>

                                          <motion.div variants={fadeInUp} className="flex items-center gap-6 pt-6 border-t border-gray-100">
                                                <div className="flex -space-x-4">
                                                      {[1, 2, 3, 4].map(i => (
                                                            <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden shadow-md">
                                                                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" className="w-full h-full" />
                                                            </div>
                                                      ))}
                                                      <div className="w-12 h-12 rounded-full border-4 border-white bg-gray-900 text-white flex items-center justify-center text-xs font-bold shadow-md">
                                                            +2k
                                                      </div>
                                                </div>
                                                <div>
                                                      <div className="flex text-yellow-500">★★★★★</div>
                                                      <p className="text-sm font-medium text-gray-500">Trusted by top institutions</p>
                                                </div>
                                          </motion.div>
                                    </motion.div>

                                    {/* Hero Image / Dashboard Preview */}
                                    <motion.div
                                          initial={{ opacity: 0, x: 50 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                                          className="relative"
                                    >
                                          <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-[8px] border-white bg-gray-900">
                                                <img src={dashboardPreview} alt="Dashboard Preview" className="w-full h-auto object-cover transform hover:scale-105 transition duration-700" />

                                                {/* Floating Badges */}
                                                <motion.div
                                                      initial={{ y: 20, opacity: 0 }}
                                                      animate={{ y: 0, opacity: 1 }}
                                                      transition={{ delay: 1, duration: 0.5 }}
                                                      className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl flex items-center gap-4 z-20 border border-gray-100"
                                                >
                                                      <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                                                            <BarChart3 className="w-6 h-6" />
                                                      </div>
                                                      <div>
                                                            <p className="text-xs text-gray-500 font-bold uppercase">Growth</p>
                                                            <p className="text-lg font-bold text-gray-900">+124%</p>
                                                      </div>
                                                </motion.div>

                                                <motion.div
                                                      initial={{ y: -20, opacity: 0 }}
                                                      animate={{ y: 0, opacity: 1 }}
                                                      transition={{ delay: 1.2, duration: 0.5 }}
                                                      className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-xl flex items-center gap-4 z-20 border border-gray-100"
                                                >
                                                      <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                                                            <Users className="w-6 h-6" />
                                                      </div>
                                                      <div>
                                                            <p className="text-xs text-gray-500 font-bold uppercase">Active Users</p>
                                                            <p className="text-lg font-bold text-gray-900">2.5k+</p>
                                                      </div>
                                                </motion.div>
                                          </div>

                                          {/* Decorative Elements behind image */}
                                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-100/50 rounded-full blur-3xl -z-10"></div>
                                    </motion.div>

                              </div>
                        </div>
                  </section>

                  {/* Modern Features Grid */}
                  <section id="features" className="py-24 bg-gray-50 relative overflow-hidden">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                              <div className="text-center max-w-3xl mx-auto mb-20">
                                    <h2 className="text-base font-bold text-blue-600 uppercase tracking-widest mb-3">Capabilities</h2>
                                    <h3 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Built for Modern Education</h3>
                                    <p className="text-xl text-gray-600 leading-relaxed font-light">
                                          Everything you need to manage your institution efficiently, beautifully designed for a seamless experience.
                                    </p>
                              </div>

                              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {[
                                          {
                                                icon: <LayoutDashboard className="w-6 h-6" />,
                                                title: "Central Command",
                                                desc: "A unified dashboard giving you a birds-eye view of your entire institution's daily operations.",
                                                color: "blue"
                                          },
                                          {
                                                icon: <Users className="w-6 h-6" />,
                                                title: "People Management",
                                                desc: "Effortlessly manage student records, teacher profiles, and staff details in one secure place.",
                                                color: "purple"
                                          },
                                          {
                                                icon: <BarChart3 className="w-6 h-6" />,
                                                title: "Advanced Analytics",
                                                desc: "Make data-driven decisions with real-time insights into attendance, grades, and financial health.",
                                                color: "indigo"
                                          },
                                          {
                                                icon: <ShieldCheck className="w-6 h-6" />,
                                                title: "Secure & Verified",
                                                desc: "Bank-grade security ensures sensitive student data is protected and always compliant.",
                                                color: "emerald"
                                          },
                                          {
                                                icon: <BookOpen className="w-6 h-6" />,
                                                title: "Digital Curriculum",
                                                desc: "Organize coursework, manage assignments, and track academic progress digitally.",
                                                color: "orange"
                                          },
                                          {
                                                icon: <Globe className="w-6 h-6" />,
                                                title: "Connected Campus",
                                                desc: "Foster community with integrated communication tools for students, parents, and teachers.",
                                                color: "cyan"
                                          }
                                    ].map((feature, idx) => (
                                          <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: idx * 0.1 }}
                                                whileHover={{ y: -5 }}
                                                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group"
                                          >
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 bg-${feature.color}-50 text-${feature.color}-600 group-hover:bg-${feature.color}-600 group-hover:text-white`}>
                                                      {feature.icon}
                                                </div>
                                                <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                                                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                                          </motion.div>
                                    ))}
                              </div>
                        </div>
                  </section>

                  {/* Visual Section - Campus Life */}
                  <section className="py-24 bg-white overflow-hidden">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                              <div className="grid lg:grid-cols-2 gap-16 items-center">
                                    <motion.div
                                          initial={{ opacity: 0, x: -50 }}
                                          whileInView={{ opacity: 1, x: 0 }}
                                          viewport={{ once: true }}
                                          transition={{ duration: 0.8 }}
                                          className="relative"
                                    >
                                          <div className="absolute top-0 -left-4 w-full h-full bg-yellow-100 rounded-3xl transform rotate-3 z-0"></div>
                                          <img src={studentLearning} alt="Students" className="relative z-10 w-full rounded-3xl shadow-2xl" />
                                    </motion.div>

                                    <div className="space-y-8">
                                          <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                                                Focus on what matters: <br />
                                                <span className="text-blue-600">Student Success</span>
                                          </h2>
                                          <p className="text-lg text-gray-600 leading-relaxed font-light">
                                                Our platform handles the administrative burden so educators can focus on teaching. With intuitive tools for grading, attendance, and feedback, we bridge the gap between efficiency and quality education.
                                          </p>

                                          <div className="space-y-4">
                                                {[
                                                      "Automated Attendance Tracking",
                                                      "Seamless Assignment Submission",
                                                      "Instant Performance Feedback",
                                                      "Parent-Teacher Communication Channel"
                                                ].map((item, idx) => (
                                                      <div key={idx} className="flex items-center gap-3">
                                                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                            <span className="text-gray-700 font-medium">{item}</span>
                                                      </div>
                                                ))}
                                          </div>

                                          <div className="pt-4">
                                                <button className="text-blue-600 font-bold hover:text-blue-700 flex items-center gap-2 group">
                                                      Learn about our mission <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
                                                </button>
                                          </div>
                                    </div>
                              </div>
                        </div>
                  </section>

                  {/* Stats / Impact Section */}
                  <section id="stats" className="py-24 bg-gray-900 text-white relative overflow-hidden">
                        <div className="absolute inset-0 z-0">
                              <img src={landingHero} alt="Background" className="w-full h-full object-cover opacity-10" />
                              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
                        </div>

                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                              <div className="text-center mb-16">
                                    <h2 className="text-3xl font-bold mb-4">Trusted by Leading Institutions</h2>
                                    <p className="text-gray-400 max-w-2xl mx-auto">Join hundreds of schools that have modernized their operations.</p>
                              </div>

                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-x divide-gray-800/50">
                                    {[
                                          { value: "500+", label: "Schools Partnered", icon: <Award className="w-6 h-6 mx-auto mb-2 text-yellow-500" /> },
                                          { value: "150k+", label: "Active Students", icon: <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" /> },
                                          { value: "99.9%", label: "Uptime Guaranteed", icon: <ShieldCheck className="w-6 h-6 mx-auto mb-2 text-green-500" /> },
                                          { value: "24/7", label: "Customer Support", icon: <Clock className="w-6 h-6 mx-auto mb-2 text-purple-500" /> }
                                    ].map((stat, idx) => (
                                          <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: idx * 0.1 }}
                                          >
                                                {stat.icon}
                                                <div className="text-4xl font-extrabold text-white mb-2">{stat.value}</div>
                                                <div className="text-sm font-medium text-gray-400 uppercase tracking-wide">{stat.label}</div>
                                          </motion.div>
                                    ))}
                              </div>
                        </div>
                  </section>

                  {/* CTA Section */}
                  <section className="py-20 bg-blue-600 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-[100px] opacity-50 translate-x-1/2 -translate-y-1/2"></div>
                        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center text-white">
                              <h2 className="text-4xl font-bold mb-6">Ready to Transform Your School?</h2>
                              <p className="text-xl text-blue-100 mb-10 font-light">
                                    Join the education revolution today. Get started with EduManage Pro and experience the difference.
                              </p>
                              <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <Link to="/signup" className="px-10 py-4 bg-white text-blue-600 rounded-full font-bold hover:bg-gray-100 transition shadow-xl">
                                          Get Started for Free
                                    </Link>
                                    <Link to="/login" className="px-10 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold hover:bg-blue-700 transition">
                                          Contact Sales
                                    </Link>
                              </div>
                        </div>
                  </section>

                  <Footer />
            </div>
      );
}
