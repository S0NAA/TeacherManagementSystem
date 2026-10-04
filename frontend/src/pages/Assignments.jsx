import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

function Assignments() {
    const [assignments, setAssignments] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);

    const [search, setSearch] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        assignmentId: "",
        teacherId: "",
        subjectId: "",
        classId: "",
        academicYear: "2026-27",
        status: "Active"
    });

    // =====================================================
    // LOAD DATA
    // =====================================================

    useEffect(() => {
        loadAssignments();
        loadTeachers();
        loadSubjects();
        loadClasses();
    }, []);

    const loadAssignments = async () => {
        try {
            const response = await api.get("/assignments");
            setAssignments(response.data);
        } catch (error) {
            console.error("Assignments API Error:", error);
        }
    };

    const loadTeachers = async () => {
        try {
            const response = await api.get("/teachers");
            setTeachers(response.data);
        } catch (error) {
            console.error("Teachers API Error:", error);
        }
    };

    const loadSubjects = async () => {
        try {
            const response = await api.get("/subjects");
            setSubjects(response.data);
        } catch (error) {
            console.error("Subjects API Error:", error);
        }
    };

    const loadClasses = async () => {
        try {
            const response = await api.get("/classes");
            setClasses(response.data);
        } catch (error) {
            console.error("Classes API Error:", error);
        }
    };

    // =====================================================
    // SEARCH
    // =====================================================

    const filteredAssignments = assignments.filter((assignment) => {
        const searchText = search.toLowerCase();

        return (
            String(assignment.assignmentId).includes(searchText) ||
            assignment.teacherId?.toLowerCase().includes(searchText) ||
            String(assignment.subjectId).includes(searchText) ||
            String(assignment.classId).includes(searchText) ||
            assignment.academicYear?.toLowerCase().includes(searchText) ||
            assignment.status?.toLowerCase().includes(searchText)
        );
    });

    // =====================================================
    // FORM HANDLING
    // =====================================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: ""
        }));
    };

    const openAddForm = () => {
        setEditMode(false);

        setFormData({
            assignmentId: "",
            teacherId: "",
            subjectId: "",
            classId: "",
            academicYear: "2026-27",
            status: "Active"
        });

        setErrors({});
        setMessage("");
        setShowForm(true);
    };

    const openEditForm = (assignment) => {
        setEditMode(true);

        setFormData({
            assignmentId: assignment.assignmentId,
            teacherId: assignment.teacherId || "",
            subjectId: assignment.subjectId || "",
            classId: assignment.classId || "",
            academicYear: assignment.academicYear || "",
            status: assignment.status || "Active"
        });

        setErrors({});
        setMessage("");
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditMode(false);
        setErrors({});
        setMessage("");
    };

    // =====================================================
    // VALIDATION
    // =====================================================

    const validateForm = () => {
        const newErrors = {};

        if (!formData.teacherId) {
            newErrors.teacherId = "Teacher is required.";
        }

        if (!formData.subjectId) {
            newErrors.subjectId = "Subject is required.";
        }

        if (!formData.classId) {
            newErrors.classId = "Class is required.";
        }

        if (!formData.academicYear.trim()) {
            newErrors.academicYear = "Academic year is required.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // =====================================================
    // ADD / UPDATE
    // =====================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const data = {
            teacherId: formData.teacherId,
            subjectId: Number(formData.subjectId),
            classId: Number(formData.classId),
            academicYear: formData.academicYear,
            status: formData.status
        };

        try {
            if (editMode) {
                await api.put(
                    `/assignments/${formData.assignmentId}`,
                    data
                );

                setMessage("Assignment updated successfully.");
            } else {
                await api.post("/assignments", data);

                setMessage("Assignment added successfully.");
            }

            setMessageType("success");

            await loadAssignments();

            setTimeout(() => {
                closeForm();
            }, 700);

        } catch (error) {
            console.error("Assignment Save Error:", error);

            const backendMessage =
                error.response?.data;

            setMessage(
                typeof backendMessage === "string"
                    ? backendMessage
                    : "Unable to save assignment."
            );

            setMessageType("error");
        }
    };

    // =====================================================
    // DELETE
    // =====================================================

    const openDeleteModal = (assignment) => {
        setRecordToDelete(assignment);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setRecordToDelete(null);
    };

    const handleDelete = async () => {
        if (!recordToDelete) {
            return;
        }

        try {
            await api.delete(
                `/assignments/${recordToDelete.assignmentId}`
            );

            setAssignments((prev) =>
                prev.filter(
                    (assignment) =>
                        assignment.assignmentId !==
                        recordToDelete.assignmentId
                )
            );

            setMessage("Assignment deleted successfully.");
            setMessageType("success");

            closeDeleteModal();

        } catch (error) {
            console.error("Assignment Delete Error:", error);

            const backendMessage =
                error.response?.data;

            setMessage(
                typeof backendMessage === "string"
                    ? backendMessage
                    : "Unable to delete assignment."
            );

            setMessageType("error");

            closeDeleteModal();
        }
    };

    return (
        <div>
            <Sidebar />

            <main>

                {/* =====================================================
                    HEADER
                ===================================================== */}

                <div className="page-header">
                    <div>
                        <h1>Teacher Assignments</h1>

                        <p>
                            Showing {filteredAssignments.length} of{" "}
                            {assignments.length} assignments
                        </p>
                    </div>

                    <div className="table-search">
                        <input
                            type="text"
                            placeholder="Search assignments..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                        <button
                            className="add-button"
                            onClick={openAddForm}
                        >
                            Add Assignment
                        </button>
                    </div>
                </div>

                {/* =====================================================
                    MESSAGE
                ===================================================== */}

                {message && !showForm && (
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

                {/* =====================================================
                    TABLE
                ===================================================== */}

                <div className="table-container">
                    <table>
                        <thead>
                        <tr>
                            <th>Assignment ID</th>
                            <th>Teacher ID</th>
                            <th>Subject ID</th>
                            <th>Class ID</th>
                            <th>Academic Year</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                        </thead>

                        <tbody>
                        {filteredAssignments.map((assignment) => (
                            <tr key={assignment.assignmentId}>

                                <td>
                                    {assignment.assignmentId}
                                </td>

                                <td>
                                    {assignment.teacherId}
                                </td>

                                <td>
                                    {assignment.subjectId}
                                </td>

                                <td>
                                    {assignment.classId}
                                </td>

                                <td>
                                    {assignment.academicYear}
                                </td>

                                <td>
                                    <span
                                        className={`status-badge ${
    assignment.status?.toLowerCase() ===
    "active"
        ? "status-active"
        : "status-inactive"
}`}
                                    >
                                        {assignment.status}
                                    </span>
                                </td>

                                <td>
                                    <div className="action-buttons">

                                        <button
                                            className="edit-button"
                                            onClick={() =>
                                                openEditForm(
                                                    assignment
                                                )
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="delete-button"
                                            onClick={() =>
                                                openDeleteModal(
                                                    assignment
                                                )
                                            }
                                        >
                                            Delete
                                        </button>

                                    </div>
                                </td>

                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {filteredAssignments.length === 0 && (
                        <div className="no-results">
                            No assignments found.
                        </div>
                    )}
                </div>

                {/* =====================================================
                    ADD / EDIT FORM
                ===================================================== */}

                {showForm && (
                    <div className="form-container">

                        <div className="form-header">
                            <h2>
                                {editMode
                                    ? "Edit Assignment"
                                    : "Add Assignment"}
                            </h2>

                            <button
                                className="close-button"
                                onClick={closeForm}
                            >
                                ×
                            </button>
                        </div>

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

                        <form onSubmit={handleSubmit}>

                            <div className="form-grid">

                                {/* Teacher */}

                                <div className="form-group">
                                    <label>
                                        Teacher
                                    </label>

                                    <select
                                        name="teacherId"
                                        value={formData.teacherId}
                                        onChange={handleChange}
                                    >
                                        <option value="">
                                            Select Teacher
                                        </option>

                                        {teachers.map((teacher) => (
                                            <option
                                                key={teacher.teacherId}
                                                value={
                                                    teacher.teacherId
                                                }
                                            >
                                                {teacher.teacherId}
                                                {teacher.name
                                                    ? ` - ${teacher.name}`
                                                    : ""}
                                            </option>
                                        ))}
                                    </select>

                                    {errors.teacherId && (
                                        <span className="field-error">
                                            {errors.teacherId}
                                        </span>
                                    )}
                                </div>

                                {/* Subject */}

                                <div className="form-group">
                                    <label>
                                        Subject
                                    </label>

                                    <select
                                        name="subjectId"
                                        value={formData.subjectId}
                                        onChange={handleChange}
                                    >
                                        <option value="">
                                            Select Subject
                                        </option>

                                        {subjects.map((subject) => (
                                            <option
                                                key={subject.subjectId}
                                                value={
                                                    subject.subjectId
                                                }
                                            >
                                                {subject.subjectId}
                                                {subject.subjectName
                                                    ? ` - ${subject.subjectName}`
                                                    : ""}
                                            </option>
                                        ))}
                                    </select>

                                    {errors.subjectId && (
                                        <span className="field-error">
                                            {errors.subjectId}
                                        </span>
                                    )}
                                </div>

                                {/* Class */}

                                <div className="form-group">
                                    <label>
                                        Class
                                    </label>

                                    <select
                                        name="classId"
                                        value={formData.classId}
                                        onChange={handleChange}
                                    >
                                        <option value="">
                                            Select Class
                                        </option>

                                        {classes.map((classItem) => (
                                            <option
                                                key={classItem.classId}
                                                value={
                                                    classItem.classId
                                                }
                                            >
                                                {classItem.classId}
                                                {classItem.className
                                                    ? ` - ${classItem.className}`
                                                    : ""}
                                            </option>
                                        ))}
                                    </select>

                                    {errors.classId && (
                                        <span className="field-error">
                                            {errors.classId}
                                        </span>
                                    )}
                                </div>

                                {/* Academic Year */}

                                <div className="form-group">
                                    <label>
                                        Academic Year
                                    </label>

                                    <input
                                        type="text"
                                        name="academicYear"
                                        value={
                                            formData.academicYear
                                        }
                                        onChange={handleChange}
                                        placeholder="2026-27"
                                    />

                                    {errors.academicYear && (
                                        <span className="field-error">
                                            {errors.academicYear}
                                        </span>
                                    )}
                                </div>

                                {/* Status */}

                                <div className="form-group">
                                    <label>
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
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
                                    onClick={closeForm}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-button"
                                >
                                    {editMode
                                        ? "Update Assignment"
                                        : "Save Assignment"}
                                </button>

                            </div>

                        </form>
                    </div>
                )}

                {/* =====================================================
                    DELETE CONFIRMATION
                ===================================================== */}

                {showDeleteModal && (
                    <div className="modal-overlay">

                        <div className="delete-modal">

                            <h2>
                                Delete Assignment?
                            </h2>

                            <p className="delete-warning">
                                Are you sure you want to delete
                                Assignment{" "}
                                <strong>
                                    {recordToDelete?.assignmentId}
                                </strong>
                                ?
                            </p>

                            <div className="delete-modal-actions">

                                <button
                                    className="cancel-button"
                                    onClick={closeDeleteModal}
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

export default Assignments;
