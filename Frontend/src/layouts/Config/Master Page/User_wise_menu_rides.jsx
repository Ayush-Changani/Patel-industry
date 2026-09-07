import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../../services/axios";

import Card from "../../../components/Card";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import Sidebar from "../../../components/Sidebar";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";
import Select from "../../../components/Select";

// ─── Theme ────────────────────────────────────────────────────────────────────
const THEME = {
  bg:          "#f0ead6",
  bgLight:     "#f7f3e8",
  bgAlt:       "#ece6d4",
  bgHighlight: "#e8f0da",
  border:      "#cfc8b0",
  checkBg:     "#5a5348",
  checkBorder: "#5a5348",
  checkHover:  "#3d3830",
  text:        "#3a3328",
  textMuted:   "#7a7060",
  textLight:   "#a09880",
  badge:       "#d4c9a8",
  badgeText:   "#5a5040",
  accent:      "#5a5348",
  viewOn:      "#2d6a4f",   // green tint for can_view column
  viewBg:      "#d8f3dc",
};

// ─── Checkbox CSS ─────────────────────────────────────────────────────────────
const CHECKBOX_CSS = `
  .theme-cb {
    appearance: none; -webkit-appearance: none;
    width: 16px; height: 16px;
    border: 1.5px solid ${THEME.checkBorder};
    border-radius: 3px; background-color: #fff;
    cursor: pointer; position: relative; flex-shrink: 0;
    transition: background-color 0.15s, border-color 0.15s;
    display: inline-block; vertical-align: middle;
  }
  .theme-cb:hover:not(:disabled) { border-color: ${THEME.checkHover}; background-color: #f5f0e8; }
  .theme-cb:checked { background-color: ${THEME.checkBg}; border-color: ${THEME.checkBg}; }
  .theme-cb:checked::after {
    content: ''; position: absolute;
    left: 4px; top: 1px; width: 5px; height: 9px;
    border: 2px solid #fff; border-top: none; border-left: none;
    transform: rotate(45deg);
  }
  .theme-cb:indeterminate { background-color: ${THEME.checkBg}; border-color: ${THEME.checkBg}; }
  .theme-cb:indeterminate::after {
    content: ''; position: absolute;
    left: 3px; top: 6px; width: 8px; height: 2px;
    background-color: #fff; border-radius: 1px;
  }
  .theme-cb:disabled { opacity: 0.5; cursor: not-allowed; }
  .theme-cb-sm { width: 14px; height: 14px; }
  .theme-cb-sm:checked::after { left: 3px; top: 1px; width: 4px; height: 7px; }
  .theme-cb-sm:indeterminate::after { left: 2px; top: 5px; width: 7px; }
  .view-cb:checked { background-color: ${THEME.viewOn}; border-color: ${THEME.viewOn}; }
`;

// ─── FLAGS — VIEW is the access gate, ACTION flags are the operations ─────────
// ✅ FIX: Separated can_view from action flags so they behave differently
const VIEW_FLAG = { key: "can_view", label: "View" };

const ACTION_FLAGS = [
  { key: "can_add",     label: "Add"     },
  { key: "can_edit",    label: "Edit"    },
  { key: "can_delete",  label: "Delete"  },
  { key: "can_approve", label: "Approve" },
  { key: "can_export",  label: "Export"  },
  { key: "can_print",   label: "Print"   },
];

// All flags combined (for rendering column headers etc.)
const ALL_FLAGS = [VIEW_FLAG, ...ACTION_FLAGS];

const defaultPerms = () =>
  Object.fromEntries(ALL_FLAGS.map((f) => [f.key, 0]));

