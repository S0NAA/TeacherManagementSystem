import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

function LeaveRequest() {

    const [leaveRequests, setLeaveRequests] = useState([]);
    const [teachers, setTeachers] = useState([]);

    const [search, setSearch] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const [showDeleteModal, setShowDeleteModal] =
        useState(false);

    const [leaveToDelete, setLeaveToDelete] =
        useState(null);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const [formData, setFormData] = useState({
        leaveId: "",
        teacherId: "",
        leaveType: "",
        fromDate: "",
        toDate: "",
        reason: "",
        status: "Pending",
        appliedOn: ""
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadLeaveRequests();
        loadTeachers();
    }, []);

    const loadLeaveRequests = async () => {
        try {
            const response =
                await api.get("/leave");

            setLeaveRequests(response.data);

        } catch (error) {
            console.error(
                "Leave API Error:",
                error
            );

            showMessage(
                "Unable to load leave requests.",
                "error"
            );
        }
    };

    const loadTeachers = async () => {
        try {
            const response =
                await api.get("/teachers");

            setTeachers(response.data);

        } catch (error) {
            console.error(
                "Teachers API Error:",
                error
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
            leaveId: "",
            teacherId: "",
            leaveType: "",
            fromDate: "",
            toDate: "",
            reason: "",
            status: "Pending",
            appliedOn: ""
        });

        setErrors({});
    };

    const handleAddLeave = () => {

        setEditMode(false);

        resetForm();

        setShowForm(true);
    };

    const handleEditLeave = (item) => {

        setEditMode(true);

        setFormData({
            leaveId: item.leaveId,
            teacherId: item.teacherId,
            leaveType: item.leaveType || "",
            fromDate: item.fromDate || "",
            toDate: item.toDate || "",
            reason: item.reason || "",
            status: item.status || "Pending",
            appliedOn: item.appliedOn || ""
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

        if (!formData.leaveType) {

            newErrors.leaveType =
                "Please select a leave type.";
        }

        if (!formData.fromDate) {

            newErrors.fromDate =
                "From date is required.";
        }

        if (!formData.toDate) {

            newErrors.toDate =
                "To date is required.";
        }

        if (
            formData.fromDate &&
            formData.toDate &&
            formData.toDate < formData.fromDate
        ) {

            newErrors.toDate =
                "To date cannot be before from date.";
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

            const leaveData = {
                teacherId:
                    formData.teacherId,

                leaveType:
                    formData.leaveType,

                fromDate:
                    formData.fromDate,

                toDate:
                    formData.toDate,

                reason:
                    formData.reason.trim(),

                status:
                    formData.status
            };

            if (editMode) {

                await api.put(
                    `/leave/${formData.leaveId}`,
                    leaveData
                );

                showMessage(
                    "Leave request updated successfully.",
                    "success"
                );

            } else {

                await api.post(
                    "/leave",
                    leaveData
                );

                showMessage(
                    "Leave request added successfully.",
                    "success"
                );
            }

            await loadLeaveRequests();

            setShowForm(false);
            setEditMode(false);

            resetForm();

        } catch (error) {

            console.error(
                "Leave Save Error:",
                error
            );

            const backendMessage =
                typeof error.response?.data ===
                "string"
                    ? error.response.data
                    : editMode
                        ? "Failed to update leave request."
                        : "Failed to add leave request.";

            showMessage(
                backendMessage,
                "error"
            );
        }
    };

    const openDeleteModal = (item) => {

        setLeaveToDelete(item);

        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {

        setShowDeleteModal(false);

        setLeaveToDelete(null);
    };

    const handleDeleteLeave = async () => {

        if (!leaveToDelete) {
            return;
        }

        try {

            await api.delete(
                `/leave/${leaveToDelete.leaveId}`
            );

            await loadLeaveRequests();

            showMessage(
                "Leave request deleted successfully.",
                "success"
            );

            closeDeleteModal();

        } catch (error) {

            console.error(
                "Delete Leave Error:",
                error
            );

            showMessage(
                "Failed to delete leave request.",
                "error"
            );

            closeDeleteModal();
        }
    };

    const getStatusClass = (status) => {

        if (status === "Approved") {
            return "status-active";
        }

        if (status === "Rejected") {
            return "status-inactive";
        }

        return "status-late";
    };

    const filteredLeaveRequests =
        leaveRequests.filter((item) => {

            const searchText =
                search.toLowerCase();

            return (
                String(item.leaveId)
                    .toLowerCase()
                    .includes(searchText) ||

                item.teacherId
                    ?.toLowerCase()
                    .includes(searchText) ||

                item.leaveType
                    ?.toLowerCase()
                    .includes(searchText) ||

                item.fromDate
                    ?.toLowerCase()
                    .includes(searchText) ||

                item.toDate
                    ?.toLowerCase()
                    .includes(searchText) ||

                item.reason
                    ?.toLowerCase()
                    .includes(searchText) ||

                item.status
                    ?.toLowerCase()
                    .includes(searchText)
            );
        });

    return (
        <div>

            <Sidebar />

            <main>

                {/* PAGE HEADER */}

                <div className="page-header">

                    <div>

                        <h1>Leave Management</h1>

                        <p>
                            Showing{" "}
                            {filteredLeaveRequests.length}{" "}
                            of{" "}
                            {leaveRequests.length}{" "}
                            leave requests
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
                                placeholder="Search leave requests..."
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
                                handleAddLeave
                            }
                        >
                            + Add Leave
                        </button>

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
                                        ? "Edit Leave"
                                        : "Add Leave"}
                                </h2>

                                <p>
                                    {editMode
                                        ? "Update leave information"
                                        : "Enter leave information"}
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


                                {/* LEAVE TYPE */}

                                <div className="form-group">

                                    <label>
                                        Leave Type
                                        <span>*</span>
                                    </label>

                                    <select
                                        name="leaveType"
                                        value={
                                            formData.leaveType
                                        }
                                        onChange={
                                            handleChange
                                        }
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

                                    {errors.leaveType && (

                                        <small className="field-error">
                                            {
                                                errors.leaveType
                                            }
                                        </small>

                                    )}

                                </div>


                                {/* FROM DATE */}

                                <div className="form-group">

                                    <label>
                                        From Date
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="date"
                                        name="fromDate"
                                        value={
                                            formData.fromDate
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    {errors.fromDate && (

                                        <small className="field-error">
                                            {
                                                errors.fromDate
                                            }
                                        </small>

                                    )}

                                </div>


                                {/* TO DATE */}

                                <div className="form-group">

                                    <label>
                                        To Date
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="date"
                                        name="toDate"
                                        value={
                                            formData.toDate
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    {errors.toDate && (

                                        <small className="field-error">
                                            {
                                                errors.toDate
                                            }
                                        </small>

                                    )}

                                </div>


                                {/* STATUS */}

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

                                        <option value="Pending">
                                            Pending
                                        </option>

                                        <option value="Approved">
                                            Approved
                                        </option>

                                        <option value="Rejected">
                                            Rejected
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


                                {/* REASON */}

                                <div className="form-group">

                                    <label>
                                        Reason
                                    </label>

                                    <input
                                        type="text"
                                        name="reason"
                                        placeholder="Optional"
                                        maxLength="255"
                                        value={
                                            formData.reason
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>

                            </div>


                            {/* FORM ACTIONS */}

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
                                        ? "Update Leave"
                                        : "Save Leave"}
                                </button>

                            </div>

                        </form>

                    </div>
                )}


                {/* TABLE */}

                <div className="table-container">

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Leave ID
                                </th>

                                <th>
                                    Teacher ID
                                </th>

                                <th>
                                    Leave Type
                                </th>

                                <th>
                                    From Date
                                </th>

                                <th>
                                    To Date
                                </th>

                                <th>
                                    Reason
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Applied On
                                </th>

                                <th>
                                    Actions
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {filteredLeaveRequests.map(
                                (item) => (

                                    <tr
                                        key={
                                            item.leaveId
                                        }
                                    >

                                        <td>
                                            <strong>
                                                {
                                                    item.leaveId
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
                                                item.leaveType
                                            }
                                        </td>

                                        <td>
                                            {
                                                item.fromDate
                                            }
                                        </td>

                                        <td>
                                            {
                                                item.toDate
                                            }
                                        </td>

                                        <td>
                                            {
                                                item.reason ||
                                                "—"
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
                                                item.appliedOn
                                            }
                                        </td>

                                        <td>

                                            <div className="action-buttons">

                                                <button
                                                    className="edit-button"
                                                    onClick={() =>
                                                        handleEditLeave(
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


                    {filteredLeaveRequests.length ===
                        0 && (

                        <div className="no-results">

                            <h3>
                                No leave requests found
                            </h3>

                            <p>
                                Try changing your
                                search or add a new
                                leave request.
                            </p>

                        </div>

                    )}

                </div>

            </main>


            {/* DELETE MODAL */}

            {showDeleteModal &&
                leaveToDelete && (

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
                                Delete Leave?
                            </h2>

                            <p>
                                Are you sure you
                                want to delete the
                                leave request for
                                <strong>
                                    {" "}
                                    {
                                        leaveToDelete.teacherId
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
                                        handleDeleteLeave
                                    }
                                >
                                    Delete Leave
                                </button>

                            </div>

                        </div>

                    </div>

                )}

        </div>
    );
}

export default LeaveRequest;