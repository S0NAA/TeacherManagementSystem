import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

function Departments() {
    const [departments, setDepartments] = useState([]);
    const [search, setSearch] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [departmentToDelete, setDepartmentToDelete] = useState(null);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const [formData, setFormData] = useState({
        departmentId: "",
        departmentCode: "",
        departmentName: "",
        hodName: "",
        status: "Active"
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadDepartments();
    }, []);

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
            departmentId: "",
            departmentCode: "",
            departmentName: "",
            hodName: "",
            status: "Active"
        });

        setErrors({});
    };

    const handleAddDepartment = () => {
        setEditMode(false);
        resetForm();
        setShowForm(true);
    };

    const handleEditDepartment = (department) => {
        setEditMode(true);

        setFormData({
            departmentId: department.departmentId,
            departmentCode: department.departmentCode,
            departmentName: department.departmentName,
            hodName: department.hodName,
            status: department.status
        });

        setErrors({});
        setShowForm(true);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.departmentId) {
            newErrors.departmentId =
                "Department ID is required.";
        } else if (Number(formData.departmentId) <= 0) {
            newErrors.departmentId =
                "Enter a valid department ID.";
        }

        if (!formData.departmentCode.trim()) {
            newErrors.departmentCode =
                "Department code is required.";
        } else if (
            !/^[A-Za-z0-9]+$/.test(
                formData.departmentCode.trim()
            )
        ) {
            newErrors.departmentCode =
                "Code should contain only letters and numbers.";
        }

        if (!formData.departmentName.trim()) {
            newErrors.departmentName =
                "Department name is required.";
        }

        if (!formData.hodName.trim()) {
            newErrors.hodName =
                "HOD name is required.";
        } else if (
            !/^[A-Za-z\s.]+$/.test(
                formData.hodName.trim()
            )
        ) {
            newErrors.hodName =
                "HOD name should contain only letters and spaces.";
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
            const departmentData = {
                departmentId: Number(formData.departmentId),
                departmentCode:
                    formData.departmentCode
                        .trim()
                        .toUpperCase(),
                departmentName:
                    formData.departmentName.trim(),
                hodName: formData.hodName.trim(),
                status: formData.status
            };

            if (editMode) {
                await api.put(
                    `/departments/${formData.departmentId}`,
                    departmentData
                );

                showMessage(
                    "Department updated successfully.",
                    "success"
                );
            } else {
                const duplicateDepartment =
                    departments.some(
                        (department) =>
                            String(
                                department.departmentId
                            ) ===
                                String(
                                    formData.departmentId
                                ) ||
                            department.departmentCode
                                ?.toLowerCase() ===
                                formData.departmentCode
                                    .trim()
                                    .toLowerCase()
                    );

                if (duplicateDepartment) {
                    setErrors({
                        departmentCode:
                            "Department ID or code already exists."
                    });

                    return;
                }

                await api.post(
                    "/departments",
                    departmentData
                );

                showMessage(
                    "Department added successfully.",
                    "success"
                );
            }

            await loadDepartments();

            setShowForm(false);
            setEditMode(false);
            resetForm();
        } catch (error) {
            console.error(
                "Department Save Error:",
                error
            );

            showMessage(
                editMode
                    ? "Failed to update department."
                    : "Failed to add department.",
                "error"
            );
        }
    };

    const openDeleteModal = (department) => {
        setDepartmentToDelete(department);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setDepartmentToDelete(null);
    };

    const handleDeleteDepartment = async () => {
        if (!departmentToDelete) {
            return;
        }

        try {
            await api.delete(
                `/departments/${departmentToDelete.departmentId}`
            );

            await loadDepartments();

            showMessage(
                "Department deleted successfully.",
                "success"
            );

            closeDeleteModal();
        } catch (error) {
            console.error(
                "Delete Department Error:",
                error
            );

            showMessage(
                "Failed to delete department.",
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

    const filteredDepartments =
        departments.filter((department) => {
            const searchText =
                search.toLowerCase();

            return (
                String(
                    department.departmentId
                )
                    .toLowerCase()
                    .includes(searchText) ||
                department.departmentCode
                    ?.toLowerCase()
                    .includes(searchText) ||
                department.departmentName
                    ?.toLowerCase()
                    .includes(searchText) ||
                department.hodName
                    ?.toLowerCase()
                    .includes(searchText) ||
                department.status
                    ?.toLowerCase()
                    .includes(searchText)
            );
        });

    return (
        <div>
            <Sidebar />

            <main>
                <div className="page-header">
                    <div>
                        <h1>Departments</h1>

                        <p>
                            Showing{" "}
                            {
                                filteredDepartments.length
                            }{" "}
                            of{" "}
                            {departments.length}{" "}
                            departments
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
                                placeholder="Search departments..."
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
                                handleAddDepartment
                            }
                        >
                            + Add Department
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
                                        ? "Edit Department"
                                        : "Add Department"}
                                </h2>

                                <p>
                                    {editMode
                                        ? "Update department information"
                                        : "Enter department information"}
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
                                        Department ID
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="number"
                                        name="departmentId"
                                        placeholder="e.g. 1"
                                        min="1"
                                        value={
                                            formData.departmentId
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            editMode
                                        }
                                    />

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
                                        Department Code
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="departmentCode"
                                        placeholder="e.g. CSE"
                                        value={
                                            formData.departmentCode
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    {errors.departmentCode && (
                                        <small className="field-error">
                                            {
                                                errors.departmentCode
                                            }
                                        </small>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>
                                        Department Name
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="departmentName"
                                        placeholder="e.g. Computer Science and Engineering"
                                        value={
                                            formData.departmentName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    {errors.departmentName && (
                                        <small className="field-error">
                                            {
                                                errors.departmentName
                                            }
                                        </small>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>
                                        HOD Name
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="hodName"
                                        placeholder="Enter HOD name"
                                        value={
                                            formData.hodName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    {errors.hodName && (
                                        <small className="field-error">
                                            {
                                                errors.hodName
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
                                        ? "Update Department"
                                        : "Save Department"}
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
                                    Department ID
                                </th>
                                <th>Code</th>
                                <th>
                                    Department Name
                                </th>
                                <th>HOD</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredDepartments.map(
                                (department) => (
                                    <tr
                                        key={
                                            department.departmentId
                                        }
                                    >
                                        <td>
                                            <strong>
                                                {
                                                    department.departmentId
                                                }
                                            </strong>
                                        </td>

                                        <td>
                                            <strong>
                                                {
                                                    department.departmentCode
                                                }
                                            </strong>
                                        </td>

                                        <td>
                                            {
                                                department.departmentName
                                            }
                                        </td>

                                        <td>
                                            {
                                                department.hodName
                                            }
                                        </td>

                                        <td>
                                            <span
                                                className={`status-badge ${
    department.status ===
    "Active"
        ? "status-active"
        : "status-inactive"
}`}
                                            >
                                                {
                                                    department.status
                                                }
                                            </span>
                                        </td>

                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="edit-button"
                                                    onClick={() =>
                                                        handleEditDepartment(
                                                            department
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="delete-button"
                                                    onClick={() =>
                                                        openDeleteModal(
                                                            department
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

                    {filteredDepartments.length ===
                        0 && (
                        <div className="no-results">
                            <h3>
                                No departments
                                found
                            </h3>

                            <p>
                                Try changing your
                                search or add a new
                                department.
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {showDeleteModal &&
                departmentToDelete && (
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
                                Delete Department?
                            </h2>

                            <p>
                                Are you sure you
                                want to delete
                                <strong>
                                    {" "}
                                    {
                                        departmentToDelete.departmentName
                                    }
                                </strong>{" "}
                                (
                                {
                                    departmentToDelete.departmentCode
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
                                        handleDeleteDepartment
                                    }
                                >
                                    Delete Department
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}

export default Departments;
