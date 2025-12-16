import { useState, useEffect } from "react";
import { Camera, FileText, Check, AlertCircle, Save } from "lucide-react";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function ProfileForm() {
      const { user } = useAuth();
      const [profile, setProfile] = useState(null);
      const [formData, setFormData] = useState({
            address: "",
            qualification: "",
            experience: "",
            fathersName: "",
            mothersName: "",
            dob: "",
      });
      const [files, setFiles] = useState({});
      const [loading, setLoading] = useState(false);
      const [uploading, setUploading] = useState(false);
      const [message, setMessage] = useState({ type: "", text: "" });

      useEffect(() => {
            fetchProfile();
      }, []);

      const fetchProfile = async () => {
            setLoading(true);
            try {
                  const res = await api.get("/profile/me");
                  if (res.data) {
                        setProfile(res.data);
                        setFormData({
                              address: res.data.address || "",
                              qualification: res.data.qualification || "",
                              experience: res.data.experience || "",
                              fathersName: res.data.fathersName || "",
                              mothersName: res.data.mothersName || "",
                              dob: res.data.dob ? res.data.dob.split("T")[0] : "",
                        });
                  }
            } catch (err) {
                  // Profile might not exist yet, which is fine

            } finally {
                  setLoading(false);
            }
      };

      const handleChange = (e) => {
            setFormData({ ...formData, [e.target.name]: e.target.value });
      };

      const handleFileChange = (e) => {
            setFiles({ ...files, [e.target.name]: e.target.files[0] });
      };

      const handleSubmit = async (e) => {
            e.preventDefault();
            setUploading(true);
            setMessage({ type: "", text: "" });

            try {
                  const data = new FormData();
                  // Append text fields
                  data.append("address", formData.address);
                  if (user.role === "teacher") {
                        data.append("qualification", formData.qualification);
                        data.append("experience", formData.experience);
                  } else if (user.role === "student") {
                        data.append("fathersName", formData.fathersName);
                        data.append("mothersName", formData.mothersName);
                        data.append("dob", formData.dob);
                  }

                  // Append files
                  if (files.photo) data.append("photo", files.photo);
                  if (files.adharCard) data.append("adharCard", files.adharCard);

                  if (user.role === "teacher") {
                        if (files.panCard) data.append("panCard", files.panCard);
                        if (files.marksheet) data.append("marksheet", files.marksheet);
                  } else if (user.role === "student") {
                        if (files.fatherAdharCard) data.append("fatherAdharCard", files.fatherAdharCard);
                  }

                  await api.post("/profile", data, {
                        headers: { "Content-Type": "multipart/form-data" },
                  });

                  setMessage({ type: "success", text: "Profile updated successfully!" });
                  fetchProfile(); // Refresh
                  setFiles({}); // Clear file inputs
            } catch (err) {
                  console.error(err);
                  setMessage({ type: "error", text: "Failed to update profile." });
            } finally {
                  setUploading(false);
            }
      };

      const getDocStatus = (name) => {
            const doc = profile?.documents?.find(d => d.name === name);
            if (!doc) return "Not Uploaded";
            return doc.status; // Pending, Approved, Rejected
      };

      return (
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in p-1">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                              {user.role === "teacher" ? <FileText className="w-5 h-5 text-indigo-600" /> : <FileText className="w-5 h-5 text-indigo-600" />}
                              My Profile & Documents
                        </h2>

                        {message.text && (
                              <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                    {message.text}
                              </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                              {/* Photo Upload */}
                              <div className="flex items-center gap-4">
                                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 relative group">
                                          {profile?.photo?.url ? (
                                                <img src={profile.photo.url} alt="Profile" className="w-full h-full object-cover" />
                                          ) : files.photo ? (
                                                <img src={URL.createObjectURL(files.photo)} alt="Preview" className="w-full h-full object-cover" />
                                          ) : (
                                                <Camera className="w-8 h-8 text-gray-400" />
                                          )}
                                          <input
                                                type="file"
                                                name="photo"
                                                onChange={handleFileChange}
                                                accept="image/*"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                          />
                                    </div>
                                    <div>
                                          <p className="font-medium text-gray-700">Profile Photo</p>
                                          <p className="text-xs text-gray-500">Tap image to upload new</p>
                                    </div>
                              </div>

                              {/* Common Fields */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                          <textarea
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                rows="3"
                                          />
                                    </div>
                              </div>

                              {/* Role Specific Fields & Docs */}
                              {user.role === "teacher" && (
                                    <>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                      <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                                                      <input
                                                            type="text"
                                                            name="qualification"
                                                            value={formData.qualification}
                                                            onChange={handleChange}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                      />
                                                </div>
                                                <div>
                                                      <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                                                      <input
                                                            type="number"
                                                            name="experience"
                                                            value={formData.experience}
                                                            onChange={handleChange}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                      />
                                                </div>
                                          </div>

                                          <div className="border-t border-gray-100 pt-4">
                                                <h3 className="text-md font-semibold text-gray-800 mb-4">Verification Documents</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                      {["Adhar Card", "Pan Card", "Marksheet"].map((docName) => {
                                                            const key = docName === "Adhar Card" ? "adharCard" : docName === "Pan Card" ? "panCard" : "marksheet";
                                                            const status = getDocStatus(docName);
                                                            return (
                                                                  <div key={docName} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                                                        <div className="flex justify-between items-start mb-2">
                                                                              <span className="font-medium text-sm text-gray-700">{docName}</span>
                                                                              <span className={`text-xs px-2 py-0.5 rounded-full border ${status === "Approved" ? "bg-green-100 text-green-700 border-green-200" :
                                                                                    status === "Rejected" ? "bg-red-100 text-red-700 border-red-200" :
                                                                                          status === "Pending" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                                                                                                "bg-gray-100 text-gray-500 border-gray-200"
                                                                                    }`}>{status}</span>
                                                                        </div>
                                                                        <input
                                                                              type="file"
                                                                              name={key}
                                                                              onChange={handleFileChange}
                                                                              accept=".jpg,.jpeg,.png,.pdf"
                                                                              className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300"
                                                                        />
                                                                  </div>
                                                            );
                                                      })}
                                                </div>
                                          </div>
                                    </>
                              )}

                              {user.role === "student" && (
                                    <>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                      <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
                                                      <input
                                                            type="text"
                                                            name="fathersName"
                                                            value={formData.fathersName}
                                                            onChange={handleChange}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                      />
                                                </div>
                                                <div>
                                                      <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name</label>
                                                      <input
                                                            type="text"
                                                            name="mothersName"
                                                            value={formData.mothersName}
                                                            onChange={handleChange}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                      />
                                                </div>
                                                <div>
                                                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                                      <input
                                                            type="date"
                                                            name="dob"
                                                            value={formData.dob}
                                                            onChange={handleChange}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                      />
                                                </div>
                                          </div>

                                          <div className="border-t border-gray-100 pt-4">
                                                <h3 className="text-md font-semibold text-gray-800 mb-4">Verification Documents</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                      {["Adhar Card", "Father's Adhar Card"].map((docName) => {
                                                            const key = docName === "Adhar Card" ? "adharCard" : "fatherAdharCard";
                                                            const status = getDocStatus(docName);
                                                            return (
                                                                  <div key={docName} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                                                        <div className="flex justify-between items-start mb-2">
                                                                              <span className="font-medium text-sm text-gray-700">{docName}</span>
                                                                              <span className={`text-xs px-2 py-0.5 rounded-full border ${status === "Approved" ? "bg-green-100 text-green-700 border-green-200" :
                                                                                    status === "Rejected" ? "bg-red-100 text-red-700 border-red-200" :
                                                                                          status === "Pending" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                                                                                                "bg-gray-100 text-gray-500 border-gray-200"
                                                                                    }`}>{status}</span>
                                                                        </div>
                                                                        <input
                                                                              type="file"
                                                                              name={key}
                                                                              onChange={handleFileChange}
                                                                              accept=".jpg,.jpeg,.png,.pdf"
                                                                              className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300"
                                                                        />
                                                                  </div>
                                                            );
                                                      })}
                                                </div>
                                          </div>
                                    </>
                              )}

                              <div className="flex justify-end">
                                    <button
                                          type="submit"
                                          disabled={uploading}
                                          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
                                    >
                                          {uploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                                          Save Profile
                                    </button>
                              </div>
                        </form>
                  </div>
            </div>
      );
}
