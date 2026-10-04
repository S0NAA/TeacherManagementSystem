import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

function Dashboard() {
    const [stats, setStats] = useState({
        teachers: 0,
        departments: 0,
        subjects: 0,
        classes: 0,
        assignments: 0,
        todayAttendance: 0,
        pendingLeaves: 0
    });

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [
                    teachersResponse,
                    departmentsResponse,
                    subjectsResponse,
                    classesResponse,
                    assignmentsResponse,
                    attendanceResponse,
                    leaveResponse
                ] = await Promise.all([
                    api.get("/teachers"),
                    api.get("/departments"),
                    api.get("/subjects"),
                    api.get("/classes"),
                    api.get("/assignments"),
                    api.get("/attendance"),
                    api.get("/leave")
                ]);

                const today = new Date().toISOString().split("T")[0];

                const todayAttendance = attendanceResponse.data.filter(
                    (attendance) =>
                        attendance.attendanceDate === today
                );

                const pendingLeaves = leaveResponse.data.filter(
                    (leave) =>
                        leave.status === "Pending"
                );

                setStats({
                    teachers: teachersResponse.data.length,
                    departments: departmentsResponse.data.length,
                    subjects: subjectsResponse.data.length,
                    classes: classesResponse.data.length,
                    assignments: assignmentsResponse.data.length,
                    todayAttendance: todayAttendance.length,
                    pendingLeaves: pendingLeaves.length
                });

            } catch (error) {
                console.error("Dashboard API Error:", error);
            }
        };

        loadStats();
    }, []);

    return (
        <div>
            <Sidebar />

            <main>
                <div className="dashboard-header">
                    <div>
                        <h1>Dashboard</h1>
                        <p>Welcome to the Teacher Management System</p>
                    </div>
                </div>

                <div className="dashboard-cards">

                    <div className="dashboard-card">
                        <div className="card-accent"></div>
                        <h2>{stats.teachers}</h2>
                        <p>Total Teachers</p>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-accent"></div>
                        <h2>{stats.departments}</h2>
                        <p>Departments</p>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-accent"></div>
                        <h2>{stats.subjects}</h2>
                        <p>Total Subjects</p>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-accent"></div>
                        <h2>{stats.classes}</h2>
                        <p>Total Classes</p>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-accent"></div>
                        <h2>{stats.assignments}</h2>
                        <p>Teacher Assignments</p>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-accent"></div>
                        <h2>{stats.todayAttendance}</h2>
                        <p>Today's Attendance</p>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-accent"></div>
                        <h2>{stats.pendingLeaves}</h2>
                        <p>Pending Leave Requests</p>
                    </div>

                </div>

                <div className="dashboard-card">
                    <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>
                        System Overview
                    </h2>

                    <p>
                        Manage teachers, departments, subjects, classes,
                        assignments, timetable, attendance and leave requests
                        from one centralized system.
                    </p>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;