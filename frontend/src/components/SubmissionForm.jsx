import { useState, useEffect } from "react";
import { X, Upload, FileText, CheckCircle, ExternalLink } from "lucide-react";
import api from "../api";

export default function SubmissionForm({ assignment, onClose, onSuccess }) {
      const [files, setFiles] = useState([]);
      const [content, setContent] = useState("");
      const [loading, setLoading] = useState(false);
      const [existingSubmission, setExistingSubmission] = useState(null);

      useEffect(() => {
            fetchMySubmission();
      }, [assignment._id]);

      const fetchMySubmission = async () => {
            try {
                  const res = await api.get(`/assignments/${assignment._id}/my-submission`);
                  setExistingSubmission(res.data);
            } catch (error) {
                  console.error("Failed to fetch submission", error);
            }
      };

      const handleSubmit = async (e) => {
            e.preventDefault();
            setLoading(true);

            const data = new FormData();
            data.append("content", content);
            files.forEach((file) => {
                  data.append("files", file);
            });

            try {
                  await api.post(`/assignments/${assignment._id}/submit`, data, {
                        headers: { "Content-Type": "multipart/form-data" }
                  });
                  onSuccess();
            } catch (error) {
                  console.error("Submission failed", error);
                  alert(error.response?.data?.message || "Submission failed");
            } finally {
                  setLoading(false);
            }
      };

      return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center shrink-0">
                              <h3 className="text-lg font-bold text-gray-800 line-clamp-1">{assignment.title}</h3>
                              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                                    <X className="w-6 h-6" />
                              </button>
                        </div>

                        <div className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0">
                              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                    <h4 className="font-bold text-blue-900 mb-2">Instructions</h4>
                                    <p className="text-blue-800 text-sm whitespace-pre-wrap">{assignment.description}</p>

                                    {assignment.attachments?.length > 0 && (
                                          <div className="mt-4 pt-4 border-t border-blue-200">
                                                <p className="text-xs font-bold text-blue-700 uppercase mb-2">Attachments</p>
                                                <div className="flex flex-wrap gap-2">
                                                      {assignment.attachments.map((file, idx) => (
                                                            <a
                                                                  key={idx}
                                                                  href={file.url}
                                                                  target="_blank"
                                                                  rel="noopener noreferrer"
                                                                  className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg text-sm text-blue-600 hover:text-blue-800 border border-blue-200 transition"
                                                            >
                                                                  <ExternalLink className="w-3 h-3" />
                                                                  {file.name || "Attachment"}
                                                            </a>
                                                      ))}
                                                </div>
                                          </div>
                                    )}
                              </div>

                              {existingSubmission ? (
                                    <div className="bg-green-50 p-6 rounded-xl border border-green-200 text-center">
                                          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                          <h4 className="text-lg font-bold text-green-900">Assignment Submitted</h4>
                                          <p className="text-green-700 text-sm mb-4">You have successfully submitted this assignment.</p>

                                          <div className="text-left bg-white p-4 rounded-lg border border-green-100 max-w-sm mx-auto">
                                                <p className="text-xs text-gray-500 mb-1">Submitted on: {new Date(existingSubmission.submittedAt).toLocaleString()}</p>
                                                {existingSubmission.grade && (
                                                      <div className="mt-2 pt-2 border-t border-gray-100">
                                                            <p className="font-bold text-gray-800">Grade: {existingSubmission.grade} / {assignment.totalPoints}</p>
                                                            {existingSubmission.feedback && (
                                                                  <p className="text-sm text-gray-600 mt-1">Feedback: {existingSubmission.feedback}</p>
                                                            )}
                                                      </div>
                                                )}
                                          </div>
                                    </div>
                              ) : (
                                    <form id="submission-form" onSubmit={handleSubmit} className="space-y-4">
                                          <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Your Work (Text)</label>
                                                <textarea
                                                      rows="4"
                                                      value={content}
                                                      onChange={(e) => setContent(e.target.value)}
                                                      placeholder="Type your answer or notes here..."
                                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                                ></textarea>
                                          </div>

                                          <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Attach Files</label>
                                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition cursor-pointer relative">
                                                      <input
                                                            type="file"
                                                            multiple
                                                            onChange={(e) => setFiles(Array.from(e.target.files))}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                      />
                                                      <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                                      <p className="text-sm text-gray-600 font-medium">Click to upload files (PDF, Images, Doc)</p>
                                                      <p className="text-xs text-gray-400 mt-1">{files.length} files selected</p>
                                                </div>
                                                {files.length > 0 && (
                                                      <div className="mt-2 space-y-1">
                                                            {files.map((f, i) => (
                                                                  <div key={i} className="text-xs text-gray-600 flex items-center gap-1">
                                                                        <FileText className="w-3 h-3" /> {f.name}
                                                                  </div>
                                                            ))}
                                                      </div>
                                                )}
                                          </div>
                                    </form>
                              )}
                        </div>

                        {!existingSubmission && (
                              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0 z-20">
                                    <button
                                          type="submit"
                                          form="submission-form"
                                          disabled={loading}
                                          className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg disabled:opacity-50 flex items-center gap-2"
                                    >
                                          {loading ? "Submitting..." : "Submit Assignment"}
                                    </button>
                              </div>
                        )}
                  </div>
            </div>
      );
}
