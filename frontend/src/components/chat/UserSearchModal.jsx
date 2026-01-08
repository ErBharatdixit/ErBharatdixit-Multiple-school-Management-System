import React, { useState } from "react";
import { Search, X, User } from "lucide-react";
import api from "../../api";

const UserSearchModal = ({ isOpen, onClose, onSelectUser }) => {
      const [query, setQuery] = useState("");
      const [results, setResults] = useState([]);
      const [loading, setLoading] = useState(false);

      const handleSearch = async (e) => {
            const value = e.target.value;
            setQuery(value);

            if (value.length < 2) {
                  setResults([]);
                  return;
            }

            try {
                  setLoading(true);
                  const { data } = await api.get(`/messages/search?query=${value}`);
                  setResults(data);
            } catch (error) {
                  console.error("Search failed:", error);
            } finally {
                  setLoading(false);
            }
      };

      if (!isOpen) return null;

      return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                              <h3 className="font-bold text-lg text-gray-800">New Message</h3>
                              <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                                    <X size={20} className="text-gray-500" />
                              </button>
                        </div>

                        <div className="p-4">
                              <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                          type="text"
                                          placeholder="Search by name or email..."
                                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                          value={query}
                                          onChange={handleSearch}
                                          autoFocus
                                    />
                              </div>
                        </div>

                        <div className="max-h-[300px] overflow-y-auto">
                              {loading && <div className="p-4 text-center text-gray-500">Searching...</div>}

                              {!loading && results.length === 0 && query.length >= 2 && (
                                    <div className="p-4 text-center text-gray-500">No users found</div>
                              )}

                              {!loading && results.map(user => (
                                    <div
                                          key={user._id}
                                          onClick={() => {
                                                onSelectUser(user);
                                                onClose();
                                          }}
                                          className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors mx-2 rounded-lg"
                                    >
                                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {user.avatar ? (
                                                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                      <User size={18} className="text-blue-600" />
                                                )}
                                          </div>
                                          <div>
                                                <p className="font-medium text-gray-900">{user.name}</p>
                                                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                                          </div>
                                    </div>
                              ))}
                        </div>
                  </div>
            </div>
      );
};

export default UserSearchModal;
