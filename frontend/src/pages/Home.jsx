import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import privateHttps from "../api/privatehttps";
import "../index.css";

function Home() {
  const [todos, setTodos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  const fetchTodos = async (pageNumber = 1) => {
    try {
      const res = await privateHttps.get(`/todo?page=${pageNumber}`);
      const newTodos = res.data.todos || [];

      // Filter out duplicates
      setTodos((prev) => {
        const existingIds = new Set(prev.map((todo) => todo._id));
        const filteredTodos = newTodos.filter((todo) => !existingIds.has(todo._id));
        return [...prev, ...filteredTodos];
      });

      setHasMore(pageNumber < res.data.totalPages);
    } catch (err) {
      console.log("Error fetching todos:", err);
    }
  };

  useEffect(() => {
    fetchTodos(page);
  }, [page]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  const handleShowMore = () => {
    setPage((prev) => prev + 1);
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
        {todos.length > 0 ? (
          todos.map((item) => (
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

      {hasMore && (
        <div className="show-more-container">
          <button className="home-btn show-more-btn" onClick={handleShowMore}>
            Show More
          </button>
        </div>
      )}
    </div>
  );
}

export default Home;
