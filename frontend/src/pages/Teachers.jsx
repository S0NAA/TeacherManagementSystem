import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

function Teachers() {
    const [teachers, setTeachers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [search, setSearch] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [teacherToDelete, setTeacherToDelete] = useState(null);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const [formData, setFormData] = useState({
        teacherId: "",
        teacherName: "",
        email: "",
        phone: "",
        departmentId: "",
        status: "Active"
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadTeachers();
        loadDepartments();
    }, []);

    const loadTeachers = async () => {
        try {
            const response = await api.get("/teachers");
            setTeachers(response.data);
        } catch (error) {
            console.error("Teachers API Error:", error);
            showMessage("Unable to load teachers.", "error");
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
                String(dept.departmentId) === String(departmentId)
        );

        return department
            ? department.departmentName
            : departmentId;
    };

    const filteredTeachers = teachers.filter((teacher) => {
        const searchText = search.toLowerCase();

        const departmentName = getDepartmentName(
            teacher.departmentId
        );

        return (
            teacher.teacherId?.toLowerCase().includes(searchText) ||
            teacher.name?.toLowerCase().includes(searchText) ||
            teacher.email?.toLowerCase().includes(searchText) ||
            teacher.phone?.toLowerCase().includes(searchText) ||
            departmentName
                ?.toString()
                .toLowerCase()
                .includes(searchText)
        );
    });

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
            teacherId: "",
            teacherName: "",
            email: "",
            phone: "",
            departmentId: "",
            status: "Active"
        });

        setErrors({});
    };

    const handleAddTeacher = () => {
        setEditMode(false);
        resetForm();
        setShowForm(true);
    };

    const handleEditTeacher = (teacher) => {
        setEditMode(true);

        setFormData({
            teacherId: teacher.teacherId,
            teacherName: teacher.name,
            email: teacher.email,
            phone: teacher.phone,
            departmentId: String(teacher.departmentId),
            status: teacher.status
        });

        setErrors({});
        setShowForm(true);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.teacherId.trim()) {
            newErrors.teacherId = "Teacher ID is required.";
        }

        if (!formData.teacherName.trim()) {
            newErrors.teacherName = "Teacher name is required.";
        } else if (
            !/^[A-Za-z\s.]+$/.test(
                formData.teacherName.trim()
            )
        ) {
            newErrors.teacherName =
                "Name should contain only letters and spaces.";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required.";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                formData.email.trim()
            )
        ) {
            newErrors.email =
                "Enter a valid email address.";
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required.";
        } else if (
            !/^\d{10}$/.test(formData.phone.trim())
        ) {
            newErrors.phone =
                "Phone number must contain exactly 10 digits.";
        }

        if (!formData.departmentId) {
            newErrors.departmentId =
                "Please select a department.";
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
            const teacherData = {
                teacherId: formData.teacherId,
                name: formData.teacherName.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                departmentId: Number(formData.departmentId),
                status: formData.status
            };

            if (editMode) {
                await api.put(
                    `/teachers/${formData.teacherId}`,
                    teacherData
                );

                showMessage(
                    "Teacher updated successfully.",
                    "success"
                );
            } else {
                const duplicateTeacher = teachers.some(
                    (teacher) =>
                        teacher.teacherId?.toLowerCase() ===
                        formData.teacherId
                            .trim()
                            .toLowerCase()
                );

                if (duplicateTeacher) {
                    setErrors({
                        teacherId:
                            "This Teacher ID already exists."
                    });
                    return;
                }

                await api.post(
                    "/teachers",
                    teacherData
                );

                showMessage(
                    "Teacher added successfully.",
                    "success"
                );
            }

            await loadTeachers();

            setShowForm(false);
            setEditMode(false);
            resetForm();
        } catch (error) {
            console.error(
                "Teacher Save Error:",
                error
            );

            if (error.response?.status === 409) {
                showMessage(
                    "Teacher ID already exists.",
                    "error"
                );
            } else {
                showMessage(
                    editMode
                        ? "Failed to update teacher."
                        : "Failed to add teacher.",
                    "error"
                );
            }
        }
    };

    const openDeleteModal = (teacher) => {
        setTeacherToDelete(teacher);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setTeacherToDelete(null);
    };

    const handleDeleteTeacher = async () => {
        if (!teacherToDelete) {
            return;
        }

        try {
            await api.delete(
                `/teachers/${teacherToDelete.teacherId}`
            );

            await loadTeachers();

            showMessage(
                "Teacher deleted successfully.",
                "success"
            );

            closeDeleteModal();
        } catch (error) {
            console.error(
                "Delete Teacher Error:",
                error
            );

            showMessage(
                "Failed to delete teacher.",
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

    return (
        <div>
            <Sidebar />

            <main>
                <div className="page-header">
                    <div>
                        <h1>Teachers</h1>

                        <p>
                            Showing{" "}
                            {filteredTeachers.length} of{" "}
                            {teachers.length} teachers
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
                                placeholder="Search teachers..."
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
                                handleAddTeacher
                            }
                        >
                            + Add Teacher
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
                                        ? "Edit Teacher"
                                        : "Add Teacher"}
                                </h2>

                                <p>
                                    {editMode
                                        ? "Update teacher information"
                                        : "Enter teacher information"}
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
                                        Teacher ID
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="teacherId"
                                        placeholder="e.g. T101"
                                        value={
                                            formData.teacherId
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            editMode
                                        }
                                    />

                                    {errors.teacherId && (
                                        <small className="field-error">
                                            {
                                                errors.teacherId
                                            }
                                        </small>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>
                                        Teacher Name
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="teacherName"
                                        placeholder="Enter teacher name"
                                        value={
                                            formData.teacherName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    {errors.teacherName && (
                                        <small className="field-error">
                                            {
                                                errors.teacherName
                                            }
                                        </small>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>
                                        Email
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="teacher@example.com"
                                        value={
                                            formData.email
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    {errors.email && (
                                        <small className="field-error">
                                            {
                                                errors.email
                                            }
                                        </small>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>
                                        Phone
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="phone"
                                        placeholder="10-digit phone number"
                                        maxLength="10"
                                        value={
                                            formData.phone
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    {errors.phone && (
                                        <small className="field-error">
                                            {
                                                errors.phone
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
                                            (department) => (
                                                <option
                                                    key={department.departmentId}
                                                    value={department.departmentId}
                                                >
                                                    {department.departmentCode} - {department.departmentName}
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
                                        ? "Update Teacher"
                                        : "Save Teacher"}
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
                                    Teacher ID
                                </th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>
                                    Department
                                </th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredTeachers.map(
                                (teacher) => (
                                    <tr
                                        key={
                                            teacher.teacherId
                                        }
                                    >
                                        <td>
                                            <strong>
                                                {
                                                    teacher.teacherId
                                                }
                                            </strong>
                                        </td>

                                        <td>
                                            {
                                                teacher.name
                                            }
                                        </td>

                                        <td>
                                            {
                                                teacher.email
                                            }
                                        </td>

                                        <td>
                                            {
                                                teacher.phone
                                            }
                                        </td>

                                        <td>
                                            {getDepartmentName(
                                                teacher.departmentId
                                            )}
                                        </td>

                                        <td>
                                            <span
                                                className={`status-badge ${
    teacher.status ===
    "Active"
        ? "status-active"
        : "status-inactive"
}`}
                                            >
                                                {
                                                    teacher.status
                                                }
                                            </span>
                                        </td>

                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="edit-button"
                                                    onClick={() =>
                                                        handleEditTeacher(
                                                            teacher
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="delete-button"
                                                    onClick={() =>
                                                        openDeleteModal(
                                                            teacher
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

                    {filteredTeachers.length ===
                        0 && (
                        <div className="no-results">
                            <h3>
                                No teachers found
                            </h3>

                            <p>
                                Try changing your
                                search or add a new
                                teacher.
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {showDeleteModal &&
                teacherToDelete && (
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
                                Delete Teacher?
                            </h2>

                            <p>
                                Are you sure you
                                want to delete
                                <strong>
                                    {" "}
                                    {
                                        teacherToDelete.name
                                    }
                                </strong>{" "}
                                (
                                {
                                    teacherToDelete.teacherId
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
                                        handleDeleteTeacher
                                    }
                                >
                                    Delete Teacher
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}

export default Teachers;