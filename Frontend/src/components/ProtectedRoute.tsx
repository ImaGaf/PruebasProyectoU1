import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children, role }: { children: JSX.Element, role?: string }) {
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  if (!user?.role) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;

  return children;
}
