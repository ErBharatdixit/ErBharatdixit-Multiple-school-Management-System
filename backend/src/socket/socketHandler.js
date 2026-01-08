import { Server } from "socket.io";

let io;
const userSockets = new Map(); // Map<userId, socketId>

export const initSocket = (server) => {
      io = new Server(server, {
            cors: {
                  origin: "http://localhost:5173", // Frontend URL
                  methods: ["GET", "POST"]
            }
      });

      io.on("connection", (socket) => {


            socket.on("register_user", (userId) => {
                  userSockets.set(userId, socket.id);

                  io.emit("user_status_change", { userId, status: "online" });
            });

            // --- Chat Events ---
            socket.on("join_chat", (userId) => {
                  socket.join(userId); // Join a room with their own ID for private messages
            });

            socket.on("send_message", (data) => {
                  // data: { recipientId, message }
                  const recipientSocketId = userSockets.get(data.recipientId);

                  // Emit to recipient if online
                  if (recipientSocketId) {
                        io.to(recipientSocketId).emit("receive_message", data.message);
                  }
                  // Always emit back to sender (for multiple tabs) or rely on HTTP response
            });

            // --- WebRTC Signaling Events ---

            // 1. Caller initiates call
            socket.on("call_user", (data) => {
                  // data: { userToCall, signalData, from, name, isVideo }
                  const socketIdToCall = userSockets.get(data.userToCall);
                  if (socketIdToCall) {
                        io.to(socketIdToCall).emit("call_user", {
                              signal: data.signalData,
                              from: data.from,
                              name: data.name,
                              isVideo: data.isVideo
                        });
                  }
            });

            // 2. Callee answers call
            socket.on("answer_call", (data) => {
                  // data: { to, signal }
                  const socketIdToCall = userSockets.get(data.to);
                  if (socketIdToCall) {
                        io.to(socketIdToCall).emit("call_accepted", data.signal);
                  }
            });

            // 3. End Call
            socket.on("end_call", (data) => {
                  // data: { to }
                  const socketIdToCall = userSockets.get(data.to);
                  if (socketIdToCall) {
                        io.to(socketIdToCall).emit("call_ended");
                  }
            });



            socket.on("disconnect", () => {
                  let disconnectedUserId = null;
                  for (let [userId, socketId] of userSockets.entries()) {
                        if (socketId === socket.id) {
                              disconnectedUserId = userId;
                              userSockets.delete(userId);
                              break;
                        }
                  }
                  if (disconnectedUserId) {
                        io.emit("user_status_change", { userId: disconnectedUserId, status: "offline" });
                  }
            });
      });
});

return io;
};

export const getIO = () => {
      if (!io) {
            throw new Error("Socket.io not initialized!");
      }
      return io;
};
