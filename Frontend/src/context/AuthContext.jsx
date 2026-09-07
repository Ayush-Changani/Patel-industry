import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/axios";
import { setItem, getItem, removeItem } from "../utils/storageUtils";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user,            setUser]            = useState(null);
  const [menuPermissions, setMenuPermissions] = useState([]);
  const [loading,         setLoading]         = useState(true);

  useEffect(() => {
    // Restore user session
    const storedUser = getItem("user");
    if (storedUser) setUser(storedUser);

    // Restore menu permissions
    const storedMenus = getItem("pi_menu_permissions");
    if (storedMenus) setMenuPermissions(storedMenus);

    setLoading(false);
  }, []);

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const formData = new FormData();
      formData.append("email",    email);
      formData.append("password", password);

      const res = await api.post("/i_pi_auth_login", formData);

      const status = res.data?.status ?? res.data?.Status;

      if (status === 1) {
        const payloadData = res.data?.result || res.data?.Result;

        if (!payloadData) {
          throw new Error(
            `API returned success status, but the 'result' object is missing. Response: ${JSON.stringify(res.data)}`
          );
        }

        const userId      = payloadData.userId      || payloadData.UserId      || payloadData.userid;
        const accessToken = payloadData.accessToken || payloadData.AccessToken || payloadData.accesstoken;
        const displayName = payloadData.displayName || payloadData.DisplayName || payloadData.displayname;
        const userGroup   = payloadData.userGroup   || payloadData.UserGroup   || payloadData.usergroup;
        const employeeId  = payloadData.emp_id  || payloadData.Emp_Id  || payloadData.emp_id;
        const isAdmin     = payloadData.isAdmin     || false;

        if (!accessToken) {
          throw new Error(
            `Missing 'accessToken' in result. Keys found: ${Object.keys(payloadData).join(", ")}`
          );
        }

        const userData = {
          id:      userId,
          name:    displayName,
          role:    userGroup,
          isAdmin: isAdmin,
          emp_id:  employeeId,
        };

        setUser(userData);
        setItem("token", accessToken);
        setItem("user",  userData);

        // ── Save menu permissions ─────────────────────────────────────────────
        const menus = payloadData.menuPermissions || [];
        setItem("pi_menu_permissions", menus);
        setMenuPermissions(menus);

        // ── Build flat page permission map for button-level checks ────────────
        // Key   = "/Purchase_Requisition_list"
        // Value = { can_add, can_edit, can_delete, can_approve, can_export, can_print }
        const pagePermMap = {};
        menus.forEach((master) => {
          (master.sub_menus || []).forEach((sub) => {
            const permObj = {
              can_view:    sub.can_view,
              can_add:     sub.can_add,
              can_edit:    sub.can_edit,
              can_delete:  sub.can_delete,
              can_approve: sub.can_approve,
              can_export:  sub.can_export,
              can_print:   sub.can_print,
            };
            if (sub.md_page_url_1) pagePermMap[`/${sub.md_page_url_1.toLowerCase()}`] = permObj;
            if (sub.md_page_url_2) pagePermMap[`/${sub.md_page_url_2.toLowerCase()}`] = permObj;
          });
        });
        setItem("pi_page_permissions", pagePermMap);

        return { success: true };
      } else {
        const msg = res.data?.message || res.data?.Message || "Invalid email or password.";
        return { success: false, message: msg };
      }
    } catch (error) {
      console.error("Login Context Error:", error);

      if (error.response) {
        const msg = error.response.data?.message || error.response.data?.Message || "Server error.";
        return { success: false, message: `Server Error: ${msg}` };
      } else if (error.request) {
        return { success: false, message: "Network Error: Could not reach the server." };
      } else {
        return { success: false, message: `Application Error: ${error.message}` };
      }
    }
  };

  // ── LOGOUT ────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await api.post("/i_pi_auth_logout");
    } catch (e) {
      console.error("Logout API issue:", e);
    } finally {
      setUser(null);
      setMenuPermissions([]);
      removeItem("user");
      removeItem("token");
      removeItem("pi_menu_permissions");
      removeItem("pi_page_permissions");
    }
  };

  // ── HELPER: can this user access a page? ──────────────────────────────────
   
  const canAccess = (path) => {
    // Admin can access everything
    if (user?.isAdmin) return true;

    if (!menuPermissions || menuPermissions.length === 0) return false;

    const lowPath = (path || "").toLowerCase();
    const slashLowPath = lowPath.startsWith("/") ? lowPath : `/${lowPath}`;

    return menuPermissions.some((master) =>
      (master.sub_menus || []).some(
        (sub) =>
          sub.can_view === 1 &&
          (sub.md_page_url_1?.toLowerCase() === lowPath || 
           `/${sub.md_page_url_1?.toLowerCase()}` === slashLowPath ||
           sub.md_page_url_2?.toLowerCase() === lowPath ||
           `/${sub.md_page_url_2?.toLowerCase()}` === slashLowPath)
      )
    );
  };

  // ── HELPER: get button permissions for a page ─────────────────────────────
   
  const getPagePerms = (path) => {
    try {
      const map = getItem("pi_page_permissions");
      if (!map) return null;
      const lowPath = (path || "").toLowerCase();
      const slashLowPath = lowPath.startsWith("/") ? lowPath : `/${lowPath}`;
      return map[lowPath] || map[slashLowPath] || null;
    } catch {
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        menuPermissions,
        canAccess,
        getPagePerms,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);