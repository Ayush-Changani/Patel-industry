import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/axios";
import Swal from "sweetalert2";

import Card from "../../../components/Card";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import Sidebar from "../../../components/Sidebar";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";
import Select from "../../../components/Select";

/* ─────────────────────────────────────────────
    Helpers
───────────────────────────────────────────── */
const today = () => new Date().toISOString().split("T")[0];

const formatGRNNumber = (num) => {
  const year = new Date().getFullYear();
  return `GRN-${year}-${String(num).padStart(5, "0")}`;
};

const statusBadgeStyle = (status) => {
  const map = {
    Draft:    { background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1" },
    Pending:  { background: "#fef9c3", color: "#854d0e", border: "1px solid #fde047" },
    Approved: { background: "#dcfce7", color: "#166534", border: "1px solid #86efac" },
    Rejected: { background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" },
  };
  return map[status] || map.Draft;
};

const discrepancyStyle = (ordered, received) => {
  const o = parseFloat(ordered || 0);
  const r = parseFloat(received || 0);
  if (!o || !r) return {};
  if (r < o) return { background: "#fef9c3", color: "#854d0e" };
  if (r > o) return { background: "#fce7f3", color: "#9d174d" };
  return { background: "#dcfce7", color: "#166534" };
};

const getDiscrepancyLabel = (ordered, received) => {
  const o = parseFloat(ordered || 0);
  const r = parseFloat(received || 0);
  if (!o || !r) return null;
  const diff = r - o;
  if (diff === 0) return { text: "✓ Exact", color: "#166534" };
  if (diff < 0)  return { text: `▼ Short ${Math.abs(diff)}`, color: "#854d0e" };
  return { text: `▲ Excess ${diff}`, color: "#9d174d" };
};

const readonlyCell = "w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-400 focus:outline-none cursor-default";
const editCell     = "w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#393E46]/30 bg-white text-[#222831] focus:outline-none focus:ring-1 focus:ring-[#393E46] transition placeholder-[#393E46]/40";

const emptyItem = () => ({
  grni_id:              null,
  grni_po_item_id:      null,
  grni_item_id:         null,
  itemName:             "",
  itemCode:             "",
  category:             "",
  uom:                  "",
  grni_ordered_qty:     "",
  grni_received_qty:    "",
  grni_rejected_qty:    "0",
  grni_discrepancy_notes: "",
  grni_unit_price:      "",
  grni_gst_percent:     18,
});

/* ─────────────────────────────────────────────
    Component
───────────────────────────────────────────── */
const GRN_form = () => {
  const location               = useLocation();
  const navigate               = useNavigate();
  const query                  = new URLSearchParams(location.search);
  const { user, getPagePerms } = useAuth();

  const editId    = query.get("eid");
  const viewId    = query.get("view_id");
  const poId      = query.get("po_id");    // pre-link from PO list
  const isEdit    = Boolean(editId);
  const isView    = Boolean(viewId);
  const currentId = editId || viewId || 0;

  const perms = getPagePerms("/GRN_form");

  /* ── Form state ── */
  const [form, setForm] = useState({
    grnNumber:               "",
    grnDate:                 today(),
    receivedDate:            today(),
    deliveryChallanNumber:   "",
    remarks:                 "",
    grnStatus:               "Draft",
  });

  const [linkedPO,       setLinkedPO]       = useState(null);
  const [poOptions,      setPOOptions]      = useState([]);
  const [vendor,         setVendor]         = useState(null);
  const [storeLocation,  setStoreLocation]  = useState(null);
  const [storeOptions,   setStoreOptions]   = useState([]);
  const [items,          setItems]          = useState([emptyItem()]);
  const [loading,        setLoading]        = useState(false);
  const [submitAction,   setSubmitAction]   = useState("draft");
  const [errors,         setErrors]         = useState({});

  const ErrorMsg = ({ name }) =>
    errors[name]?.message ? (
      <p style={{ color: "#F63049" }} className="text-xxxs mt-1">{errors[name].message}</p>
    ) : null;

  /* ─────────────────────────────────────────────
      FETCH: GRN Number
  ───────────────────────────────────────────── */
  useEffect(() => {
    if (!isEdit && !isView) {
      api.get("/i_pi_get_next_grn_number")
        .then((res) => {
          if (res.data?.Status === 1)
            setForm((f) => ({ ...f, grnNumber: formatGRNNumber(res.data.Result) }));
        })
        .catch(() => setForm((f) => ({ ...f, grnNumber: formatGRNNumber(1) })));
    }
  }, [isEdit, isView]);

  /* ─────────────────────────────────────────────
      FETCH: Store Locations
  ───────────────────────────────────────────── */
  useEffect(() => {
    api.get("/i_pi_get_store_location_ddl")
      .then((res) => {
        if (res.data?.Status === 1)
          setStoreOptions(res.data.Result.map((r) => ({ value: r.value, label: r.label })));
      })
      .catch(console.error);
  }, []);

  /* ─────────────────────────────────────────────
      FETCH: Approved PO dropdown
  ───────────────────────────────────────────── */
  const fetchPOs = async (search = "") => {
    try {
      const res = await api.get("/i_pi_get_approved_po_ddl", { params: { SearchTerm: search } });
      if (res.data?.Status === 1)
        setPOOptions(res.data.Result.map((r) => ({ value: r.po_id, label: r.po_number })));
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchPOs();
    if (poId) loadFromPO(poId);
  }, []);

  /* ─────────────────────────────────────────────
      Auto-fill from Approved PO
  ───────────────────────────────────────────── */
  const loadFromPO = async (id) => {
    try {
      const res = await api.get("/i_pi_grn_prefill_from_po", { params: { po_id: id } });
      if (res.data?.Status === 1 && res.data.Result?.length > 0) {
        const h = res.data.Result[0];

        setLinkedPO({ value: h.po_id, label: h.po_number });
        setVendor({ value: h.po_vendor_id, label: h.vendor_name });

        setForm((f) => ({
          ...f,
          deliveryAddress: h.po_delivery_address || "",
        }));

        const rows = res.data.Result.map((r) => ({
          grni_id:              null,
          grni_po_item_id:      r.po_item_id,
          grni_item_id:         r.item_id,
          itemName:             r.item_name,
          itemCode:             r.item_code,
          category:             r.item_category,
          uom:                  r.uom_name,
          grni_ordered_qty:     r.ordered_qty?.toString() || "",
          grni_received_qty:    "",
          grni_rejected_qty:    "0",
          grni_discrepancy_notes: "",
          grni_unit_price:      r.unit_price?.toString() || "",
          grni_gst_percent:     r.gst_percent ?? 18,
        }));
        setItems(rows.length > 0 ? rows : [emptyItem()]);
      }
    } catch (err) { console.error(err); }
  };

  /* ─────────────────────────────────────────────
      FETCH: Edit / View data
  ───────────────────────────────────────────── */
  useEffect(() => {
    const fetchDetails = async () => {
      if (!currentId || currentId === "0" || currentId === 0) return;
      try {
        const res = await api.get("/i_pi_grn_select_all_and_id", { params: { grn_id: currentId } });
        if (res.data?.Status === 1 && res.data.Result?.length > 0) {
          const h = res.data.Result[0];
          setForm({
            grnNumber:               h.grn_number || "",
            grnDate:                 h.grn_date?.split(/[\sT]/)[0] || today(),
            receivedDate:            h.grn_received_date?.split(/[\sT]/)[0] || today(),
            deliveryChallanNumber:   h.grn_delivery_challan_number || "",
            remarks:                 h.grn_remarks || "",
            grnStatus:               h.grn_status || "Draft",
          });
          setLinkedPO({ value: h.grn_po_id, label: h.po_number || "" });
          setVendor(h.grn_vendor_id ? { value: h.grn_vendor_id, label: h.vendor_name || "" } : null);
          if (h.grn_store_location_id)
            setStoreLocation({ value: h.grn_store_location_id, label: h.store_location_name || "" });
        }

        const iRes = await api.get("/i_pi_grn_items_select", { params: { grn_id: currentId } });
        if (iRes.data?.Status === 1 && iRes.data.Result?.length > 0) {
          setItems(iRes.data.Result.map((r) => ({
            grni_id:                r.grni_id,
            grni_po_item_id:        r.grni_po_item_id,
            grni_item_id:           r.grni_item_id,
            itemName:               r.item_name,
            itemCode:               r.item_code,
            category:               r.item_category,
            uom:                    r.uom_name,
            grni_ordered_qty:       r.grni_ordered_qty?.toString() || "",
            grni_received_qty:      r.grni_received_qty?.toString() || "",
            grni_rejected_qty:      r.grni_rejected_qty?.toString() || "0",
            grni_discrepancy_notes: r.grni_discrepancy_notes || "",
            grni_unit_price:        r.grni_unit_price?.toString() || "",
            grni_gst_percent:       r.grni_gst_percent ?? 18,
          })));
        } else {
          setItems([emptyItem()]);
        }
      } catch (err) { console.error(err); }
    };
    fetchDetails();
  }, [currentId]);

  /* ─────────────────────────────────────────────
      Item field change
  ───────────────────────────────────────────── */
  const handleItemField = (idx, field, value) =>
    setItems((prev) => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));

  /* ─────────────────────────────────────────────
      Summary calculations
  ───────────────────────────────────────────── */
  const totalOrdered  = items.reduce((s, it) => s + parseFloat(it.grni_ordered_qty  || 0), 0);
  const totalReceived = items.reduce((s, it) => s + parseFloat(it.grni_received_qty || 0), 0);
  const totalRejected = items.reduce((s, it) => s + parseFloat(it.grni_rejected_qty || 0), 0);
  const totalAccepted = totalReceived - totalRejected;
  const fulfilmentPct = totalOrdered > 0 ? Math.min(100, Math.round((totalReceived / totalOrdered) * 100)) : 0;

  /* ─────────────────────────────────────────────
      Validation
  ───────────────────────────────────────────── */
  const validateForm = () => {
    const newErrors = {};
    if (!linkedPO)             newErrors.linkedPO       = { message: "Please link an Approved Purchase Order" };
    if (!form.receivedDate)    newErrors.receivedDate   = { message: "Received date is required" };
    if (!storeLocation)        newErrors.storeLocation  = { message: "Store location is required" };

    const hasValidItem = items.some(
      (it) => it.grni_item_id && parseFloat(it.grni_received_qty) >= 0
    );
    if (!hasValidItem)         newErrors.items          = { message: "At least one item with received qty is required" };

    items.forEach((it, idx) => {
      if (!it.grni_item_id) return;
      const recv = parseFloat(it.grni_received_qty);
      const rej  = parseFloat(it.grni_rejected_qty || 0);
      if (isNaN(recv) || recv < 0)
        newErrors[`recv_${idx}`] = { message: "Qty ≥ 0" };
      if (rej > recv)
        newErrors[`rej_${idx}`]  = { message: "Rejected ≤ Received" };
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ─────────────────────────────────────────────
      Submit
  ───────────────────────────────────────────── */
  const handleSubmit = async (action) => {
    if (isView || !validateForm()) return;
    setLoading(true);

    const payload = {
      grn_id:                       currentId,
      grn_number:                   form.grnNumber,
      grn_po_id:                    linkedPO?.value || 0,
      grn_vendor_id:                vendor?.value   || 0,
      grn_received_date:            form.receivedDate,
      grn_delivery_challan_number:  form.deliveryChallanNumber,
      grn_store_location_id:        storeLocation?.value || 0,
      grn_remarks:                  form.remarks,
      grn_status:                   action === "submit" ? "Pending" : "Draft",
      grn_created_by_user_id:       user?.id || 0,
      items: items
        .filter((it) => it.grni_item_id && parseFloat(it.grni_received_qty) >= 0)
        .map((it) => ({
          grni_po_item_id:          it.grni_po_item_id || 0,
          grni_item_id:             it.grni_item_id,
          grni_ordered_qty:         parseFloat(it.grni_ordered_qty  || 0),
          grni_received_qty:        parseFloat(it.grni_received_qty || 0),
          grni_rejected_qty:        parseFloat(it.grni_rejected_qty || 0),
          grni_discrepancy_notes:   it.grni_discrepancy_notes || "",
          grni_unit_price:          parseFloat(it.grni_unit_price   || 0),
          grni_gst_percent:         parseFloat(it.grni_gst_percent  || 0),
        })),
    };

    try {
      const res = await api.post("/i_pi_grn_insert_update", payload);
      if (res.data?.status === 1 || res.data?.Status === 1) {
        Swal.fire("Success", res.data?.message || res.data?.Message || "GRN saved.", "success");
        navigate("/GRN_list");
      } else {
        Swal.fire("Error", res.data?.message || res.data?.Message || "Failed to save.", "error");
      }
    } catch { Swal.fire("Error", "Server error.", "error"); }
    finally  { setLoading(false); }
  };

  /* ─────────────────────────────────────────────
      Render
  ───────────────────────────────────────────── */
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col h-full overflow-hidden">
        <Header />

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar-sidebar">
          <div className="max-w-6xl mx-auto pb-8">
            <Card title="Goods Received Note">
              <div className="p-4 space-y-6">

                {/* Status + mode badges */}
                {(isEdit || isView) && (
                  <div className="flex justify-end items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold border"
                      style={statusBadgeStyle(form.grnStatus)}>
                      {form.grnStatus}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-300">
                      {isView ? "View" : "Edit"}
                    </span>
                  </div>
                )}

                {/* ═══════════════════════════════════
                    SECTION 1 — GRN Header
                ═══════════════════════════════════ */}
                <Card title="GRN Header">
                  <div className="p-4 space-y-4">

                    <div className="grid grid-cols-3 gap-4">
                      <Input label="GRN Number" value={form.grnNumber} disabled readOnly />
                      <Input label="GRN Date"   value={form.grnDate}   type="date" disabled readOnly />
                      <div>
                        <Select
                          label="Purchase Order"
                          value={linkedPO}
                          options={poOptions}
                          onChange={(val) => {
                            setLinkedPO(val);
                            setErrors((p) => { const n = { ...p }; delete n.linkedPO; return n; });
                            if (val) loadFromPO(val.value);
                            else {
                              setVendor(null);
                              setItems([emptyItem()]);
                            }
                          }}
                          searchable serverSearch onSearch={fetchPOs}
                          required disabled={isView}
                          placeholder="Select approved PO..."
                        />
                        <ErrorMsg name="linkedPO" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {/* Vendor — auto-filled from PO */}
                      <Input label="Vendor" value={vendor?.label || ""} disabled readOnly />

                      <div>
                        <Input
                          label="Received Date" type="date"
                          value={form.receivedDate}
                          onChange={(e) => {
                            setForm({ ...form, receivedDate: e.target.value });
                            setErrors((p) => { const n = { ...p }; delete n.receivedDate; return n; });
                          }}
                          disabled={isView} required
                        />
                        <ErrorMsg name="receivedDate" />
                      </div>

                      <div>
                        <Select
                          label="Store Location"
                          value={storeLocation}
                          options={storeOptions}
                          onChange={(val) => {
                            setStoreLocation(val);
                            setErrors((p) => { const n = { ...p }; delete n.storeLocation; return n; });
                          }}
                          required disabled={isView}
                          placeholder="Select store location..."
                        />
                        <ErrorMsg name="storeLocation" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Delivery Challan Number"
                        value={form.deliveryChallanNumber}
                        onChange={(e) => setForm({ ...form, deliveryChallanNumber: e.target.value })}
                        placeholder="Challan / Invoice number from vendor..."
                        disabled={isView}
                      />
                      <Input
                        label="Remarks"
                        value={form.remarks}
                        onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                        placeholder="Internal remarks..."
                        disabled={isView}
                      />
                    </div>

                  </div>
                </Card>

                {/* ═══════════════════════════════════
                    SECTION 2 — Receipt Summary Cards
                ═══════════════════════════════════ */}
                {items.some((it) => it.grni_item_id) && (
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: "Total Ordered",  value: totalOrdered,  color: "#334155", bg: "#f8fafc", border: "#cbd5e1" },
                      { label: "Total Received", value: totalReceived, color: "#166534", bg: "#dcfce7", border: "#86efac" },
                      { label: "Total Rejected", value: totalRejected, color: "#991b1b", bg: "#fee2e2", border: "#fca5a5" },
                      { label: "Total Accepted", value: totalAccepted, color: "#1e40af", bg: "#dbeafe", border: "#93c5fd" },
                    ].map((card, i) => (
                      <div key={i} className="rounded-xl p-3 text-center"
                        style={{ background: card.bg, border: `1px solid ${card.border}` }}>
                        <div className="text-lg font-extrabold" style={{ color: card.color }}>
                          {card.value.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 3 })}
                        </div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider mt-0.5"
                          style={{ color: card.color, opacity: 0.7 }}>
                          {card.label}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Fulfilment progress bar */}
                {items.some((it) => it.grni_item_id && it.grni_received_qty) && (
                  <div className="rounded-xl px-4 py-3"
                    style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-semibold text-[#393E46]">Fulfilment Rate</span>
                      <span className="text-xs font-bold text-[#222831]">{fulfilmentPct}%</span>
                    </div>
                    <div className="w-full rounded-full h-2" style={{ background: "#e2e8f0" }}>
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${fulfilmentPct}%`,
                          background: fulfilmentPct === 100 ? "#16a34a"
                            : fulfilmentPct >= 80 ? "#eab308"
                            : "#dc2626",
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* ═══════════════════════════════════
                    SECTION 3 — Item Details
                ═══════════════════════════════════ */}
                <Card title="Item Receipt Details">
                  <div className="p-4 space-y-3">

                    {/* Column headers */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl select-none"
                      style={{ background: "#222831" }}>
                      <span style={{ width: "28px",  flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8] text-center">#</span>
                      <span style={{ width: "160px", flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8]">Item</span>
                      <span style={{ width: "80px",  flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8]">Code</span>
                      <span style={{ width: "80px",  flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8]">Category</span>
                      <span style={{ width: "44px",  flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8] text-center">UoM</span>
                      <span style={{ width: "76px",  flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8] text-right">Ordered</span>
                      <span style={{ width: "76px",  flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8] text-right">Received</span>
                      <span style={{ width: "76px",  flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8] text-right">Rejected</span>
                      <span style={{ width: "72px",  flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8] text-center">Status</span>
                      <span style={{ flex: 1        }}               className="text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8]">Discrepancy Notes</span>
                    </div>

                    {/* Item rows */}
                    {items.map((item, idx) => {
                      const discLabel  = getDiscrepancyLabel(item.grni_ordered_qty, item.grni_received_qty);
                      const rowStyle   = discrepancyStyle(item.grni_ordered_qty, item.grni_received_qty);
                      const isEven     = idx % 2 === 0;
                      const recv       = parseFloat(item.grni_received_qty || 0);
                      const rej        = parseFloat(item.grni_rejected_qty || 0);
                      const accepted   = Math.max(0, recv - rej);

                      return (
                        <div key={idx}
                          style={{
                            display: "flex", alignItems: "center", gap: "8px",
                            padding: "8px 12px", borderRadius: "12px",
                            background: isEven ? "#f8fafc" : "#fff",
                            border: `1px solid ${isEven ? "#e2e8f0" : "#f1f5f9"}`,
                            boxShadow: "0 1px 3px rgba(0,0,0,.04)"
                          }}>

                          {/* # */}
                          <div style={{ width: "28px", flexShrink: 0 }} className="flex items-center justify-center">
                            <span className="text-[10px] font-bold text-[#393E46] flex items-center justify-center rounded-full"
                              style={{ width: "20px", height: "20px", background: isEven ? "#e2e8f0" : "#f1f5f9" }}>
                              {idx + 1}
                            </span>
                          </div>

                          {/* Item name — read-only */}
                          <div style={{ width: "160px", flexShrink: 0 }}>
                            <input type="text" value={item.itemName} readOnly className={readonlyCell} />
                          </div>
                          {/* Code */}
                          <div style={{ width: "80px", flexShrink: 0 }}>
                            <input type="text" value={item.itemCode} readOnly className={readonlyCell} />
                          </div>
                          {/* Category */}
                          <div style={{ width: "80px", flexShrink: 0 }}>
                            <input type="text" value={item.category} readOnly className={readonlyCell} />
                          </div>
                          {/* UoM */}
                          <div style={{ width: "44px", flexShrink: 0 }} className="flex justify-center">
                            {item.uom
                              ? <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                                  style={{ background: "#ede9fe", color: "#6d28d9", border: "1px solid #ddd6fe" }}>
                                  {item.uom}
                                </span>
                              : <span className="text-slate-300 text-xs">—</span>
                            }
                          </div>

                          {/* Ordered Qty — read-only */}
                          <div style={{ width: "76px", flexShrink: 0 }}>
                            <input type="text"
                              value={item.grni_ordered_qty || "—"}
                              readOnly className={`${readonlyCell} text-right font-semibold`} />
                          </div>

                          {/* Received Qty — editable */}
                          <div style={{ width: "76px", flexShrink: 0 }}>
                            <input type="number"
                              value={item.grni_received_qty}
                              disabled={isView}
                              placeholder="0"
                              onChange={(e) => {
                                handleItemField(idx, "grni_received_qty", e.target.value);
                                setErrors((p) => { const n = { ...p }; delete n[`recv_${idx}`]; delete n.items; return n; });
                              }}
                              className={`w-full px-2 py-1.5 text-xs rounded-lg border text-right font-semibold focus:outline-none focus:ring-1 transition ${
                                errors[`recv_${idx}`]
                                  ? "border-rose-400 bg-rose-50 text-rose-600 focus:ring-rose-300"
                                  : "border-[#393E46]/30 bg-white text-[#222831] focus:ring-[#393E46]"
                              }`}
                              style={{ appearance: "textfield" }}
                            />
                            {errors[`recv_${idx}`] && (
                              <p style={{ color: "#F63049" }} className="text-[9px] mt-0.5 text-right">
                                {errors[`recv_${idx}`].message}
                              </p>
                            )}
                          </div>

                          {/* Rejected Qty — editable */}
                          <div style={{ width: "76px", flexShrink: 0 }}>
                            <input type="number"
                              value={item.grni_rejected_qty}
                              disabled={isView}
                              placeholder="0"
                              onChange={(e) => {
                                handleItemField(idx, "grni_rejected_qty", e.target.value);
                                setErrors((p) => { const n = { ...p }; delete n[`rej_${idx}`]; return n; });
                              }}
                              className={`w-full px-2 py-1.5 text-xs rounded-lg border text-right font-semibold focus:outline-none focus:ring-1 transition ${
                                errors[`rej_${idx}`]
                                  ? "border-rose-400 bg-rose-50 text-rose-600 focus:ring-rose-300"
                                  : "border-[#393E46]/30 bg-white text-[#222831] focus:ring-[#393E46]"
                              }`}
                              style={{ appearance: "textfield" }}
                            />
                            {errors[`rej_${idx}`] && (
                              <p style={{ color: "#F63049" }} className="text-[9px] mt-0.5 text-right">
                                {errors[`rej_${idx}`].message}
                              </p>
                            )}
                          </div>

                          {/* Discrepancy status badge */}
                          <div style={{ width: "72px", flexShrink: 0 }} className="flex flex-col items-center gap-0.5">
                            {discLabel ? (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-center w-full"
                                style={{
                                  background: discLabel.color === "#166534" ? "#dcfce7"
                                    : discLabel.color === "#854d0e" ? "#fef9c3" : "#fce7f3",
                                  color: discLabel.color,
                                  border: `1px solid ${
                                    discLabel.color === "#166534" ? "#86efac"
                                    : discLabel.color === "#854d0e" ? "#fde047" : "#fbcfe8"
                                  }`,
                                }}>
                                {discLabel.text}
                              </span>
                            ) : (
                              <span className="text-slate-300 text-[9px]">—</span>
                            )}
                            {recv > 0 && (
                              <span className="text-[9px] text-[#393E46]">
                                Acc: {accepted.toLocaleString("en-IN", { maximumFractionDigits: 3 })}
                              </span>
                            )}
                          </div>

                          {/* Discrepancy Notes */}
                          <div style={{ flex: 1 }}>
                            <input
                              type="text"
                              value={item.grni_discrepancy_notes}
                              disabled={isView}
                              placeholder="Notes on discrepancy, damage, short delivery..."
                              onChange={(e) => handleItemField(idx, "grni_discrepancy_notes", e.target.value)}
                              className={isView ? readonlyCell : editCell}
                            />
                          </div>

                        </div>
                      );
                    })}

                    {errors.items?.message && (
                      <p style={{ color: "#F63049" }} className="text-xxxs px-1 flex items-center gap-1">
                        <span>⚠</span> {errors.items.message}
                      </p>
                    )}
                  </div>
                </Card>

                {/* ═══════════════════════════════════
                    ACTION BUTTONS
                ═══════════════════════════════════ */}
                <div className="flex justify-center gap-4 pt-4">
                  {!isView ? (
                    <>
                      <Button variant="cancel" onClick={() => navigate("/GRN_list")}>Cancel</Button>
                      <Button variant="update" disabled={loading}
                        onClick={() => { setSubmitAction("draft"); handleSubmit("draft"); }}>
                        {loading && submitAction === "draft" ? "Saving..." : "Save Draft"}
                      </Button>
                      <Button variant="submit" disabled={loading}
                        onClick={() => { setSubmitAction("submit"); handleSubmit("submit"); }}>
                        {loading && submitAction === "submit" ? "Submitting..." : "Submit for Approval"}
                      </Button>
                    </>
                  ) : (
                    <Button variant="cancel" onClick={() => navigate("/GRN_list")}>Cancel</Button>
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

export default GRN_form;