import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import TeacherSidebar from "../components/TeacherSidebar";

function TeacherLeaveRequests() {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        leaveType: "",
        fromDate: "",
        toDate: "",
        reason: ""
    });

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

        loadLeaveRequests(user.teacherId);
    }, [navigate]);

    const loadLeaveRequests = async (teacherId) => {
        try {
            const response = await api.get("/leave");

            const myRequests = response.data.filter(
                (request) =>
                    String(request.teacherId) ===
                    String(teacherId)
            );

            setLeaveRequests(myRequests);
        } catch (err) {
            console.error("Leave Request API Error:", err);
            setError("Unable to load your leave requests.");
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const storedUser = localStorage.getItem("user");
        const user = JSON.parse(storedUser);

        try {
            await api.post("/leave", {
                teacherId: user.teacherId,
                leaveType: formData.leaveType,
                fromDate: formData.fromDate,
                toDate: formData.toDate,
                reason: formData.reason,
                status: "Pending",
                appliedOn: new Date().toISOString().split("T")[0]
            });

            setFormData({
                leaveType: "",
                fromDate: "",
                toDate: "",
                reason: ""
            });

            setShowForm(false);

            await loadLeaveRequests(user.teacherId);

        } catch (err) {
            console.error("Leave Request Submit Error:", err);
            setError("Unable to submit leave request.");
        }
    };

    const getStatusClass = (status) => {
        if (status === "Approved") {
            return "status-approved";
        }

        if (status === "Rejected") {
            return "status-rejected";
        }

        return "status-pending";
    };

    return (
        <div className="app-layout">

            <TeacherSidebar />

            <main className="main-content">

                <div className="page-header">

                    <div>
                        <h1>My Leave Requests</h1>

                        <p>
                            View and submit your leave requests
                        </p>
                    </div>

                    <button
                        className="primary-button"
                        onClick={() =>
                            setShowForm(!showForm)
                        }
                    >
                        {showForm
                            ? "Cancel"
                            : "Request Leave"}
                    </button>

                </div>

                {error && (
                    <div className="message message-error">
                        {error}
                    </div>
                )}

                {showForm && (
                    <div className="form-container">

                        <div className="form-header">
                            <h2>New Leave Request</h2>
                        </div>

                        <form onSubmit={handleSubmit}>

                            <div className="form-grid">

                                <div className="form-group">
                                    <label>Leave Type</label>

                                    <select
                                        name="leaveType"
                                        value={formData.leaveType}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">
                                            Select Leave Type
                                        </option>
                                        <option value="Casual">
                                            Casual
                                        </option>

                                        <option value="Sick">
                                            Sick
                                        </option>

                                        <option value="Earned">
                                            Earned
                                        </option>

                                        <option value="Emergency">
                                            Emergency
                                        </option>

                                        <option value="Other">
                                            Other
                                        </option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>From Date</label>

                                    <input
                                        type="date"
                                        name="fromDate"
                                        value={formData.fromDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>To Date</label>

                                    <input
                                        type="date"
                                        name="toDate"
                                        value={formData.toDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div
                                    className="form-group"
                                    style={{
                                        gridColumn: "1 / -1"
                                    }}
                                >
                                    <label>Reason</label>

                                    <textarea
                                        name="reason"
                                        value={formData.reason}
                                        onChange={handleChange}
                                        placeholder="Enter reason for leave"
                                        rows="4"
                                        required
                                    />
                                </div>

                            </div>

                            <button
                                type="submit"
                                className="primary-button"
                            >
                                Submit Request
                            </button>

                        </form>

                    </div>
                )}

                <div className="table-container">

                    <table>

                        <thead>
                        <tr>
                            <th>Request ID</th>
                            <th>Leave Type</th>
                            <th>From Date</th>
                            <th>To Date</th>
                            <th>Reason</th>
                            <th>Applied On</th>
                            <th>Status</th>
                        </tr>
                        </thead>

                        <tbody>

                        {leaveRequests.map((request) => (

                            <tr key={request.leaveId}>

                                <td>
                                    {request.leaveId}
                                </td>

                                <td>
                                    {request.leaveType}
                                </td>

                                <td>
                                    {request.fromDate}
                                </td>

                                <td>
                                    {request.toDate}
                                </td>

                                <td>
                                    {request.reason || "—"}
                                </td>

                                <td>
                                    {request.appliedOn}
                                </td>

                                <td>
                                        <span
                                            className={`status-badge ${getStatusClass(
                                                request.status
                                            )}`}
                                        >
                                            {request.status}
                                        </span>
                                </td>

                            </tr>

                        ))}

                        </tbody>

                    </table>

                    {leaveRequests.length === 0 && !error && (
                        <div className="no-results">

                            <h3>No leave requests</h3>

                            <p>
                                You have not submitted any
                                leave requests yet.
                            </p>

                        </div>
                    )}

                </div>

            </main>
        </div>
    );
}

export default TeacherLeaveRequests;