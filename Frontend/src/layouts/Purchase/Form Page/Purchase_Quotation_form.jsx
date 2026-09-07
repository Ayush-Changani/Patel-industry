import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/axios";
import Swal from "sweetalert2";
import { FaCheck, FaTimes, FaBalanceScale, FaStar, FaRegStar } from "react-icons/fa";
import { MdOutlineCompareArrows } from "react-icons/md";

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

const formatPQNumber = (num) => {
  const year = new Date().getFullYear();
  return `PQ-${year}-${String(num).padStart(5, "0")}`;
};

const statusBadgeStyle = (status) => {
  const map = {
    Draft:     { background: "#f1f5f9", color: "#475569",  border: "1px solid #cbd5e1" },
    Pending:   { background: "#fef9c3", color: "#854d0e",  border: "1px solid #fde047" },
    Approved:  { background: "#dcfce7", color: "#166534",  border: "1px solid #86efac" },
    Rejected:  { background: "#fee2e2", color: "#991b1b",  border: "1px solid #fca5a5" },
    Finalized: { background: "#ede9fe", color: "#5b21b6",  border: "1px solid #c4b5fd" },
  };
  return map[status] || map.Draft;
};

const CURRENCY_OPTIONS = [
  { value: "INR", label: "INR - Indian Rupee" },
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro"        },
];

// GST_OPTIONS loaded dynamically from i_pi_get_all_gst_slab_ddl
// ✅ Convert DD/MM/YYYY → YYYY-MM-DD
const convertToInputDate = (dateStr) => {
  if (!dateStr) return "";

  // Already ISO format
  if (dateStr.includes("-")) {
    return dateStr.split("T")[0];
  }

  // Convert from DD/MM/YYYY
  if (dateStr.includes("/")) {
    const [dd, mm, yyyy] = dateStr.split("/");
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }

  return "";
};

const emptyVendorQuote = () => ({
  pqv_id:       null,
  vendor:       null,
  vendorOptions:[],
  quoteNumber:  "",
  quoteDate:    today(),
  validUpto:    "",
  deliveryDays: "",
  paymentTerms: "",
  currency:     { value: "INR", label: "INR - Indian Rupee" },
  remarks:      "",
  isSelected:   false,
  isRejected:   false,
  items:        [],
});

const calcRowTotal = (unitPrice, qty, gstPct) => {
  const base = parseFloat(unitPrice || 0) * parseFloat(qty || 0);
  const gst  = base * (parseFloat(gstPct || 0) / 100);
  return { base, gst, total: base + gst };
};

