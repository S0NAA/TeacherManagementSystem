import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import TeacherSidebar from "../components/TeacherSidebar";

function TeacherDashboard() {
    const [teacher, setTeacher] = useState(null);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            navigate("/login");
            return;
        }

        const user = JSON.parse(storedUser);

        if (user.role !== "TEACHER") {
            navigate("/dashboard");
            return;
        }

        if (!user.teacherId) {
            setError("No teacher profile is linked to this account.");
            return;
        }

        const loadTeacher = async () => {
            try {
                const response = await api.get(
                    `/teachers/${user.teacherId}`
                );

                setTeacher(response.data);
            } catch (err) {
                setError("Unable to load teacher information.");
            }
        };

        loadTeacher();
    }, [navigate]);

    return (
        <div className="app-layout">
            <TeacherSidebar />

            <main className="main-content">

                {error && (
                    <div className="message message-error">
                        {error}
                    </div>
                )}

                {teacher && (
                    <>
                        {/* Welcome Section */}
                        <section className="teacher-welcome">
                            <div>
                                <span className="welcome-label">
                                    TEACHER PORTAL
                                </span>

                                <h1>
                                    Welcome back, {teacher.name}
                                </h1>

                                <p>
                                    Manage your timetable, attendance and
                                    leave requests from your dashboard.
                                </p>
                            </div>

                            <div className="teacher-welcome-id">
                                <span>Teacher ID</span>
                                <strong>{teacher.teacherId}</strong>
                            </div>
                        </section>

                        {/* Quick Information */}
                        <section className="teacher-info-grid">

                            <div className="teacher-info-box">
                                <span>Designation</span>
                                <strong>
                                    {teacher.designation || "—"}
                                </strong>
                            </div>

                            <div className="teacher-info-box">
                                <span>Department</span>
                                <strong>
                                    {teacher.departmentId || "—"}
                                </strong>
                            </div>

                            <div className="teacher-info-box">
                                <span>Status</span>
                                <strong className="teacher-status">
                                    {teacher.status || "—"}
                                </strong>
                            </div>

                        </section>

                        {/* Dashboard Content */}
                        <section className="teacher-dashboard-section">

                            <div className="teacher-section-header">
                                <div>
                                    <h2>Quick Access</h2>
                                    <p>
                                        Access your frequently used sections.
                                    </p>
                                </div>
                            </div>

                            <div className="teacher-quick-grid">

                                <button
                                    className="teacher-quick-item"
                                    onClick={() =>
                                        navigate("/teacher-profile")
                                    }
                                >
                                    <span>My Profile</span>
                                    <small>
                                        View and update your profile
                                    </small>
                                </button>

                                <button
                                    className="teacher-quick-item"
                                    onClick={() =>
                                        navigate("/teacher-timetable")
                                    }
                                >
                                    <span>My Timetable</span>
                                    <small>
                                        View your weekly schedule
                                    </small>
                                </button>

                                <button
                                    className="teacher-quick-item"
                                    onClick={() =>
                                        navigate("/teacher-attendance")
                                    }
                                >
                                    <span>My Attendance</span>
                                    <small>
                                        Check your attendance records
                                    </small>
                                </button>

                                <button
                                    className="teacher-quick-item"
                                    onClick={() =>
                                        navigate("/teacher-leave-requests")
                                    }
                                >
                                    <span>My Leave Requests</span>
                                    <small>
                                        Apply and view leave requests
                                    </small>
                                </button>

                            </div>

                        </section>

                        {/* Professional Information */}
                        <section className="teacher-dashboard-section">

                            <div className="teacher-section-header">
                                <div>
                                    <h2>Professional Information</h2>
                                    <p>
                                        Overview of your employment details.
                                    </p>
                                </div>
                            </div>

                            <div className="teacher-professional-grid">

                                <div>
                                    <span>Qualification</span>
                                    <strong>
                                        {teacher.qualification || "—"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Joining Date</span>
                                    <strong>
                                        {teacher.joiningDate || "—"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Email</span>
                                    <strong>
                                        {teacher.email || "—"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Phone</span>
                                    <strong>
                                        {teacher.phone || "—"}
                                    </strong>
                                </div>

                            </div>

                        </section>
                    </>
                )}

            </main>
        </div>
    );
}

export default TeacherDashboard;