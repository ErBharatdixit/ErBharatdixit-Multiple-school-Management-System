import { Mail, Phone, MapPin, Facebook, Github, Instagram, Linkedin, Heart } from "lucide-react";

export default function Footer() {
      return (
            <footer className="bg-gray-900 text-white pt-16 pb-8 border-t border-gray-800">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                              {/* Brand Section */}
                              <div className="col-span-1 md:col-span-2">
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-4">
                                          EduManage Pro
                                    </h2>
                                    <p className="text-gray-400 mb-6 max-w-sm">
                                          Empowering educational institutions with cutting-edge digital solutions. Streamlining management, enhancing learning.
                                    </p>
                                    <div className="flex gap-4">
                                          <a href="https://www.facebook.com/bharat.dixit.5872/" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition duration-300">
                                                <Facebook className="w-5 h-5" />
                                          </a>
                                          
                                          <a href="https://www.instagram.com/panditbharatdixit/" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition duration-300">
                                                <Instagram className="w-5 h-5" />
                                          </a>
                                          <a href="https://www.linkedin.com/in/bharat-dixit-8a3555296/" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-700 transition duration-300">
                                                <Linkedin className="w-5 h-5" />
                                          </a>
                                          <a href="https://github.com/ErBharatdixit" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-700 transition duration-300">
                                                <Github className="w-5 h-5" />
                                          </a>
                                    </div>
                              </div>

                              {/* Quick Links */}
                              <div>
                                    <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
                                    <ul className="space-y-4 text-gray-400">
                                          <li><a href="#" className="hover:text-blue-400 transition">About Us</a></li>
                                          <li><a href="#" className="hover:text-blue-400 transition">Admissions</a></li>
                                          <li><a href="#" className="hover:text-blue-400 transition">Academics</a></li>
                                          <li><a href="#" className="hover:text-blue-400 transition">Contact</a></li>
                                    </ul>
                              </div>

                              {/* Contact Info */}
                              <div>
                                    <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
                                    <ul className="space-y-4 text-gray-400">
                                          <li className="flex items-start gap-3">
                                                <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                                <span>123 knowledge Ave, Education City, India</span>
                                          </li>
                                          <li className="flex items-center gap-3">
                                                <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                                                <span>+91 7068876861</span>
                                          </li>
                                          <li className="flex items-center gap-3">
                                                <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                                                <span>bharat010703@gmail.com</span>
                                          </li>
                                    </ul>
                              </div>
                        </div>

                        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                              <p className="text-gray-500 text-sm">
                                    © 2025 EduManage Pro. All rights reserved.
                              </p>
                              <div className="flex items-center gap-1 text-gray-500 text-sm">
                                    <span>Made with</span>
                                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                                    <span>by Bharat Dixit</span>
                              </div>
                        </div>
                  </div>
            </footer>
      );
}
