import { useEffect, useState } from "react";
import { useParams, useNavigate,Link } from "react-router-dom";
import privateHttps from "../api/privatehttps";
import "../index.css";

function TodoDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [todo, setTodo] = useState(null);
  const [editMod, setEditMod] = useState(false);
  const [inviteEmail, setInvteEmail] = useState("");
  const [showParticipants, setShowParticipants] = useState(false);

  const fetchTodo = async () => {
    try {
      const res = await privateHttps.get(`/todo/${id}`);
      setTodo(res.data.todo);
    } catch (err) {
      console.error("Error fetching the todo:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchTodo();
  }, [id]);

  const handleDelete = async () => {
    try {
      await privateHttps.delete(`/todo/${id}`);
      navigate("/home");
    } catch (err) {
      console.error("Error deleting todo:", err.response?.data || err.message);
      alert("Failed to delete the todo.");
    }
  };

  const handleChange = (e) => {
    setTodo({ ...todo, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const { title, description, status } = todo;
      await privateHttps.put(`/todo/${id}`, { title, description, status });
      setEditMod(false);
      alert("Todo updated successfully.");
    } catch (err) {
      console.error("Error updating todo:", err.response?.data || err.message);
      alert("Failed to update the todo.");
    }
  };

  const handleInvite = async () => {
    try {
      await privateHttps.post("/invite/send", {
        email: inviteEmail,
        todoId: id,
      });
      alert("Invite sent!");
      setInvteEmail("");
    } catch (err) {
      console.error("Error sending invite:", err.response?.data || err.message);
      alert("Failed to send invite.");
    }
  };

  if (!todo) return <p className="loading">Loading...</p>;

  return (
    <div className="todo-details-container">
      <h2 className="title">Todo Details</h2>

      {editMod ? (
        <div className="edit-section">
          <input
            className="input"
            name="title"
            onChange={handleChange}
            value={todo.title}
            placeholder="Title"
          />
          <textarea
            className="input"
            name="description"
            onChange={handleChange}
            value={todo.description}
            placeholder="Description"
          />
          <select
            className="input"
            name="status"
            onChange={handleChange}
            value={todo.status}
          >
            <option value="todo">Todo</option>
            <option value="working">In progress</option>
            <option value="finished">Done</option>
          </select>
          <button className="btn update-btn" onClick={handleUpdate}>
            Update
          </button>
        </div>
      ) : (
        <div className="view-section">
          <h3 className="todo-title">{todo.title}</h3>
          <p className="todo-description">{todo.description}</p>
          <p className="todo-status">Status: {todo.status}</p>

          <div className="button-group">
            <button className="btn edit-btn" onClick={() => setEditMod(true)}>
              Edit
            </button>
            <button className="btn delete-btn" onClick={handleDelete}>
              Delete
            </button>
          </div>
             <Link to="/home" className="register-home-link">Back to Home</Link>
        </div>
      )}

      <hr />

      <h4 className="subheading">Invite User</h4>
      <div className="invite-section">
        <input
          className="input"
          type="email"
          placeholder="Enter email"
          value={inviteEmail}
          onChange={(e) => setInvteEmail(e.target.value)}
        />
        <button className="btn invite-btn" onClick={handleInvite}>
          Send Invite
        </button>
      </div>

      <hr />

      <button
        className="btn show-btn"
        onClick={() => setShowParticipants((prev) => !prev)}
      >
        {showParticipants ? "Hide Participants" : "Show Participants"}
      </button>

      {showParticipants && (
        <>
          <h4 className="subheading">Participants:</h4>
          <ul className="participant-list">
            {(todo.participants || []).map((user) => (
              <li key={user._id || user}>
                {user.name || "Unnamed"} ({user.email || "No email"})
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default TodoDetails;
