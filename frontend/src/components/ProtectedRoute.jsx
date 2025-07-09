import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import Privatehttps from "../api/privatehttps";

function ProtectedRoute({ children }) {
  const [auth, setAuth] = useState("loading");
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await Privatehttps.get("/auth/me");
        setAuth("authenticated");
      } catch (err) {
        setAuth("unauthenticated");
        console.log("",err)
      }
    };

    verifyAuth();
  }, []);

  if (auth === "loading") return <p>Checking authentication...</p>;

  if (auth === "unauthenticated") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