/* ─────────────────────────────────────────────
    Component
───────────────────────────────────────────── */
const Purchase_Quotation_form = () => {
  const location               = useLocation();
  const navigate               = useNavigate();
  const query                  = new URLSearchParams(location.search);
  const { user, getPagePerms } = useAuth();

  const editId    = query.get("eid");
  const viewId    = query.get("view_id");
  const prId      = query.get("pr_id");
  const isEdit    = Boolean(editId);
  const isView    = Boolean(viewId);
  const currentId = editId || viewId || 0;

  const perms = getPagePerms("/Purchase_Quotation_form");

  /* ── Form state ── */
  const [form, setForm] = useState({
    pqNumber: "",
    pqDate:   today(),
    pqStatus: "Draft",
    title:    "",
    notes:    "",
  });

  const [linkedPR,         setLinkedPR]         = useState(null);
  const [prOptions,        setPROptions]        = useState([]);
  const [prItems,          setPRItems]          = useState([]);
  const [vendors,          setVendors]          = useState([emptyVendorQuote(), emptyVendorQuote()]);
  const [loading,          setLoading]          = useState(false);
  const [submitAction,     setSubmitAction]     = useState("draft");
  const [errors,           setErrors]           = useState({});
  const [selectedVendorIdx,setSelectedVendorIdx]= useState(null);

  const ErrorMsg = ({ name }) =>
    errors[name]?.message ? (
      <p style={{ color: "#F63049" }} className="text-xxxs mt-1">{errors[name].message}</p>
    ) : null;

  /* ─────────────────────────────────────────────
      FETCH: PQ Number
  ───────────────────────────────────────────── */
  useEffect(() => {
    if (!isEdit && !isView) {
      api.get("/i_pi_get_next_pq_number")
        .then((res) => {
          if (res.data?.Status === 1)
            setForm((f) => ({ ...f, pqNumber: formatPQNumber(res.data.Result) }));
        })
        .catch(() => setForm((f) => ({ ...f, pqNumber: formatPQNumber(1) })));
    }
  }, [isEdit, isView]);

  /* ─────────────────────────────────────────────
      FETCH: Dropdowns
  ───────────────────────────────────────────── */

  const fetchPRs = async (search = "") => {
    try {
      const res = await api.get("/i_pi_get_approved_pr_ddl", { params: { SearchTerm: search } });
      if (res.data?.Status === 1)
        setPROptions(res.data.Result.map((r) => ({ value: r.pr_id, label: r.pr_number })));
    } catch (err) { console.error(err); }
  };

  const fetchVendorsForIndex = async (idx, search = "") => {
    try {
      const res = await api.get("/i_pi_get_vendor_ddl", { params: { SearchTerm: search } });
      if (res.data?.Status === 1) {
        const opts = res.data.Result.map((v) => ({
          value: v.vendor_id, label: v.vendor_name,
          gstin: v.gstin, contact: v.contact_person, phone: v.phone,
        }));
        setVendors((prev) => prev.map((v, i) => i === idx ? { ...v, vendorOptions: opts } : v));
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchPRs();
    vendors.forEach((_, idx) => fetchVendorsForIndex(idx));
    if (prId) {
      api.get("/i_pi_purchase_requisition_select_all_and_id", { params: { pr_id: prId } })
        .then((res) => {
          if (res.data?.Status === 1 && res.data.Result?.length > 0) {
            const h = res.data.Result[0];
            setLinkedPR({ value: h.pr_id || parseInt(prId), label: h.purchase_requisition_number });
            loadPRItems(prId);
          }
        });
    }
  }, []);

  /* Load PR items when PR is selected */
  const loadPRItems = async (id, skipVendors = false) => {
    try {

      const res = await api.get("/i_pi_purchase_requisition_items_select_by_master", { params: { pr_id: id } });
      if (res.data?.Status === 1 && res.data.Result?.length > 0) {
        const items = res.data.Result.map((i) => ({
          pr_item_id: i.pri_id,
          itemName:   i.itm_item_name,
          itemCode:   i.itm_item_code,
          category:   i.ic_item_category,
          uom:        i.uom_name,
          prQty:      i.pri_quantity,
        }));
        setPRItems(items);
        if (!skipVendors) {
          setVendors((prev) =>
            prev.map((v) => ({
              ...v,
              items: items.map((pi) => ({
                pr_item_id:  pi.pr_item_id,
                itemName:    pi.itemName,
                itemCode:    pi.itemCode,
                uom:         pi.uom,
                prQty:       pi.prQty,
                unitPrice:   "",
                gst:         "18",
                discountPct: "",
                remarks:     "",
              })),
            }))
          );
        }
        return items;
      }
    } catch (err) { console.error(err); }
    return [];
  };

  /* ─────────────────────────────────────────────
      FETCH: Edit / View data
  ───────────────────────────────────────────── */
  useEffect(() => {
    const fetchDetails = async () => {
      if (!currentId || currentId === "0" || currentId === 0) return;
      try {

        // 2. Fetch PQ Header
        const res = await api.get("/i_pi_purchase_quotation_select_all_and_id", { params: { pq_id: currentId } });
        let pItems = [];
        if (res.data?.Status === 1 && res.data.Result?.length > 0) {
          const h = res.data.Result[0];
          setForm({
            pqNumber: h.pq_number || "",
            pqDate: convertToInputDate(h.pq_date) || today(),
            pqStatus: h.pq_status || "Draft",
            title:    h.pq_title  || "",
            notes:    h.pq_notes  || "",
          });
          if (h.pq_pr_id) {
            setLinkedPR({ value: h.pq_pr_id, label: h.pr_number || "" });
            // skipVendors=true so that vendor items loaded from DB are not overwritten
            pItems = await loadPRItems(h.pq_pr_id, true);
          }
        }

        // 3. Fetch Vendor Quotes & Items
        const vRes = await api.get("/i_pi_purchase_quotation_vendors_select", { params: { pq_id: currentId } });
        if (vRes.data?.Status === 1 && vRes.data.Result?.length > 0) {
          const vendorGroups = {};
          vRes.data.Result.forEach((row) => {
            if (!vendorGroups[row.pqv_id]) {
              vendorGroups[row.pqv_id] = {
                pqv_id:       row.pqv_id,
                vendor:       { value: row.pqv_vendor_id, label: row.vendor_name },
                vendorOptions:[],
                quoteNumber:  row.pqv_quote_number || "",
                quoteDate:    row.pqv_quote_date?.split(/[\sT]/)[0] || today(),
                validUpto:    row.pqv_valid_upto?.split(/[\sT]/)[0]  || "",
                deliveryDays: row.pqv_delivery_days?.toString()  || "",
                paymentTerms: row.pqv_payment_terms || "",
                currency:     { value: row.pqv_currency || "INR", label: row.pqv_currency || "INR" },
                remarks:      row.pqv_remarks || "",
                isSelected:   row.pqv_is_selected === true || row.pqv_is_selected === 1,
                isRejected:   row.pqv_is_rejected === true || row.pqv_is_rejected === 1,
                // Pre-initialize items to match the order of PR Items
                items: pItems.map((pi) => ({
                  pr_item_id:  pi.pr_item_id,
                  itemName:    pi.itemName,
                  itemCode:    pi.itemCode,
                  uom:         pi.uom,
                  prQty:       pi.prQty,
                  unitPrice:   "",
                  gst:         "18",
                  discountPct: "",
                  remarks:     "",
                })),
              };
            }

            // Fill in the specific item data at the correct index
            if (row.pqvi_item_id) {
              const itemIdx = pItems.findIndex((pi) => pi.pr_item_id === row.pqvi_pr_item_id);
              if (itemIdx !== -1) {
                const fetchedGst = row.pqvi_gst_percent ?? 18;
                const itemGst = fetchedGst.toString();

                vendorGroups[row.pqv_id].items[itemIdx] = {
                  ...vendorGroups[row.pqv_id].items[itemIdx],
                  unitPrice:   row.pqvi_unit_price?.toString()        || "0",
                  gst:         itemGst,
                  discountPct: row.pqvi_discount_percent?.toString()   || "0",
                  remarks:     row.pqvi_remarks || "",
                };
              }
            }
          });

          const loadedVendors = Object.values(vendorGroups);
          setVendors(loadedVendors.length > 0 ? loadedVendors : [emptyVendorQuote(), emptyVendorQuote()]);
          
          const selectedIdx = loadedVendors.findIndex(v => v.isSelected);
          if (selectedIdx !== -1) setSelectedVendorIdx(selectedIdx);
        }
      } catch (err) { console.error(err); }
    };
    fetchDetails();
  }, [currentId]);

  /* ─────────────────────────────────────────────
      Vendor management
  ───────────────────────────────────────────── */
  const addVendorColumn = () => {
    const newV = emptyVendorQuote();
    newV.items = prItems.map((pi) => ({
      pr_item_id:  pi.pr_item_id,
      itemName:    pi.itemName,
      itemCode:    pi.itemCode,
      uom:         pi.uom,
      prQty:       pi.prQty,
      unitPrice:   "",
      gst:         "18",
      discountPct: "",
      remarks:     "",
    }));
    fetchVendorsForIndex(vendors.length);
    setVendors((prev) => [...prev, newV]);
  };

  const removeVendorColumn = (idx) => {
    if (vendors.length <= 1) return;
    setVendors((prev) => prev.filter((_, i) => i !== idx));
    if      (selectedVendorIdx === idx) setSelectedVendorIdx(null);
    else if (selectedVendorIdx > idx)   setSelectedVendorIdx((s) => s - 1);
  };

  const updateVendorField = (idx, field, value) =>
    setVendors((prev) => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v));

  const updateVendorItemField = (vIdx, itemIdx, field, value) =>
    setVendors((prev) =>
      prev.map((v, i) =>
        i === vIdx
          ? { ...v, items: v.items.map((it, j) => j === itemIdx ? { ...it, [field]: value } : it) }
          : v
      )
    );

  const handleSelectVendor = (idx) => {
    if (isView) return;
    setSelectedVendorIdx(idx);
    setVendors((prev) =>
      prev.map((v, i) => ({ ...v, isSelected: i === idx, isRejected: i !== idx }))
    );
  };

  const handleToggleReject = (idx) => {
    if (isView) return;
    setVendors((prev) =>
      prev.map((v, i) => {
        if (i !== idx) return v;
        const nowRejected = !v.isRejected;
        if (nowRejected && selectedVendorIdx === idx) setSelectedVendorIdx(null);
        return { ...v, isRejected: nowRejected, isSelected: nowRejected ? false : v.isSelected };
      })
    );
  };

  /* ─────────────────────────────────────────────
      Totals
  ───────────────────────────────────────────── */
  const vendorTotals = vendors.map((v) => {
    let subTotal = 0, totalGST = 0, grandTotal = 0;
    v.items.forEach((it) => {
      const disc  = parseFloat(it.discountPct || 0) / 100;
      const price = parseFloat(it.unitPrice   || 0) * (1 - disc);
      const { base, gst, total } = calcRowTotal(price, it.prQty, it.gst || 0);
      subTotal  += base;
      totalGST  += gst;
      grandTotal+= total;
    });
    return { subTotal, totalGST, grandTotal };
  });

  const lowestIdx = vendorTotals.reduce((low, t, i, arr) => {
    if (!t.grandTotal) return low;
    if (low === null)  return i;
    return t.grandTotal < arr[low].grandTotal ? i : low;
  }, null);

  /* ─────────────────────────────────────────────
      Validation
  ───────────────────────────────────────────── */
  const validateForm = () => {
    const newErrors = {};

    if (!form.pqDate)              newErrors.pqDate   = { message: "Quotation Date is mandatory" };
    else if (form.pqDate < today()) newErrors.pqDate   = { message: "Must be today or a future date" };

    if (!linkedPR) newErrors.linkedPR = { message: "Please link a Purchase Requisition" };

    vendors.forEach((v, idx) => {
      if (!v.vendor) newErrors[`vendor_${idx}`] = { message: "Vendor is required" };
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

    const toISO = (d) => {
      if (!d) return null;
      try { return new Date(d).toISOString(); } catch { return d; }
    };

    const payload = {
      pq_id:     Number(currentId) || 0,
      pq_number: form.pqNumber,
      pq_date:    toISO(form.pqDate),
      pq_pr_id:  Number(linkedPR?.value || 0),
      pq_title:  form.title,
      pq_notes:  form.notes,
      pq_status: action === "submit" ? "Pending" : "Draft",
      pq_created_by_user_id: Number(user?.id || 0),
      vendors: vendors.map((v) => ({
        pqv_id:            Number(v.pqv_id || 0),
        pqv_vendor_id:     Number(v.vendor?.value || 0),
        pqv_quote_number:  v.quoteNumber,
        pqv_quote_date:    toISO(v.quoteDate),
        pqv_valid_upto:    toISO(v.validUpto),
        pqv_delivery_days: Number(v.deliveryDays || 0),
        pqv_payment_terms: v.paymentTerms,
        pqv_currency:      v.currency?.value || "INR",
        pqv_remarks:       v.remarks,
        pqv_is_selected:   v.isSelected === true,
        pqv_is_rejected:   v.isRejected === true,
        items: v.items.map((it) => ({
          pqvi_pr_item_id:       Number(it.pr_item_id || 0),
          pqvi_unit_price:       Number(it.unitPrice   || 0),
          pqvi_gst_percent:      Number(it.gst || 18),
          pqvi_discount_percent: Number(it.discountPct || 0),
          pqvi_remarks:          it.remarks,
        })),
      })),
    };

    try {
      const res = await api.post("/i_pi_purchase_quotation_insert_update", payload);
      if (res.data?.status === 1 || res.data?.Status === 1) {
        Swal.fire("Success", res.data?.message || res.data?.Message || "Quotation saved successfully.", "success");
        navigate("/Purchase_Quotation_list");
      } else {
        Swal.fire("Error", res.data?.message || res.data?.Message || "Failed to save.", "error");
      }
    } catch { Swal.fire("Error", "Server error.", "error"); }
    finally  { setLoading(false); }
  };

  const handleFinalize = async () => {
    if (selectedVendorIdx === null) {
      Swal.fire("Select Vendor", "Please select a winning vendor before finalizing.", "warning");
      return;
    }
    const result = await Swal.fire({
      title: "Finalize Quotation?",
      html: `You are selecting <strong>${vendors[selectedVendorIdx]?.vendor?.label}</strong> as the approved vendor.<br/>This action will lock the comparison.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#5b21b6",
      confirmButtonText: "Yes, Finalize!",
    });
    if (!result.isConfirmed) return;
    setLoading(true);
    try {
      const res = await api.post("/i_pi_purchase_quotation_finalize", {
        pq_id:                currentId,
        selected_pqv_id:      vendors[selectedVendorIdx]?.pqv_id,
        finalized_by_user_id: user?.id,
      });
      if (res.data?.Status === 1 || res.data?.status === 1) {
        Swal.fire("Finalized!", res.data?.Message || "Quotation finalized.", "success");
        navigate("/Purchase_Quotation_list");
      } else {
        Swal.fire("Error", res.data?.Message || "Finalize failed.", "error");
      }
    } catch { Swal.fire("Error", "Server error.", "error"); }
    finally { setLoading(false); }
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
          <div className="max-w-full mx-auto pb-8 px-0">
            <Card title="Purchase Quotation">
              <div className="p-4 space-y-6">

                {/* ── Status + mode badges ── */}
                {(isEdit || isView) && (
                  <div className="flex justify-end items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold border" style={statusBadgeStyle(form.pqStatus)}>
                      {form.pqStatus}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-300">
                      {isView ? "View" : "Edit"}
                    </span>
                  </div>
                )}

                {/* ── SECTION 1 : Header ── */}
                <Card title="Quotation Header">
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-3 gap-4">

                      <Input label="PQ Number" value={form.pqNumber} disabled readOnly />

                      {/* Quotation Date — with validation */}
                      <div>
                        <Input
                          label="Quotation Date" type="date" value={form.pqDate} min={today()}
                          onChange={(e) => {
                            const selected = e.target.value;
                            if (selected < today()) {
                              setErrors((p) => ({ ...p, pqDate: { message: "Must be today or a future date" } }));
                              return;
                            }
                            setErrors((p) => { const n = { ...p }; delete n.pqDate; return n; });
                            setForm({ ...form, pqDate: selected });
                          }}
                          disabled={isView} required
                        />
                        <ErrorMsg name="pqDate" />
                      </div>

                      {/* Linked PR */}
                      <div>
                        <Select
                          label="Purchase Requisition"
                          value={linkedPR}
                          options={prOptions}
                          onChange={(val) => {
                            setLinkedPR(val);
                            setErrors((p) => { const n = { ...p }; delete n.linkedPR; return n; });
                            if (val) loadPRItems(val.value);
                            else { setPRItems([]); setVendors([emptyVendorQuote(), emptyVendorQuote()]); }
                          }}
                          searchable serverSearch onSearch={fetchPRs}
                          required disabled={isView}
                          placeholder="Select approved PR..."
                        />
                        <ErrorMsg name="linkedPR" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Comparison Title / Subject" value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g. Q2 Raw Material Procurement" disabled={isView}
                      />
                      <Input
                        label="Notes" value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        placeholder="Internal notes..." disabled={isView}
                      />
                    </div>
                  </div>
                </Card>

                {/* ── SECTION 2 : Comparison Table ── */}
                <Card
                  title={
                    <div className="flex items-center gap-2">
                      <MdOutlineCompareArrows size={18} className="text-[#393E46]" />
                      <span>Vendor Quote Comparison</span>
                      {lowestIdx !== null && (
                        <span className="ml-3 px-2 py-0.5 text-[10px] rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 font-semibold">
                          Lowest: {vendors[lowestIdx]?.vendor?.label || `Vendor ${lowestIdx + 1}`}
                        </span>
                      )}
                    </div>
                  }
                >
                  <div className="p-4">
                    <div className="overflow-x-auto" style={{ minWidth: 0 }}>
                      <table style={{ borderCollapse: "separate", borderSpacing: 0, width: "100%", minWidth: `${200 + vendors.length * 240}px` }}>
                        <thead>

                          {/* ── Vendor header row ── */}
                          <tr>
                            <th style={{ width: "200px", minWidth: "200px", background: "#222831", color: "#DFD0B8", fontSize: "10px", padding: "10px 12px", borderRadius: "10px 0 0 0", textAlign: "left", letterSpacing: "0.08em", fontWeight: 700 }}>
                              ITEM DETAILS
                            </th>
                            {vendors.map((v, idx) => (
                              <VendorHeaderCell
                                key={idx}
                                idx={idx}
                                vendor={v}
                                isView={isView}
                                isSelected={selectedVendorIdx === idx}
                                isLowest={lowestIdx === idx}
                                vendorTotals={vendorTotals[idx]}
                                totalVendors={vendors.length}
                                onSelect={() => handleSelectVendor(idx)}
                                onToggleReject={() => handleToggleReject(idx)}
                                onRemove={() => removeVendorColumn(idx)}
                                onFieldChange={(field, val) => updateVendorField(idx, field, val)}
                                fetchVendors={(s) => fetchVendorsForIndex(idx, s)}
                                errors={errors}
                              />
                            ))}
                            {!isView && (
                              <th style={{ width: "56px", verticalAlign: "top", padding: "8px" }}>
                                <button
                                  type="button"
                                  onClick={addVendorColumn}
                                  title="Add Vendor"
                                  style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#393E46", color: "#DFD0B8", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", boxShadow: "0 2px 8px rgba(57,62,70,.35)", marginTop: "8px" }}
                                >+</button>
                              </th>
                            )}
                          </tr>

                          {/* ── Quote # / Date / Valid Upto sub-row ── */}
                          <tr style={{ background: "rgba(57,62,70,0.06)" }}>
                            <td style={{ padding: "6px 12px", fontSize: "10px", color: "#393E46", fontWeight: 600, borderBottom: "1px solid rgba(57,62,70,0.2)" }}>
                              Quote # / Date / Valid Upto
                            </td>
                            {vendors.map((v, idx) => (
                              <VendorInfoCell key={idx} vendor={v} idx={idx} isView={isView}
                                onFieldChange={(field, val) => updateVendorField(idx, field, val)} />
                            ))}
                            {!isView && <td />}
                          </tr>

                          {/* ── Delivery Days / Payment Terms sub-row ── */}
                          <tr style={{ background: "transparent" }}>
                            <td style={{ padding: "6px 12px", fontSize: "10px", color: "#393E46", fontWeight: 600, borderBottom: "1px solid rgba(57,62,70,0.2)" }}>
                              Delivery Days / Payment Terms
                            </td>
                            {vendors.map((v, idx) => (
                              <VendorDeliveryCell key={idx} vendor={v} idx={idx} isView={isView}
                                onFieldChange={(field, val) => updateVendorField(idx, field, val)} />
                            ))}
                            {!isView && <td />}
                          </tr>

                          {/* ── Item pricing column headers ── */}
                          <tr style={{ background: "#222831" }}>
                            <th style={{ padding: "8px 12px", fontSize: "10px", color: "#DFD0B8", textAlign: "left", letterSpacing: "0.08em", fontWeight: 700 }}>
                              ITEM / CODE / UOM / PR QTY
                            </th>
                            {vendors.map((_, idx) => (
                              <th key={idx} style={{ padding: "8px 12px", fontSize: "10px", color: "#DFD0B8", letterSpacing: "0.08em", fontWeight: 700, textAlign: "center" }}>
                                Unit Price · Disc% · GST% · Row Total
                              </th>
                            ))}
                            {!isView && <th />}
                          </tr>
                        </thead>

                        <tbody>
                          {prItems.length === 0 ? (
                            <tr>
                              <td colSpan={vendors.length + 2} style={{ textAlign: "center", padding: "32px", color: "#94a3b8", fontSize: "13px" }}>
                                {linkedPR ? "No items found for this PR." : "Select a PR to load items."}
                              </td>
                            </tr>
                          ) : (
                            prItems.map((pi, itemIdx) => (
                              <tr key={itemIdx} style={{ background: itemIdx % 2 === 0 ? "rgba(57,62,70,0.05)" : "transparent" }}>

                                {/* ── Item label cell ── */}
                                <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(57,62,70,0.15)", minWidth: "200px" }}>
                                  <div className="font-semibold text-xs text-[#222831]">{pi.itemName}</div>
                                  <div className="text-[10px] text-[#393E46] mt-0.5">{pi.itemCode} · {pi.uom}</div>
                                  <div className="text-[10px] mt-0.5">
                                    <span className="px-1.5 py-0.5 rounded bg-[#393E46] text-[#DFD0B8] font-semibold border border-[#222831]">
                                      PR Qty: {pi.prQty}
                                    </span>
                                  </div>
                                </td>

                                {/* ── Price cells per vendor ── */}
                                {vendors.map((v, vIdx) => {
                                  const it       = v.items[itemIdx] || {};
                                  const disc     = parseFloat(it.discountPct || 0) / 100;
                                  const effPrice = parseFloat(it.unitPrice   || 0) * (1 - disc);
                                  const { base, gst, total } = calcRowTotal(effPrice, pi.prQty, it.gst || 0);

                                  const rowTotals = vendors.map((vv) => {
                                    const vit = vv.items[itemIdx] || {};
                                    const d   = parseFloat(vit.discountPct || 0) / 100;
                                    const ep  = parseFloat(vit.unitPrice   || 0) * (1 - d);
                                    return calcRowTotal(ep, pi.prQty, vit.gst || 0).total;
                                  });
                                  const minRowTotal   = Math.min(...rowTotals.filter((t) => t > 0));
                                  const isRowCheapest = total > 0 && total === minRowTotal;

                                  return (
                                    <td key={vIdx}
                                      style={{
                                        padding:      "8px 10px",
                                        borderBottom: "1px solid rgba(57,62,70,0.15)",
                                        background:   v.isRejected ? "rgba(239,68,68,0.05)" : v.isSelected ? "rgba(34,197,94,0.05)" : undefined,
                                        opacity:      v.isRejected ? 0.6 : 1,
                                      }}
                                    >
                                      <div className="flex flex-col gap-1">

                                          {/* Unit price */}
                                        <div className="flex items-center gap-1">
                                          <span className="text-[10px] text-[#393E46] w-14 shrink-0">Unit Price</span>
                                          <input
                                            type="number"
                                            value={it.unitPrice || ""}
                                            disabled={isView || v.isRejected || (currentId !== 0 && form.pqStatus !== "Draft" && form.pqStatus !== "Rejected")}
                                            placeholder="0.00"
                                            onChange={(e) => updateVendorItemField(vIdx, itemIdx, "unitPrice", e.target.value)}
                                            className="flex-1 px-2 py-1 text-xs rounded border border-slate-300 bg-white text-right font-semibold focus:outline-none focus:ring-1 focus:ring-[#393E46]"
                                            style={{ appearance: "textfield", minWidth: 0, maxWidth: "90px" }}
                                          />
                                          {isRowCheapest && total > 0 && (
                                            <span title="Lowest for this item" style={{ color: "#16a34a", marginLeft: "2px" }}>
                                              <FaStar size={9} />
                                            </span>
                                          )}
                                        </div>

                                        {/* Discount % */}
                                        <div className="flex items-center gap-1">
                                          <span className="text-[10px] text-[#393E46] w-14 shrink-0">Disc %</span>
                                          <input
                                            type="number"
                                            value={it.discountPct || ""}
                                            disabled={isView || v.isRejected || (currentId !== 0 && form.pqStatus !== "Draft" && form.pqStatus !== "Rejected")}
                                            placeholder="0"
                                            onChange={(e) => updateVendorItemField(vIdx, itemIdx, "discountPct", e.target.value)}
                                            className="flex-1 px-2 py-1 text-xs rounded border border-slate-300 bg-white text-right focus:outline-none focus:ring-1 focus:ring-[#393E46]"
                                            style={{ appearance: "textfield", minWidth: 0, maxWidth: "90px" }}
                                          />
                                        </div>

                                        {/* GST % */}
                                        <div className="flex items-center gap-1">
                                          <span className="text-[10px] text-[#393E46] w-14 shrink-0">GST %</span>
                                          <input
                                            type="number"
                                            value={it.gst || ""}
                                            disabled={isView || v.isRejected || (currentId !== 0 && form.pqStatus !== "Draft" && form.pqStatus !== "Rejected")}
                                            placeholder="18"
                                            onChange={(e) => updateVendorItemField(vIdx, itemIdx, "gst", e.target.value)}
                                            className="flex-1 px-2 py-1 text-xs rounded border border-slate-300 bg-white text-right focus:outline-none focus:ring-1 focus:ring-[#393E46]"
                                            style={{ appearance: "textfield", minWidth: 0, maxWidth: "90px" }}
                                          />
                                        </div>

                                        {/* Row totals */}
                                        {total > 0 && (
                                          <div className="mt-1 pt-1 border-t border-[#393E46]/10 space-y-0.5">
                                            <div className="flex justify-between text-[10px] text-[#393E46]">
                                              <span>Base</span>
                                              <span>{base.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between text-[10px] text-[#393E46]">
                                              <span>GST</span>
                                              <span>{gst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between text-[10px] font-bold text-[#222831]">
                                              <span>Total</span>
                                              <span style={{ color: isRowCheapest ? "#16a34a" : "#222831" }}>
                                                {total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                              </span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                  );
                                })}
                                {!isView && <td />}
                              </tr>
                            ))
                          )}

                          {/* ── Grand total row ── */}
                          {prItems.length > 0 && (
                            <tr style={{ background: "#222831" }}>
                              <td style={{ padding: "10px 12px", color: "#DFD0B8", fontSize: "11px", fontWeight: 700 }}>
                                GRAND TOTAL
                              </td>
                              {vendorTotals.map((t, idx) => {
                                const v = vendors[idx];
                                return (
                                  <td key={idx} style={{ padding: "10px 12px", textAlign: "center", opacity: v?.isRejected ? 0.5 : 1 }}>
                                    {t.grandTotal > 0 ? (
                                      <div>
                                        <div className="text-[10px] text-zinc-400">
                                          Sub: {t.subTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                          &nbsp;+&nbsp;GST: {t.totalGST.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                        </div>
                                        <div style={{ fontSize: "14px", fontWeight: 800, color: idx === lowestIdx ? "#DFD0B8" : "#9ca3af" }}>
                                          {v?.currency?.value || "INR"} {t.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                        </div>
                                        {idx === lowestIdx && (
                                          <div style={{ fontSize: "9px", color: "#4ade80", marginTop: "2px", letterSpacing: "0.05em" }}>
                                            ✦ LOWEST QUOTE
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <span style={{ color: "#475569", fontSize: "12px" }}>—</span>
                                    )}
                                  </td>
                                );
                              })}
                              {!isView && <td />}
                            </tr>
                          )}

                          {/* ── Select / Reject decision row ── */}
                          {prItems.length > 0 && !isView && (
                            <tr style={{ background: "rgba(57,62,70,0.06)" }}>
                              <td style={{ padding: "10px 12px", fontSize: "11px", fontWeight: 700, color: "#222831" }}>
                                DECISION
                              </td>
                              {vendors.map((v, idx) => (
                                <td key={idx} style={{ padding: "10px 12px", textAlign: "center" }}>
                                  <div className="flex flex-col items-center gap-2">
                                    <label className="flex items-center gap-1.5 cursor-pointer select-none group">
                                      <input
                                        type="radio"
                                        name="vendor_selection"
                                        checked={selectedVendorIdx === idx}
                                        onChange={() => handleSelectVendor(idx)}
                                        disabled={v.isRejected}
                                        className="accent-green-600 w-3.5 h-3.5"
                                      />
                                      <span className={`text-xs font-semibold flex items-center gap-1 ${selectedVendorIdx === idx ? "text-green-700" : "text-slate-500 group-hover:text-green-600"}`}>
                                        <FaCheck size={9} /> Select
                                      </span>
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleReject(idx)}
                                      className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border transition ${v.isRejected ? "bg-rose-100 text-rose-700 border-rose-300" : "bg-white text-slate-400 border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300"}`}
                                    >
                                      <FaTimes size={8} /> {v.isRejected ? "Rejected" : "Reject"}
                                    </button>
                                  </div>
                                </td>
                              ))}
                              {!isView && <td />}
                            </tr>
                          )}

                          {/* ── Vendor remarks row ── */}
                          {prItems.length > 0 && (
                            <tr style={{ background: "transparent" }}>
                              <td style={{ padding: "10px 12px", fontSize: "10px", fontWeight: 600, color: "#393E46", borderTop: "1px solid rgba(57,62,70,0.2)" }}>
                                VENDOR REMARKS
                              </td>
                              {vendors.map((v, idx) => (
                                <td key={idx} style={{ padding: "8px 10px", borderTop: "1px solid rgba(57,62,70,0.2)" }}>
                                  <input
                                    type="text"
                                    value={v.remarks}
                                    disabled={isView}
                                    placeholder="Optional remarks..."
                                    onChange={(e) => updateVendorField(idx, "remarks", e.target.value)}
                                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#393E46]/30 bg-white/50 text-[#222831] focus:outline-none focus:ring-1 focus:ring-[#393E46]"
                                  />
                                </td>
                              ))}
                              {!isView && <td />}
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* ── Legend ── */}
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#393E46]/10">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <span className="inline-block w-3 h-3 rounded-full bg-emerald-100 border border-emerald-300" />
                        Selected vendor
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <span className="inline-block w-3 h-3 rounded-full bg-rose-100 border border-rose-300" />
                        Rejected vendor
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <FaStar size={10} className="text-green-600" /> Lowest price for row
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <span className="font-bold text-[#393E46] bg-[#DFD0B8] px-1 rounded text-[10px]">✦</span> Lowest grand total
                      </div>
                    </div>
                  </div>
                </Card>

                {/* ══════════════════════════════════════
                    ACTION BUTTONS
                ══════════════════════════════════════ */}
                <div className="flex justify-center gap-4 pt-4">
                  {!isView ? (
                    <>
                      <Button variant="cancel" onClick={() => navigate("/Purchase_Quotation_list")}>Cancel</Button>
                      <Button variant="update" disabled={loading}
                        onClick={() => { setSubmitAction("draft"); handleSubmit("draft"); }}>
                        {loading && submitAction === "draft" ? "Saving..." : "Save Draft"}
                      </Button>
                      <Button variant="submit" disabled={loading}
                        onClick={() => { setSubmitAction("submit"); handleSubmit("submit"); }}>
                        {loading && submitAction === "submit" ? "Submitting..." : "Submit for Approval"}
                      </Button>
                      {isEdit && form.pqStatus === "Approved" && (
                        <Button variant="approve" disabled={loading} onClick={handleFinalize}>
                          {loading ? "Finalizing..." : "Finalize & Select Vendor"}
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button variant="cancel" onClick={() => navigate("/Purchase_Quotation_list")}>Cancel</Button>
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

/* ─────────────────────────────────────────────
    VendorHeaderCell
───────────────────────────────────────────── */
const VendorHeaderCell = ({ idx, vendor, isView, isSelected, isLowest, vendorTotals, totalVendors, onSelect, onToggleReject, onRemove, onFieldChange, fetchVendors, errors }) => {
  const cardBg = vendor.isRejected
    ? "rgba(239,68,68,0.1)"
    : isSelected
    ? "rgba(34,197,94,0.1)"
    : "rgba(255,255,255,0.4)";

  const cardBorder = vendor.isRejected ? "#ef4444"
    : isSelected ? "#22c55e"
    : isLowest   ? "#222831"
    : "#393E46";

  return (
    <th style={{ minWidth: "230px", verticalAlign: "top", padding: "0", border: "none" }}>
      <div style={{ background: cardBg, border: `1.5px solid ${cardBorder}`, borderRadius: "10px", margin: "6px 4px", padding: "10px 12px", position: "relative", transition: "all 0.2s" }}>

        {/* Badges row */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-[#393E46] uppercase tracking-widest">Vendor {idx + 1}</span>
          <div className="flex items-center gap-1">
            {isLowest && (
              <span style={{ fontSize: "9px", background: "#DFD0B8", color: "#393E46", border: "1px solid #393E46", borderRadius: "999px", padding: "1px 6px", fontWeight: 700 }}>LOWEST</span>
            )}
            {isSelected && (
              <span style={{ fontSize: "9px", background: "#22c55e", color: "#fff", border: "1px solid #16a34a", borderRadius: "999px", padding: "1px 6px", fontWeight: 700 }}>SELECTED</span>
            )}
            {vendor.isRejected && (
              <span style={{ fontSize: "9px", background: "#ef4444", color: "#fff", border: "1px solid #dc2626", borderRadius: "999px", padding: "1px 6px", fontWeight: 700 }}>REJECTED</span>
            )}
            {!isView && totalVendors > 1 && (
              <button type="button" onClick={onRemove} title="Remove vendor"
                style={{ width: "18px", height: "18px", borderRadius: "50%", background: "#fee2e2", color: "#dc2626", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px" }}>
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Vendor select */}
        <Select
          label=""
          value={vendor.vendor}
          options={vendor.vendorOptions}
          onChange={(val) => onFieldChange("vendor", val)}
          searchable serverSearch onSearch={fetchVendors}
          placeholder="Select vendor..."
          disabled={isView}
        />
        {errors[`vendor_${idx}`]?.message && (
          <p style={{ color: "#F63049", fontSize: "10px", marginTop: "2px" }}>{errors[`vendor_${idx}`].message}</p>
        )}

        {/* Currency */}
        <div className="mt-2">
          <Select
            label=""
            value={vendor.currency}
            options={CURRENCY_OPTIONS}
            onChange={(val) => onFieldChange("currency", val)}
            disabled={isView}
          />
        </div>
      </div>
    </th>
  );
};

/* ─────────────────────────────────────────────
    VendorInfoCell — Quote # / Date / Valid Upto
───────────────────────────────────────────── */
const VendorInfoCell = ({ vendor, isView, onFieldChange }) => (
  <td style={{ padding: "6px 10px", borderBottom: "1px solid rgba(57,62,70,0.2)", background: vendor.isRejected ? "rgba(239,68,68,0.05)" : undefined, opacity: vendor.isRejected ? 0.7 : 1 }}>
    <div className="flex flex-col gap-1">
      <input type="text" value={vendor.quoteNumber} disabled={isView} placeholder="Quote No."
        onChange={(e) => onFieldChange("quoteNumber", e.target.value)}
        className="w-full px-2 py-1 text-xs rounded border border-[#393E46]/30 bg-white/50 focus:outline-none focus:ring-1 focus:ring-[#393E46] placeholder-[#393E46]/50" />
      <input type="date" value={vendor.quoteDate} disabled={isView} min={today()}
        onChange={(e) => onFieldChange("quoteDate", e.target.value)}
        className="w-full px-2 py-1 text-xs rounded border border-[#393E46]/30 bg-white/50 focus:outline-none focus:ring-1 focus:ring-[#393E46]" />
      <input type="date" value={vendor.validUpto} disabled={isView} min={today()}
        onChange={(e) => onFieldChange("validUpto", e.target.value)}
        className="w-full px-2 py-1 text-xs rounded border border-[#393E46]/30 bg-white/50 focus:outline-none focus:ring-1 focus:ring-[#393E46]" />
    </div>
  </td>
);

/* ─────────────────────────────────────────────
    VendorDeliveryCell — Delivery Days / Payment Terms
───────────────────────────────────────────── */
const VendorDeliveryCell = ({ vendor, isView, onFieldChange }) => (
  <td style={{ padding: "6px 10px", borderBottom: "1px solid rgba(57,62,70,0.2)", background: vendor.isRejected ? "rgba(239,68,68,0.05)" : undefined, opacity: vendor.isRejected ? 0.7 : 1 }}>
    <div className="flex flex-col gap-1">
      <input type="number" value={vendor.deliveryDays} disabled={isView} placeholder="Days"
        onChange={(e) => onFieldChange("deliveryDays", e.target.value)}
        className="w-full px-2 py-1 text-xs rounded border border-[#393E46]/30 bg-white/50 focus:outline-none focus:ring-1 focus:ring-[#393E46] placeholder-[#393E46]/50"
        style={{ appearance: "textfield" }} />
      <input type="text" value={vendor.paymentTerms} disabled={isView} placeholder="e.g. Net 30"
        onChange={(e) => onFieldChange("paymentTerms", e.target.value)}
        className="w-full px-2 py-1 text-xs rounded border border-[#393E46]/30 bg-white/50 focus:outline-none focus:ring-1 focus:ring-[#393E46] placeholder-[#393E46]/50" />
    </div>
  </td>
);

export default Purchase_Quotation_form;