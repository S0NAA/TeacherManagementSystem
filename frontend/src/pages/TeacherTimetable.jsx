import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import TeacherSidebar from "../components/TeacherSidebar";

function TeacherTimetable() {
    const [timetables, setTimetables] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

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

        loadData();
    }, [navigate]);

    const loadData = async () => {
        try {
            const [timetableResponse, assignmentResponse] =
                await Promise.all([
                    api.get("/timetable"),
                    api.get("/assignments")
                ]);

            setTimetables(timetableResponse.data);
            setAssignments(assignmentResponse.data);

        } catch (err) {
            console.error("Teacher Timetable Error:", err);
            setError("Unable to load your timetable.");
        }
    };

    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    const getAssignment = (assignmentId) => {
        return assignments.find(
            (assignment) =>
                Number(assignment.assignmentId) ===
                Number(assignmentId)
        );
    };

    const getTeacherTimetables = () => {
        if (!user?.teacherId) {
            return [];
        }

        return timetables
            .filter((item) => {
                const assignment = getAssignment(item.assignmentId);

                return (
                    String(assignment?.teacherId) ===
                    String(user.teacherId)
                );
            })
            .sort((a, b) =>
                (a.startTime || "").localeCompare(
                    b.startTime || ""
                )
            );
    };

    const formatTime = (time) => {
        if (!time) return "";

        const [hours, minutes] =
            time.substring(0, 5).split(":");

        let hour = Number(hours);

        const ampm = hour >= 12 ? "PM" : "AM";

        hour = hour % 12 || 12;

        return `${String(hour).padStart(2, "0")}:${minutes} ${ampm}`;
    };

    const getDayTimetables = (day) => {
        return getTeacherTimetables().filter(
            (item) =>
                item.dayOfWeek?.toLowerCase() ===
                day.toLowerCase()
        );
    };

    const teacherTimetables = getTeacherTimetables();

    return (
        <div className="app-layout">

            <TeacherSidebar />

            <main className="main-content">

                <div className="page-header">
                    <div>
                        <h1>My Timetable</h1>

                        <p>
                            {teacherTimetables.length} scheduled
                            class{" "}
                            {teacherTimetables.length === 1
                                ? "class"
                                : "classes"}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="message message-error">
                        {error}
                    </div>
                )}

                <div className="weekly-dashboard">

                    <div style={{ marginBottom: "20px" }}>
                        <h2 style={{ marginBottom: "5px" }}>
                            My Weekly Schedule
                        </h2>

                        <p
                            style={{
                                color: "#666",
                                margin: 0
                            }}
                        >
                            Monday to Saturday
                        </p>
                    </div>

                    <div
                        className="weekly-grid"
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(6, minmax(180px, 1fr))",
                            gap: "15px",
                            overflowX: "auto"
                        }}
                    >

                        {days.map((day) => {

                            const dayItems =
                                getDayTimetables(day);

                            return (
                                <div
                                    key={day}
                                    style={{
                                        background: "#F5F0E8",
                                        borderRadius: "10px",
                                        padding: "15px",
                                        minHeight: "400px",
                                        border:
                                            "1px solid #D4C8B7"
                                    }}
                                >

                                    <div
                                        style={{
                                            background: "#1E3E45",
                                            color: "white",
                                            padding: "12px",
                                            borderRadius: "7px",
                                            textAlign: "center",
                                            marginBottom: "15px",
                                            fontWeight: "600"
                                        }}
                                    >
                                        {day}
                                    </div>

                                    {dayItems.length === 0 ? (

                                        <div
                                            style={{
                                                textAlign: "center",
                                                color: "#888",
                                                padding:
                                                    "40px 5px"
                                            }}
                                        >
                                            No classes
                                        </div>

                                    ) : (

                                        dayItems.map((item) => {

                                            const assignment =
                                                getAssignment(
                                                    item.assignmentId
                                                );

                                            return (
                                                <div
                                                    key={
                                                        item.timetableId
                                                    }
                                                    style={{
                                                        background:
                                                            "white",
                                                        border:
                                                            "1px solid #D4C8B7",
                                                        borderLeft:
                                                            "5px solid #3B6A78",
                                                        borderRadius:
                                                            "7px",
                                                        padding: "12px",
                                                        marginBottom:
                                                            "12px",
                                                        boxShadow:
                                                            "0 2px 5px rgba(0,0,0,0.08)"
                                                    }}
                                                >

                                                    <div
                                                        style={{
                                                            fontWeight:
                                                                "700",
                                                            color:
                                                                "#1E3E45",
                                                            marginBottom:
                                                                "8px"
                                                        }}
                                                    >
                                                        {formatTime(
                                                            item.startTime
                                                        )}
                                                        {" - "}
                                                        {formatTime(
                                                            item.endTime
                                                        )}
                                                    </div>

                                                    <div
                                                        style={{
                                                            fontWeight:
                                                                "600",
                                                            marginBottom:
                                                                "5px"
                                                        }}
                                                    >
                                                        Subject{" "}
                                                        {assignment?.subjectId ||
                                                            "N/A"}
                                                    </div>

                                                    <div
                                                        style={{
                                                            fontSize:
                                                                "14px",
                                                            color:
                                                                "#555",
                                                            marginBottom:
                                                                "3px"
                                                        }}
                                                    >
                                                        Class{" "}
                                                        {assignment?.classId ||
                                                            "N/A"}
                                                    </div>

                                                    <div
                                                        style={{
                                                            fontSize:
                                                                "14px",
                                                            color:
                                                                "#555",
                                                            marginBottom:
                                                                "3px"
                                                        }}
                                                    >
                                                        Room{" "}
                                                        {item.roomNo ||
                                                            "N/A"}
                                                    </div>

                                                    <div
                                                        style={{
                                                            fontSize:
                                                                "12px",
                                                            color:
                                                                "#777",
                                                            marginTop:
                                                                "8px"
                                                        }}
                                                    >
                                                        Assignment #
                                                        {item.assignmentId}
                                                    </div>

                                                </div>
                                            );
                                        })

                                    )}

                                </div>
                            );
                        })}

                    </div>

                </div>

            </main>
        </div>
    );
}

export default TeacherTimetable;