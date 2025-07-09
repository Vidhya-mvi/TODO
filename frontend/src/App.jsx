import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import CreateTodo from "./pages/CreateTodo";
import TodoDetails from "./pages/TodoDetails";
import AcceptInvite from "./pages/AcceptInvite";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />}></Route>
      <Route path="/login" element={<Login />}></Route>
      <Route path="/register" element={<Register />}></Route>
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>}></Route>
      <Route path="/todo/create" element={<CreateTodo />}></Route>
      <Route path="/todo/:id" element={<TodoDetails />}></Route>
<Route path="/invite/accept" element={
  <ProtectedRoute>
    <AcceptInvite />
  </ProtectedRoute>
} />

      </Routes>

  )
}

export default App;