import { useState } from "react";
import PublicHttps from "../api/publichtpps";
import { useNavigate, Link } from "react-router-dom";
import "../index.css";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await PublicHttps.post("auth/login", form);
      const accessToken = res.data.token;

      // ✅ Store the token securely
      localStorage.setItem("accessToken", accessToken);

      // ✅ Redirect based on invite token
      const inviteToken = localStorage.getItem("inviteToken");
      if (inviteToken) {
        localStorage.removeItem("inviteToken");
        navigate(`/invite/accept?token=${inviteToken}`);
      } else {
        navigate("/home");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Welcome Back!</h2>
        <p>Enter your details below to sign in into your account</p>

        <div className="divider"><span>or</span></div>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
            required
          />
          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="signup-text">
          Don’t Have An Account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
