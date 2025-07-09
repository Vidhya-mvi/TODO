import { Link } from "react-router-dom";
import "../index.css";

function LandingPage() {
  return (
    <div className="landing-container">
      <div className="card">
        <h1>Welcome to TODO</h1>
        <p>Please login or register to get started</p>
        <div className="button-group">
          <Link to="/login">
            <button className="btn">Login</button>
          </Link>
          <Link to="/register">
            <button className="btn">Register</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