// ─── Themed checkbox ──────────────────────────────────────────────────────────
const ThemeCb = ({ checked, indeterminate, onChange, disabled, sm = false, isView = false }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      className={`theme-cb${sm ? " theme-cb-sm" : ""}${isView ? " view-cb" : ""}`}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
    />
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const User_wise_menu_rides = () => {
  const navigate = useNavigate();

  const [loading,     setLoading]     = useState(false);
  const [treeLoading, setTreeLoading] = useState(false);
  const [isActive,    setIsActive]    = useState(true);

  // ── Assign type & selections ───────────────────────────────────────────────
  const [assignType,   setAssignType]   = useState("user");
  const [userOptions,  setUserOptions]  = useState([]);
  const [roleOptions,  setRoleOptions]  = useState([]);
  const [deptOptions,  setDeptOptions]  = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);

  // ── Menu tree ──────────────────────────────────────────────────────────────
  const [masterMenu,        setMasterMenu]        = useState(null);
  const [masterMenuOptions, setMasterMenuOptions] = useState([]);
  const [allMenuRows,       setAllMenuRows]        = useState([]);
  const [treeData,          setTreeData]          = useState([]);
  const [expandedMenus,     setExpandedMenus]     = useState({});
  const [treeLoaded,        setTreeLoaded]        = useState(false);
  const [menuPerms,         setMenuPerms]         = useState({});

  // ── Helpers ────────────────────────────────────────────────────────────────
  const activeAssignee = () => {
    if (assignType === "user") return selectedUser;
    if (assignType === "role") return selectedRole;
    if (assignType === "dept") return selectedDept;
    return null;
  };

  const resetTree = (clearPerms = false) => {
    setTreeLoaded(false);
    setTreeData([]);
    setExpandedMenus({});
    if (clearPerms) setMenuPerms({});
  };

  // ── Fetch dropdowns ────────────────────────────────────────────────────────
  const fetchUsers = async (search = "") => {
    try {
      const res = await api.get("/i_pi_user__mst_select_all_and_id", { params: { SearchTerm: search || "" } });
      const d = res.data;
      if (d?.Status === 1 || d?.status === 1) {
        const r = d.Result || d.result || [];
        const mapped = r.map((u) => ({ value: String(u.usr_id), label: u.user_name || u.usr_display_name }));
        setUserOptions(mapped);
        return mapped;
      }
    } catch (err) { console.error(err); }
    return [];
  };

  const fetchRoles = async (search = "") => {
    try {
      const res = await api.get("/i_pi_user_group_mst_select_all_and_id", { params: { SearchTerm: search || "" } });
      const d = res.data;
      if (d?.Status === 1 || d?.status === 1) {
        const r = d.Result || d.result || [];
        const mapped = r.map((x) => ({ value: String(x.ug_id), label: x.user_group_name }));
        setRoleOptions(mapped);
        return mapped;
      }
    } catch (err) { console.error(err); }
    return [];
  };

  const fetchDepts = async (search = "") => {
    try {
      const res = await api.get("/i_pi_department_mst_select_all_and_id", { params: { SearchTerm: search || "" } });
      const d = res.data;
      if (d?.Status === 1 || d?.status === 1) {
        const r = d.Result || d.result || [];
        const mapped = r.map((x) => ({ value: String(x.dept_id), label: x.dept_name }));
        setDeptOptions(mapped);
        return mapped;
      }
    } catch (err) { console.error(err); }
    return [];
  };

  const fetchAllMenus = async () => {
    try {
      const res = await api.get("/i_pi_menu_detail_select_all_and_id", { params: { id: 0 } });
      const d = res.data;
      if ((d?.Status === 1 || d?.status === 1)) {
        const rows = d.Result || d.result || [];
        if (rows.length > 0) {
          setAllMenuRows(rows);
          const masterMap = {};
          rows.forEach((row) => {
            const mId = String(row.md_master_menu_id);
            if (!masterMap[mId]) masterMap[mId] = { value: mId, label: row.master_menu_name };
          });
          setMasterMenuOptions(Object.values(masterMap));
          return rows;
        }
      }
    } catch (err) { console.error(err); }
    return [];
  };

  // ── Build tree ─────────────────────────────────────────────────────────────
  const buildTree = (rows) => {
    const grouped = {};
    rows.forEach((row) => {
      const masterId   = String(row.md_master_menu_id);
      const masterName = row.master_menu_name;
      const subId      = String(row.id);
      const subName    = row.md_sub_menu_name || row.menu_name;
      if (!grouped[masterId]) grouped[masterId] = { masterId, masterName, subMenus: [] };
      grouped[masterId].subMenus.push({ subId, subName });
    });
    return Object.values(grouped);
  };

  // ── Load tree + pre-fill existing perms ───────────────────────────────────
  const loadTreeForAssignee = useCallback(async (assigneeValue, type, menuRows) => {
    if (!assigneeValue || !menuRows?.length) return;

    setTreeLoading(true);
    setTreeLoaded(false);
    setExpandedMenus({});

    const filteredRows = masterMenu
      ? menuRows.filter((row) => String(row.md_master_menu_id) === masterMenu.value)
      : menuRows;

    if (filteredRows.length === 0) {
      setTreeData([]);
      setTreeLoaded(true);
      setTreeLoading(false);
      return;
    }

    const tree = buildTree(filteredRows);
    setTreeData(tree);
    const expanded = {};
    tree.forEach((g) => { expanded[g.masterId] = true; });
    setExpandedMenus(expanded);

    // ✅ FIX: Initialize ALL perms to 0 — nothing pre-selected by default
    const freshPerms = {};
    filteredRows.forEach((row) => {
      freshPerms[String(row.id)] = defaultPerms();
    });

    // ✅ Only pre-fill for USER type — fetch their saved permissions
    // Role/Dept always starts with blank slate
    if (type === "user") {
      try {
        const res = await api.get("/i_pi_menu_permission_select_by_usr_id", {
          params: { usr_id: assigneeValue },
        });
        const d = res.data;
        if ((d?.Status === 1 || d?.status === 1)) {
          const record = d.Result || d.result;
          if (record?.permissions?.length > 0) {
            record.permissions.forEach((p) => {
              const key = String(p.menu_detail_id);
              if (freshPerms[key] !== undefined) {
                // ✅ FIX: Respect exact saved values — don't assume anything
                freshPerms[key] = {
                  can_view:    p.can_view    ?? 0,
                  can_add:     p.can_add     ?? 0,
                  can_edit:    p.can_edit    ?? 0,
                  can_delete:  p.can_delete  ?? 0,
                  can_approve: p.can_approve ?? 0,
                  can_export:  p.can_export  ?? 0,
                  can_print:   p.can_print   ?? 0,
                };
              }
            });
            if (record.is_active !== undefined) {
              setIsActive(record.is_active === 1);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load existing permissions:", err);
      }
    }

    setMenuPerms(freshPerms);
    setTreeLoaded(true);
    setTreeLoading(false);
  }, [masterMenu]);

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchRoles(), fetchDepts()]);
      await fetchAllMenus();
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedUser && allMenuRows.length > 0)
      loadTreeForAssignee(selectedUser.value, "user", allMenuRows);
  }, [selectedUser]);

  useEffect(() => {
    if (selectedRole && allMenuRows.length > 0)
      loadTreeForAssignee(selectedRole.value, "role", allMenuRows);
  }, [selectedRole]);

  useEffect(() => {
    if (selectedDept && allMenuRows.length > 0)
      loadTreeForAssignee(selectedDept.value, "dept", allMenuRows);
  }, [selectedDept]);

  useEffect(() => {
    const assignee = activeAssignee();
    if (assignee && allMenuRows.length > 0 && treeLoaded)
      loadTreeForAssignee(assignee.value, assignType, allMenuRows);
  }, [masterMenu]);

  // ── CRUD toggles ───────────────────────────────────────────────────────────

  // ✅ FIX: Smart toggle — auto-enable can_view when any action is ON,
  //         auto-disable all actions when can_view is turned OFF
  const toggleFlag = (subId, flagKey) => {
    setMenuPerms((prev) => {
      const current = { ...(prev[subId] || defaultPerms()) };
      const newVal  = current[flagKey] ? 0 : 1;
      current[flagKey] = newVal;

      // Auto-enable can_view when any action flag is turned ON
      if (flagKey !== "can_view" && newVal === 1) {
        current.can_view = 1;
      }

      // Auto-disable ALL action flags when can_view is turned OFF
      if (flagKey === "can_view" && newVal === 0) {
        ACTION_FLAGS.forEach((f) => { current[f.key] = 0; });
      }

      return { ...prev, [subId]: current };
    });
  };

  // ✅ FIX: "All" checkbox per sub-menu only toggles ACTION flags
  //         can_view is auto-set: ON when any action ON, untouched when turning OFF
  const toggleAllFlags = (subId) => {
    const perms = menuPerms[subId] || defaultPerms();
    const allActionsOn = ACTION_FLAGS.every((f) => perms[f.key] === 1);
    setMenuPerms((prev) => {
      const current = { ...(prev[subId] || defaultPerms()) };
      ACTION_FLAGS.forEach((f) => { current[f.key] = allActionsOn ? 0 : 1; });
      // Auto-enable can_view when turning actions ON
      if (!allActionsOn) current.can_view = 1;
      return { ...prev, [subId]: current };
    });
  };

  // ✅ FIX: Master group toggle — toggles ALL flags including can_view correctly
  const toggleMasterGroupFlags = (masterId) => {
    const group = treeData.find((g) => g.masterId === masterId);
    if (!group) return;
    const allOn = group.subMenus.every((s) =>
      ALL_FLAGS.every((f) => menuPerms[s.subId]?.[f.key] === 1)
    );
    setMenuPerms((prev) => {
      const updated = { ...prev };
      group.subMenus.forEach((s) => {
        updated[s.subId] = Object.fromEntries(
          ALL_FLAGS.map((f) => [f.key, allOn ? 0 : 1])
        );
      });
      return updated;
    });
  };

  const isMasterChecked = (group) =>
    group.subMenus.length > 0 &&
    group.subMenus.every((s) => ALL_FLAGS.every((f) => menuPerms[s.subId]?.[f.key] === 1));

  const isMasterIndeterminate = (group) => {
    const someOn = group.subMenus.some((s) => ALL_FLAGS.some((f) => menuPerms[s.subId]?.[f.key] === 1));
    return someOn && !isMasterChecked(group);
  };

  const toggleExpand = (masterId) =>
    setExpandedMenus((prev) => ({ ...prev, [masterId]: !prev[masterId] }));

  // ✅ Count menus where can_view = 1 (the real access gate)
  const totalViewCount = Object.values(menuPerms).filter((p) => p.can_view === 1).length;

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const assignee = activeAssignee();
    if (!assignee) {
      Swal.fire("Validation", "Please select an assignee", "warning");
      return;
    }

    if (!treeLoaded) {
      Swal.fire("Validation", "Please wait for menus to load", "warning");
      return;
    }

    // ✅ FIX: Only send menus where can_view = 1 (user explicitly granted access)
    // Menus where everything is 0 are NOT sent — SP will delete+reinsert only these
    const permRows = Object.entries(menuPerms)
      .filter(([, p]) => p.can_view === 1)   // ← KEY FIX: gate on can_view, not any flag
      .map(([menuDetailId, p]) => ({
        menu_detail_id: Number(menuDetailId),
        can_view:    p.can_view,
        can_add:     p.can_add,
        can_edit:    p.can_edit,
        can_delete:  p.can_delete,
        can_approve: p.can_approve,
        can_export:  p.can_export,
        can_print:   p.can_print,
      }));

    if (permRows.length === 0) {
      Swal.fire("Validation", "Please grant View access to at least one menu", "warning");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("id",          0);
      formData.append("ug_id",       assignType === "role" ? assignee.value : "0");
      formData.append("usr_id",      assignType === "user" ? assignee.value : "0");
      formData.append("dept_id",     assignType === "dept" ? assignee.value : "0");
      formData.append("is_active",   isActive ? 1 : 0);
      formData.append("permissions", JSON.stringify(permRows));

      const res = await api.post("/i_pi_menu_permission_insert", formData);
      const d = res.data;

      if (d?.Status === 1 || d?.status === 1) {
        Swal.fire("Success", d.Message || d.message || "Saved successfully", "success");
        setSelectedUser(null);
        setSelectedRole(null);
        setSelectedDept(null);
        resetTree(true);
        setIsActive(true);
      } else {
        Swal.fire("Warning", d.Message || d.message || "Operation failed", "warning");
      }
    } catch (err) {
      console.error("Submit error:", err);
      Swal.fire("Error", "Server Error", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Render tree ────────────────────────────────────────────────────────────
  const renderTree = () => {
    if (treeLoading) {
      return (
        <div className="flex items-center justify-center gap-2 py-8 mt-4 rounded-lg"
          style={{ color: THEME.textMuted, background: THEME.bgLight, border: `1px solid ${THEME.border}` }}>
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-sm">Loading menu permissions…</span>
        </div>
      );
    }

    if (!treeLoaded) return null;

    if (treeData.length === 0)
      return (
        <div className="text-center py-8 text-sm mt-4 rounded-lg"
          style={{ color: THEME.textMuted, background: THEME.bgLight, border: `1px solid ${THEME.border}` }}>
          No menus available
        </div>
      );

    return (
      <div className="mt-6 overflow-hidden rounded-lg"
        style={{ border: `1px solid ${THEME.border}`, background: THEME.bgLight }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5"
          style={{ background: THEME.bgAlt, borderBottom: `1px solid ${THEME.border}` }}>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: THEME.textMuted }}>
            Menu Permissions
          </span>
          <div className="flex items-center gap-2">
            {/* ✅ Shows how many menus the user can VIEW (the access gate) */}
            <span className="text-xs rounded-full px-2.5 py-0.5 font-medium"
              style={{ background: THEME.viewBg, color: THEME.viewOn }}>
              {totalViewCount} menus accessible
            </span>
          </div>
        </div>

        {/* ✅ Column headers — View column highlighted in green to show it's special */}
        <div className="flex items-center gap-2 px-4 py-2"
          style={{ background: THEME.bg, borderBottom: `1px solid ${THEME.border}` }}>
          <div className="w-5 flex-shrink-0" />
          <div className="w-4 flex-shrink-0" />
          <div className="flex-1 text-xs font-semibold uppercase tracking-wide" style={{ color: THEME.textMuted }}>Menu</div>
          <div className="w-6 flex-shrink-0 text-center text-xs font-semibold uppercase" style={{ color: THEME.textLight }}>All</div>

          {/* View column — green label to emphasise it's the access gate */}
          <div className="w-14 flex-shrink-0 text-center text-xs font-semibold uppercase tracking-wide"
            style={{ color: THEME.viewOn }}>
            View ✱
          </div>

          {ACTION_FLAGS.map((f) => (
            <div key={f.key} className="w-14 flex-shrink-0 text-center text-xs font-semibold uppercase tracking-wide"
              style={{ color: THEME.textMuted }}>
              {f.label}
            </div>
          ))}
        </div>

        {/* ✅ Small hint about View column behaviour */}
        <div className="px-4 py-1.5 text-xs italic"
          style={{ background: THEME.bgHighlight, borderBottom: `1px solid ${THEME.border}`, color: THEME.viewOn }}>
          ✱ View = page access gate. Enabling any action auto-enables View. Disabling View disables all actions.
        </div>

        {/* Rows */}
        <div>
          {treeData.map((group, gIdx) => (
            <div key={group.masterId}
              style={{ borderBottom: gIdx < treeData.length - 1 ? `1px solid ${THEME.border}` : "none" }}>

              {/* Master row */}
              <div className="flex items-center gap-2 px-4 py-2.5 select-none"
                style={{ background: THEME.bgAlt, cursor: "pointer" }}
                onClick={() => toggleExpand(group.masterId)}>
                <button type="button"
                  onClick={(e) => { e.stopPropagation(); toggleExpand(group.masterId); }}
                  className="flex items-center justify-center w-5 h-5 flex-shrink-0"
                  style={{ color: THEME.textMuted }}>
                  <svg className={`w-4 h-4 transition-transform duration-200 ${expandedMenus[group.masterId] ? "rotate-90" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <div onClick={(e) => e.stopPropagation()}>
                  <ThemeCb
                    checked={isMasterChecked(group)}
                    indeterminate={isMasterIndeterminate(group)}
                    onChange={() => toggleMasterGroupFlags(group.masterId)}
                  />
                </div>

                <span className="flex-1 text-sm font-semibold flex items-center gap-2" style={{ color: THEME.text }}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    style={{ color: THEME.accent }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  {group.masterName}
                </span>

                <span className="text-xs rounded-full px-2 py-0.5 mr-6"
                  style={{ background: THEME.badge, color: THEME.badgeText }}>
                  {group.subMenus.length} items
                </span>

                {/* Spacer columns to align with sub-row checkboxes */}
                <div className="w-6 flex-shrink-0" />
                {ALL_FLAGS.map((f) => <div key={f.key} className="w-14 flex-shrink-0" />)}
              </div>

              {/* Sub rows */}
              {expandedMenus[group.masterId] && (
                <div>
                  {group.subMenus.map((sub) => {
                    const perms  = menuPerms[sub.subId] || defaultPerms();
                    const viewOn = perms.can_view === 1;
                    const allActionsOn = ACTION_FLAGS.every((f) => perms[f.key] === 1);
                    const someActionsOn = ACTION_FLAGS.some((f) => perms[f.key] === 1) && !allActionsOn;

                    return (
                      <div key={sub.subId}
                        className="flex items-center gap-2 pl-10 pr-4 py-2 transition-colors"
                        style={{
                          background: viewOn ? THEME.bgHighlight : THEME.bgLight,
                          borderTop: `1px solid ${THEME.border}`,
                        }}>

                        <div className="w-5 flex-shrink-0 flex items-center justify-center">
                          <span style={{ color: THEME.textLight, fontSize: 12 }}>└</span>
                        </div>

                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          style={{ color: THEME.textLight }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>

                        <span className="text-sm flex-1"
                          style={{
                            color:      viewOn ? THEME.text : THEME.textMuted,
                            fontWeight: viewOn ? 500 : 400,
                          }}>
                          {sub.subName}
                        </span>

                        {/* "All actions" checkbox — only toggles action flags */}
                        <div className="w-6 flex-shrink-0 flex items-center justify-center">
                          <ThemeCb
                            checked={allActionsOn}
                            indeterminate={someActionsOn}
                            onChange={() => toggleAllFlags(sub.subId)}
                            sm
                          />
                        </div>

                        {/* ✅ View checkbox — green, standalone access gate */}
                        <div className="w-14 flex-shrink-0 flex items-center justify-center">
                          <ThemeCb
                            checked={viewOn}
                            onChange={() => toggleFlag(sub.subId, "can_view")}
                            isView
                          />
                        </div>

                        {/* Action flag checkboxes — disabled if view is OFF */}
                        {ACTION_FLAGS.map((f) => (
                          <div key={f.key} className="w-14 flex-shrink-0 flex items-center justify-center">
                            <input
                              type="checkbox"
                              className="theme-cb"
                              checked={!!perms[f.key]}
                              // ✅ FIX: Action flags are disabled when can_view is OFF
                              disabled={!viewOn}
                              style={{ opacity: viewOn ? 1 : 0.35, cursor: viewOn ? "pointer" : "not-allowed" }}
                              onChange={() => toggleFlag(sub.subId, f.key)}
                            />
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── JSX ────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{CHECKBOX_CSS}</style>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 ml-64 flex flex-col h-full overflow-hidden" style={{ background: THEME.bg }}>
          <Header />
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar-sidebar">
            <div className="max-w-6xl mx-auto">
              <Card title="Menu Permission">
                <form onSubmit={handleSubmit} className="p-2">

                  {/* Assign-by radio */}
                  <div className="mb-5">
                    <Input
                      type="radio"
                      label="Assign By"
                      name="assignType"
                      value={assignType}
                      options={[
                        { value: "user", label: "By User"         },
                        { value: "role", label: "By Role / Group" },
                        { value: "dept", label: "By Department"   },
                      ]}
                      onChange={(val) => {
                        setAssignType(val);
                        setSelectedUser(null);
                        setSelectedRole(null);
                        setSelectedDept(null);
                        resetTree(true);
                      }}
                    />
                  </div>

                  {/* Assignee + master menu filter */}
                  <div className="grid grid-cols-2 gap-4">
                    {assignType === "user" && (
                      <Select
                        label="User"
                        options={userOptions}
                        value={selectedUser}
                        onChange={(val) => setSelectedUser(val)}
                        searchable serverSearch onSearch={fetchUsers}
                        placeholder="Search and select user"
                      />
                    )}
                    {assignType === "role" && (
                      <Select
                        label="Role / Group"
                        options={roleOptions}
                        value={selectedRole}
                        onChange={(val) => setSelectedRole(val)}
                        searchable serverSearch onSearch={fetchRoles}
                        placeholder="Search and select role"
                      />
                    )}
                    {assignType === "dept" && (
                      <Select
                        label="Department"
                        options={deptOptions}
                        value={selectedDept}
                        onChange={(val) => setSelectedDept(val)}
                        searchable serverSearch onSearch={fetchDepts}
                        placeholder="Search and select department"
                      />
                    )}

                    <Select
                      label="Master Menu (Optional Filter)"
                      options={masterMenuOptions}
                      value={masterMenu}
                      onChange={(val) => setMasterMenu(val)}
                      searchable
                      placeholder="All menus (leave blank for all)"
                      isClearable
                    />
                  </div>

                  {!treeLoaded && !treeLoading && activeAssignee() && (
                    <p className="mt-3 text-xs" style={{ color: THEME.textMuted }}>
                      Loading menus…
                    </p>
                  )}

                  {/* Permission tree */}
                  {renderTree()}

                  {/* Active toggle */}
                  {treeLoaded && (
                    <div className="flex items-center gap-2.5 mt-5">
                      <input
                        type="checkbox"
                        id="isActiveChk"
                        className="theme-cb"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                      />
                      <label htmlFor="isActiveChk" className="text-sm select-none cursor-pointer"
                        style={{ color: THEME.text }}>
                        Active
                      </label>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex justify-center gap-4 mt-6">
                    <Button type="submit" variant="submit" disabled={loading || !treeLoaded}>
                      {loading ? "Saving..." : "Save"}
                    </Button>
                    <Button type="button" variant="cancel"
                      onClick={() => {
                        setSelectedUser(null);
                        setSelectedRole(null);
                        setSelectedDept(null);
                        resetTree(true);
                        setIsActive(true);
                      }}>
                      Reset
                    </Button>
                  </div>

                </form>
              </Card>
            </div>
          </div>
          <Footer />
        </main>
      </div>
    </>
  );
};

export default User_wise_menu_rides;