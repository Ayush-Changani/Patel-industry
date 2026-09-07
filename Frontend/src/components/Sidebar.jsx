import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FiChevronDown, FiChevronUp, FiAlertCircle } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/patel_lindustry_logo.png";

/* ═══════════════════════════════════════════════════════════════════════════
   FONT AWESOME — injected once into <head>
═══════════════════════════════════════════════════════════════════════════ */
const FA_CDN   = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css";
const FA_SHIMS = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/v4-shims.min.css";

const injectFontAwesome = () => {
  [FA_CDN, FA_SHIMS].forEach((href) => {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  });
};

const FAIcon = ({ iconClass, style }) => (
  <i className={iconClass || "fas fa-folder"} style={style} />
);

/* ═══════════════════════════════════════════════════════════════════════════
   STATIC ITEMS — always visible regardless of permissions
═══════════════════════════════════════════════════════════════════════════ */
// const STATIC_TOP = [
//   { label: "Dashboard",      icon: "fa fa-home", path: "/Dashboard"            },
//   { label: "Menu",           icon: "fa fa-cogs", path: "/Menu_list"            },
//   { label: "User wise Menu", icon: "fa fa-cogs", path: "/User_wise_menu_rides" },
// ];

/* ═══════════════════════════════════════════════════════════════════════════
   SIDEBAR COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
const Sidebar = () => {
  const [openMenu, setOpenMenu] = useState(null);
  const { menuPermissions } = useAuth();

  useEffect(() => { injectFontAwesome(); }, []);

  // ── Build dynamic menus from permission data ───────────────────────────────
  //
  // LOGIC:
  //   1. Loop over master menus from menuPermissions
  //   2. For each master, only include sub_menus where can_view === 1
  //      (SP already guarantees this, but we filter again as safety)
  //   3. Only show master group in sidebar if it has at least 1 accessible sub-menu
  //
  // The permission flags (can_add, can_edit etc.) are NOT used here —
  // they are used inside each page via getPagePerms() to show/hide buttons.
  //
  const dynamicMenus = (menuPermissions || [])
    .map((master) => ({
      id:       String(master.master_menu_id),
      label:    master.master_menu_name,
      icon:     master.icon || "fas fa-folder",

      // ✅ Show sub-menu if ANY permission flag is 1
      // Default = hidden. Only show if at least one ride is granted.
      // If menu_detail_id has NO row in pi_menu_permission → not in list → hidden.
      children: (master.sub_menus || [])
        .filter((sub) =>
          sub.can_view    === 1 ||
          sub.can_add     === 1 ||
          sub.can_edit    === 1 ||
          sub.can_delete  === 1 ||
          sub.can_approve === 1 ||
          sub.can_export  === 1 ||
          sub.can_print   === 1
        )
        .map((sub) => ({
          id:    String(sub.menu_detail_id),
          label: sub.md_sub_menu_name,
          path:  `/${sub.md_page_url_1 || ""}`,
          icon:  sub.md_icon || "fas fa-circle",
        })),
    }))
    // ✅ Only show master group if at least one child is accessible
    .filter((group) => group.children.length > 0);

  const toggleSubMenu = (label) =>
    setOpenMenu((prev) => (prev === label ? null : label));

  /* ── Static NavLink ─────────────────────────────────────────────────────── */
  const renderStatic = (item) => (
    <NavLink
      key={item.path}
      to={item.path}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 transition-colors ${
          isActive
            ? "bg-[#393E46] text-[#DFD0B8] border-r-4 border-[#EEEEEE]"
            : "hover:bg-[#393E46]"
        }`
      }
    >
      <FAIcon iconClass={item.icon} style={{ width: 16, textAlign: "center" }} />
      <span className="font-medium">{item.label}</span>
    </NavLink>
  );

  /* ── Collapsible group ──────────────────────────────────────────────────── */
  const renderGroup = (group) => (
    <div key={group.id} className="mb-1">
      <button
        onClick={() => toggleSubMenu(group.label)}
        className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-[#393E46] transition-colors duration-200"
      >
        <div className="flex items-center gap-3">
          <FAIcon iconClass={group.icon} style={{ width: 16, textAlign: "center" }} />
          <span className="font-medium">{group.label}</span>
        </div>
        {openMenu === group.label ? <FiChevronUp /> : <FiChevronDown />}
      </button>

      {openMenu === group.label && (
        <div className="py-1">
          {group.children.map((child) => (
            <NavLink
              key={child.id}
              to={child.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-10 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-[#393E46] text-[#DFD0B8] border-r-4 border-[#EEEEEE]"
                    : "hover:bg-[#393E46] hover:text-white"
                }`
              }
            >
              <FAIcon iconClass={child.icon} style={{ width: 14, textAlign: "center" }} />
              <span>{child.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );

  /* ── JSX ────────────────────────────────────────────────────────────────── */
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-[#222831] text-[#DFD0B8] flex flex-col border-r border-[#393E46] z-50">

      {/* Brand */}
      <div className="p-1 border-b border-[#393E46] flex-shrink-0 flex justify-center">
        <img src={logo} alt="Patel Industries Logo" className="h-15 object-contain" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar-sidebar mt-2">

        {/* {STATIC_TOP.map(renderStatic)} */}

        <div className="mx-4 my-2" />

        {/* Dynamic permission-based menus */}
        {dynamicMenus.length === 0 && (
          <div className="flex items-center gap-2 px-4 py-3 text-xs text-[#7a7060]">
            <FiAlertCircle />
            <span>No menu permissions assigned</span>
          </div>
        )}

        {dynamicMenus.map(renderGroup)}

        <div className="mx-4 my-2" />

      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#393E46] text-[10px] text-center text-gray-500 uppercase tracking-widest">
        © 2026 Patel Industries
      </div>
    </aside>
  );
};

export default Sidebar;