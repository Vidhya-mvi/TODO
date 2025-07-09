import { useState } from "react";
import PublicHttps from "../api/publichtpps";
import { useNavigate, Link } from "react-router-dom";
import "../index.css";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await PublicHttps.post("auth/register", form);
      console.log("Registering successfully:", res.data);

      const inviteToken = localStorage.getItem("inviteToken");
      if (inviteToken) {
        navigate(`/login?fromInvite=true`);
        return;
      }

      navigate("/login");
    } catch (err) {
      console.log("Error Registering:", err.message);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h2>Create Account</h2>
        <p>Please enter your information to sign up</p>
        <form onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
          <button type="submit" className="register-btn">Register</button>
        </form>
        <p className="register-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
        <Link to="/" className="register-home-link">Back to Home</Link>
      </div>
    </div>
  );
}

export default Register;
