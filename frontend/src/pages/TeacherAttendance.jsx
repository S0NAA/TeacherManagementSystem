import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import TeacherSidebar from "../components/TeacherSidebar";

function TeacherAttendance() {
    const [attendance, setAttendance] = useState([]);
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

        const loadAttendance = async () => {
            try {
                const response = await api.get("/attendance");

                const myAttendance = response.data.filter(
                    (item) =>
                        String(item.teacherId) ===
                        String(user.teacherId)
                );

                setAttendance(myAttendance);

            } catch (err) {
                console.error("Attendance API Error:", err);
                setError("Unable to load your attendance.");
            }
        };

        loadAttendance();
    }, [navigate]);

    const presentCount = attendance.filter(
        (item) => item.status === "Present"
    ).length;

    const absentCount = attendance.filter(
        (item) => item.status === "Absent"
    ).length;

    const lateCount = attendance.filter(
        (item) => item.status === "Late"
    ).length;

    const getStatusClass = (status) => {
        if (status === "Present") {
            return "status-present";
        }

        if (status === "Absent") {
            return "status-absent";
        }

        return "status-late";
    };

    return (
        <div>
            <TeacherSidebar />

            <main>

                <div className="page-header">
                    <div>
                        <h1>My Attendance</h1>

                        <p>
                            View your attendance records
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="message message-error">
                        {error}
                    </div>
                )}

                {/* SUMMARY */}

                <div
                    style={{
                        display: "flex",
                        gap: "20px",
                        marginBottom: "20px",
                        flexWrap: "wrap"
                    }}
                >

                    <div>
                        <strong>Present:</strong>{" "}
                        {presentCount}
                    </div>

                    <div>
                        <strong>Absent:</strong>{" "}
                        {absentCount}
                    </div>

                    <div>
                        <strong>Late:</strong>{" "}
                        {lateCount}
                    </div>

                    <div>
                        <strong>Total:</strong>{" "}
                        {attendance.length}
                    </div>

                </div>

                {/* ATTENDANCE TABLE */}

                <div className="table-container">

                    <table>

                        <thead>
                        <tr>
                            <th>Attendance ID</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Remarks</th>
                        </tr>
                        </thead>

                        <tbody>

                        {attendance.map((item) => (

                            <tr key={item.attendanceId}>

                                <td>
                                    <strong>
                                        {item.attendanceId}
                                    </strong>
                                </td>

                                <td>
                                    {item.attendanceDate}
                                </td>

                                <td>
                                        <span
                                            className={`status-badge ${getStatusClass(
                                                item.status
                                            )}`}
                                        >
                                            {item.status}
                                        </span>
                                </td>

                                <td>
                                    {item.remarks || "—"}
                                </td>

                            </tr>

                        ))}

                        </tbody>

                    </table>

                    {attendance.length === 0 && !error && (
                        <div className="no-results">

                            <h3>
                                No attendance records found
                            </h3>

                            <p>
                                No attendance records are
                                available for your account.
                            </p>

                        </div>
                    )}

                </div>

            </main>
        </div>
    );
}

export default TeacherAttendance;