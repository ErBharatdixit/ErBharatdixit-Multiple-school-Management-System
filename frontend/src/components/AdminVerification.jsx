import { useState, useEffect } from "react";
import { Check, X, Eye, FileText, CheckCircle, XCircle, Search } from "lucide-react";
import api from "../api";

export default function AdminVerification() {
      const [profiles, setProfiles] = useState([]);
      const [filteredProfiles, setFilteredProfiles] = useState([]);
      const [loading, setLoading] = useState(false);
      const [selectedProfile, setSelectedProfile] = useState(null);
      const [roleFilter, setRoleFilter] = useState("all"); // 'all', 'teacher', 'student'
      const [statusFilter, setStatusFilter] = useState("Pending"); // 'Pending', 'Approved', 'Rejected', 'all'
      const [verifying, setVerifying] = useState(false);

      useEffect(() => {
            fetchPendingProfiles();
      }, []);

      const fetchPendingProfiles = async () => {
            setLoading(true);
            try {
                  const res = await api.get("/profile/pending");
                  setProfiles(res.data);
                  filterProfiles(res.data, roleFilter, statusFilter);
            } catch (err) {
                  console.error(err);
            } finally {
                  setLoading(false);
            }
      };

      const filterProfiles = (data, role, status) => {
            let filtered = data;
            if (role !== "all") {
                  filtered = filtered.filter(p => p.userId?.role === role);
            }
            if (status !== "all") {
                  // status is verificationStatus which is overall
                  // But user might want to see those with ANY pending doc?
                  // backend returns everything not 'Approved' fully.
                  // Let's filter by profile.verificationStatus
                  filtered = filtered.filter(p => p.verificationStatus === status);
            }
            setFilteredProfiles(filtered);
      };

      useEffect(() => {
            filterProfiles(profiles, roleFilter, statusFilter);
      }, [roleFilter, statusFilter, profiles]);


      const handleVerify = async (profileId, docId, status, rejectionReason = "") => {
            setVerifying(true);
            try {
                  await api.patch(`/profile/verify/${profileId}`, {
                        docId,
                        status,
                        rejectionReason
                  });

                  // Updating local state
                  const updatedProfiles = profiles.map(p => {
                        if (p._id === profileId) {
                              const updatedDocs = p.documents.map(d => {
                                    if (d._id === docId) return { ...d, status, rejectionReason };
                                    return d;
                              });
                              // Ideally re-calc verificationStatus or fetch fresh
                              // Let's fetch fresh for accuracy
                              return p;
                        }
                        return p;
                  });
                  setProfiles(updatedProfiles); // This will trigger re-fetch basically? No.
                  fetchPendingProfiles(); // safest

                  if (selectedProfile && selectedProfile._id === profileId) {
                        // refresh modal view
                        // We can just rely on fetchPendingProfiles updating the selectedProfile logic if we find it again
                  }

            } catch (err) {
                  alert("Verification failed");
            } finally {
                  setVerifying(false);
            }
      };

      return (
            <div className="space-y-6 animate-fade-in p-1">
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-indigo-600" />
                              Verification Requests
                        </h2>
                        <div className="flex gap-2">
                              <select
                                    className="border border-gray-300 rounded-md text-sm px-3 py-1.5 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={roleFilter}
                                    onChange={e => setRoleFilter(e.target.value)}
                              >
                                    <option value="all">All Roles</option>
                                    <option value="teacher">Teachers</option>
                                    <option value="student">Students</option>
                              </select>
                              <select
                                    className="border border-gray-300 rounded-md text-sm px-3 py-1.5 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value)}
                              >
                                    <option value="Pending">Pending</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Partial">Partial</option>
                                    <option value="all">All Status</option>
                              </select>
                        </div>
                  </div>

                  {/* List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                              <p className="col-span-full text-center py-12 text-gray-500">Loading...</p>
                        ) : filteredProfiles.length === 0 ? (
                              <p className="col-span-full text-center py-12 text-gray-500">No profiles found matching filters.</p>
                        ) : (
                              filteredProfiles.map(profile => (
                                    <div key={profile._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                                          <div className="p-4 flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                      <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden">
                                                            {profile.photo?.url ? (
                                                                  <img src={profile.photo.url} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                  <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl">
                                                                        {profile.userId?.name?.charAt(0)}
                                                                  </div>
                                                            )}
                                                      </div>
                                                      <div>
                                                            <h3 className="font-bold text-gray-900">{profile.userId?.name}</h3>
                                                            <span className="text-xs uppercase font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                                  {profile.role}
                                                            </span>
                                                      </div>
                                                </div>
                                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${profile.verificationStatus === "Approved" ? "bg-green-100 text-green-700" :
                                                      profile.verificationStatus === "Rejected" ? "bg-red-100 text-red-700" :
                                                            "bg-yellow-100 text-yellow-700"
                                                      }`}>
                                                      {profile.verificationStatus}
                                                </span>
                                          </div>

                                          <div className="px-4 py-2 bg-gray-50 border-t border-b border-gray-100 text-xs text-gray-500 grid grid-cols-2 gap-2">
                                                <div>
                                                      <span className="block font-medium text-gray-700">Submitted Docs</span>
                                                      {profile.documents.length}
                                                </div>
                                                <div>
                                                      <span className="block font-medium text-gray-700">Date</span>
                                                      {new Date(profile.updatedAt).toLocaleDateString()}
                                                </div>
                                          </div>

                                          <div className="p-4 mt-auto">
                                                <button
                                                      onClick={() => setSelectedProfile(profile)}
                                                      className="w-full py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-medium transition"
                                                >
                                                      Review Documents
                                                </button>
                                          </div>
                                    </div>
                              ))
                        )}
                  </div>

                  {/* Review Modal */}
                  {selectedProfile && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                              <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
                                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                                          <h3 className="font-bold text-lg text-gray-800">Verifying {selectedProfile.userId?.name}</h3>
                                          <button onClick={() => setSelectedProfile(null)} className="p-2 hover:bg-gray-200 rounded-full transition"><X className="w-5 h-5 text-gray-500" /></button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                          {/* Details Section */}
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                                <div>
                                                      <p className="text-xs text-blue-600 font-bold uppercase mb-1">Personal Info</p>
                                                      <p className="text-sm"><span className="font-semibold">Email:</span> {selectedProfile.userId?.email}</p>
                                                      <p className="text-sm"><span className="font-semibold">Address:</span> {selectedProfile.address || "N/A"}</p>
                                                </div>
                                                {selectedProfile.role === "teacher" ? (
                                                      <div>
                                                            <p className="text-xs text-blue-600 font-bold uppercase mb-1">Professional Info</p>
                                                            <p className="text-sm"><span className="font-semibold">Qualification:</span> {selectedProfile.qualification || "N/A"}</p>
                                                            <p className="text-sm"><span className="font-semibold">Experience:</span> {selectedProfile.experience || 0} years</p>
                                                      </div>
                                                ) : (
                                                      <div>
                                                            <p className="text-xs text-blue-600 font-bold uppercase mb-1">Guardian Info</p>
                                                            <p className="text-sm"><span className="font-semibold">Father:</span> {selectedProfile.fathersName || "N/A"}</p>
                                                            <p className="text-sm"><span className="font-semibold">Mother:</span> {selectedProfile.mothersName || "N/A"}</p>
                                                      </div>
                                                )}
                                          </div>

                                          {/* Documents Grid */}
                                          <div className="space-y-4">
                                                {selectedProfile.documents.map(doc => (
                                                      <div key={doc._id} className="border border-gray-200 rounded-xl overflow-hidden flex flex-col md:flex-row">
                                                            {/* Document Preview */}
                                                            <div className="w-full md:w-1/2 h-64 bg-gray-100 relative group border-b md:border-b-0 md:border-r border-gray-200">
                                                                  {doc.url.endsWith(".pdf") ? (
                                                                        <iframe src={doc.url} className="w-full h-full" title={doc.name}></iframe>
                                                                  ) : (
                                                                        <img src={doc.url} alt={doc.name} className="w-full h-full object-contain p-2" />
                                                                  )}
                                                                  <a href={doc.url} target="_blank" rel="noreferrer" className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white text-indigo-600 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition">
                                                                        <Eye className="w-4 h-4" />
                                                                  </a>
                                                            </div>

                                                            {/* Action Area */}
                                                            <div className="p-6 flex-1 flex flex-col justify-center">
                                                                  <h4 className="font-bold text-lg text-gray-800 mb-1">{doc.name}</h4>
                                                                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold w-fit mb-6 ${doc.status === "Approved" ? "bg-green-100 text-green-700" :
                                                                        doc.status === "Rejected" ? "bg-red-100 text-red-700" :
                                                                              "bg-yellow-100 text-yellow-700"
                                                                        }`}>
                                                                        {doc.status}
                                                                  </div>

                                                                  {doc.status !== "Approved" ? (
                                                                        <div className="flex gap-3">
                                                                              <button
                                                                                    onClick={() => handleVerify(selectedProfile._id, doc._id, "Approved")}
                                                                                    disabled={verifying}
                                                                                    className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition flex justify-center items-center gap-2"
                                                                              >
                                                                                    <Check className="w-4 h-4" /> Approve
                                                                              </button>
                                                                              <button
                                                                                    onClick={() => {
                                                                                          const reason = prompt("Enter rejection reason:");
                                                                                          if (reason) handleVerify(selectedProfile._id, doc._id, "Rejected", reason);
                                                                                    }}
                                                                                    disabled={verifying}
                                                                                    className="flex-1 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition flex justify-center items-center gap-2"
                                                                              >
                                                                                    <X className="w-4 h-4" /> Reject
                                                                              </button>
                                                                        </div>
                                                                  ) : (
                                                                        <div className="w-full py-2 bg-green-50 text-green-700 rounded-lg font-medium flex justify-center items-center gap-2 border border-green-200">
                                                                              <CheckCircle className="w-4 h-4" />
                                                                              Approved
                                                                        </div>
                                                                  )}
                                                                  {doc.status === "Rejected" && (
                                                                        <p className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded">
                                                                              <span className="font-bold">Reason:</span> {doc.rejectionReason}
                                                                        </p>
                                                                  )}
                                                            </div>
                                                      </div>
                                                ))}
                                          </div>
                                    </div>
                              </div>
                        </div>
                  )}
            </div>
      );
}
