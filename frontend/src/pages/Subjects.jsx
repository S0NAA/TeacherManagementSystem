import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

function Subjects() {
    const [subjects, setSubjects] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [search, setSearch] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState(null);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const [formData, setFormData] = useState({
        subjectId: "",
        subjectCode: "",
        subjectName: "",
        departmentId: "",
        semester: "",
        status: "Active"
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadSubjects();
        loadDepartments();
    }, []);

    const loadSubjects = async () => {
        try {
            const response = await api.get("/subjects");
            setSubjects(response.data);
        } catch (error) {
            console.error("Subjects API Error:", error);
            showMessage("Unable to load subjects.", "error");
        }
    };

    const loadDepartments = async () => {
        try {
            const response = await api.get("/departments");
            setDepartments(response.data);
        } catch (error) {
            console.error("Departments API Error:", error);
            showMessage("Unable to load departments.", "error");
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

    const getDepartmentName = (departmentId) => {
        const department = departments.find(
            (dept) =>
                String(dept.departmentId) ===
                String(departmentId)
        );

        return department
            ? `${department.departmentCode} - ${department.departmentName}`
            : departmentId;
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
            subjectId: "",
            subjectCode: "",
            subjectName: "",
            departmentId: "",
            semester: "",
            status: "Active"
        });

        setErrors({});
    };

    const handleAddSubject = () => {
        setEditMode(false);
        resetForm();
        setShowForm(true);
    };

    const handleEditSubject = (subject) => {
        setEditMode(true);

        setFormData({
            subjectId: subject.subjectId,
            subjectCode: subject.subjectCode,
            subjectName: subject.subjectName,
            departmentId: String(subject.departmentId),
            semester: String(subject.semester),
            status: subject.status
        });

        setErrors({});
        setShowForm(true);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.subjectId) {
            newErrors.subjectId =
                "Subject ID is required.";
        }

        if (!formData.subjectCode.trim()) {
            newErrors.subjectCode =
                "Subject code is required.";
        } else if (
            !/^[A-Za-z0-9]+$/.test(
                formData.subjectCode.trim()
            )
        ) {
            newErrors.subjectCode =
                "Subject code should contain only letters and numbers.";
        }

        if (!formData.subjectName.trim()) {
            newErrors.subjectName =
                "Subject name is required.";
        }

        if (!formData.departmentId) {
            newErrors.departmentId =
                "Please select a department.";
        }

        if (!formData.semester) {
            newErrors.semester =
                "Please select a semester.";
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
            const subjectData = {
                subjectId: Number(formData.subjectId),
                subjectCode:
                    formData.subjectCode
                        .trim()
                        .toUpperCase(),
                subjectName:
                    formData.subjectName.trim(),
                departmentId:
                    Number(formData.departmentId),
                semester:
                    Number(formData.semester),
                status: formData.status
            };

            if (editMode) {
                await api.put(
                    `/subjects/${formData.subjectId}`,
                    subjectData
                );

                showMessage(
                    "Subject updated successfully.",
                    "success"
                );
            } else {
                const duplicateSubject =
                    subjects.some(
                        (subject) =>
                            String(
                                subject.subjectId
                            ) ===
                                String(
                                    formData.subjectId
                                ) ||
                            subject.subjectCode
                                ?.toLowerCase() ===
                                formData.subjectCode
                                    .trim()
                                    .toLowerCase()
                    );

                if (duplicateSubject) {
                    setErrors({
                        subjectCode:
                            "Subject ID or code already exists."
                    });

                    return;
                }

                await api.post(
                    "/subjects",
                    subjectData
                );

                showMessage(
                    "Subject added successfully.",
                    "success"
                );
            }

            await loadSubjects();

            setShowForm(false);
            setEditMode(false);
            resetForm();
        } catch (error) {
            console.error(
                "Subject Save Error:",
                error
            );

            showMessage(
                editMode
                    ? "Failed to update subject."
                    : "Failed to add subject.",
                "error"
            );
        }
    };

    const openDeleteModal = (subject) => {
        setSubjectToDelete(subject);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setSubjectToDelete(null);
    };

    const handleDeleteSubject = async () => {
        if (!subjectToDelete) {
            return;
        }

        try {
            await api.delete(
                `/subjects/${subjectToDelete.subjectId}`
            );

            await loadSubjects();

            showMessage(
                "Subject deleted successfully.",
                "success"
            );

            closeDeleteModal();
        } catch (error) {
            console.error(
                "Delete Subject Error:",
                error
            );

            showMessage(
                "Failed to delete subject.",
                "error"
            );

            closeDeleteModal();
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditMode(false);
        resetForm();
    };

    const filteredSubjects = subjects.filter(
        (subject) => {
            const searchText =
                search.toLowerCase();

            const departmentName =
                getDepartmentName(
                    subject.departmentId
                ).toString();

            return (
                String(subject.subjectId)
                    .toLowerCase()
                    .includes(searchText) ||
                subject.subjectCode
                    ?.toLowerCase()
                    .includes(searchText) ||
                subject.subjectName
                    ?.toLowerCase()
                    .includes(searchText) ||
                departmentName
                    .toLowerCase()
                    .includes(searchText) ||
                String(subject.semester)
                    .toLowerCase()
                    .includes(searchText) ||
                subject.status
                    ?.toLowerCase()
                    .includes(searchText)
            );
        }
    );

    return (
        <div>
            <Sidebar />

            <main>
                <div className="page-header">
                    <div>
                        <h1>Subjects</h1>

                        <p>
                            Showing{" "}
                            {
                                filteredSubjects.length
                            }{" "}
                            of{" "}
                            {subjects.length}{" "}
                            subjects
                        </p>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            gap: "12px",
                            alignItems: "center"
                        }}
                    >
                        <div className="table-search">
                            <input
                                type="text"
                                placeholder="Search subjects..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                            />
                        </div>

                        <button
                            className="add-button"
                            onClick={
                                handleAddSubject
                            }
                        >
                            + Add Subject
                        </button>
                    </div>
                </div>

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

                {showForm && (
                    <div className="form-container">
                        <div className="form-header">
                            <div>
                                <h2>
                                    {editMode
                                        ? "Edit Subject"
                                        : "Add Subject"}
                                </h2>

                                <p>
                                    {editMode
                                        ? "Update subject information"
                                        : "Enter subject information"}
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
                                <div className="form-group">
                                    <label>
                                        Subject ID
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="number"
                                        name="subjectId"
                                        placeholder="e.g. 101"
                                        min="1"
                                        value={
                                            formData.subjectId
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            editMode
                                        }
                                    />

                                    {errors.subjectId && (
                                        <small className="field-error">
                                            {
                                                errors.subjectId
                                            }
                                        </small>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>
                                        Subject Code
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="subjectCode"
                                        placeholder="e.g. CS301"
                                        value={
                                            formData.subjectCode
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    {errors.subjectCode && (
                                        <small className="field-error">
                                            {
                                                errors.subjectCode
                                            }
                                        </small>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>
                                        Subject Name
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="subjectName"
                                        placeholder="e.g. Database Management Systems"
                                        value={
                                            formData.subjectName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    {errors.subjectName && (
                                        <small className="field-error">
                                            {
                                                errors.subjectName
                                            }
                                        </small>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>
                                        Department
                                        <span>*</span>
                                    </label>

                                    <select
                                        name="departmentId"
                                        value={
                                            formData.departmentId
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >
                                        <option value="">
                                            Select Department
                                        </option>

                                        {departments.map(
                                            (
                                                department
                                            ) => (
                                                <option
                                                    key={
                                                        department.departmentId
                                                    }
                                                    value={
                                                        department.departmentId
                                                    }
                                                >
                                                    {
                                                        department.departmentCode
                                                    }{" "}
                                                    -{" "}
                                                    {
                                                        department.departmentName
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>

                                    {errors.departmentId && (
                                        <small className="field-error">
                                            {
                                                errors.departmentId
                                            }
                                        </small>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>
                                        Semester
                                        <span>*</span>
                                    </label>

                                    <select
                                        name="semester"
                                        value={
                                            formData.semester
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >
                                        <option value="">
                                            Select Semester
                                        </option>

                                        <option value="1">
                                            Semester 1
                                        </option>

                                        <option value="2">
                                            Semester 2
                                        </option>

                                        <option value="3">
                                            Semester 3
                                        </option>

                                        <option value="4">
                                            Semester 4
                                        </option>

                                        <option value="5">
                                            Semester 5
                                        </option>

                                        <option value="6">
                                            Semester 6
                                        </option>

                                        <option value="7">
                                            Semester 7
                                        </option>

                                        <option value="8">
                                            Semester 8
                                        </option>
                                    </select>

                                    {errors.semester && (
                                        <small className="field-error">
                                            {
                                                errors.semester
                                            }
                                        </small>
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
                                        ? "Update Subject"
                                        : "Save Subject"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>
                                    Subject ID
                                </th>
                                <th>
                                    Subject Code
                                </th>
                                <th>
                                    Subject Name
                                </th>
                                <th>
                                    Department
                                </th>
                                <th>
                                    Semester
                                </th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredSubjects.map(
                                (subject) => (
                                    <tr
                                        key={
                                            subject.subjectId
                                        }
                                    >
                                        <td>
                                            <strong>
                                                {
                                                    subject.subjectId
                                                }
                                            </strong>
                                        </td>

                                        <td>
                                            <strong>
                                                {
                                                    subject.subjectCode
                                                }
                                            </strong>
                                        </td>

                                        <td>
                                            {
                                                subject.subjectName
                                            }
                                        </td>

                                        <td>
                                            {getDepartmentName(
                                                subject.departmentId
                                            )}
                                        </td>

                                        <td>
                                            {
                                                subject.semester
                                            }
                                        </td>

                                        <td>
                                            <span
                                                className={`status-badge ${
    subject.status ===
    "Active"
        ? "status-active"
        : "status-inactive"
}`}
                                            >
                                                {
                                                    subject.status
                                                }
                                            </span>
                                        </td>

                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="edit-button"
                                                    onClick={() =>
                                                        handleEditSubject(
                                                            subject
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="delete-button"
                                                    onClick={() =>
                                                        openDeleteModal(
                                                            subject
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

                    {filteredSubjects.length ===
                        0 && (
                        <div className="no-results">
                            <h3>
                                No subjects found
                            </h3>

                            <p>
                                Try changing your
                                search or add a new
                                subject.
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {showDeleteModal &&
                subjectToDelete && (
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
                                Delete Subject?
                            </h2>

                            <p>
                                Are you sure you
                                want to delete
                                <strong>
                                    {" "}
                                    {
                                        subjectToDelete.subjectName
                                    }
                                </strong>{" "}
                                (
                                {
                                    subjectToDelete.subjectCode
                                }
                                )?
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
                                        handleDeleteSubject
                                    }
                                >
                                    Delete Subject
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}

export default Subjects;
