import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../../services/axios";

import Card from "../../../components/Card";
import Button from "../../../components/Button";
import Sidebar from "../../../components/Sidebar";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";

const THEME = {
  bg:           "#f0ead6",
  bgLight:      "#f7f3e8",
  bgAlt:        "#ece6d4",
  border:       "#cfc8b0",
  text:         "#3a3328",
  textMuted:    "#7a7060",
  textLight:    "#a09880",
  badge:        "#d4c9a8",
  badgeText:    "#5a5040",
  accent:       "#5a5348",
  rowHover:     "#ede7d4",
  activeBg:     "#e6f0da",
  activeText:   "#3a6030",
  inactiveBg:   "#f0e0d0",
  inactiveText: "#804030",
};

const User_wise_menu_list = () => {
  const navigate = useNavigate();

  const [data,       setData]       = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ── Fetch list ─────────────────────────────────────────────────────────────
  const fetchList = async (search = "") => {
    setLoading(true);
    try {
      const res = await api.get("/i_pi_menu_permission_select_all", {
        params: { SearchTerm: search },
      });

      // ✅ FIX: API returns lowercase keys — status, message, result
      const d = res.data;
      if (d?.status === 1 || d?.Status === 1) {
        setData(d.result || d.Result || []);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    fetchList(val);
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (usrId) => {
    const confirm = await Swal.fire({
      title: "Delete Permission?",
      text:  "This will remove ALL menu permissions for this user.",
      icon:  "warning",
      showCancelButton:  true,
      confirmButtonText: "Yes, delete",
      cancelButtonText:  "Cancel",
      confirmButtonColor: THEME.accent,
    });
    if (!confirm.isConfirmed) return;

    try {
      const formData = new FormData();
      formData.append("id", usrId);
      const res = await api.post("/i_pi_menu_permission_delete", formData);
      const d = res.data;
      if (d?.status === 1 || d?.Status === 1) {
        Swal.fire("Deleted", d.message || d.Message || "Deleted successfully.", "success");
        fetchList(searchTerm);
      } else {
        Swal.fire("Warning", d.message || d.Message || "Could not delete.", "warning");
      }
    } catch {
      Swal.fire("Error", "Server error.", "error");
    }
  };

  // ── JSX ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main
        className="flex-1 ml-64 flex flex-col h-full overflow-hidden"
        style={{ background: THEME.bg }}
      >
        <Header />

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar-sidebar">
          <div className="max-w-7xl mx-auto">
            <Card title="Menu Permission List">
              <div className="p-2">

                {/* Toolbar */}
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="relative flex-1 max-w-sm">
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: THEME.textLight }}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearch}
                      placeholder="Search by user name…"
                      className="w-full pl-9 pr-4 py-2 text-sm rounded-md outline-none transition-colors"
                      style={{
                        background: THEME.bgLight,
                        border:     `1px solid ${THEME.border}`,
                        color:      THEME.text,
                      }}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => navigate("/User_wise_menu_rides")}
                  >
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Permission
                    </span>
                  </Button>
                </div>

                {/* Table */}
                <div
                  className="overflow-hidden rounded-lg"
                  style={{ border: `1px solid ${THEME.border}` }}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr style={{ background: THEME.bgAlt, borderBottom: `1px solid ${THEME.border}` }}>
                          {["#", "User", "Menus Assigned", "Status", "Created", "Actions"].map((h) => (
                            <th
                              key={h}
                              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                              style={{ color: THEME.textMuted }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan={6} className="text-center py-12">
                              <div className="flex items-center justify-center gap-2" style={{ color: THEME.textMuted }}>
                                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                Loading…
                              </div>
                            </td>
                          </tr>
                        ) : data.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-12 text-sm" style={{ color: THEME.textMuted }}>
                              No records found.
                            </td>
                          </tr>
                        ) : (
                          data.map((row, idx) => (
                            <tr
                              key={row.usr_id}
                              style={{ borderBottom: `1px solid ${THEME.border}`, background: THEME.bgLight }}
                              onMouseEnter={(e) => e.currentTarget.style.background = THEME.rowHover}
                              onMouseLeave={(e) => e.currentTarget.style.background = THEME.bgLight}
                            >
                              {/* # */}
                              <td className="px-4 py-3" style={{ color: THEME.textMuted, width: 48 }}>
                                {idx + 1}
                              </td>

                              {/* User */}
                              <td className="px-4 py-3 font-medium" style={{ color: THEME.text }}>
                                {row.usr_name || "—"}
                              </td>

                              {/* Menus count */}
                              <td className="px-4 py-3">
                                <span
                                  className="text-xs font-medium px-2.5 py-1 rounded-full"
                                  style={{ background: THEME.badge, color: THEME.badgeText }}
                                >
                                  {row.permission_count ?? 0} menus
                                </span>
                              </td>

                              {/* Status */}
                              <td className="px-4 py-3">
                                <span
                                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                  style={
                                    row.is_active === 1
                                      ? { background: THEME.activeBg,   color: THEME.activeText }
                                      : { background: THEME.inactiveBg, color: THEME.inactiveText }
                                  }
                                >
                                  {row.is_active === 1 ? "Active" : "Inactive"}
                                </span>
                              </td>

                              {/* Created */}
                              <td className="px-4 py-3 text-xs" style={{ color: THEME.textMuted }}>
                                {row.created_at || "—"}
                              </td>

                              {/* Actions */}
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">

                                  {/* View */}
                                  <button
                                    type="button" title="View"
                                    onClick={() => navigate(`/User_wise_menu_rides?view_id=${row.usr_id}`)}
                                    className="p-1.5 rounded transition-colors"
                                    style={{ color: THEME.textMuted }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = THEME.text}
                                    onMouseLeave={(e) => e.currentTarget.style.color = THEME.textMuted}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  </button>

                                  {/* Edit */}
                                  <button
                                    type="button" title="Edit"
                                    onClick={() => navigate(`/User_wise_menu_rides?eid=${row.usr_id}`)}
                                    className="p-1.5 rounded transition-colors"
                                    style={{ color: THEME.textMuted }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = THEME.accent}
                                    onMouseLeave={(e) => e.currentTarget.style.color = THEME.textMuted}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                  </button>

                                  {/* Delete */}
                                  <button
                                    type="button" title="Delete"
                                    onClick={() => handleDelete(row.usr_id)}
                                    className="p-1.5 rounded transition-colors"
                                    style={{ color: THEME.textMuted }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = "#b04030"}
                                    onMouseLeave={(e) => e.currentTarget.style.color = THEME.textMuted}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" />
                                    </svg>
                                  </button>

                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer row count */}
                  {!loading && data.length > 0 && (
                    <div
                      className="px-4 py-2.5 flex items-center justify-end text-xs"
                      style={{
                        background: THEME.bgAlt,
                        borderTop:  `1px solid ${THEME.border}`,
                        color:      THEME.textMuted,
                      }}
                    >
                      {data.length} record{data.length !== 1 ? "s" : ""} found
                    </div>
                  )}
                </div>

              </div>
            </Card>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
};

export default User_wise_menu_list;