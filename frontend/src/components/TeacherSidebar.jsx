import { NavLink, useNavigate } from "react-router-dom";

function TeacherSidebar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo-icon">TM</div>

                <div>
                    <h2>Teacher</h2>
                    <span>Management System</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/teacher-dashboard">
                    My Dashboard
                </NavLink>

                <NavLink to="/teacher-profile">
                    My Profile
                </NavLink>

                <NavLink to="/teacher-timetable">
                    My Timetable
                </NavLink>

                <NavLink to="/teacher-attendance">
                    My Attendance
                </NavLink>

                <NavLink to="/teacher-leave-requests">
                    My Leave Requests
                </NavLink>
            </nav>

            <div className="sidebar-bottom">
                <button onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </aside>
    );
}

export default TeacherSidebar;