import React, { useState, useEffect, useRef } from "react";
import Peer from "simple-peer";
import { useSocket } from "../../context/SocketContext";
import { Phone, Video, Mic, MicOff, VideoOff, PhoneOff, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const VideoCallModal = ({ caller, recipient, isIncoming, callSignal, onClose, isVideo = true }) => {
      const { user } = useAuth();
      const { socket } = useSocket();
      const [stream, setStream] = useState(null);
      const [callAccepted, setCallAccepted] = useState(false);
      const [callEnded, setCallEnded] = useState(false);
      const [micOn, setMicOn] = useState(true);
      const [videoOn, setVideoOn] = useState(isVideo);
      const myVideo = useRef();
      const userVideo = useRef();
      const connectionRef = useRef();

      useEffect(() => {
            navigator.mediaDevices.getUserMedia({ video: isVideo, audio: true })
                  .then((currentStream) => {
                        setStream(currentStream);
                        if (myVideo.current) {
                              myVideo.current.srcObject = currentStream;
                        }
                  })
                  .catch(err => {
                        console.error("Error accessing media devices:", err);
                        alert("Could not access camera/microphone");
                        onClose();
                  });

            return () => {
                  // Cleanup on unmount (end call)
                  if (stream) {
                        stream.getTracks().forEach(track => track.stop());
                  }
            };
      }, []);

      // Initiate Call (if outgoing)
      useEffect(() => {
            if (!isIncoming && stream && socket && recipient) {
                  const peer = new Peer({
                        initiator: true,
                        trickle: false,
                        stream: stream
                  });

                  peer.on("signal", (data) => {
                        socket.emit("call_user", {
                              userToCall: recipient._id,
                              signalData: data,
                              from: user._id,
                              name: user.name,
                              isVideo
                        });
                  });

                  peer.on("stream", (currentStream) => {
                        if (userVideo.current) {
                              userVideo.current.srcObject = currentStream;
                        }
                  });

                  socket.on("call_accepted", (signal) => {
                        setCallAccepted(true);
                        peer.signal(signal);
                  });

                  socket.on("call_ended", () => {
                        setCallEnded(true);
                        onClose();
                  });

                  connectionRef.current = peer;
            }
      }, [stream, isIncoming, recipient]);

      // Answer Call (if incoming & accepted action) - WAIT, this logic should be split.
      // Actually, usually we accept manually. 
      const answerCall = () => {
            setCallAccepted(true);
            const peer = new Peer({
                  initiator: false,
                  trickle: false,
                  stream: stream
            });

            peer.on("signal", (data) => {
                  socket.emit("answer_call", { signal: data, to: caller._id });
            });

            peer.on("stream", (currentStream) => {
                  if (userVideo.current) {
                        userVideo.current.srcObject = currentStream;
                  }
            });

            peer.signal(callSignal);
            connectionRef.current = peer;
      };

      const leaveCall = () => {
            setCallEnded(true);
            if (connectionRef.current) connectionRef.current.destroy();
            socket.emit("end_call", { to: isIncoming ? caller._id : recipient._id });
            onClose();
      };

      const toggleMic = () => {
            setMicOn(!micOn);
            if (stream) {
                  stream.getAudioTracks()[0].enabled = !micOn;
            }
      }

      const toggleVideo = () => {
            setVideoOn(!videoOn);
            if (stream) {
                  stream.getVideoTracks()[0].enabled = !videoOn;
            }
      }

      return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
                  <div className="w-full max-w-4xl p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[60vh]">

                              {/* My Video */}
                              <div className="relative bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
                                    {stream && <video playsInline muted ref={myVideo} autoPlay className={`w-full h-full object-cover ${!videoOn ? 'hidden' : ''}`} />}
                                    {!videoOn && (
                                          <div className="w-full h-full flex items-center justify-center flex-col gap-2">
                                                <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
                                                      <User size={40} className="text-gray-400" />
                                                </div>
                                                <p className="text-gray-400">You</p>
                                          </div>
                                    )}
                                    <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-full text-white text-sm backdrop-blur-md">
                                          You {micOn ? '' : '(Muted)'}
                                    </div>
                              </div>

                              {/* Remote Video */}
                              <div className="relative bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
                                    {callAccepted && !callEnded ? (
                                          <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
                                    ) : (
                                          <div className="w-full h-full flex flex-col items-center justify-center text-white">
                                                {isIncoming ? (
                                                      <>
                                                            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center mb-4 animate-pulse">
                                                                  {caller?.avatar ? <img src={caller.avatar} className="w-full h-full rounded-full object-cover" /> : <User size={48} />}
                                                            </div>
                                                            <h3 className="text-2xl font-bold mb-2">{caller?.name}</h3>
                                                            <p className="text-blue-200">Incoming {isVideo ? 'Video' : 'Audio'} Call...</p>
                                                      </>
                                                ) : (
                                                      <>
                                                            <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mb-4 animate-bounce">
                                                                  {recipient?.avatar ? <img src={recipient.avatar} className="w-full h-full rounded-full object-cover" /> : <User size={48} />}
                                                            </div>
                                                            <h3 className="text-2xl font-bold mb-2">Calling {recipient?.name}...</h3>
                                                            <p className="text-gray-400">Waiting for answer...</p>
                                                      </>
                                                )}
                                          </div>
                                    )}
                              </div>
                        </div>

                        {/* Controls */}
                        <div className="mt-8 flex justify-center gap-6">
                              <button onClick={toggleMic} className={`p-4 rounded-full transition-all ${micOn ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500 text-white'}`}>
                                    {micOn ? <Mic size={24} /> : <MicOff size={24} />}
                              </button>

                              <button onClick={toggleVideo} className={`p-4 rounded-full transition-all ${videoOn ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500 text-white'}`}>
                                    {videoOn ? <Video size={24} /> : <VideoOff size={24} />}
                              </button>

                              {isIncoming && !callAccepted ? (
                                    <button
                                          onClick={answerCall}
                                          className="p-4 rounded-full bg-green-500 hover:bg-green-600 text-white animate-pulse shadow-lg shadow-green-500/30"
                                    >
                                          <Phone size={24} />
                                    </button>
                              ) : null}

                              <button
                                    onClick={leaveCall}
                                    className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30"
                              >
                                    <PhoneOff size={24} />
                              </button>
                        </div>
                  </div>
            </div>
      );
};

export default VideoCallModal;
