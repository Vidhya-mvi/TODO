import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Privatehttps from "../api/privatehttps";
import "../index.css";

function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token =
    (searchParams.get("token") || localStorage.getItem("inviteToken") || "").trim();
  const [status, setStatus] = useState("loading");
  const [todoTitle, setTodoTitle] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

  const isInviteToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.todoId !== undefined && decoded.email;
    } catch (err) {
      console.log("Invalid token", err);
      return false;
    }
  };

  useEffect(() => {
    const checkAuthAndValidate = async () => {
      if (!token || !isInviteToken(token)) {
        setStatus("invalid");
        return;
      }

      const inviteEmail = jwtDecode(token).email;

      let user = null;
      try {
        const res = await Privatehttps.get("/auth/me");
        user = res.data;
        setAuthChecked(true);
      } catch (err) {
        localStorage.setItem("inviteToken", token);
        console.log("Not logged in:", err);
        navigate("/login");
        return;
      }

      if (!user?.email || user.email !== inviteEmail) {
        console.warn("Logged-in user email does not match invite token.");
        setStatus("invalid");
        return;
      }

      try {
        const res = await Privatehttps.get(`/invite?token=${token}`);
        setTodoTitle(res.data.todo || "a todo");
        setStatus("confirm");
      } catch (err) {
        console.error("Invite validation failed", err);
        if (err.response?.status === 400 || err.response?.status === 404) {
          setStatus("invalid");
        } else {
          setStatus("error");
        }
      }
    };

    checkAuthAndValidate();
  }, [token, navigate]);

  if (!authChecked && status === "loading") {
    return <p className="invite-status-message">Checking authentication...</p>;
  }

  const handleAccept = async () => {
    try {
      setStatus("loading");
      await Privatehttps.post(`/invite/accept?token=${token}`);
      localStorage.removeItem("inviteToken");
      setStatus("accepted");
      setTimeout(() => navigate("/home"), 2000);
    } catch (err) {
      console.error("Accept failed", err);
      setStatus("error");
    }
  };

  const handleReject = async () => {
    try {
      setStatus("loading");
      await Privatehttps.post(`/invite/reject?token=${token}`);
      localStorage.removeItem("inviteToken");
      setStatus("rejected");
      setTimeout(() => navigate("/home"), 2000);
    } catch (err) {
      console.error("Reject failed", err);
      setStatus("error");
    }
  };

  return (
    <div className="accept-invite-page">
      {status === "loading" && (
        <p className="invite-status-message">Checking your invitation...</p>
      )}

      {status === "confirm" && (
        <>
          <p>
            You’ve been invited to collaborate on <strong>{todoTitle}</strong>.
          </p>
          <div className="invite-actions">
            <button onClick={handleAccept} className="invite-btn accept">
              Accept
            </button>
            <button onClick={handleReject} className="invite-btn reject">
              Reject
            </button>
          </div>
        </>
      )}

      {status === "accepted" && (
        <p className="invite-status-message success">
          Invite accepted! Redirecting...
        </p>
      )}
      {status === "rejected" && (
        <p className="invite-status-message warning">
           Invite rejected. Redirecting...
        </p>
      )}
      {status === "invalid" && (
        <p className="invite-status-message warning">
           This invitation is invalid, expired, used, or not meant for this user.
        </p>
      )}
      {status === "error" && (
        <p className="invite-status-message error">
           Something went wrong. Please try again later.
        </p>
      )}
    </div>
  );
}

export default AcceptInvite;
