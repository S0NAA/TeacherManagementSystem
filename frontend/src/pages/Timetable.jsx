import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

function Timetable() {

    const [timetables, setTimetables] = useState([]);
    const [assignments, setAssignments] = useState([]);

    const [search, setSearch] = useState("");
    const [dayFilter, setDayFilter] = useState("All");
    const [teacherFilter, setTeacherFilter] = useState("All");
    const [classFilter, setClassFilter] = useState("All");

    const [showForm, setShowForm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showWeeklyView, setShowWeeklyView] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        timetableId: "",
        assignmentId: "",
        dayOfWeek: "",
        startTime: "",
        endTime: "",
        roomNo: "",
        status: "Active"
    });

    const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    // =====================================================
    // LOAD DATA
    // =====================================================

    useEffect(() => {
        loadTimetables();
        loadAssignments();
    }, []);

    const loadTimetables = async () => {
        try {
            const response = await api.get("/timetable");
            setTimetables(response.data);
        } catch (error) {
            console.error("Timetable Load Error:", error);
            showMessage("Failed to load timetable.", "error");
        }
    };

    const loadAssignments = async () => {
        try {
            const response = await api.get("/assignments");
            setAssignments(response.data);
        } catch (error) {
            console.error("Assignment Load Error:", error);
        }
    };

    // =====================================================
    // HELPERS
    // =====================================================

    const getAssignment = (assignmentId) => {
        return assignments.find(
            (assignment) =>
                Number(assignment.assignmentId) === Number(assignmentId)
        );
    };

    const showMessage = (text, type) => {
        setMessage(text);
        setMessageType(type);

        setTimeout(() => {
            setMessage("");
            setMessageType("");
        }, 3000);
    };

    const formatTime = (time) => {
        if (!time) return "";

        const [hours, minutes] = time.substring(0, 5).split(":");

        let hour = Number(hours);
        const ampm = hour >= 12 ? "PM" : "AM";

        hour = hour % 12 || 12;

        return `${String(hour).padStart(2, "0")}:${minutes} ${ampm}`;
    };

    // =====================================================
    // FILTER OPTIONS
    // =====================================================

    const teacherOptions = [
        ...new Set(
            assignments
                .map((assignment) => assignment.teacherId)
                .filter(Boolean)
        )
    ];

    const classOptions = [
        ...new Set(
            assignments
                .map((assignment) => assignment.classId)
                .filter((classId) => classId !== null && classId !== undefined)
        )
    ];

    // =====================================================
    // SEARCH + FILTERS
    // =====================================================

    const filteredTimetables = timetables.filter((item) => {

        const assignment = getAssignment(item.assignmentId);

        const searchText = `
${item.timetableId || ""}
${item.assignmentId || ""}
${item.dayOfWeek || ""}
${item.roomNo || ""}
${item.status || ""}
${assignment?.teacherId || ""}
${assignment?.subjectId || ""}
${assignment?.classId || ""}
`.toLowerCase();

        const matchesSearch =
            searchText.includes(search.toLowerCase());

        const matchesDay =
            dayFilter === "All" ||
            item.dayOfWeek === dayFilter;

        const matchesTeacher =
            teacherFilter === "All" ||
            String(assignment?.teacherId) === String(teacherFilter);

        const matchesClass =
            classFilter === "All" ||
            String(assignment?.classId) === String(classFilter);

        return (
            matchesSearch &&
            matchesDay &&
            matchesTeacher &&
            matchesClass
        );
    });

    // =====================================================
    // FORM HANDLING
    // =====================================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });

        setErrors({
            ...errors,
            [name]: ""
        });
    };

    const resetForm = () => {
        setFormData({
            timetableId: "",
            assignmentId: "",
            dayOfWeek: "",
            startTime: "",
            endTime: "",
            roomNo: "",
            status: "Active"
        });

        setErrors({});
        setEditingId(null);
    };

    const handleAdd = () => {
        resetForm();
        setShowForm(true);
    };

    const handleEditTimetable = (item) => {

        setFormData({
            timetableId: item.timetableId,
            assignmentId: item.assignmentId,
            dayOfWeek: item.dayOfWeek,

            startTime: item.startTime
                ? item.startTime.substring(0, 5)
                : "",

            endTime: item.endTime
                ? item.endTime.substring(0, 5)
                : "",

            roomNo: item.roomNo || "",
            status: item.status || "Active"
        });

        setEditingId(item.timetableId);
        setErrors({});
        setShowForm(true);
    };

    // =====================================================
    // VALIDATION
    // =====================================================

    const validateForm = () => {

        const newErrors = {};

        if (
            !editingId &&
            (!formData.timetableId ||
                formData.timetableId.toString().trim() === "")
        ) {
            newErrors.timetableId =
                "Timetable ID is required.";
        }

        if (!formData.assignmentId) {
            newErrors.assignmentId =
                "Assignment is required.";
        }

        if (!formData.dayOfWeek) {
            newErrors.dayOfWeek =
                "Day is required.";
        }

        if (!formData.startTime) {
            newErrors.startTime =
                "Start time is required.";
        }

        if (!formData.endTime) {
            newErrors.endTime =
                "End time is required.";
        }

        if (
            formData.startTime &&
            formData.endTime &&
            formData.startTime >= formData.endTime
        ) {
            newErrors.endTime =
                "End time must be after start time.";
        }

        if (!formData.roomNo.trim()) {
            newErrors.roomNo =
                "Room number is required.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // =====================================================
    // SAVE
    // =====================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const data = {
            assignmentId: Number(formData.assignmentId),
            dayOfWeek: formData.dayOfWeek,
            startTime: formData.startTime,
            endTime: formData.endTime,
            roomNo: formData.roomNo,
            status: formData.status
        };

        try {

            if (editingId) {

                await api.put(
                    `/timetable/${editingId}`,
                    data
                );

                showMessage(
                    "Timetable updated successfully.",
                    "success"
                );

            } else {

                await api.post(
                    "/timetable",
                    data
                );

                showMessage(
                    "Timetable added successfully.",
                    "success"
                );
            }

            setShowForm(false);
            resetForm();
            loadTimetables();

        } catch (error) {

            console.error(
                "Timetable Save Error:",
                error.response?.data
            );

            const backendMessage =
                typeof error.response?.data === "string"
                    ? error.response.data
                    : editingId
                        ? "Failed to update timetable."
                        : "Failed to add timetable.";

            showMessage(
                backendMessage,
                "error"
            );
        }
    };

    // =====================================================
    // DELETE
    // =====================================================

    const confirmDelete = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {

        try {

            await api.delete(
                `/timetable/${deleteId}`
            );

            showMessage(
                "Timetable deleted successfully.",
                "success"
            );

            setShowDeleteModal(false);
            setDeleteId(null);

            loadTimetables();

        } catch (error) {

            console.error(
                "Timetable Delete Error:",
                error
            );

            showMessage(
                "Failed to delete timetable.",
                "error"
            );
        }
    };

    // =====================================================
    // WEEKLY VIEW
    // =====================================================

    const getDayTimetables = (day) => {

        return timetables
            .filter(
                (item) =>
                    item.dayOfWeek?.toLowerCase() ===
                    day.toLowerCase()
            )
            .sort((a, b) =>
                (a.startTime || "").localeCompare(
                    b.startTime || ""
                )
            );
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="app-layout">

            <Sidebar />

            <main className="main-content">

                {/* HEADER */}

                <div className="page-header">

                    <div>
                        <h1>Timetable</h1>

                        <p>
                            Showing{" "}
                            {filteredTimetables.length}{" "}
                            of{" "}
                            {timetables.length}{" "}
                            timetable records
                        </p>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            gap: "10px"
                        }}
                    >

                        <button
                            className="add-button"
                            onClick={() =>
                                setShowWeeklyView(
                                    !showWeeklyView
                                )
                            }
                        >
                            {showWeeklyView
                                ? "Table View"
                                : "Weekly View"}
                        </button>

                        {!showWeeklyView && (
                            <button
                                className="add-button"
                                onClick={handleAdd}
                            >
                                + Add Timetable
                            </button>
                        )}

                    </div>

                </div>

                {/* MESSAGE */}

                {message && (
                    <div
                        className={`message ${
                            messageType === "success"
                                ? "message-success"
                                : "message-error"
                        }`}
                    >
                        {message}
                    </div>
                )}

                {/* WEEKLY VIEW */}

                {showWeeklyView ? (

                    <div className="weekly-dashboard">

                        <div
                            style={{
                                marginBottom: "20px"
                            }}
                        >
                            <h2
                                style={{
                                    marginBottom: "5px"
                                }}
                            >
                                Weekly Teaching Schedule
                            </h2>

                            <p
                                style={{
                                    color: "#666",
                                    margin: 0
                                }}
                            >
                                Monday to Saturday timetable
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
                                            background:
                                                "#F5F0E8",
                                            borderRadius:
                                                "10px",
                                            padding:
                                                "15px",
                                            minHeight:
                                                "400px",
                                            border:
                                                "1px solid #D4C8B7"
                                        }}
                                    >

                                        <div
                                            style={{
                                                background:
                                                    "#1E3E45",
                                                color: "white",
                                                padding:
                                                    "12px",
                                                borderRadius:
                                                    "7px",
                                                textAlign:
                                                    "center",
                                                marginBottom:
                                                    "15px",
                                                fontWeight:
                                                    "600"
                                            }}
                                        >
                                            {day}
                                        </div>

                                        {dayItems.length === 0 ? (

                                            <div
                                                style={{
                                                    textAlign:
                                                        "center",
                                                    color:
                                                        "#888",
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
                                                            padding:
                                                                "12px",
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
                                                                    "7px"
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
                                                            Teacher{" "}
                                                            {assignment?.teacherId ||
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
                                                                    "#555"
                                                            }}
                                                        >
                                                            Room{" "}
                                                            {item.roomNo ||
                                                                "N/A"}
                                                        </div>

                                                        <div
                                                            style={{
                                                                marginTop:
                                                                    "8px",
                                                                fontSize:
                                                                    "12px",
                                                                color:
                                                                    "#777"
                                                            }}
                                                        >
                                                            Assignment #
                                                            {
                                                                item.assignmentId
                                                            }
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

                ) : (

                    <>

                        {/* FILTERS */}

                        <div
                            style={{
                                display: "flex",
                                gap: "10px",
                                marginBottom: "15px",
                                flexWrap: "wrap",
                                alignItems: "center"
                            }}
                        >

                            <input
                                type="text"
                                className="table-search"
                                placeholder="Search timetable..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                            />

                            <select
                                value={dayFilter}
                                onChange={(e) =>
                                    setDayFilter(
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
                                    All Days
                                </option>

                                {days.map((day) => (
                                    <option
                                        key={day}
                                        value={day}
                                    >
                                        {day}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={teacherFilter}
                                onChange={(e) =>
                                    setTeacherFilter(
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
                                    All Teachers
                                </option>

                                {teacherOptions.map(
                                    (teacherId) => (
                                        <option
                                            key={teacherId}
                                            value={teacherId}
                                        >
                                            Teacher {teacherId}
                                        </option>
                                    )
                                )}
                            </select>

                            <select
                                value={classFilter}
                                onChange={(e) =>
                                    setClassFilter(
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
                                    All Classes
                                </option>

                                {classOptions.map(
                                    (classId) => (
                                        <option
                                            key={classId}
                                            value={classId}
                                        >
                                            Class {classId}
                                        </option>
                                    )
                                )}
                            </select>

                        </div>

                        {/* TABLE */}

                        <div className="table-container">

                            <table>

                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Assignment</th>
                                    <th>Day</th>
                                    <th>Time</th>
                                    <th>Room</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>

                                <tbody>

                                {filteredTimetables.length === 0 ? (

                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="no-results"
                                        >
                                            No timetable records found.
                                        </td>
                                    </tr>

                                ) : (

                                    filteredTimetables.map(
                                        (item) => {

                                            const assignment =
                                                getAssignment(
                                                    item.assignmentId
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        item.timetableId
                                                    }
                                                >

                                                    <td>
                                                        {
                                                            item.timetableId
                                                        }
                                                    </td>

                                                    <td>

                                                        <strong>
                                                            Assignment{" "}
                                                            {
                                                                item.assignmentId
                                                            }
                                                        </strong>

                                                        <br />

                                                        <small>
                                                            Teacher{" "}
                                                            {
                                                                assignment?.teacherId
                                                            }
                                                            {" • "}
                                                            Subject{" "}
                                                            {
                                                                assignment?.subjectId
                                                            }
                                                            {" • "}
                                                            Class{" "}
                                                            {
                                                                assignment?.classId
                                                            }
                                                        </small>

                                                    </td>

                                                    <td>
                                                        {
                                                            item.dayOfWeek
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            formatTime(
                                                                item.startTime
                                                            )
                                                        }
                                                        {" - "}
                                                        {
                                                            formatTime(
                                                                item.endTime
                                                            )
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            item.roomNo
                                                        }
                                                    </td>

                                                    <td>

                                                            <span
                                                                className={`status-badge ${
                                                                    item.status ===
                                                                    "Active"
                                                                        ? "status-active"
                                                                        : "status-inactive"
                                                                }`}
                                                            >
                                                                {
                                                                    item.status
                                                                }
                                                            </span>

                                                    </td>

                                                    <td>

                                                        <div className="action-buttons">

                                                            <button
                                                                className="edit-button"
                                                                onClick={() =>
                                                                    handleEditTimetable(
                                                                        item
                                                                    )
                                                                }
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                className="delete-button"
                                                                onClick={() =>
                                                                    confirmDelete(
                                                                        item.timetableId
                                                                    )
                                                                }
                                                            >
                                                                Delete
                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>
                                            );
                                        }
                                    )

                                )}

                                </tbody>

                            </table>

                        </div>

                    </>
                )}

                {/* ADD / EDIT FORM */}

                {showForm && (

                    <div className="modal-overlay">

                        <div className="form-container">

                            <div className="form-header">

                                <h2>
                                    {editingId
                                        ? "Edit Timetable"
                                        : "Add Timetable"}
                                </h2>

                                <button
                                    className="close-button"
                                    onClick={() => {
                                        setShowForm(false);
                                        resetForm();
                                    }}
                                >
                                    ×
                                </button>

                            </div>

                            <form onSubmit={handleSubmit}>

                                <div className="form-grid">

                                    {!editingId && (

                                        <div className="form-group">

                                            <label>
                                                Timetable ID
                                            </label>

                                            <input
                                                type="number"
                                                name="timetableId"
                                                value={
                                                    formData.timetableId
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                            {errors.timetableId && (
                                                <span className="field-error">
                                                    {
                                                        errors.timetableId
                                                    }
                                                </span>
                                            )}

                                        </div>
                                    )}

                                    <div className="form-group">

                                        <label>
                                            Assignment
                                        </label>

                                        <select
                                            name="assignmentId"
                                            value={
                                                formData.assignmentId
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        >

                                            <option value="">
                                                Select Assignment
                                            </option>

                                            {assignments.map(
                                                (assignment) => (

                                                    <option
                                                        key={
                                                            assignment.assignmentId
                                                        }
                                                        value={
                                                            assignment.assignmentId
                                                        }
                                                    >
                                                        Assignment{" "}
                                                        {
                                                            assignment.assignmentId
                                                        }
                                                        {" - Teacher "}
                                                        {
                                                            assignment.teacherId
                                                        }
                                                        {" - Subject "}
                                                        {
                                                            assignment.subjectId
                                                        }
                                                        {" - Class "}
                                                        {
                                                            assignment.classId
                                                        }
                                                    </option>

                                                )
                                            )}

                                        </select>

                                        {errors.assignmentId && (
                                            <span className="field-error">
                                                {
                                                    errors.assignmentId
                                                }
                                            </span>
                                        )}

                                    </div>

                                    <div className="form-group">

                                        <label>
                                            Day
                                        </label>

                                        <select
                                            name="dayOfWeek"
                                            value={
                                                formData.dayOfWeek
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        >

                                            <option value="">
                                                Select Day
                                            </option>

                                            {days.map((day) => (
                                                <option
                                                    key={day}
                                                    value={day}
                                                >
                                                    {day}
                                                </option>
                                            ))}

                                        </select>

                                        {errors.dayOfWeek && (
                                            <span className="field-error">
                                                {
                                                    errors.dayOfWeek
                                                }
                                            </span>
                                        )}

                                    </div>

                                    <div className="form-group">

                                        <label>
                                            Start Time
                                        </label>

                                        <input
                                            type="time"
                                            name="startTime"
                                            value={
                                                formData.startTime
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                        {errors.startTime && (
                                            <span className="field-error">
                                                {
                                                    errors.startTime
                                                }
                                            </span>
                                        )}

                                    </div>

                                    <div className="form-group">

                                        <label>
                                            End Time
                                        </label>

                                        <input
                                            type="time"
                                            name="endTime"
                                            value={
                                                formData.endTime
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                        {errors.endTime && (
                                            <span className="field-error">
                                                {
                                                    errors.endTime
                                                }
                                            </span>
                                        )}

                                    </div>

                                    <div className="form-group">

                                        <label>
                                            Room Number
                                        </label>

                                        <input
                                            type="text"
                                            name="roomNo"
                                            value={
                                                formData.roomNo
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="e.g. 101"
                                        />

                                        {errors.roomNo && (
                                            <span className="field-error">
                                                {
                                                    errors.roomNo
                                                }
                                            </span>
                                        )}

                                    </div>

                                    <div className="form-group">

                                        <label>
                                            Status
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

                                            <option value="Active">
                                                Active
                                            </option>

                                            <option value="Inactive">
                                                Inactive
                                            </option>

                                        </select>

                                    </div>

                                </div>

                                <div className="form-actions">

                                    <button
                                        type="button"
                                        className="cancel-button"
                                        onClick={() => {
                                            setShowForm(false);
                                            resetForm();
                                        }}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="save-button"
                                    >
                                        {editingId
                                            ? "Update Timetable"
                                            : "Save Timetable"}
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>
                )}

                {/* DELETE MODAL */}

                {showDeleteModal && (

                    <div className="modal-overlay">

                        <div className="delete-modal">

                            <div className="delete-modal-icon">
                                !
                            </div>

                            <h2>
                                Delete Timetable?
                            </h2>

                            <p className="delete-warning">
                                Are you sure you want to delete
                                this timetable record?
                            </p>

                            <div className="delete-modal-actions">

                                <button
                                    className="cancel-button"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeleteId(null);
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    className="delete-confirm-button"
                                    onClick={handleDelete}
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    </div>
                )}

            </main>

        </div>
    );
}

export default Timetable;