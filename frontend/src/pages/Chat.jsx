import React, { useState, useEffect, useRef } from "react";
import { Send, User, Search, MoreVertical, Phone, Video, Paperclip, X, FileText, Image as ImageIcon, PlayCircle, Edit2, Trash2 } from "lucide-react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import UserSearchModal from "../components/chat/UserSearchModal";
import VideoCallModal from "../components/chat/VideoCallModal";

const Chat = () => {
      const { user } = useAuth();
      const { socket, onlineUsers } = useSocket();
      const [conversations, setConversations] = useState([]);
      const [selectedUser, setSelectedUser] = useState(null);
      const [messages, setMessages] = useState([]);
      const [newMessage, setNewMessage] = useState("");
      const [selectedFiles, setSelectedFiles] = useState([]);
      const [previewUrls, setPreviewUrls] = useState([]);
      const [editingMessageId, setEditingMessageId] = useState(null);
      const [openMenuMessageId, setOpenMenuMessageId] = useState(null);
      const [isSearchOpen, setIsSearchOpen] = useState(false);
      const [loadingMessages, setLoadingMessages] = useState(false);

      // Call State
      const [callParams, setCallParams] = useState(null); // { isIncoming, caller, recipient, signal, isVideo }

      const messagesEndRef = useRef(null);
      const fileInputRef = useRef(null);

      // Listen for incoming calls and messages
      useEffect(() => {
            if (!socket) return;

            socket.on("receive_message", (message) => {
                  // Only add message if it belongs to current conversation
                  if (selectedUser && (message.sender._id === selectedUser._id || message.sender === selectedUser._id)) {
                        setMessages(prev => [...prev, message]);
                        scrollToBottom();
                  }
                  fetchConversations(); // Update list order/preview
            });

            socket.on("call_user", (data) => {
                  // data: { from, name, signal, isVideo }
                  setCallParams({
                        isIncoming: true,
                        caller: { _id: data.from, name: data.name }, // Simplified user obj
                        signal: data.signal,
                        isVideo: data.isVideo
                  });
            });

            return () => {
                  socket.off("receive_message");
                  socket.off("call_user");
            }
      }, [socket, selectedUser]);

      // Initial Fetch
      useEffect(() => {
            fetchConversations();
            // Join my own room is handled in Context by register_user
      }, [user]);

      // Fetch messages on select
      useEffect(() => {
            if (selectedUser) {
                  fetchMessages(selectedUser._id);
            }
      }, [selectedUser]);




      // Scroll to bottom when messages change
      useEffect(() => {
            scrollToBottom();
      }, [messages]);

      const scrollToBottom = () => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      };

      const fetchConversations = async () => {
            try {
                  const { data } = await api.get("/messages/conversations");
                  setConversations(data);
            } catch (error) {
                  // toggle error state silently or showing UI alert, keeping clean console for now
            }
      };

      const fetchMessages = async (userId, showLoading = true) => {
            if (showLoading) setLoadingMessages(true);
            try {
                  const { data } = await api.get(`/messages/${userId}`);
                  setMessages(data);
                  if (showLoading) {
                        // wait for render then scroll
                        setTimeout(scrollToBottom, 100);
                  }
            } catch (error) {
                  console.error("Error fetching messages:", error);
            } finally {
                  if (showLoading) setLoadingMessages(false);
            }
      };

      const handleFileSelect = (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;

            setSelectedFiles(prev => [...prev, ...files]);

            // Create preview URLs
            const newPreviews = files.map(file => ({
                  url: URL.createObjectURL(file),
                  type: file.type,
                  name: file.name
            }));
            setPreviewUrls(prev => [...prev, ...newPreviews]);
      };

      const removeFile = (index) => {
            setSelectedFiles(prev => prev.filter((_, i) => i !== index));
            setPreviewUrls(prev => {
                  URL.revokeObjectURL(prev[index].url);
                  return prev.filter((_, i) => i !== index);
            });
      };

      const handleUpdateMessage = async (messageId, newContent) => {
            try {
                  await api.put(`/messages/${messageId}`, { content: newContent });
                  setEditingMessageId(null);
                  fetchMessages(selectedUser._id, false);
            } catch (error) {
                  console.error("Error updating message:", error);
            }
      };

      const handleDeleteMessage = async (messageId) => {
            if (!window.confirm("Are you sure you want to delete this message?")) return;
            try {
                  await api.delete(`/messages/${messageId}`);
                  fetchMessages(selectedUser._id, false);
            } catch (error) {
                  console.error("Error deleting message:", error);
            }
      };

      const handleSendMessage = async (e) => {
            e.preventDefault();
            if ((!newMessage.trim() && selectedFiles.length === 0) || !selectedUser) return;

            try {
                  const formData = new FormData();
                  formData.append("recipientId", selectedUser._id);
                  formData.append("content", newMessage);

                  selectedFiles.forEach(file => {
                        formData.append("files", file);
                  });

                  const { data: sentMsg } = await api.post("/messages/send", formData, {
                        headers: { "Content-Type": "multipart/form-data" }
                  });

                  // Emit socket message for real-time
                  if (socket) {
                        socket.emit("send_message", {
                              recipientId: selectedUser._id,
                              message: sentMsg
                        });
                  }

                  // Optimistic update or just use the response
                  setMessages(prev => [...prev, sentMsg]);
                  setNewMessage("");
                  setSelectedFiles([]);
                  setPreviewUrls([]);
                  fetchConversations();
                  scrollToBottom();
            } catch (error) {
                  console.error("Error sending message:", error);
            }
      };

      const initiateCall = (isVideo) => {
            if (!selectedUser) return;
            setCallParams({
                  isIncoming: false,
                  recipient: selectedUser,
                  isVideo
            });
      };

      const handleSelectUser = (user) => {
            setSelectedUser(user);
            // Check if conversation already exists, if not, add temp to list?
            // Actually fetching messages will just show empty if new.
            fetchMessages(user._id);
      };

      const formatDate = (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      };

      return (
            <div className="flex bg-gray-50 h-[calc(100vh-64px)] overflow-hidden">
                  {callParams && (
                        <VideoCallModal
                              caller={callParams.caller}
                              recipient={callParams.recipient}
                              isIncoming={callParams.isIncoming}
                              callSignal={callParams.signal}
                              onClose={() => setCallParams(null)}
                              isVideo={callParams.isVideo}
                        />
                  )}

                  <UserSearchModal
                        isOpen={isSearchOpen}
                        onClose={() => setIsSearchOpen(false)}
                        onSelectUser={handleSelectUser}
                  />

                  {/* Sidebar - Conversation List */}
                  <div className="w-80 md:w-96 bg-white border-r border-gray-200 flex flex-col h-full z-10">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Messages</h2>
                              <button
                                    onClick={() => setIsSearchOpen(true)}
                                    className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                                    title="New Chat"
                              >
                                    <Search size={20} />
                              </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                              {conversations.length === 0 && (
                                    <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                <Search size={24} className="text-gray-300" />
                                          </div>
                                          <p className="font-medium">No conversations yet</p>
                                          <button
                                                onClick={() => setIsSearchOpen(true)}
                                                className="mt-4 text-blue-600 font-semibold hover:underline text-sm"
                                          >
                                                Start a new chat
                                          </button>
                                    </div>
                              )}

                              {conversations.map((conv) => (
                                    <div
                                          key={conv._id}
                                          onClick={() => handleSelectUser(conv.userDetails)}
                                          className={`flex items-center gap-4 p-4 cursor-pointer transition-all border-b border-gray-50 hover:bg-gray-50 ${selectedUser?._id === conv.userDetails._id ? "bg-blue-50 border-l-4 border-l-blue-600" : "border-l-4 border-l-transparent"
                                                }`}
                                    >
                                          <div className="relative">
                                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                                                      {conv.userDetails.avatar ? (
                                                            <img src={conv.userDetails.avatar} alt="" className="w-full h-full object-cover" />
                                                      ) : (
                                                            <User size={24} className="text-gray-400" />
                                                      )}
                                                </div>
                                                {/* <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div> Active indicator */}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-1">
                                                      <h3 className="font-semibold text-gray-900 truncate">{conv.userDetails.name}</h3>
                                                      <span className="text-xs text-gray-400">{formatDate(conv.lastMessage.createdAt)}</span>
                                                </div>
                                                <p className={`text-sm truncate ${conv.lastMessage.read || conv.lastMessage.sender === user?._id ? 'text-gray-500' : 'text-gray-900 font-bold'}`}>
                                                      {conv.lastMessage.sender === user?._id ? "You: " : ""}{conv.lastMessage.content}
                                                </p>
                                          </div>
                                    </div>
                              ))}
                        </div>
                  </div>

                  {/* Main Chat Area */}
                  <div className="flex-1 flex flex-col h-full bg-[#f0f2f5]">
                        {selectedUser ? (
                              <>
                                    {/* Chat Header */}
                                    <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center shadow-sm">
                                          <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                                                      {selectedUser.avatar ? (
                                                            <img src={selectedUser.avatar} alt="" className="w-full h-full object-cover" />
                                                      ) : (
                                                            <User size={20} className="text-indigo-600" />
                                                      )}
                                                </div>
                                                <div>
                                                      <h3 className="font-bold text-gray-900">{selectedUser.name}</h3>
                                                      <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
                                                      </p>
                                                </div>
                                          </div>
                                          <div className="flex items-center gap-4 text-gray-400">
                                                <button onClick={() => initiateCall(false)} className="hover:text-blue-600 transition-colors"><Phone size={20} /></button>
                                                <button onClick={() => initiateCall(true)} className="hover:text-blue-600 transition-colors"><Video size={20} /></button>
                                                <button className="hover:text-gray-600"><MoreVertical size={20} /></button>
                                          </div>
                                    </div>

                                    {/* Messages Feed */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 md:p-6 custom-scrollbar">
                                          <div className="text-center my-6">
                                                <div className="bg-blue-50 text-blue-800 text-xs px-3 py-1 rounded-full inline-block font-medium">
                                                      Messages are secured with end-to-end encryption
                                                </div>
                                          </div>

                                          {loadingMessages ? (
                                                <div className="flex justify-center mt-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                                          ) : messages.map((msg, index) => {
                                                const isMe = msg.sender._id === user?._id || msg.sender === user?._id;
                                                const showAvatar = !isMe && (index === 0 || messages[index - 1].sender._id !== msg.sender._id);

                                                return (
                                                      <div key={msg._id} className={`flex w-full ${isMe ? "justify-end" : "justify-start"} group`}>
                                                            <div className={`flex max-w-[75%] md:max-w-[60%] items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>

                                                                  {!isMe && (
                                                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 mb-1 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
                                                                              {showAvatar && (selectedUser.avatar ? <img src={selectedUser.avatar} className="w-full h-full object-cover" /> : <User size={14} className="m-auto text-gray-500" />)}
                                                                        </div>
                                                                  )}

                                                                  <div
                                                                        className={`p-3 px-4 rounded-2xl shadow-sm text-sm relative group/msg ${isMe
                                                                              ? "bg-blue-600 text-white rounded-tr-none"
                                                                              : "bg-white text-gray-900 rounded-tl-none border border-gray-100"
                                                                              }`}
                                                                  >
                                                                        {/* Message Options Menu */}
                                                                        {isMe && !editingMessageId && (
                                                                              <div className={`absolute top-2 right-2 opacity-0 group-hover/msg:opacity-100 transition-opacity z-50 ${openMenuMessageId === msg._id ? "opacity-100" : ""}`}>
                                                                                    <div className="relative">
                                                                                          <button
                                                                                                onClick={(e) => {
                                                                                                      e.stopPropagation();
                                                                                                      setOpenMenuMessageId(openMenuMessageId === msg._id ? null : msg._id);
                                                                                                }}
                                                                                                className={`p-1 rounded-full ${isMe ? "hover:bg-blue-500 text-blue-100" : "hover:bg-gray-100 text-gray-500"}`}
                                                                                          >
                                                                                                <MoreVertical size={14} />
                                                                                          </button>
                                                                                          {openMenuMessageId === msg._id && (
                                                                                                <>
                                                                                                      <div
                                                                                                            className="fixed inset-0 z-40"
                                                                                                            onClick={(e) => {
                                                                                                                  e.stopPropagation();
                                                                                                                  setOpenMenuMessageId(null);
                                                                                                            }}
                                                                                                      />
                                                                                                      <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-xl border border-gray-100 py-1 overflow-hidden z-50">
                                                                                                            <button
                                                                                                                  onClick={(e) => {
                                                                                                                        e.stopPropagation();
                                                                                                                        setEditingMessageId(msg._id);
                                                                                                                        setOpenMenuMessageId(null);
                                                                                                                        setNewMessage(msg.content);
                                                                                                                  }}
                                                                                                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                                                                            >
                                                                                                                  <Edit2 size={14} /> Edit
                                                                                                            </button>
                                                                                                            <button
                                                                                                                  onClick={(e) => {
                                                                                                                        e.stopPropagation();
                                                                                                                        handleDeleteMessage(msg._id);
                                                                                                                        setOpenMenuMessageId(null);
                                                                                                                  }}
                                                                                                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                                                                            >
                                                                                                                  <Trash2 size={14} /> Delete
                                                                                                            </button>
                                                                                                      </div>
                                                                                                </>
                                                                                          )}
                                                                                    </div>
                                                                              </div>
                                                                        )}

                                                                        {/* Render Attachments */}
                                                                        {msg.attachments && msg.attachments.length > 0 && (
                                                                              <div className="space-y-2 mb-2">
                                                                                    {msg.attachments.map((att, i) => (
                                                                                          <div key={i} className="rounded overflow-hidden">
                                                                                                {att.fileType === 'image' ? (
                                                                                                      <img src={`https://multiple-school-management.onrender.com${att.url}`} alt="attachment" className="max-w-full h-auto rounded max-h-60 object-cover cursor-pointer hover:opacity-90 transition-opacity" />
                                                                                                ) : att.fileType === 'video' ? (
                                                                                                      <video controls src={`https://multiple-school-management.onrender.com${att.url}`} className="max-w-full rounded max-h-60" />
                                                                                                ) : (
                                                                                                      <a href={`https://multiple-school-management.onrender.com${att.url}`} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 p-2 rounded ${isMe ? "bg-blue-700/50 hover:bg-blue-700" : "bg-gray-100 hover:bg-gray-200"} transition-colors`}>
                                                                                                            <FileText size={20} />
                                                                                                            <span className="truncate max-w-[150px]">{att.originalName}</span>
                                                                                                      </a>
                                                                                                )}
                                                                                          </div>
                                                                                    ))}
                                                                              </div>
                                                                        )}

                                                                        {editingMessageId === msg._id ? (
                                                                              <form
                                                                                    onSubmit={(e) => {
                                                                                          e.preventDefault();
                                                                                          handleUpdateMessage(msg._id, e.target.elements.editContent.value);
                                                                                    }}
                                                                                    className="min-w-[150px]"
                                                                              >
                                                                                    <input
                                                                                          name="editContent"
                                                                                          defaultValue={msg.content}
                                                                                          autoFocus
                                                                                          className="w-full px-2 py-1 text-black rounded text-sm focus:outline-none"
                                                                                          onBlur={() => setEditingMessageId(null)}
                                                                                    />
                                                                              </form>
                                                                        ) : (
                                                                              msg.content
                                                                        )}

                                                                        <div className={`text-[10px] mt-1 text-right opacity-70 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                                                              {formatDate(msg.createdAt)}
                                                                        </div>
                                                                  </div>
                                                            </div>
                                                      </div>
                                                );
                                          })}
                                          <div ref={messagesEndRef} />
                                    </div>

                                    {/* Input Area */}
                                    <div className="bg-white p-4 border-t border-gray-200">
                                          {previewUrls.length > 0 && (
                                                <div className="flex gap-2 mb-3 overflow-x-auto p-2">
                                                      {previewUrls.map((preview, index) => (
                                                            <div key={index} className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden group">
                                                                  {preview.type.startsWith('image/') ? (
                                                                        <img src={preview.url} alt="preview" className="w-full h-full object-cover" />
                                                                  ) : preview.type.startsWith('video/') ? (
                                                                        <div className="w-full h-full flex items-center justify-center">
                                                                              <PlayCircle size={24} className="text-gray-500" />
                                                                        </div>
                                                                  ) : (
                                                                        <div className="w-full h-full flex items-center justify-center">
                                                                              <FileText size={24} className="text-gray-500" />
                                                                        </div>
                                                                  )}
                                                                  <button
                                                                        onClick={() => removeFile(index)}
                                                                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-red-500 transition-colors"
                                                                  >
                                                                        <X size={12} />
                                                                  </button>
                                                            </div>
                                                      ))}
                                                </div>
                                          )}

                                          <form onSubmit={handleSendMessage} className="flex gap-3 max-w-4xl mx-auto items-end">
                                                <input
                                                      type="file"
                                                      multiple
                                                      ref={fileInputRef}
                                                      className="hidden"
                                                      onChange={handleFileSelect}
                                                      accept="image/*,video/*,application/pdf"
                                                />
                                                <button
                                                      type="button"
                                                      onClick={() => fileInputRef.current?.click()}
                                                      className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors mb-1"
                                                      title="Attach file"
                                                >
                                                      <Paperclip size={20} />
                                                </button>

                                                <textarea
                                                      value={newMessage}
                                                      onChange={(e) => setNewMessage(e.target.value)}
                                                      placeholder="Type a message..."
                                                      rows={1}
                                                      className="flex-1 bg-gray-100 border-0 rounded-3xl px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none custom-scrollbar min-h-[48px] max-h-32"
                                                      onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                                  e.preventDefault();
                                                                  handleSendMessage(e);
                                                            }
                                                      }}
                                                />
                                                <button
                                                      type="submit"
                                                      disabled={!newMessage.trim() && selectedFiles.length === 0}
                                                      className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/30 active:scale-95 transform duration-100 mb-1"
                                                >
                                                      <Send size={20} className={newMessage.trim() ? "ml-0.5" : ""} />
                                                </button>
                                          </form>
                                    </div>
                              </>
                        ) : (
                              <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-500 opacity-60 p-8 text-center">
                                    <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                                          <div className="relative">
                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                                <User size={64} className="text-gray-400" />
                                          </div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-700 mb-2">Welcome to Messages</h3>
                                    <p className="max-w-md">Select a conversation from the sidebar or start a new chat to communicate with teachers, parents, and admins.</p>
                                    <button
                                          onClick={() => setIsSearchOpen(true)}
                                          className="mt-8 px-6 py-3 bg-white border border-gray-300 rounded-xl font-semibold shadow-sm hover:bg-gray-50 transition-colors"
                                    >
                                          Start New Conversation
                                    </button>
                              </div>
                        )}
                  </div>
            </div>
      );
};

export default Chat;
