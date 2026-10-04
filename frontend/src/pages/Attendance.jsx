import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

function Attendance() {

    const [attendance, setAttendance] = useState([]);
    const [teachers, setTeachers] = useState([]);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [dateFilter, setDateFilter] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [attendanceToDelete, setAttendanceToDelete] =
        useState(null);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const [formData, setFormData] = useState({
        attendanceId: "",
        teacherId: "",
        attendanceDate: "",
        status: "Present",
        remarks: ""
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadAttendance();
        loadTeachers();
    }, []);

    const loadAttendance = async () => {
        try {
            const response = await api.get("/attendance");
            setAttendance(response.data);
        } catch (error) {
            console.error(
                "Attendance API Error:",
                error
            );

            showMessage(
                "Unable to load attendance.",
                "error"
            );
        }
    };

    const loadTeachers = async () => {
        try {
            const response = await api.get("/teachers");
            setTeachers(response.data);
        } catch (error) {
            console.error(
                "Teachers API Error:",
                error
            );

            showMessage(
                "Unable to load teachers.",
                "error"
            );
        }
    };

    const showMessage = (text, type) => {
        setMessage(text);
        setMessageType(type);

        setTimeout(() => {
            setMessage("");
            setMessageType("");
        }, 3000);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });

        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ""
            });
        }
    };

    const resetForm = () => {
        setFormData({
            attendanceId: "",
            teacherId: "",
            attendanceDate: "",
            status: "Present",
            remarks: ""
        });

        setErrors({});
    };

    const handleAddAttendance = () => {
        setEditMode(false);
        resetForm();
        setShowForm(true);
    };

    const handleEditAttendance = (item) => {
        setEditMode(true);

        setFormData({
            attendanceId: item.attendanceId,
            teacherId: item.teacherId,
            attendanceDate:
                item.attendanceDate || "",
            status:
                item.status || "Present",
            remarks:
                item.remarks || ""
        });

        setErrors({});
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditMode(false);
        resetForm();
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.teacherId) {
            newErrors.teacherId =
                "Please select a teacher.";
        }

        if (!formData.attendanceDate) {
            newErrors.attendanceDate =
                "Attendance date is required.";
        }

        if (!formData.status) {
            newErrors.status =
                "Please select a status.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const attendanceData = {
                teacherId: formData.teacherId,
                attendanceDate:
                formData.attendanceDate,
                status: formData.status,
                remarks:
                    formData.remarks.trim()
            };

            if (editMode) {
                await api.put(
                    `/attendance/${formData.attendanceId}`,
                    attendanceData
                );

                showMessage(
                    "Attendance updated successfully.",
                    "success"
                );
            } else {
                await api.post(
                    "/attendance",
                    attendanceData
                );

                showMessage(
                    "Attendance added successfully.",
                    "success"
                );
            }

            await loadAttendance();

            setShowForm(false);
            setEditMode(false);
            resetForm();

        } catch (error) {
            console.error(
                "Attendance Save Error:",
                error
            );

            const backendMessage =
                typeof error.response?.data ===
                "string"
                    ? error.response.data
                    : editMode
                        ? "Failed to update attendance."
                        : "Failed to add attendance.";

            showMessage(
                backendMessage,
                "error"
            );
        }
    };

    const openDeleteModal = (item) => {
        setAttendanceToDelete(item);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setAttendanceToDelete(null);
    };

    const handleDeleteAttendance = async () => {
        if (!attendanceToDelete) {
            return;
        }

        try {
            await api.delete(
                `/attendance/${attendanceToDelete.attendanceId}`
            );

            await loadAttendance();

            showMessage(
                "Attendance deleted successfully.",
                "success"
            );

            closeDeleteModal();

        } catch (error) {
            console.error(
                "Delete Attendance Error:",
                error
            );

            showMessage(
                "Failed to delete attendance.",
                "error"
            );

            closeDeleteModal();
        }
    };

    const getStatusClass = (status) => {
        if (status === "Present") {
            return "status-present";
        }

        if (status === "Absent") {
            return "status-absent";
        }

        return "status-late";
    };

    const filteredAttendance =
        attendance.filter((item) => {

            const searchText =
                search.toLowerCase();

            const matchesSearch =
                String(item.attendanceId)
                    .toLowerCase()
                    .includes(searchText) ||

                item.teacherId
                    ?.toLowerCase()
                    .includes(searchText) ||

                item.attendanceDate
                    ?.toLowerCase()
                    .includes(searchText) ||

                item.status
                    ?.toLowerCase()
                    .includes(searchText) ||

                item.remarks
                    ?.toLowerCase()
                    .includes(searchText);

            const matchesStatus =
                statusFilter === "All" ||
                item.status === statusFilter;

            const matchesDate =
                !dateFilter ||
                item.attendanceDate === dateFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesDate
            );
        });

    const presentCount =
        filteredAttendance.filter(
            (item) => item.status === "Present"
        ).length;

    const absentCount =
        filteredAttendance.filter(
            (item) => item.status === "Absent"
        ).length;

    const lateCount =
        filteredAttendance.filter(
            (item) => item.status === "Late"
        ).length;

    return (
        <div>
            <Sidebar />

            <main>

                {/* PAGE HEADER */}

                <div className="page-header">

                    <div>
                        <h1>Attendance</h1>

                        <p>
                            Showing{" "}
                            {filteredAttendance.length}{" "}
                            of{" "}
                            {attendance.length}{" "}
                            attendance records
                        </p>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            gap: "12px",
                            alignItems: "center",
                            flexWrap: "wrap"
                        }}
                    >

                        <div className="table-search">
                            <input
                                type="text"
                                placeholder="Search attendance..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(
                                    e.target.value
                                )
                            }
                            style={{
                                padding: "10px 12px",
                                border: "1px solid #ddd",
                                borderRadius: "6px",
                                background: "#fff"
                            }}
                        >
                            <option value="All">
                                All Status
                            </option>

                            <option value="Present">
                                Present
                            </option>

                            <option value="Absent">
                                Absent
                            </option>

                            <option value="Late">
                                Late
                            </option>
                        </select>

                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) =>
                                setDateFilter(
                                    e.target.value
                                )
                            }
                            style={{
                                padding: "9px 12px",
                                border: "1px solid #ddd",
                                borderRadius: "6px",
                                background: "#fff"
                            }}
                        />

                        <button
                            className="add-button"
                            onClick={
                                handleAddAttendance
                            }
                        >
                            + Add Attendance
                        </button>

                    </div>

                </div>


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
                        <strong>
                            Present:
                        </strong>{" "}
                        {presentCount}
                    </div>

                    <div>
                        <strong>
                            Absent:
                        </strong>{" "}
                        {absentCount}
                    </div>

                    <div>
                        <strong>
                            Late:
                        </strong>{" "}
                        {lateCount}
                    </div>

                </div>


                {/* MESSAGE */}

                {message && (
                    <div
                        className={`message ${
                            messageType ===
                            "success"
                                ? "message-success"
                                : "message-error"
                        }`}
                    >

                        <span>
                            {messageType ===
                            "success"
                                ? "✓"
                                : "!"}
                        </span>

                        {message}

                    </div>
                )}


                {/* ADD / EDIT FORM */}

                {showForm && (
                    <div className="form-container">

                        <div className="form-header">

                            <div>

                                <h2>
                                    {editMode
                                        ? "Edit Attendance"
                                        : "Add Attendance"}
                                </h2>

                                <p>
                                    {editMode
                                        ? "Update attendance information"
                                        : "Enter attendance information"}
                                </p>

                            </div>

                            <button
                                className="close-button"
                                onClick={
                                    handleCancel
                                }
                                type="button"
                            >
                                ×
                            </button>

                        </div>

                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >

                            <div className="form-grid">

                                {/* TEACHER */}

                                <div className="form-group">

                                    <label>
                                        Teacher
                                        <span>*</span>
                                    </label>

                                    <select
                                        name="teacherId"
                                        value={
                                            formData.teacherId
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option value="">
                                            Select Teacher
                                        </option>

                                        {teachers.map(
                                            (teacher) => (
                                                <option
                                                    key={
                                                        teacher.teacherId
                                                    }
                                                    value={
                                                        teacher.teacherId
                                                    }
                                                >
                                                    {
                                                        teacher.teacherId
                                                    }
                                                    {" - "}
                                                    {
                                                        teacher.name
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                    {errors.teacherId && (
                                        <small className="field-error">
                                            {
                                                errors.teacherId
                                            }
                                        </small>
                                    )}

                                </div>


                                {/* DATE */}

                                <div className="form-group">

                                    <label>
                                        Attendance Date
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="date"
                                        name="attendanceDate"
                                        value={
                                            formData.attendanceDate
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    {errors.attendanceDate && (
                                        <small className="field-error">
                                            {
                                                errors.attendanceDate
                                            }
                                        </small>
                                    )}

                                </div>


                                {/* STATUS */}

                                <div className="form-group">

                                    <label>
                                        Status
                                        <span>*</span>
                                    </label>

                                    <select
                                        name="status"
                                        value={
                                            formData.status
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option value="Present">
                                            Present
                                        </option>

                                        <option value="Absent">
                                            Absent
                                        </option>

                                        <option value="Late">
                                            Late
                                        </option>

                                    </select>

                                    {errors.status && (
                                        <small className="field-error">
                                            {
                                                errors.status
                                            }
                                        </small>
                                    )}

                                </div>


                                {/* REMARKS */}

                                <div className="form-group">

                                    <label>
                                        Remarks
                                    </label>

                                    <input
                                        type="text"
                                        name="remarks"
                                        placeholder="Optional"
                                        maxLength="255"
                                        value={
                                            formData.remarks
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>

                            </div>


                            {/* FORM BUTTONS */}

                            <div className="form-actions">

                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={
                                        handleCancel
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-button"
                                >
                                    {editMode
                                        ? "Update Attendance"
                                        : "Save Attendance"}
                                </button>

                            </div>

                        </form>

                    </div>
                )}


                {/* ATTENDANCE TABLE */}

                <div className="table-container">

                    <table>

                        <thead>

                        <tr>

                            <th>
                                Attendance ID
                            </th>

                            <th>
                                Teacher ID
                            </th>

                            <th>
                                Date
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Remarks
                            </th>

                            <th>
                                Actions
                            </th>

                        </tr>

                        </thead>

                        <tbody>

                        {filteredAttendance.map(
                            (item) => (

                                <tr
                                    key={
                                        item.attendanceId
                                    }
                                >

                                    <td>
                                        <strong>
                                            {
                                                item.attendanceId
                                            }
                                        </strong>
                                    </td>

                                    <td>
                                        {
                                            item.teacherId
                                        }
                                    </td>

                                    <td>
                                        {
                                            item.attendanceDate
                                        }
                                    </td>

                                    <td>

                                            <span
                                                className={`status-badge ${getStatusClass(
                                                    item.status
                                                )}`}
                                            >
                                                {
                                                    item.status
                                                }
                                            </span>

                                    </td>

                                    <td>
                                        {
                                            item.remarks ||
                                            "—"
                                        }
                                    </td>

                                    <td>

                                        <div className="action-buttons">

                                            <button
                                                className="edit-button"
                                                onClick={() =>
                                                    handleEditAttendance(
                                                        item
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="delete-button"
                                                onClick={() =>
                                                    openDeleteModal(
                                                        item
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            )
                        )}

                        </tbody>

                    </table>


                    {filteredAttendance.length ===
                        0 && (

                            <div className="no-results">

                                <h3>
                                    No attendance records found
                                </h3>

                                <p>
                                    Try changing your
                                    search or add a new
                                    attendance record.
                                </p>

                            </div>

                        )}

                </div>

            </main>


            {/* DELETE MODAL */}

            {showDeleteModal &&
                attendanceToDelete && (

                    <div
                        className="modal-overlay"
                        onClick={
                            closeDeleteModal
                        }
                    >

                        <div
                            className="delete-modal"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="delete-modal-icon">
                                !
                            </div>

                            <h2>
                                Delete Attendance?
                            </h2>

                            <p>
                                Are you sure you
                                want to delete
                                attendance record
                                <strong>
                                    {" "}
                                    #
                                    {
                                        attendanceToDelete.attendanceId
                                    }
                                </strong>
                                ?
                            </p>

                            <p className="delete-warning">
                                This action cannot
                                be undone.
                            </p>

                            <div className="delete-modal-actions">

                                <button
                                    className="cancel-button"
                                    onClick={
                                        closeDeleteModal
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    className="delete-confirm-button"
                                    onClick={
                                        handleDeleteAttendance
                                    }
                                >
                                    Delete Attendance
                                </button>

                            </div>

                        </div>

                    </div>

                )}

        </div>
    );
}

export default Attendance;