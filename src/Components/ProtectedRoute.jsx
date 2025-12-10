import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ role, children }) {
  const auth = JSON.parse(localStorage.getItem("jb_auth"));

  if (!auth) return <Navigate to="/signin" />;
  if (role && auth.role !== role) return <Navigate to="/" />;

  return children;
}
