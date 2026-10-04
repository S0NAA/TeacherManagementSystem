import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";

import Dashboard from "./pages/Dashboard";
import Teachers from "./pages/Teachers";
import Departments from "./pages/Departments";
import Subjects from "./pages/Subjects";
import Classes from "./pages/Classes";
import Assignments from "./pages/Assignments";
import Timetable from "./pages/Timetable";
import Attendance from "./pages/Attendance";
import LeaveRequests from "./pages/LeaveRequests";

import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherProfile from "./pages/TeacherProfile";
import TeacherTimetable from "./pages/TeacherTimetable";
import TeacherAttendance from "./pages/TeacherAttendance";
import TeacherLeaveRequests from "./pages/TeacherLeaveRequests";


function RoleRoute({ allowedRole, children }) {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
        return <Navigate to="/login" replace />;
    }

    const user = JSON.parse(storedUser);

    if (user.role !== allowedRole) {
        if (user.role === "TEACHER") {
            return <Navigate to="/teacher-dashboard" replace />;
        }

        return <Navigate to="/dashboard" replace />;
    }

    return children;
}


function App() {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    return (
        <BrowserRouter>
            <Routes>

                {/* Root */}
                <Route
                    path="/"
                    element={
                        user ? (
                            user.role === "TEACHER" ? (
                                <Navigate to="/teacher-dashboard" replace />
                            ) : (
                                <Navigate to="/dashboard" replace />
                            )
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />


                {/* Login */}
                <Route
                    path="/login"
                    element={
                        user ? (
                            user.role === "TEACHER" ? (
                                <Navigate to="/teacher-dashboard" replace />
                            ) : (
                                <Navigate to="/dashboard" replace />
                            )
                        ) : (
                            <Login />
                        )
                    }
                />


                {/* ================= ADMIN ROUTES ================= */}

                <Route
                    path="/dashboard"
                    element={
                        <RoleRoute allowedRole="ADMIN">
                            <Dashboard />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/teachers"
                    element={
                        <RoleRoute allowedRole="ADMIN">
                            <Teachers />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/departments"
                    element={
                        <RoleRoute allowedRole="ADMIN">
                            <Departments />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/subjects"
                    element={
                        <RoleRoute allowedRole="ADMIN">
                            <Subjects />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/classes"
                    element={
                        <RoleRoute allowedRole="ADMIN">
                            <Classes />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/assignments"
                    element={
                        <RoleRoute allowedRole="ADMIN">
                            <Assignments />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/timetable"
                    element={
                        <RoleRoute allowedRole="ADMIN">
                            <Timetable />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/attendance"
                    element={
                        <RoleRoute allowedRole="ADMIN">
                            <Attendance />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/leave-requests"
                    element={
                        <RoleRoute allowedRole="ADMIN">
                            <LeaveRequests />
                        </RoleRoute>
                    }
                />


                {/* ================= TEACHER ROUTES ================= */}

                <Route
                    path="/teacher-dashboard"
                    element={
                        <RoleRoute allowedRole="TEACHER">
                            <TeacherDashboard />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/teacher-profile"
                    element={
                        <RoleRoute allowedRole="TEACHER">
                            <TeacherProfile />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/teacher-timetable"
                    element={
                        <RoleRoute allowedRole="TEACHER">
                            <TeacherTimetable />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/teacher-attendance"
                    element={
                        <RoleRoute allowedRole="TEACHER">
                            <TeacherAttendance />
                        </RoleRoute>
                    }
                />

                <Route
                    path="/teacher-leave-requests"
                    element={
                        <RoleRoute allowedRole="TEACHER">
                            <TeacherLeaveRequests />
                        </RoleRoute>
                    }
                />


                {/* Unknown URL */}
                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;