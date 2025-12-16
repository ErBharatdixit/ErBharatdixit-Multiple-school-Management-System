import { useState, useEffect } from "react";
import { X, Eye, CheckCircle, XCircle } from "lucide-react";
import api from "../api";

export default function UserProfileModal({ isOpen, onClose, userId }) {
      const [profile, setProfile] = useState(null);
      const [loading, setLoading] = useState(false);

      useEffect(() => {
            if (isOpen && userId) {
                  fetchProfile();
            } else {
                  setProfile(null);
            }
      }, [isOpen, userId]);

      const fetchProfile = async () => {
            setLoading(true);
            try {
                  const res = await api.get(`/profile/user/${userId}`);
                  setProfile(res.data);
            } catch (err) {
                  console.error("Failed to fetch profile", err);
                  setProfile(null);
            } finally {
                  setLoading(false);
            }
      };

      if (!isOpen) return null;

      return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                  <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                              <h3 className="font-bold text-lg text-gray-800">User Profile</h3>
                              <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition"><X className="w-5 h-5 text-gray-500" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                              {loading ? (
                                    <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
                              ) : !profile ? (
                                    <div className="text-center py-12 text-gray-500">
                                          <p>Profile not created yet.</p>
                                    </div>
                              ) : (
                                    <div className="space-y-8">
                                          {/* Header Info */}
                                          <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
                                                <div className="w-16 h-16 rounded-full bg-white border border-blue-200 overflow-hidden flex-shrink-0">
                                                      {profile.photo?.url ? (
                                                            <img src={profile.photo.url} alt="Profile" className="w-full h-full object-cover" />
                                                      ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-blue-300 font-bold text-2xl">
                                                                  {profile.userId?.name?.charAt(0) || "U"}
                                                            </div>
                                                      )}
                                                </div>
                                                <div>
                                                      <h2 className="text-xl font-bold text-gray-900">{profile.userId?.name}</h2>
                                                      <div className="flex gap-2 mt-1">
                                                            <span className="px-2 py-0.5 text-xs font-bold uppercase rounded-full bg-white text-blue-600 border border-blue-200">
                                                                  {profile.role}
                                                            </span>
                                                            <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded-full border ${profile.verificationStatus === "Approved" ? "bg-green-100 text-green-700 border-green-200" :
                                                                        profile.verificationStatus === "Rejected" ? "bg-red-100 text-red-700 border-red-200" :
                                                                              "bg-yellow-100 text-yellow-700 border-yellow-200"
                                                                  }`}>
                                                                  {profile.verificationStatus}
                                                            </span>
                                                      </div>
                                                </div>
                                          </div>

                                          {/* Details Grid */}
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-1">
                                                      <p className="text-xs text-gray-500 font-bold uppercase">Contact</p>
                                                      <p className="text-sm font-medium text-gray-900">{profile.address || "N/A"}</p>
                                                </div>
                                                {profile.role === "teacher" ? (
                                                      <>
                                                            <div className="space-y-1">
                                                                  <p className="text-xs text-gray-500 font-bold uppercase">Qualification</p>
                                                                  <p className="text-sm font-medium text-gray-900">{profile.qualification || "N/A"}</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                  <p className="text-xs text-gray-500 font-bold uppercase">Experience</p>
                                                                  <p className="text-sm font-medium text-gray-900">{profile.experience || 0} Years</p>
                                                            </div>
                                                      </>
                                                ) : (
                                                      <>
                                                            <div className="space-y-1">
                                                                  <p className="text-xs text-gray-500 font-bold uppercase">Father's Name</p>
                                                                  <p className="text-sm font-medium text-gray-900">{profile.fathersName || "N/A"}</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                  <p className="text-xs text-gray-500 font-bold uppercase">Mother's Name</p>
                                                                  <p className="text-sm font-medium text-gray-900">{profile.mothersName || "N/A"}</p>
                                                            </div>
                                                      </>
                                                )}
                                          </div>

                                          {/* Documents */}
                                          <div>
                                                <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">Documents</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                      {profile.documents.map(doc => (
                                                            <div key={doc._id} className="border border-gray-200 rounded-lg overflow-hidden group">
                                                                  <div className="h-40 bg-gray-100 relative">
                                                                        {doc.url.endsWith(".pdf") ? (
                                                                              <div className="w-full h-full flex items-center justify-center text-gray-400">PDF Preview</div>
                                                                        ) : (
                                                                              <img src={doc.url} alt={doc.name} className="w-full h-full object-cover" />
                                                                        )}
                                                                        <a href={doc.url} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                                                                              <Eye className="w-8 h-8 drop-shadow-lg" />
                                                                        </a>
                                                                  </div>
                                                                  <div className="p-3 bg-gray-50 flex justify-between items-center">
                                                                        <span className="text-sm font-semibold">{doc.name}</span>
                                                                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${doc.status === "Approved" ? "bg-green-100 text-green-700" :
                                                                                    doc.status === "Rejected" ? "bg-red-100 text-red-700" :
                                                                                          "bg-yellow-100 text-yellow-700"
                                                                              }`}>
                                                                              {doc.status}
                                                                        </span>
                                                                  </div>
                                                            </div>
                                                      ))}
                                                </div>
                                          </div>
                                    </div>
                              )}
                        </div>
                  </div>
            </div>
      );
}
