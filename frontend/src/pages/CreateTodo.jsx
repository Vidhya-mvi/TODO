import { useState } from "react";
import { useNavigate,Link} from "react-router-dom";
import privateHttps from "../api/privatehttps";
import "../index.css";

function CreateTodo() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    dueDate: "",
    status: "todo"
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await privateHttps.post("/todo/create", form);
      console.log("Todo created:", res.data);
      navigate("/home");
    } catch (err) {
      console.log("Error creating:", err);
    }
  };

  return (
    <div className="create-todo-container">
      <div className="create-todo-card">
        <h2>Create Todo</h2>
        <form onSubmit={handleSubmit} className="create-todo-form">
          <input type="text" name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
          <input type="text" name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
          <input type="date" name="startDate" value={form.startDate} onChange={handleChange} />
          <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <button type="submit">Create</button>
           <Link to="/home" className="register-home-link">Back to Home</Link>
        </form>
      </div>
    </div>
  );
}

export default CreateTodo;
