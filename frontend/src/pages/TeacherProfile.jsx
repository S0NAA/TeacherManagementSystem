import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import TeacherSidebar from "../components/TeacherSidebar";

function TeacherProfile() {
    const [teacher, setTeacher] = useState(null);
    const [formData, setFormData] = useState({});
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

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
            setLoading(false);
            return;
        }

        const loadTeacher = async () => {
            try {
                const response = await api.get(
                    `/teachers/${user.teacherId}`
                );

                setTeacher(response.data);
                setFormData(response.data);
            } catch (err) {
                setError("Unable to load teacher profile.");
            } finally {
                setLoading(false);
            }
        };

        loadTeacher();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEdit = () => {
        setMessage("");
        setError("");
        setIsEditing(true);
    };

    const handleCancel = () => {
        setFormData(teacher);
        setError("");
        setMessage("");
        setIsEditing(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");

        try {
            const response = await api.put(
                `/teachers/${teacher.teacherId}`,
                {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    departmentId: formData.departmentId,
                    status: formData.status
                }
            );

            setTeacher(response.data);
            setFormData(response.data);
            setIsEditing(false);
            setMessage("Profile updated successfully.");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update profile."
            );
        }
    };

    if (loading) {
        return (
            <div className="app-layout">
                <TeacherSidebar />

                <main className="main-content">
                    <div className="profile-loading">
                        Loading profile...
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="app-layout">

            <TeacherSidebar />

            <main className="main-content">

                {error && (
                    <div className="message message-error">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="message message-success">
                        {message}
                    </div>
                )}

                {teacher && (
                    <>
                        {/* Profile Header */}
                        <section className="profile-header-box">

                            <div className="profile-header-content">

                                <div className="profile-avatar">
                                    {teacher.name
                                        ? teacher.name.charAt(0).toUpperCase()
                                        : "T"}
                                </div>

                                <div className="profile-heading">
                                    <span>MY PROFILE</span>

                                    <h1>
                                        {teacher.name || "Teacher"}
                                    </h1>

                                    <p>
                                        {teacher.designation || "Teacher"}
                                        {teacher.departmentId
                                            ? ` • Department ${teacher.departmentId}`
                                            : ""}
                                    </p>
                                </div>

                            </div>

                            {!isEditing && (
                                <button
                                    className="profile-edit-button"
                                    onClick={handleEdit}
                                >
                                    Edit Profile
                                </button>
                            )}

                        </section>

                        {/* Basic Information */}
                        <section className="profile-section">

                            <div className="profile-section-header">
                                <div>
                                    <h2>Basic Information</h2>
                                    <p>
                                        Your personal and contact details.
                                    </p>
                                </div>
                            </div>

                            <div className="profile-info-grid">

                                <div className="profile-field">
                                    <span>Teacher ID</span>

                                    {isEditing ? (
                                        <input
                                            value={formData.teacherId || ""}
                                            readOnly
                                        />
                                    ) : (
                                        <strong>
                                            {teacher.teacherId || "—"}
                                        </strong>
                                    )}
                                </div>

                                <div className="profile-field">
                                    <span>Name</span>

                                    {isEditing ? (
                                        <input
                                            name="name"
                                            value={formData.name || ""}
                                            onChange={handleChange}
                                        />
                                    ) : (
                                        <strong>
                                            {teacher.name || "—"}
                                        </strong>
                                    )}
                                </div>

                                <div className="profile-field">
                                    <span>Email</span>

                                    {isEditing ? (
                                        <input
                                            name="email"
                                            value={formData.email || ""}
                                            onChange={handleChange}
                                        />
                                    ) : (
                                        <strong>
                                            {teacher.email || "—"}
                                        </strong>
                                    )}
                                </div>

                                <div className="profile-field">
                                    <span>Phone</span>

                                    {isEditing ? (
                                        <input
                                            name="phone"
                                            value={formData.phone || ""}
                                            onChange={handleChange}
                                        />
                                    ) : (
                                        <strong>
                                            {teacher.phone || "—"}
                                        </strong>
                                    )}
                                </div>

                            </div>

                        </section>

                        {/* Professional Information */}
                        <section className="profile-section">

                            <div className="profile-section-header">
                                <div>
                                    <h2>Professional Information</h2>
                                    <p>
                                        Your current employment details.
                                    </p>
                                </div>
                            </div>

                            <div className="profile-info-grid">

                                <div className="profile-field">
                                    <span>Department ID</span>

                                    {isEditing ? (
                                        <input
                                            name="departmentId"
                                            value={
                                                formData.departmentId || ""
                                            }
                                            onChange={handleChange}
                                        />
                                    ) : (
                                        <strong>
                                            {teacher.departmentId || "—"}
                                        </strong>
                                    )}
                                </div>

                                <div className="profile-field">
                                    <span>Designation</span>

                                    <strong>
                                        {teacher.designation || "—"}
                                    </strong>
                                </div>

                                <div className="profile-field">
                                    <span>Qualification</span>

                                    <strong>
                                        {teacher.qualification || "—"}
                                    </strong>
                                </div>

                                <div className="profile-field">
                                    <span>Joining Date</span>

                                    <strong>
                                        {teacher.joiningDate || "—"}
                                    </strong>
                                </div>

                                <div className="profile-field">
                                    <span>Status</span>

                                    {isEditing ? (
                                        <select
                                            name="status"
                                            value={formData.status || ""}
                                            onChange={handleChange}
                                        >
                                            <option value="Active">
                                                Active
                                            </option>

                                            <option value="Inactive">
                                                Inactive
                                            </option>
                                        </select>
                                    ) : (
                                        <strong
                                            className={
                                                teacher.status === "Active"
                                                    ? "profile-active-status"
                                                    : "profile-inactive-status"
                                            }
                                        >
                                            {teacher.status || "—"}
                                        </strong>
                                    )}
                                </div>

                            </div>

                        </section>

                        {/* Edit Actions */}
                        {isEditing && (
                            <div className="profile-actions">

                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="save-button"
                                    onClick={handleSave}
                                >
                                    Save Changes
                                </button>

                            </div>
                        )}

                    </>
                )}

            </main>
        </div>
    );
}

export default TeacherProfile;