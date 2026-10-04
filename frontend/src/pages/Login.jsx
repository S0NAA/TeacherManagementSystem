import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await api.get(`/users/${username}`);

            const user = response.data;

            if (
                user &&
                user.username === username &&
                user.password === password
            ) {
                localStorage.setItem("user", JSON.stringify(user));

                if (user.role === "TEACHER") {
                    navigate("/teacher-dashboard");
                } else {
                    navigate("/dashboard");
                }
            } else {
                setError("Invalid username or password");
            }
        } catch (err) {
            setError("Invalid username or password");
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">

                <div className="login-logo">
                    TM
                </div>

                <h1>Teacher Management</h1>

                <p className="login-subtitle">
                    Sign in to access your dashboard
                </p>

                {error && (
                    <div className="login-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>

                    <div className="login-form-group">
                        <label>Username</label>

                        <input
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="login-form-group">
                        <label>Password</label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                    >
                        Sign In
                    </button>

                </form>
            </div>
        </div>
    );
}

export default Login;