import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ─── Pages always accessible to ANY logged-in user ───────────────────────────
const ALWAYS_ALLOWED = [
  "/",
  // "/dashboard",
  // "/Dashboard",
  // "/Menu_master",
  // "/Menu_list",
  // "/User_wise_menu_rides",
  // "/User_wise_menu_list",
  "/ErrorPage",
];

const ProtectedRoute = () => {
  const { user, loading, canAccess, menuPermissions } = useAuth();
  const location = useLocation();

  // ── Still restoring auth from storage — show spinner ─────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#222831] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#DFD0B8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Not logged in → go to login ───────────────────────────────────────────
  if (!user) {
    return <Navigate to="/ERPHomepage" state={{ from: location }} replace />;
  }

  // ── Admin → always allow everything ──────────────────────────────────────
  if (user?.isAdmin) return <Outlet />;

  // ── Always-allowed routes pass through ────────────────────────────────────
  const isAlwaysAllowed = ALWAYS_ALLOWED.some(
    (p) => p.toLowerCase() === location.pathname.toLowerCase()
  );
  if (isAlwaysAllowed) return <Outlet />;

  // ── No permissions loaded yet → allow through ─────────────────────────────
  if (!menuPermissions || menuPermissions.length === 0) return <Outlet />;

  // ── Check if this page is in user's allowed menus ─────────────────────────
  const allowed = canAccess(location.pathname);

  if (!allowed) {
    return <Navigate to="/ErrorPage" state={{ noPermission: true }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;