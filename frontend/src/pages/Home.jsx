import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import privateHttps from "../api/privatehttps";
import "../index.css";

function Home() {
  const [todo, setTodo] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const res = await privateHttps.get("/todo");
        setTodo(res.data.todos);
        console.log("Fetched Todos:", res.data);
      } catch (err) {
        console.log("Error fetching todos:", err);
      }
    };

    fetchTodos();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  return (
    <div className="home-page">
      <div className="home-header">
        <h2>Welcome Home</h2>
        <div className="home-actions">
          <Link to="/todo/create">
            <button className="home-btn create-btn">Create Todo</button>
          </Link>
          <button onClick={handleLogout} className="home-btn logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="todo-list">
        {todo.length > 0 ? (
          todo.map((item) => (
            <Link to={`/todo/${item._id}`} key={item._id} className="todo-card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <span>Status: {item.status}</span>
            </Link>
          ))
        ) : (
          <p className="no-todos">No todos available</p>
        )}
      </div>
    </div>
  );
}

export default Home;
