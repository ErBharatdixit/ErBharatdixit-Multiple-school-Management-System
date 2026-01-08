import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";

import Home from "./pages/Home";
import AssignmentManager from "./components/AssignmentManager";
import SubmissionGrading from "./components/SubmissionGrading";
import FeeStructureManager from "./components/FeeStructureManager";
import ParentDashboard from "./pages/ParentDashboard";
import AssignmentList from "./components/AssignmentList";
import Chat from "./pages/Chat";

// Polyfill for process (required by simple-peer)
import * as process from "process";
window.process = process;
window.global = window;


function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/admin/fees" element={<FeeStructureManager />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route
              path="/superadmin"
              element={
                <ProtectedRoute allowedRoles={["superadmin"]}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher"
              element={
                <ProtectedRoute allowedRoles={["teacher", "admin", "superadmin"]}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/assignments"
              element={
                <ProtectedRoute allowedRoles={["teacher", "admin", "superadmin"]}>
                  <AssignmentManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/assignments/:id/submissions"
              element={
                <ProtectedRoute allowedRoles={["teacher", "admin", "superadmin"]}>
                  <SubmissionGrading />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/assignments"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <AssignmentList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/parent"
              element={
                <ProtectedRoute allowedRoles={["parent"]}>
                  <ParentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute allowedRoles={["admin", "teacher", "student", "parent", "superadmin"]}>
                  <Chat />
                </ProtectedRoute>
              }
            />



            <Route
              path="/unauthorized"
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900">403</h1>
                    <p className="text-gray-600 mt-2">Unauthorized Access</p>
                  </div>
                </div>
              }
            />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider >
  );
}

export default App;

