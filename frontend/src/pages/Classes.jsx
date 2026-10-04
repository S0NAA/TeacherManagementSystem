import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

function Classes() {
    const [classes, setClasses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [search, setSearch] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [classToDelete, setClassToDelete] = useState(null);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const [formData, setFormData] = useState({
        classId: "",
        className: "",
        departmentId: "",
        semester: "",
        section: "",
        status: "Active"
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadClasses();
        loadDepartments();
    }, []);

    const loadClasses = async () => {
        try {
            const response = await api.get("/classes");
            setClasses(response.data);
        } catch (error) {
            console.error("Classes API Error:", error);
            showMessage("Unable to load classes.", "error");
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
            classId: "",
            className: "",
            departmentId: "",
            semester: "",
            section: "",
            status: "Active"
        });

        setErrors({});
    };

    const handleAddClass = () => {
        setEditMode(false);
        resetForm();
        setShowForm(true);
    };

    const handleEditClass = (item) => {
        setEditMode(true);

        setFormData({
            classId: item.classId,
            className: item.className,
            departmentId: String(item.departmentId),
            semester: String(item.semester),
            section: item.section,
            status: item.status
        });

        setErrors({});
        setShowForm(true);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.classId) {
            newErrors.classId =
                "Class ID is required.";
        }

        if (!formData.className.trim()) {
            newErrors.className =
                "Class name is required.";
        }

        if (!formData.departmentId) {
            newErrors.departmentId =
                "Please select a department.";
        }

        if (!formData.semester) {
            newErrors.semester =
                "Please select a semester.";
        }

        if (!formData.section.trim()) {
            newErrors.section =
                "Section is required.";
        } else if (
            !/^[A-Za-z0-9]+$/.test(
                formData.section.trim()
            )
        ) {
            newErrors.section =
                "Section should contain only letters and numbers.";
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
            const classData = {
                classId: Number(formData.classId),
                className: formData.className.trim(),
                departmentId: Number(formData.departmentId),
                semester: Number(formData.semester),
                section: formData.section.trim().toUpperCase(),
                status: formData.status
            };

            if (editMode) {
                await api.put(
                    `/classes/${formData.classId}`,
                    classData
                );

                showMessage(
                    "Class updated successfully.",
                    "success"
                );
            } else {
                const duplicateClass = classes.some(
                    (item) =>
                        String(item.classId) ===
                            String(formData.classId) ||
                        (
                            String(item.departmentId) ===
                                String(formData.departmentId) &&
                            String(item.semester) ===
                                String(formData.semester) &&
                            item.section?.toLowerCase() ===
                                formData.section
                                    .trim()
                                    .toLowerCase()
                        )
                );

                if (duplicateClass) {
                    setErrors({
                        classId:
                            "This class already exists."
                    });

                    return;
                }

                await api.post(
                    "/classes",
                    classData
                );

                showMessage(
                    "Class added successfully.",
                    "success"
                );
            }

            await loadClasses();

            setShowForm(false);
            setEditMode(false);
            resetForm();
        } catch (error) {
            console.error(
                "Class Save Error:",
                error
            );

            showMessage(
                editMode
                    ? "Failed to update class."
                    : "Failed to add class.",
                "error"
            );
        }
    };

    const openDeleteModal = (item) => {
        setClassToDelete(item);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setClassToDelete(null);
    };

    const handleDeleteClass = async () => {
        if (!classToDelete) {
            return;
        }

        try {
            await api.delete(
                `/classes/${classToDelete.classId}`
            );

            await loadClasses();

            showMessage(
                "Class deleted successfully.",
                "success"
            );

            closeDeleteModal();
        } catch (error) {
            console.error(
                "Delete Class Error:",
                error
            );

            showMessage(
                "Failed to delete class.",
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

    const filteredClasses = classes.filter(
        (item) => {
            const searchText =
                search.toLowerCase();

            const departmentName =
                getDepartmentName(
                    item.departmentId
                ).toString();

            return (
                String(item.classId)
                    .toLowerCase()
                    .includes(searchText) ||
                item.className
                    ?.toLowerCase()
                    .includes(searchText) ||
                departmentName
                    .toLowerCase()
                    .includes(searchText) ||
                String(item.semester)
                    .toLowerCase()
                    .includes(searchText) ||
                item.section
                    ?.toLowerCase()
                    .includes(searchText) ||
                item.status
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
                        <h1>Classes</h1>

                        <p>
                            Showing{" "}
                            {filteredClasses.length}{" "}
                            of {classes.length}{" "}
                            classes
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
                                placeholder="Search classes..."
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
                                handleAddClass
                            }
                        >
                            + Add Class
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
                                        ? "Edit Class"
                                        : "Add Class"}
                                </h2>

                                <p>
                                    {editMode
                                        ? "Update class information"
                                        : "Enter class information"}
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
                                        Class ID
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="number"
                                        name="classId"
                                        placeholder="e.g. 101"
                                        min="1"
                                        value={
                                            formData.classId
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            editMode
                                        }
                                    />

                                    {errors.classId && (
                                        <small className="field-error">
                                            {
                                                errors.classId
                                            }
                                        </small>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>
                                        Class Name
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="className"
                                        placeholder="e.g. CSE-A"
                                        value={
                                            formData.className
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    {errors.className && (
                                        <small className="field-error">
                                            {
                                                errors.className
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
                                        Section
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="section"
                                        placeholder="e.g. A"
                                        maxLength="5"
                                        value={
                                            formData.section
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    {errors.section && (
                                        <small className="field-error">
                                            {
                                                errors.section
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
                                        ? "Update Class"
                                        : "Save Class"}
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
                                    Class ID
                                </th>
                                <th>
                                    Class Name
                                </th>
                                <th>
                                    Department
                                </th>
                                <th>
                                    Semester
                                </th>
                                <th>
                                    Section
                                </th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredClasses.map(
                                (item) => (
                                    <tr
                                        key={
                                            item.classId
                                        }
                                    >
                                        <td>
                                            <strong>
                                                {
                                                    item.classId
                                                }
                                            </strong>
                                        </td>

                                        <td>
                                            {
                                                item.className
                                            }
                                        </td>

                                        <td>
                                            {getDepartmentName(
                                                item.departmentId
                                            )}
                                        </td>

                                        <td>
                                            {
                                                item.semester
                                            }
                                        </td>

                                        <td>
                                            {
                                                item.section
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
                                                        handleEditClass(
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

                    {filteredClasses.length ===
                        0 && (
                        <div className="no-results">
                            <h3>
                                No classes found
                            </h3>

                            <p>
                                Try changing your
                                search or add a new
                                class.
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {showDeleteModal &&
                classToDelete && (
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
                                Delete Class?
                            </h2>

                            <p>
                                Are you sure you
                                want to delete
                                <strong>
                                    {" "}
                                    {
                                        classToDelete.className
                                    }
                                </strong>{" "}
                                (
                                {
                                    classToDelete.section
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
                                        handleDeleteClass
                                    }
                                >
                                    Delete Class
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}

export default Classes;