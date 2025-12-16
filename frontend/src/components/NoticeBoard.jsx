import { useState, useEffect } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { Plus, Trash2, Megaphone, Calendar, Users } from "lucide-react";

export default function NoticeBoard() {
      const { user } = useAuth();
      const [notices, setNotices] = useState([]);
      const [classes, setClasses] = useState([]);
      const [loading, setLoading] = useState(true);
      const [showModal, setShowModal] = useState(false);
      const [newNotice, setNewNotice] = useState({ title: "", content: "", targetAudience: "all", targetClassId: "" });

      const isAdmin = user?.role === "admin" || user?.role === "superadmin";


      useEffect(() => {
            fetchNotices();
            if (isAdmin) {
                  fetchClasses();
            }
      }, []);

      const fetchNotices = async () => {
            try {
                  const res = await api.get("/notices");
                  setNotices(res.data);
            } catch (error) {
                  console.error("Failed to fetch notices:", error);
            } finally {
                  setLoading(false);
            }
      };

      const fetchClasses = async () => {
            try {
                  const res = await api.get("/academic/classes");
                  setClasses(res.data);
            } catch (error) {
                  console.error("Failed to fetch classes:", error);
            }
      };

      const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                  const payload = {
                        ...newNotice,
                        // If target is not student, clear class selection
                        targetClassId: newNotice.targetAudience === "student" && newNotice.targetClassId ? newNotice.targetClassId : null
                  };
                  await api.post("/notices", payload);
                  setShowModal(false);
                  setNewNotice({ title: "", content: "", targetAudience: "all", targetClassId: "" });
                  fetchNotices();
            } catch (error) {
                  alert("Failed to post notice");
            }
      };

      const baseInputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 transition-colors";

      const handleDelete = async (id) => {
            if (window.confirm("Are you sure you want to delete this notice?")) {
                  try {
                        await api.delete(`/notices/${id}`);
                        fetchNotices();
                  } catch (error) {
                        console.error("Failed to delete notice:", error);
                        alert("Failed to delete notice");
                  }
            }
      };

      return (
            <div className="space-y-6 animate-fade-in">
                  {/* ... Header ... */}
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                              <Megaphone className="w-6 h-6 text-orange-600" />
                              Notice Board
                        </h2>
                        {isAdmin && (
                              <button
                                    onClick={() => setShowModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition shadow-md"
                              >
                                    <Plus className="w-4 h-4" />
                                    Post Notice
                              </button>
                        )}
                  </div>

                  {loading ? (
                        <div className="flex justify-center p-12">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                        </div>
                  ) : notices.length > 0 ? (
                        <div className="grid gap-4">
                              {notices.map((notice) => (
                                    <div key={notice._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition relative">
                                          <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                      <h3 className="text-lg font-bold text-gray-900">{notice.title}</h3>
                                                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                  <Calendar className="w-3 h-3" />
                                                                  {new Date(notice.createdAt).toLocaleDateString()}
                                                            </span>
                                                            <span className="flex items-center gap-1 capitalize px-2 py-0.5 bg-gray-100 rounded-full">
                                                                  <Users className="w-3 h-3" />
                                                                  {notice.targetAudience}
                                                                  {notice.targetClassId && ` - ${notice.targetClassId.name} (${notice.targetClassId.section})`}
                                                            </span>
                                                            <span>By: {notice.postedBy?.name || "Admin"}</span>
                                                      </div>
                                                </div>
                                                {isAdmin && (
                                                      <button
                                                            onClick={() => handleDelete(notice._id)}
                                                            className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition"
                                                      >
                                                            <Trash2 className="w-4 h-4" />
                                                      </button>
                                                )}
                                          </div>
                                          <p className="mt-3 text-gray-700 whitespace-pre-wrap">{notice.content}</p>
                                    </div>
                              ))}
                        </div>
                  ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                              <p className="text-gray-500">No notices found.</p>
                        </div>
                  )}

                  {/* Add Notice Modal */}
                  {showModal && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                              <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[85vh] z-[100]">
                                    <div className="p-4 bg-orange-600 shrink-0">
                                          <h3 className="text-xl font-bold text-white">Post School Notice</h3>
                                    </div>
                                    <form id="notice-form" onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto flex-1 min-h-0">
                                          <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                                <input
                                                      type="text"
                                                      required
                                                      value={newNotice.title}
                                                      onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                                                      className={baseInputClass}
                                                      placeholder="e.g. Annual Sports Day"
                                                />
                                          </div>
                                          <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                                <textarea
                                                      required
                                                      rows="4"
                                                      value={newNotice.content}
                                                      onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                                                      className={baseInputClass}
                                                      placeholder="Enter notice details..."
                                                ></textarea>
                                          </div>
                                          <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                                                <select
                                                      value={newNotice.targetAudience}
                                                      onChange={(e) => setNewNotice({ ...newNotice, targetAudience: e.target.value })}
                                                      className={baseInputClass}
                                                >
                                                      <option value="all">All School</option>
                                                      <option value="student">Students</option>
                                                      <option value="teacher">Teachers</option>
                                                </select>
                                          </div>

                                          {/* Class Selector - Only show if current selection is 'student' */}
                                          {newNotice.targetAudience === "student" && (
                                                <div className="animate-fade-in">
                                                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Class (Optional)</label>
                                                      <select
                                                            value={newNotice.targetClassId}
                                                            onChange={(e) => setNewNotice({ ...newNotice, targetClassId: e.target.value })}
                                                            className={baseInputClass}
                                                      >
                                                            <option value="">All Classes</option>
                                                            {classes.map(cls => (
                                                                  <option key={cls._id} value={cls._id}>
                                                                        {cls.name} - Section {cls.section}
                                                                  </option>
                                                            ))}
                                                      </select>
                                                      <p className="text-xs text-gray-500 mt-1">Leave blank to send to ALL students.</p>
                                                </div>
                                          )}
                                    </form>
                                    <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 shrink-0">
                                          <button
                                                type="button"
                                                onClick={() => setShowModal(false)}
                                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition"
                                          >
                                                Cancel
                                          </button>
                                          <button
                                                type="submit"
                                                form="notice-form"
                                                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium shadow-sm transition"
                                          >
                                                Post Notice
                                          </button>
                                    </div>
                              </div>
                        </div>
                  )}
            </div>
      );
}
