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

const formatPONumber = (num) => {
  const year = new Date().getFullYear();
  return `PO-${year}-${String(num).padStart(5, "0")}`;
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

const GST_OPTIONS = [
  { value: 0,  label: "0%"  },
  { value: 5,  label: "5%"  },
  { value: 12, label: "12%" },
  { value: 18, label: "18%" },
  { value: 28, label: "28%" },
];

const SUPPLY_TYPE_OPTIONS = [
  { value: "Intra", label: "Intra-State (CGST + SGST)" },
  { value: "Inter", label: "Inter-State (IGST)"         },
];

const emptyItem = () => ({
  poi_id:           null,
  pr_item_id:       null,
  itemId:           null,
  itemName:         "",
  itemCode:         "",
  category:         "",
  uom:              "",
  qty:              "",
  unitPrice:        "",
  discountPct:      "",
  gst:              { value: 18, label: "18%" },
  remarks:          "",
});

const calcItem = (item) => {
  const qty      = parseFloat(item.qty       || 0);
  const price    = parseFloat(item.unitPrice || 0);
  const disc     = parseFloat(item.discountPct || 0) / 100;
  const gstPct   = item.gst?.value ?? 0;
  const baseAmt  = qty * price * (1 - disc);
  const gstAmt   = baseAmt * (gstPct / 100);
  return { baseAmt, gstAmt, totalAmt: baseAmt + gstAmt, gstPct };
};

const readonlyCell = "w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-400 focus:outline-none cursor-default";
const editCell     = "w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#393E46]/30 bg-white text-[#222831] focus:outline-none focus:ring-1 focus:ring-[#393E46] transition placeholder-[#393E46]/40";

/* ─────────────────────────────────────────────
    Component
───────────────────────────────────────────── */
const Purchase_Order_form = () => {
  const location               = useLocation();
  const navigate               = useNavigate();
  const query                  = new URLSearchParams(location.search);
  const { user, getPagePerms } = useAuth();

  const editId    = query.get("eid");
  const viewId    = query.get("view_id");
  const pqId      = query.get("pq_id");   // pre-link from PQ list
  const isEdit    = Boolean(editId);
  const isView    = Boolean(viewId);
  const currentId = editId || viewId || 0;

  const perms = getPagePerms("/Purchase_Order_form");

  /* ── Form state ── */
  const [form, setForm] = useState({
    poNumber:         "",
    poDate:           today(),
    expectedDelivery: "",
    poStatus:         "Draft",
    supplyType:       { value: "Intra", label: "Intra-State (CGST + SGST)" },
    deliveryAddress:  "",
    termsConditions:  "",
    remarks:          "",
  });

  const [linkedPQ,          setLinkedPQ]         = useState(null);
  const [pqOptions,         setPQOptions]        = useState([]);
  const [vendor,            setVendor]           = useState(null);
  const [entity,            setEntity]           = useState(null);
  const [department,        setDepartment]       = useState(null);
  const [items,             setItems]            = useState([emptyItem()]);
  const [loading,           setLoading]          = useState(false);
  const [submitAction,      setSubmitAction]     = useState("draft");
  const [errors,            setErrors]           = useState({});

  const ErrorMsg = ({ name }) =>
    errors[name]?.message ? (
      <p style={{ color: "#F63049" }} className="text-xxxs mt-1">{errors[name].message}</p>
    ) : null;

    const formatToInputDate = (dateStr) => {
  if (!dateStr) return "";

  // If already in YYYY-MM-DD
  if (dateStr.includes("-")) return dateStr.split("T")[0];

  // Convert from DD/MM/YYYY → YYYY-MM-DD
  const [day, month, year] = dateStr.split("/");
  if (!day || !month || !year) return "";

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};
  /* ─────────────────────────────────────────────
      FETCH: PO Number
  ───────────────────────────────────────────── */
  useEffect(() => {
    if (!isEdit && !isView) {
      api.get("/i_pi_get_next_po_number")
        .then((res) => {
          if (res.data?.Status === 1)
            setForm((f) => ({ ...f, poNumber: formatPONumber(res.data.Result) }));
        })
        .catch(() => setForm((f) => ({ ...f, poNumber: formatPONumber(1) })));
    }
  }, [isEdit, isView]);

  /* ─────────────────────────────────────────────
      FETCH: Finalized PQ dropdown
  ───────────────────────────────────────────── */
  const fetchPQs = async (search = "") => {
    try {
      const res = await api.get("/i_pi_get_finalized_pq_ddl", { params: { SearchTerm: search } });
      if (res.data?.Status === 1)
        setPQOptions(res.data.Result.map((r) => ({ value: r.pq_id, label: r.pq_number })));
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchPQs();
    // If opened from PQ list with pq_id param
    if (pqId) loadFromPQ(pqId);
  }, []);

  /* ─────────────────────────────────────────────
      Auto-fill from finalized PQ
  ───────────────────────────────────────────── */
  const loadFromPQ = async (id) => {
    try {
      const res = await api.get("/i_pi_purchase_order_prefill_from_pq", { params: { pq_id: id } });
      if (res.data?.Status === 1 && res.data.Result?.length > 0) {
        const h = res.data.Result[0];

        setLinkedPQ({ value: h.pq_id, label: h.pq_number });
        setVendor({ value: h.vendor_id, label: h.vendor_name });
        setEntity({ value: h.entity_id, label: h.entity_name });
        setDepartment({ value: h.department_id, label: h.department_name });

        setForm((f) => ({
          ...f,
          deliveryAddress: h.delivery_address || "",
          termsConditions: h.terms_conditions || "",
        }));

        // Build item rows from PQ winner items
        const rows = res.data.Result.map((r) => ({
          poi_id:      null,
          pr_item_id:  r.pr_item_id,
          itemId:      r.item_id,
          itemName:    r.item_name,
          itemCode:    r.item_code,
          category:    r.item_category,
          uom:         r.uom_name,
          qty:         r.pr_quantity?.toString() || "",
          unitPrice:   r.unit_price?.toString()  || "",
          discountPct: r.discount_percent?.toString() || "0",
          gst:         { value: r.gst_percent ?? 18, label: `${r.gst_percent ?? 18}%` },
          remarks:     "",
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
        // Header
        const res = await api.get("/i_pi_purchase_order_select_all_and_id", { params: { po_id: currentId } });
        if (res.data?.Status === 1 && res.data.Result?.length > 0) {
          const h = res.data.Result[0];
          setForm({
            poNumber:         h.po_number || "",
            poDate: formatToInputDate(h.po_date) || today(),
            expectedDelivery: formatToInputDate(h.po_expected_delivery) || "",
            poStatus:         h.po_status || "Draft",
            supplyType:       h.po_supply_type === "Inter"
                                ? { value: "Inter", label: "Inter-State (IGST)" }
                                : { value: "Intra", label: "Intra-State (CGST + SGST)" },
            deliveryAddress:  h.po_delivery_address  || "",
            termsConditions:  h.po_terms_conditions  || "",
            remarks:          h.po_remarks           || "",
          });
          setLinkedPQ({ value: h.po_pq_id, label: h.pq_number || "" });
          setVendor(h.po_vendor_id ? { value: h.po_vendor_id, label: h.vendor_name || "" } : null);
          setEntity(h.po_entity_id ? { value: h.po_entity_id, label: h.entity_name || "" } : null);
          setDepartment(h.po_department_id ? { value: h.po_department_id, label: h.department_name || "" } : null);
        }

        // Items
        const iRes = await api.get("/i_pi_purchase_order_items_select", { params: { po_id: currentId } });
        if (iRes.data?.Status === 1 && iRes.data.Result?.length > 0) {
          setItems(iRes.data.Result.map((r) => ({
            poi_id:      r.poi_id,
            pr_item_id:  r.poi_pr_item_id,
            itemId:      r.poi_item_id,
            itemName:    r.item_name,
            itemCode:    r.item_code,
            category:    r.item_category,
            uom:         r.uom_name,
            qty:         r.poi_qty?.toString()           || "",
            unitPrice:   r.poi_unit_price?.toString()    || "",
            discountPct: r.poi_discount_percent?.toString() || "0",
            gst:         { value: r.poi_gst_percent ?? 18, label: `${r.poi_gst_percent ?? 18}%` },
            remarks:     r.poi_remarks || "",
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
      Tax Summary calculation
  ───────────────────────────────────────────── */
  const taxRows = items.reduce((acc, item) => {
    const { baseAmt, gstAmt, gstPct } = calcItem(item);
    if (!baseAmt) return acc;
    const key = gstPct;
    if (!acc[key]) acc[key] = { gstPct, taxable: 0, gstAmt: 0 };
    acc[key].taxable += baseAmt;
    acc[key].gstAmt  += gstAmt;
    return acc;
  }, {});

  const taxSummary   = Object.values(taxRows).sort((a, b) => a.gstPct - b.gstPct);
  const totalTaxable = taxSummary.reduce((s, r) => s + r.taxable, 0);
  const totalGST     = taxSummary.reduce((s, r) => s + r.gstAmt, 0);
  const grandTotal   = totalTaxable + totalGST;
  const isInter      = form.supplyType?.value === "Inter";

  /* ─────────────────────────────────────────────
      Validation
  ───────────────────────────────────────────── */
  const validateForm = () => {
    const newErrors = {};
    if (!linkedPQ)               newErrors.linkedPQ         = { message: "Please link a finalized Quotation" };
    if (!form.expectedDelivery)  newErrors.expectedDelivery = { message: "Expected delivery date is required" };
    else if (form.expectedDelivery < today())
                                 newErrors.expectedDelivery = { message: "Must be today or a future date" };
    if (!form.deliveryAddress?.trim())
                                 newErrors.deliveryAddress  = { message: "Delivery address is required" };

    const hasValidItem = items.some((it) => it.itemId && parseFloat(it.qty) > 0 && parseFloat(it.unitPrice) >= 0);
    if (!hasValidItem)           newErrors.items            = { message: "At least one item with qty is required" };

    items.forEach((it, idx) => {
      if (!it.itemId) return;
      if (!it.qty || parseFloat(it.qty) <= 0) newErrors[`qty_${idx}`] = { message: "Qty > 0" };
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
      po_id:                currentId,
      po_number:            form.poNumber,
      po_date:              form.poDate,
      po_pq_id:             linkedPQ?.value || 0,
      po_vendor_id:         vendor?.value   || 0,
      po_entity_id:         entity?.value   || 0,
      po_department_id:     department?.value || 0,
      po_expected_delivery: form.expectedDelivery,
      po_supply_type:       form.supplyType?.value || "Intra",
      po_delivery_address:  form.deliveryAddress,
      po_terms_conditions:  form.termsConditions,
      po_remarks:           form.remarks,
      po_status:            action === "submit" ? "Pending" : "Draft",
      po_created_by_user_id: user?.id || 0,
      items: items
        .filter((it) => it.itemId && parseFloat(it.qty) > 0)
        .map((it) => ({
          poi_item_id:          it.itemId,
          poi_pr_item_id:       it.pr_item_id || 0,
          poi_qty:              parseFloat(it.qty),
          poi_unit_price:       parseFloat(it.unitPrice   || 0),
          poi_discount_percent: parseFloat(it.discountPct || 0),
          poi_gst_percent:      it.gst?.value ?? 18,
          poi_remarks:          it.remarks || "",
        })),
    };

    try {
      const res = await api.post("/i_pi_purchase_order_insert_update", payload);
      if (res.data?.status === 1 || res.data?.Status === 1) {
        Swal.fire("Success", res.data?.message || res.data?.Message || "Purchase Order saved.", "success");
        navigate("/Purchase_Order_list");
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
            <Card title="Purchase Order">
              <div className="p-4 space-y-6">

                {/* Status + mode badges */}
                {(isEdit || isView) && (
                  <div className="flex justify-end items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold border" style={statusBadgeStyle(form.poStatus)}>
                      {form.poStatus}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-300">
                      {isView ? "View" : "Edit"}
                    </span>
                  </div>
                )}

                {/* ═══════════════════════════════════
                    SECTION 1 — Header
                ═══════════════════════════════════ */}
                <Card title="Order Header">
                  <div className="p-4 space-y-4">

                    <div className="grid grid-cols-3 gap-4">
                      <Input label="PO Number" value={form.poNumber} disabled readOnly />
                      <Input label="PO Date"   value={form.poDate}   type="date" disabled readOnly />
                      <div>
                        <Select
                          label="Finalized Quotation"
                          value={linkedPQ}
                          options={pqOptions}
                          onChange={(val) => {
                            setLinkedPQ(val);
                            setErrors((p) => { const n = { ...p }; delete n.linkedPQ; return n; });
                            if (val) loadFromPQ(val.value);
                            else {
                              setVendor(null); setEntity(null); setDepartment(null);
                              setItems([emptyItem()]);
                            }
                          }}
                          searchable serverSearch onSearch={fetchPQs}
                          required disabled={isView}
                          placeholder="Select finalized PQ..."
                        />
                        <ErrorMsg name="linkedPQ" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {/* Vendor — auto-filled, read-only */}
                      <Input label="Vendor" value={vendor?.label || ""} disabled readOnly />
                      {/* Entity — auto-filled */}
                      <Input label="Entity" value={entity?.label || ""} disabled readOnly />
                      {/* Department — auto-filled */}
                      <Input label="Department" value={department?.label || ""} disabled readOnly />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Input
                          label="Expected Delivery Date" type="date"
                          value={form.expectedDelivery} min={today()}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v < today()) { setErrors((p) => ({ ...p, expectedDelivery: { message: "Must be today or future" } })); return; }
                            setErrors((p) => { const n = { ...p }; delete n.expectedDelivery; return n; });
                            setForm({ ...form, expectedDelivery: v });
                          }}
                          disabled={isView} required
                        />
                        <ErrorMsg name="expectedDelivery" />
                      </div>
                      <Select
                        label="Supply Type"
                        value={form.supplyType}
                        options={SUPPLY_TYPE_OPTIONS}
                        onChange={(val) => setForm({ ...form, supplyType: val })}
                        disabled={isView}
                      />
                      <Input
                        label="Remarks" value={form.remarks}
                        onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                        placeholder="Internal remarks..." disabled={isView}
                      />
                    </div>
                  </div>
                </Card>

                {/* ═══════════════════════════════════
                    SECTION 2 — Delivery Address
                ═══════════════════════════════════ */}
                <Card title="Delivery Information">
                  <div className="p-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#393E46] mb-1">
                        Deliver To Address <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        value={form.deliveryAddress}
                        disabled={isView}
                        placeholder="Full delivery address..."
                        onChange={(e) => {
                          setForm({ ...form, deliveryAddress: e.target.value });
                          setErrors((p) => { const n = { ...p }; delete n.deliveryAddress; return n; });
                        }}
                        className={`w-full px-3 py-2 text-xs rounded-lg border resize-none focus:outline-none focus:ring-1 transition ${errors.deliveryAddress ? "border-rose-400 bg-rose-50 focus:ring-rose-300" : "border-[#393E46]/30 bg-white text-[#222831] focus:ring-[#393E46]"}`}
                      />
                      <ErrorMsg name="deliveryAddress" />
                    </div>
                  </div>
                </Card>

                {/* ═══════════════════════════════════
                    SECTION 3 — Items
                ═══════════════════════════════════ */}
                <Card title="Item Details">
                  <div className="p-4 space-y-3">

                    {/* Column headers */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl select-none"
                      style={{ background: "#222831" }}>
                      <span style={{ width: "28px",  flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8] text-center">#</span>
                      <span style={{ width: "180px", flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8]">Item</span>
                      <span style={{ width: "80px",  flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8]">Code</span>
                      <span style={{ width: "80px",  flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8]">Category</span>
                      <span style={{ width: "50px",  flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8] text-center">UoM</span>
                      <span style={{ width: "70px",  flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8] text-right">Qty</span>
                      <span style={{ width: "90px",  flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8] text-right">Unit Price</span>
                      <span style={{ width: "60px",  flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8] text-right">Disc%</span>
                      <span style={{ width: "64px",  flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8] text-center">GST%</span>
                      <span style={{ width: "90px",  flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8] text-right">Amount</span>
                      <span style={{ flex: 1        }}               className="text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8]">Remarks</span>
                    </div>

                    {/* Item rows */}
                    {items.map((item, idx) => {
                      const { baseAmt, gstAmt, totalAmt } = calcItem(item);
                      const isEven = idx % 2 === 0;
                      return (
                        <div key={idx}
                          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "12px", background: isEven ? "#f8fafc" : "#fff", border: `1px solid ${isEven ? "#e2e8f0" : "#f1f5f9"}`, boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}
                        >
                          {/* # */}
                          <div style={{ width: "28px", flexShrink: 0 }} className="flex items-center justify-center">
                            <span className="text-[10px] font-bold text-[#393E46] flex items-center justify-center rounded-full"
                              style={{ width: "20px", height: "20px", background: isEven ? "#e2e8f0" : "#f1f5f9" }}>
                              {idx + 1}
                            </span>
                          </div>

                          {/* Item name — read-only (auto-filled from PQ) */}
                          <div style={{ width: "180px", flexShrink: 0 }}>
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
                          <div style={{ width: "50px", flexShrink: 0 }} className="flex justify-center">
                            {item.uom
                              ? <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: "#ede9fe", color: "#6d28d9", border: "1px solid #ddd6fe" }}>{item.uom}</span>
                              : <span className="text-slate-300 text-xs">—</span>
                            }
                          </div>
                          {/* Qty */}
                          <div style={{ width: "70px", flexShrink: 0 }}>
                            <input type="number" value={item.qty} disabled={isView} placeholder="0"
                              onChange={(e) => {
                                handleItemField(idx, "qty", e.target.value);
                                setErrors((p) => { const n = { ...p }; delete n[`qty_${idx}`]; delete n.items; return n; });
                              }}
                              className={`w-full px-2 py-1.5 text-xs rounded-lg border text-right font-semibold focus:outline-none focus:ring-1 transition ${errors[`qty_${idx}`] ? "border-rose-400 bg-rose-50 text-rose-600 focus:ring-rose-300" : "border-[#393E46]/30 bg-white text-[#222831] focus:ring-[#393E46]"}`}
                              style={{ appearance: "textfield" }}
                            />
                            {errors[`qty_${idx}`] && <p style={{ color: "#F63049" }} className="text-[9px] mt-0.5 text-right">{errors[`qty_${idx}`].message}</p>}
                          </div>
                          {/* Unit Price */}
                          <div style={{ width: "90px", flexShrink: 0 }}>
                            <input type="number" value={item.unitPrice} disabled={isView} placeholder="0.00"
                              onChange={(e) => handleItemField(idx, "unitPrice", e.target.value)}
                              className={`${editCell} text-right font-semibold`}
                              style={{ appearance: "textfield" }}
                            />
                          </div>
                          {/* Discount % */}
                          <div style={{ width: "60px", flexShrink: 0 }}>
                            <input type="number" value={item.discountPct} disabled={isView} placeholder="0"
                              onChange={(e) => handleItemField(idx, "discountPct", e.target.value)}
                              className={`${editCell} text-right`}
                              style={{ appearance: "textfield" }}
                            />
                          </div>
                          {/* GST % */}
                          <div style={{ width: "64px", flexShrink: 0 }}>
                            <Select
                              value={item.gst}
                              options={GST_OPTIONS}
                              onChange={(val) => handleItemField(idx, "gst", val)}
                              disabled={isView}
                            />
                          </div>
                          {/* Amount */}
                          <div style={{ width: "90px", flexShrink: 0 }}>
                            <div className="text-right">
                              <div className="text-xs font-bold text-[#222831]">
                                {totalAmt > 0 ? totalAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "—"}
                              </div>
                              {totalAmt > 0 && (
                                <div className="text-[9px] text-[#393E46]">
                                  +GST {gstAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </div>
                              )}
                            </div>
                          </div>
                          {/* Remarks */}
                          <div style={{ flex: 1 }}>
                            <input type="text" value={item.remarks} disabled={isView} placeholder="Optional..."
                              onChange={(e) => handleItemField(idx, "remarks", e.target.value)}
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
                    SECTION 4 — Tax Summary
                ═══════════════════════════════════ */}
                <Card title="Tax Summary">
                  <div className="p-4">
                    <div className="max-w-lg ml-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr style={{ background: "#222831" }}>
                            <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8] rounded-tl-lg">GST Rate</th>
                            <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8]">Taxable Amt</th>
                            {isInter ? (
                              <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8] rounded-tr-lg">IGST</th>
                            ) : (
                              <>
                                <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8]">CGST</th>
                                <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8] rounded-tr-lg">SGST</th>
                              </>
                            )}
                            <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8] rounded-tr-lg">Total Tax</th>
                          </tr>
                        </thead>
                        <tbody>
                          {taxSummary.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-3 py-4 text-center text-slate-400 text-xs">
                                Enter item prices to see tax breakdown
                              </td>
                            </tr>
                          ) : (
                            taxSummary.map((row, i) => (
                              <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff" }}>
                                <td className="px-3 py-2 font-semibold text-[#222831]">{row.gstPct}%</td>
                                <td className="px-3 py-2 text-right text-[#393E46]">
                                  {row.taxable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </td>
                                {isInter ? (
                                  <td className="px-3 py-2 text-right text-[#393E46]">
                                    {row.gstAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                  </td>
                                ) : (
                                  <>
                                    <td className="px-3 py-2 text-right text-[#393E46]">
                                      {(row.gstAmt / 2).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-3 py-2 text-right text-[#393E46]">
                                      {(row.gstAmt / 2).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                    </td>
                                  </>
                                )}
                                <td className="px-3 py-2 text-right font-semibold text-[#222831]">
                                  {row.gstAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                        {taxSummary.length > 0 && (
                          <tfoot>
                            <tr style={{ background: "#393E46" }}>
                              <td className="px-3 py-2 text-[10px] font-bold text-[#DFD0B8] rounded-bl-lg">TOTAL</td>
                              <td className="px-3 py-2 text-right text-[10px] font-bold text-[#DFD0B8]">
                                {totalTaxable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                              </td>
                              {isInter ? (
                                <td className="px-3 py-2 text-right text-[10px] font-bold text-[#DFD0B8]">
                                  {totalGST.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </td>
                              ) : (
                                <>
                                  <td className="px-3 py-2 text-right text-[10px] font-bold text-[#DFD0B8]">
                                    {(totalGST / 2).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                  </td>
                                  <td className="px-3 py-2 text-right text-[10px] font-bold text-[#DFD0B8]">
                                    {(totalGST / 2).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                  </td>
                                </>
                              )}
                              <td className="px-3 py-2 text-right text-[10px] font-bold text-[#DFD0B8] rounded-br-lg">
                                {totalGST.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                            {/* Grand total */}
                            <tr>
                              <td colSpan={isInter ? 3 : 4} className="px-3 pt-3 text-right text-xs font-semibold text-[#393E46]">
                                Grand Total (Taxable + GST)
                              </td>
                              <td className="px-3 pt-3 text-right text-sm font-extrabold text-[#222831]">
                                ₹ {grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  </div>
                </Card>

                {/* ═══════════════════════════════════
                    SECTION 5 — Terms & Conditions
                ═══════════════════════════════════ */}
                <Card title="Terms & Conditions">
                  <div className="p-4">
                    <textarea
                      rows={5}
                      value={form.termsConditions}
                      disabled={isView}
                      placeholder="Enter terms and conditions for this purchase order..."
                      onChange={(e) => setForm({ ...form, termsConditions: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#393E46]/30 bg-white text-[#222831] resize-none focus:outline-none focus:ring-1 focus:ring-[#393E46] transition placeholder-[#393E46]/40"
                    />
                    {!isView && (
                      <p className="text-right text-xs mt-1" style={{ color: form.termsConditions.length > 900 ? "#dc2626" : "#94a3b8" }}>
                        {form.termsConditions.length} / 1000
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
                      <Button variant="cancel" onClick={() => navigate("/Purchase_Order_list")}>Cancel</Button>
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
                    <Button variant="cancel" onClick={() => navigate("/Purchase_Order_list")}>Cancel</Button>
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

export default Purchase_Order_form; 