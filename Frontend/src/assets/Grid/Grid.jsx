import React, { useState, useMemo } from "react";
import {
  FaEdit,
  FaTrashAlt,
  FaPlus,
  FaSyncAlt,
  FaSearch,
  FaEye,
  FaCheck,
  FaTimes,
  FaRegThumbsUp,
  FaMoneyBillWave,
  FaRegFileAlt,
} from "react-icons/fa";

import Card from "../../components/Card";
import { useAuth } from "../../context/AuthContext";
import Select from "../../components/Select";

/* ─────────────────────────────────────────────
    Status badge
───────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const styles = {
    draft:     { background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1" },
    pending:   { background: "#fef9c3", color: "#854d0e", border: "1px solid #fde047" },
    sent:      { background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" },
    approved:  { background: "#dcfce7", color: "#166534", border: "1px solid #86efac" },
    rejected:  { background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" },
    finalized: { background: "#ede9fe", color: "#5b21b6", border: "1px solid #c4b5fd" },
  };
  const key   = status?.toLowerCase() || "draft";
  const style = styles[key] || styles.draft;
  return (
    <span
      style={{
        ...style,
        padding:       "2px 10px",
        borderRadius:  "9999px",
        fontSize:      "11px",
        fontWeight:    600,
        display:       "inline-block",
        textTransform: "capitalize",
        whiteSpace:    "nowrap",
      }}
    >
      {status || "—"}
    </span>
  );
};

/* ─────────────────────────────────────────────
    Inline StatCard — lives in the toolbar row
    Visible only when data rows exist
    Now CLICKABLE to act as an inline filter
───────────────────────────────────────────── */
const StatCard = ({ label, value, bg, color, border, active, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background:   bg,
      border:       active ? `2px solid ${color}` : `1px solid ${border}`,
      borderRadius: 8,
      padding:      active ? "2px 10px 3px" : "3px 11px 4px",
      display:      "flex",
      flexDirection:"column",
      alignItems:   "flex-start",
      minWidth:     64,
      cursor:       "pointer",
      transition:   "all 0.2s ease",
      transform:    active ? "scale(1.07)" : "scale(1)",
      boxShadow:    active ? `0 2px 12px ${color}33` : "none",
      userSelect:   "none",
    }}
  >
    <span style={{ fontSize: 9, color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", lineHeight: 1.4 }}>
      {label}
    </span>
    <span style={{ fontSize: 16, fontWeight: 700, color, lineHeight: 1.15 }}>
      {value}
    </span>
  </div>
);

/* columns that render as a badge */
const STATUS_COLUMNS = ["status", "pr_status", "pi_status", "pq_status", "Status"];

/* ─────────────────────────────────────────────
    Grid  —  shared, generic, NO filters
    Filters belong to each individual list page.

    NEW PROP: stats
    ───────────────
    Optional array of stat card objects to show
    in the toolbar row beside Add / Reload.
    Cards are hidden when:
      • stats prop is not passed / empty, OR
      • data array is empty (no records loaded yet)

    Example usage in a list page:
      <Grid
        stats={[
          { label: "Total",    value: 42, bg: "#f8fafc", color: "#334155", border: "#cbd5e1" },
          { label: "Draft",    value: 10, bg: "#f1f5f9", color: "#475569", border: "#cbd5e1" },
          { label: "Pending",  value: 5,  bg: "#fef9c3", color: "#854d0e", border: "#fde047" },
          { label: "Approved", value: 27, bg: "#dcfce7", color: "#166534", border: "#86efac" },
        ]}
        ...
      />
───────────────────────────────────────────── */
const Grid = ({
  title         = "Data Grid",
  data          = [],
  totalRecords  = 0,
  currentPage   = 1,
  pageSize      = 10,
  ignoreColumns = [],
  stats         = [],   // optional stat cards (clickable for filtering)
  filters       = [],   // Array of { key, label, options, value }
  onFilterChange= () => {}, // Callback
  onClearFilters= () => {}, // Callback
  onStatClick   = null,     // NEW: (label) => void — fires when a stat card is clicked
  activeStatLabel = "",     // NEW: which stat card is currently active

  // Callbacks
  onPageChange = () => {},
  onSearch     = () => {},
  onAdd        = () => {},
  onReload     = () => {},
  onEdit       = () => {},
  onDelete     = () => {},
  onView       = () => {},
  onApprove    = () => {},
  onReject     = () => {},
  onFinalize   = () => {},
  onPaid       = () => {},
  onExportPdf  = () => {},

  // Pass showApprove={true} ONLY on list pages that need approval.
  showApprove = false,
  showFinalize = false,
  showPaid = false,
  showExportPdf = false,
}) => {
  const [searchText, setSearchText] = useState("");

  /* ── Permissions from DB ── */
  const { getPagePerms, user } = useAuth();
  const perms = getPagePerms(window.location.pathname);

  const canView    = perms?.can_view   === 1;
  const canAdd     = perms?.can_add    === 1;
  const canEdit    = perms?.can_edit   === 1;
  const canDelete  = perms?.can_delete === 1;
  const canApprove = showApprove && (user?.isAdmin || perms?.can_approve === 1);
  const canFinalize = showFinalize && (user?.isAdmin || perms?.can_approve === 1);
  const canPaid = showPaid && (user?.isAdmin || perms?.can_approve === 1);
  const canExportPdf = showExportPdf;

  /* ── Columns ── */
  const formatHeader = (text) => {
    if (STATUS_COLUMNS.includes(text)) return "Status";
    return text.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const columns = useMemo(() => {
    if (!data.length) return [];
    return Object.keys(data[0]).filter((c) => !ignoreColumns.includes(c));
  }, [data, ignoreColumns]);

  const totalPages     = Math.ceil(totalRecords / pageSize);
  const showActionsCol = canView || canEdit || canDelete || canApprove || canFinalize || canPaid || canExportPdf;

  /* Stat cards visible when stats were passed (even if filtered data is empty) */
  const showStats = Array.isArray(stats) && stats.length > 0;

  return (
    <Card title={title}>

      {/* ══════════════════════════════════════
          TOOLBAR — Add / Reload / Stats / Search
      ══════════════════════════════════════ */}
<div className="flex flex-wrap items-center justify-between mb-5 gap-4">
        
        {/* Left: Actions + Stats */}
        <div className="flex items-center gap-2 flex-wrap">
          {canAdd && (
            <button onClick={onAdd} className="bg-[#393E46] text-[#DFD0B8] px-4 py-2 rounded shadow-sm hover:bg-[#222831] transition-all border border-[#DFD0B8]/10 text-sm flex items-center gap-2">
              <FaPlus size={11} /> Add New
            </button>
          )}
          <button onClick={onReload} className="border border-[#393E46] text-[#393E46] px-4 py-2 rounded hover:bg-[#393E46] hover:text-[#DFD0B8] transition-all text-sm flex items-center gap-2">
            <FaSyncAlt size={11} /> Reload
          </button>

          {showStats && (
            <>
              <div style={{ width: 1, height: 32, background: "#393E46", opacity: 0.2, margin: "0 4px" }} />
              {stats.map((s) => (
                <StatCard
                  key={s.label}
                  {...s}
                  active={activeStatLabel === s.label}
                  onClick={() => onStatClick && onStatClick(s.label)}
                />
              ))}
            </>
          )}
        </div>

        {/* Right: Search */}
        <div className="flex items-center gap-2 border border-[#393E46]/40 rounded-lg px-3 py-2 w-full md:w-64 focus-within:ring-2 focus-within:ring-[#393E46]">
          <FaSearch className="text-[#393E46]" size={13} />
          <input
            className="bg-transparent outline-none text-sm w-full"
            placeholder="Search records..."
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              onSearch(e.target.value);
            }}
          />
        </div>
      </div>


      {/* ══════════════════════════════════════
          TABLE
      ══════════════════════════════════════ */}
      {!data.length ? (
        <div className="text-center py-20 rounded-lg border-2 border-dashed text-[#393E46]">
          <p className="text-lg font-medium">No records found</p>
          <p className="text-sm opacity-70">Try adjusting your search or add a new entry.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-[#393E46] rounded-xl shadow-sm custom-scrollbar-transparent">
          <table className="min-w-[1100px] w-full border-collapse">

            <thead className="bg-[#222831] text-[#DFD0B8]">
              <tr>
                {showActionsCol && (
                  <th
                    className="px-4 py-4 text-center border-r border-[#393E46]/50 uppercase text-xs tracking-wider"
                    style={{ width: 120 }}
                  >
                    Actions
                  </th>
                )}
                {columns.map((col, i) => (
                  <th
                    key={col}
                    className={`px-4 py-4 text-center whitespace-nowrap uppercase text-xs tracking-wider ${
                      i !== columns.length - 1 ? "border-r border-[#393E46]/50" : ""
                    }`}
                  >
                    {formatHeader(col)}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.map((row, i) => {
                const rawStatus = row.status || row.pq_status || row.pi_status || row.pr_status || "";
                const rowStatus = rawStatus.toLowerCase();
                const isPending = rowStatus === "pending" || rowStatus === "sent";
                const isApprovedOrRejected = rowStatus === "approved" || rowStatus === "rejected"||rowStatus ==="finalized"|| rowStatus ==="paid";

                return (
                  <tr key={i} className="border-b transition-colors hover:bg-slate-50">

                    {showActionsCol && (
                      <td className="text-center border-r px-2">
                        <div className="flex justify-center items-center gap-4 py-3">

                          {canView && (
                            <FaEye
                              size={14}
                              className="text-[#393E46] cursor-pointer hover:scale-125 transition-transform"
                              onClick={() => onView(row)}
                              title="View"
                            />
                          )}

                          {canEdit && !isApprovedOrRejected && (
                            <FaEdit
                              size={14}
                              className="text-[#393E46] cursor-pointer hover:scale-125 transition-transform"
                              onClick={() => onEdit(row)}
                              title="Edit"
                            />
                          )}

                          {canDelete && !isApprovedOrRejected && (
                            <FaTrashAlt
                              size={14}
                              className="text-[#393E46] cursor-pointer hover:scale-125 transition-transform"
                              onClick={() => onDelete(row)}
                              title="Delete"
                            />
                          )}

                          {canApprove && isPending && (
                            <>
                              <FaCheck
                                size={14}
                                className="text-[#393E46] cursor-pointer hover:scale-125 transition-transform"
                                onClick={() => onApprove(row)}
                                title="Approve"
                              />
                              <FaTimes
                                size={14}
                                className="text-[#393E46] cursor-pointer hover:scale-125 transition-transform"
                                onClick={() => onReject(row)}
                                title="Reject"
                              />
                            </>
                          )}

                          {canFinalize && rowStatus === "approved" && (
                            <FaRegThumbsUp
                              size={14}
                              className="text-[#393E46] cursor-pointer hover:scale-125 transition-transform"
                              onClick={() => onFinalize(row)}
                              title="Finalize"
                            />
                          )}

                          {canPaid && (rowStatus === "approved" || rowStatus === "finalized") && (
                            <FaMoneyBillWave
                              size={14}
                              className="text-[#393E46] cursor-pointer hover:scale-125 transition-transform"
                              onClick={() => onPaid(row)}
                              title="Mark as Paid"
                            />
                          )}

                          {canExportPdf && rowStatus === "paid" && (
                            <FaRegFileAlt
                              size={14}
                              className="text-[#393E46] cursor-pointer hover:scale-125 transition-transform"
                              onClick={() => onExportPdf(row)}
                              title="Export PDF"
                            />
                          )}

                        </div>
                      </td>
                    )}

                    {columns.map((col, ci) => (
                      <td
                        key={col}
                        className={`px-4 py-3 text-center text-[#222831] whitespace-nowrap text-sm ${
                          ci !== columns.length - 1 ? "border-r border-gray-200" : ""
                        }`}
                      >
                        {STATUS_COLUMNS.includes(col)
                          ? <StatusBadge status={row[col]} />
                          : (row[col] ?? "—")}
                      </td>
                    ))}

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ══════════════════════════════════════
          PAGINATION
      ══════════════════════════════════════ */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-5">

          <p className="text-sm text-gray-500">
            Showing page {currentPage} of {totalPages} ({totalRecords} records)
          </p>

          <div className="flex items-center gap-3">

            {/* FIRST PAGE */}
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="text-sm px-2 py-1 border rounded disabled:opacity-40"
            >
              First
            </button>

            {/* PREVIOUS */}
            <button
             onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              {"<<"}
            </button>

            {/* CURRENT PAGE */}
            <span className="px-4 py-1 bg-[#222831] text-[#DFD0B8] rounded font-semibold">
              {currentPage}
            </span>

            {/* NEXT */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              {">>"}
            </button>

            {/* LAST PAGE */}
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="text-sm px-2 py-1 border rounded disabled:opacity-40"
            >
              Last
            </button>

          </div>
        </div>
      )}
    </Card>
  );
};

export default Grid;