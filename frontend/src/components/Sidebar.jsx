import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
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
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/teachers">Teachers</NavLink>
                <NavLink to="/departments">Departments</NavLink>
                <NavLink to="/subjects">Subjects</NavLink>
                <NavLink to="/classes">Classes</NavLink>
                <NavLink to="/assignments">Assignments</NavLink>
                <NavLink to="/timetable">Timetable</NavLink>
                <NavLink to="/attendance">Attendance</NavLink>
                <NavLink to="/leave-requests">Leave Requests</NavLink>
            </nav>

            <div className="sidebar-bottom">
                <button onClick={handleLogout}>Logout</button>
            </div>
        </aside>
    );
}

export default Sidebar;