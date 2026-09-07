import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../../services/axios";
import Swal from "sweetalert2";
import { useAuth } from "../../../context/AuthContext";
import { downloadPurchaseInvoicePDF } from "../../../components/PdfTemplates/PurchaseInvoicePDF";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import Card from "../../../components/Card";
import Input from "../../../components/Input";
import Select from "../../../components/Select";
import Button from "../../../components/Button";

/* ─────────────────────────────────────────────
    Constants & Styles
───────────────────────────────────────────── */
const GST_OPTIONS = [
  { value: 0,  label: "0%"  },
  { value: 5,  label: "5%"  },
  { value: 12, label: "12%" },
  { value: 18, label: "18%" },
  { value: 28, label: "28%" },
];

const readonlyCell = "w-full px-2.5 py-1.5 text-[11px] rounded border border-slate-100 bg-slate-50 text-slate-400 focus:outline-none cursor-default";
const editCell     = "w-full px-2.5 py-1.5 text-[11px] rounded border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition placeholder-slate-300";

const today = () => new Date().toISOString().split("T")[0];

const formatPINumber = (num) => {
  const year = new Date().getFullYear();
  return `PI-${year}-${String(num).padStart(5, "0")}`;
};

const statusBadgeStyle = (status) => {
  const map = {
    Draft:    { background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1" },
    Pending:  { background: "#fef9c3", color: "#854d0e", border: "1px solid #fde047" },
    Approved: { background: "#dcfce7", color: "#166534", border: "1px solid #86efac" },
    Paid:     { background: "#dbeafe", color: "#1e40af", border: "1px solid #93c5fd" },
  };
  return map[status] || map.Draft;
};

const emptyItem = () => ({
  id:         0,
  itemId:     null,
  itemName:   "",
  itemCode:   "",
  poQty:      0,
  grnQty:     0,
  invoiceQty: 0,
  rate:       0,
  gst:        { value: 18, label: "18%" },
  remark:     "",
  isManual:   true,
});

/* ─────────────────────────────────────────────
    Component
───────────────────────────────────────────── */
const Purchase_Invoice_form = () => {
  const navigate               = useNavigate();
  const location               = useLocation();
  const query                  = new URLSearchParams(location.search);
  const { user }               = useAuth();

  const editId    = query.get("eid");
  const viewId    = query.get("view_id");
  const isEdit    = Boolean(editId);
  const isView    = Boolean(viewId);
  const currentId = editId || viewId || 0;

  /* ── Form state ── */
  const [form, setForm] = useState({
    piNumber:      "",
    invoiceNumber: "",
    invoiceDate:   today(),
    dueDate:       "",
    vendor:        null,
    po:            null,
    grn:           null,
    currency:      { value: "INR", label: "INR" },
    notes:         "",
    status:        "Draft",
  });

  const [items,      setItems]      = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [fetching,   setFetching]   = useState(false);
  const [exporting,  setExporting]  = useState(false);
  const [submitAction, setSubmitAction] = useState("");
  const [errors,       setErrors]       = useState({});

  const ErrorMsg = ({ name }) =>
    errors[name]?.message ? (
      <p style={{ color: "#F63049" }} className="text-xxxs mt-1">{errors[name].message}</p>
    ) : null;

  /* ── Options ── */
  const [vendorOptions, setVendorOptions] = useState([]);
  const [poOptions,     setPoOptions]     = useState([]);
  const [grnOptions,    setGrnOptions]    = useState([]);
  const [itemOptions,   setItemOptions]   = useState([]);

  const formatDateForInput = (dateStr) => {
  if (!dateStr) return "";

  // If already ISO (2026-04-29)
  if (dateStr.includes("-")) return dateStr.split("T")[0];

  // Convert DD/MM/YYYY → YYYY-MM-DD
  if (dateStr.includes("/")) {
    const [dd, mm, yyyy] = dateStr.split("/");
    return `${yyyy}-${mm}-${dd}`;
  }

  return "";
};
  /* ─────────────────────────────────────────────
      FETCH: Initial Data
  ───────────────────────────────────────────── */
  const fetchNextPINumber = async () => {
    try {
      const res = await api.get("/i_pi_purchase_invoice_generate_number");
      if (res.data?.Status === 1)
        setForm((prev) => ({ ...prev, piNumber: formatPINumber(res.data.Result) }));
    } catch { setForm((prev) => ({ ...prev, piNumber: formatPINumber(1) })); }
  };

  const fetchVendors = async (search = "") => {
    try {
      const res = await api.get("/i_pi_get_vendor_ddl", { params: { SearchTerm: search } });
      if (res.data?.Status === 1)
        setVendorOptions(res.data.Result.map(v => ({ value: v.vendor_id, label: v.vendor_name })));
    } catch (err) { console.error(err); }
  };

  const fetchApprovedPOs = async (search = "") => {
    try {
      const res = await api.get("/i_pi_get_approved_po_ddl", { params: { SearchTerm: search } });
      if (res.data?.Status === 1)
        setPoOptions(res.data.Result.map(p => ({ value: p.po_id, label: p.po_number })));
    } catch (err) { console.error(err); }
  };

  const fetchItemDDL = async (search = "") => {
    try {
      const res = await api.get("/i_pi_get_item_ddl", { params: { SearchTerm: search } });
      if (res.data?.Status === 1)
        setItemOptions(res.data.Result.map(i => ({ 
          value: i.item_id, 
          label: i.item_name,
          code: i.item_code,
          category: i.category_name,
          uom: i.uom_name
        })));
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (!isEdit && !isView) fetchNextPINumber();
    fetchVendors();
    fetchApprovedPOs();
    fetchItemDDL();
  }, [isEdit, isView]);

  /* ─────────────────────────────────────────────
      FETCH: Edit / View Data
  ───────────────────────────────────────────── */
  useEffect(() => {
    const fetchRecord = async () => {
      if (!currentId) return;
      setFetching(true);
      try {
        const res = await api.get("/i_pi_purchase_invoice_select_all_and_id", { params: { pinv_id: currentId, pi_id: currentId } });
        if (res.data?.Status === 1 && res.data.Result?.length > 0) {
          const h = res.data.Result[0];
          setForm({
            piNumber:      h.invoice_number || "",
            invoiceNumber: h.invoice_number || "",
            invoiceDate: formatDateForInput(h.invoice_date) || today(),
            dueDate: formatDateForInput(h.due_date) || "",
            vendor:        h.pinv_vendor_id ? { value: h.pinv_vendor_id, label: h.vendor_name || h.vc_group_name || "" } : null,
            po:            h.pinv_po_id ? { value: h.pinv_po_id, label: h.purchase_number || h.po_number || "" } : null,
            grn:           h.pinv_grn_id ? { value: h.pinv_grn_id, label: h.grn_number || "" } : null,
            currency:      { value: "INR", label: "INR" },
            notes:         h.reject_remark || h.pi_remarks || "",
            status:        h.status || "Draft",
          });

          // Fetch items for existing PI
          const iRes = await api.get("/i_pi_purchase_invoice_items_select", { params: { pinv_id: currentId, pi_id: currentId } });
          if (iRes.data?.Status === 1) {
            setItems(iRes.data.Result.map(r => {
              // Calculate GST percentage from amount and tax if percentage is not provided directly
              let gstPercent = 18; // Default
              if (r.pinv_i_amount > 0) {
                const totalTax = (r.pinv_i_cgst || 0) + (r.pinv_i_sgst || 0) + (r.pinv_i_igst || 0);
                gstPercent = Math.round((totalTax / r.pinv_i_amount) * 100);
              }

              // Try to find the item in our pre-loaded options if the API didn't join the name
              const foundItem = itemOptions.find(opt => opt.value === (r.itm_item_name || r.itm_item_name));
              const finalItemName = r.item_name || foundItem?.label || `${r.itm_item_name}`;
              const finalItemCode = r.item_code || foundItem?.code || "";

              return {
                id:         r.pinv_i_id || r.id,
                itemId:     r.pinv_i_item_id || r.pii_item_id,
                itemName:   finalItemName,
                itemCode:   finalItemCode,
                selectedItem: { value: r.pinv_i_item_id || r.pii_item_id, label: finalItemName, code: finalItemCode },
                poQty:      r.po_qty || 0,
                grnQty:     r.grn_qty || 0,
                invoiceQty: r.pinv_i_quantity || r.pii_quantity || 0,
                rate:       r.pinv_i_rate || r.pii_rate || 0,
                gst:        { value: gstPercent, label: `${gstPercent}%` },
                remark:     r.pinv_i_remarks || r.pii_remarks || "",
                isManual:   true, // Fallback to manual mode to allow reassignment or display via Select
              };
            }));
          }
        }
      } catch (err) { console.error(err); }
      finally { setFetching(false); }
    };
    fetchRecord();
  }, [currentId]);

  /* ─────────────────────────────────────────────
      Cascading Choice Logic
  ───────────────────────────────────────────── */
  const handlePOChange = async (val) => {
    setForm((prev) => ({ ...prev, po: val, grn: null }));
    setGrnOptions([]);
    setItems([]);
    if (!val) return;

    try {
      const res = await api.get("/i_pi_get_grn_by_po_id", { params: { po_id: val.value } });
      if (res.data?.Status === 1) {
        const options = res.data.Result.map(g => ({ value: g.id, label: g.grn_number }));
        setGrnOptions(options);

        // Auto-select if only one GRN exists
        if (options.length === 1) {
          handleGRNChange(options[0]);
        }
      }
    } catch (err) { console.error(err); }
  };

  const handleGRNChange = async (val) => {
    setForm((prev) => ({ ...prev, grn: val }));
    setItems([]);
    if (!val) return;

    try {
      const res = await api.get("/i_pi_grn_items_select", { params: { grn_id: val.value } });
      if (res.data?.Status === 1) {
        setItems(res.data.Result.map(r => ({
          itemId:     r.grni_item_id,
          itemName:   r.item_name,
          itemCode:   r.item_code,
          poQty:      r.grni_ordered_qty || 0,
          grnQty:     r.grni_received_qty || 0,
          invoiceQty: r.grni_received_qty || 0, // Default to Received Qty
          rate:       r.grni_unit_price || 0,
          gst:        { value: r.grni_gst_percent ?? 18, label: `${r.grni_gst_percent ?? 18}%` },
          remark:     "",
          isManual:   false,
        })));
      }
    } catch (err) { console.error(err); }
  };

  /* ─────────────────────────────────────────────
      Item Repeater Actions
  ───────────────────────────────────────────── */
  const handleAddRow = () => setItems([...items, emptyItem()]);
  const handleDeleteRow = (idx) => setItems(items.filter((_, i) => i !== idx));

  const updateItem = (index, field, value) => {
    const copy = [...items];
    copy[index][field] = value;
    
    // If selecting an item from search
    if (field === "selectedItem" && value) {
      copy[index].itemId = value.value;
      copy[index].itemName = value.label;
      copy[index].itemCode = value.code;
    }
    
    setItems(copy);
  };

  /* ─────────────────────────────────────────────
      Calculations
  ───────────────────────────────────────────── */
  const calc = (qty, rate, gstObj) => {
    const q = parseFloat(qty || 0);
    const r = parseFloat(rate || 0);
    const g = parseFloat(gstObj?.value || 0);
    const base  = q * r;
    const tax   = (base * g) / 100;
    return { base, tax, total: base + tax };
  };

  const totals = items.reduce(
    (acc, item) => {
      const r = calc(item.invoiceQty, item.rate, item.gst);
      acc.subTotal += r.base;
      acc.gst      += r.tax;
      acc.total    += r.total;
      return acc;
    },
    { subTotal: 0, gst: 0, total: 0 }
  );

  /* ─────────────────────────────────────────────
      Actions: Save / Submit
  ───────────────────────────────────────────── */
  const handleExportPDF = async () => {
    if (!currentId) {
      Swal.fire("Error", "Please save the invoice first before exporting.", "error");
      return;
    }

    setExporting(true);
    try {
      await downloadPurchaseInvoicePDF(currentId);
      Swal.fire("Success", "Invoice PDF exported successfully!", "success");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to export PDF. Please try again.", "error");
    } finally {
      setExporting(false);
    }
  };

  const handleSubmit = async (action) => {
    if (isView) return;
    
    // Validation
    const newErrors = {};
    if (!form.invoiceNumber) newErrors.invoiceNumber = { message: "Invoice Number is required" };
    if (!form.invoiceDate)   newErrors.invoiceDate   = { message: "Invoice Date is required" };
    if (!form.vendor)        newErrors.vendor        = { message: "Please select a Vendor" };
    if (items.length === 0)  newErrors.items         = { message: "At least one item is required" };

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setLoading(true);
    setSubmitAction(action);

    const payload = {
      pinv_id:                 Number(currentId) || 0,
      pinv_number:             form.piNumber,
      pinv_date:               new Date(form.invoiceDate).toISOString(),
      pinv_po_id:              form.po?.value || 0,
      pinv_grn_id:             form.grn?.value || 0,
      pinv_vendor_id:          form.vendor?.value || 0,
      pinv_due_date:           form.dueDate ? new Date(form.dueDate).toISOString() : null,
      pinv_total_amount:       totals.total,
      pinv_status:             action === "submit" ? "Pending" : "Draft",
      pinv_created_by_user_id: user?.id || 0,
      pinv_rejection_remarks:  "",
      pinv_approved_by_user_id: user?.id || 0,
      items: items.map(it => {
        const r = calc(it.invoiceQty, it.rate, it.gst);
        return {
          pinv_i_id:      it.id || 0,
          pinv_i_item_id: it.itemId,
          pinv_i_quantity: parseFloat(it.invoiceQty || 0),
          pinv_i_rate:     parseFloat(it.rate || 0),
          pinv_i_amount:   r.base,
          pinv_i_cgst:     r.tax / 2, // Standard project assumption
          pinv_i_sgst:     r.tax / 2,
          pinv_i_igst:     0,
          pinv_i_total:    r.total,
          pinv_i_remarks:  it.remark,
        };
      })
    };

    try {
      const res = await api.post("/i_pi_purchase_invoice_insert_update", payload);
      if (res.data?.Status === 1 || res.data?.status === 1) {
        Swal.fire("Success", res.data?.Message || res.data?.message ||"Invoice saved successfully.", "success");
        navigate("/Purchase_Invoice_list");
      } else {
        Swal.fire("Error", res.data?.Message || "Failed to save invoice.", "error");
      }
    } catch { Swal.fire("Error", "Server error occurred.", "error"); }
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
          <div className="max-w-full mx-auto pb-8">
            <Card title="Purchase Invoice">
              <div className="p-4 space-y-6">
                
                {/* Status Badges */}
                {(isEdit || isView) && (
                  <div className="flex justify-end gap-2">
                    <span className="px-3 py-1 rounded-sm text-[10px] font-bold border uppercase tracking-wider" style={statusBadgeStyle(form.status)}>
                      {form.status}
                    </span>
                    <span className="px-3 py-1 rounded-sm text-[10px] font-bold bg-yellow-50 text-yellow-600 border border-yellow-200 uppercase tracking-wider">
                      {isView ? "View" : "Edit"} Mode
                    </span>
                  </div>
                )}

                {/* Invoice Details */}
                <Card title="Invoice Header">
                  <div className="grid grid-cols-4 gap-4 p-4">
                    <div className="flex flex-col">
                      <Input label="PI Number" value={form.piNumber} disabled readOnly />
                    </div>
                    <div className="flex flex-col">
                      <Input
                        label="Invoice Number *"
                        value={form.invoiceNumber}
                        onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
                        placeholder="Enter supplier invoice #"
                        disabled={isView}
                        error={!!errors.invoiceNumber}
                      />
                      <ErrorMsg name="invoiceNumber" />
                    </div>
                    <div className="flex flex-col">
                      <Input
                        label="Invoice Date *"
                        type="date"
                        value={form.invoiceDate}
                        onChange={(e) => setForm({ ...form, invoiceDate: e.target.value })}
                        disabled={isView}
                        error={!!errors.invoiceDate}
                      />
                      <ErrorMsg name="invoiceDate" />
                    </div>
                    <div className="flex flex-col">
                      <Input
                        label="Due Date"
                        type="date"
                        value={form.dueDate}
                        onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                        disabled={isView}
                      />
                    </div>
                    <div className="flex flex-col">
                      <Select
                        label="Vendor *"
                        options={vendorOptions}
                        value={form.vendor}
                        onChange={(v) => { setForm({ ...form, vendor: v }); if(v) setErrors(prev => ({...prev, vendor: null})); }}
                        onSearch={fetchVendors}
                        serverSearch={true}
                        searchable
                        disabled={isView || isEdit}
                        error={!!errors.vendor}
                      />
                      <ErrorMsg name="vendor" />
                    </div>
                    <div className="flex flex-col">
                      <Select
                        label="Purchase Order"
                        options={poOptions}
                        value={form.po}
                        onChange={handlePOChange}
                        onSearch={fetchApprovedPOs}
                        serverSearch={true}
                        searchable
                        disabled={isView || isEdit}
                      />
                    </div>
                    <div className="flex flex-col">
                      <Select
                        label="GRN"
                        options={grnOptions}
                        value={form.grn}
                        onChange={handleGRNChange}
                        searchable
                        disabled={isView || isEdit}
                      />
                    </div>
                    <div className="flex flex-col">
                      <Select
                        label="Currency"
                        value={form.currency}
                        options={[
                          { value: "INR", label: "INR" },
                          { value: "USD", label: "USD" }
                        ]}
                        onChange={(v) => setForm({ ...form, currency: v })}
                        disabled={isView}
                      />
                    </div>
                  </div>
                </Card>

                {/* Invoice Items (Repeater Style) */}
                <Card 
                  title={
                    <div class="flex justify-between items-center w-full pr-4">
                      <span>Invoice Items</span>
                      {items.length > 0 && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border">{items.length} Lines</span>}
                    </div>
                  }
                >
                  <div className="p-4 space-y-3 overflow-x-auto min-w-[1000px]">
                    <ErrorMsg name="items" />
                    
                    {/* Header Row */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#222831] select-none">
                      <span className="w-8 text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8] text-center">#</span>
                      <span className="w-52 text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8]">Item Details</span>
                      <span className="w-20 text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8] text-center">PO Qty</span>
                      <span className="w-20 text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8] text-center">GRN Qty</span>
                      <span className="w-24 text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8] text-center">Inv Qty</span>
                      <span className="w-24 text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8] text-right">Rate</span>
                      <span className="w-20 text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8] text-right">GST %</span>
                      <span className="w-32 text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8] text-right">Total</span>
                      <span className="flex-1 text-[10px] font-bold uppercase tracking-widest text-[#DFD0B8]">Remark</span>
                    </div>

                    {/* Rows */}
                    {items.length === 0 ? (
                      <div className="p-12 text-center text-slate-400 italic bg-slate-50 border border-dashed rounded-xl">
                        {/* No items added. Click "+ ADD ITEM" to start or select a PO/GRN to load items. */}
                      </div>
                    ) : (
                      items.map((item, idx) => {
                        const r = calc(item.invoiceQty, item.rate, item.gst);
                        const isEven = idx % 2 === 0;
                        return (
                          <div 
                            key={idx}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition hover:shadow-md border ${isEven ? "bg-slate-50 border-slate-100" : "bg-white border-slate-50"}`}
                          >
                            {/* # */}
                            <div className="w-8 flex items-center justify-center">
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 w-5 h-5 flex items-center justify-center rounded-full italic">
                                {idx + 1}
                              </span>
                            </div>

                            {/* Item Details */}
                            <div className="w-52">
                              {item.isManual ? (
                                <Select
                                  compact
                                  searchable
                                  options={itemOptions}
                                  onSearch={fetchItemDDL}
                                  value={item.selectedItem}
                                  onChange={(v) => updateItem(idx, "selectedItem", v)}
                                  placeholder="Search item..."
                                />
                              ) : (
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-bold text-slate-700 truncate">{item.itemName}</span>
                                  <span className="text-[9px] text-slate-400">{item.itemCode}</span>
                                </div>
                              )}
                            </div>

                            {/* PO Qty */}
                            <div className="w-20">
                              <input type="text" readOnly value={item.poQty} className={`${readonlyCell} text-center`} />
                            </div>

                            {/* GRN Qty */}
                            <div className="w-20">
                              <input type="text" readOnly value={item.grnQty} className={`${readonlyCell} text-center font-bold text-slate-600`} />
                            </div>

                            {/* Invoiced Qty */}
                            <div className="w-24">
                              <input
                                type="number"
                                value={item.invoiceQty}
                                onChange={(e) => updateItem(idx, "invoiceQty", e.target.value)}
                                className={`${editCell} text-center font-bold`}
                                disabled={isView}
                              />
                            </div>

                            {/* Rate */}
                            <div className="w-24">
                              <input
                                type="number"
                                value={item.rate}
                                onChange={(e) => updateItem(idx, "rate", e.target.value)}
                                className={`${editCell} text-right font-semibold`}
                                disabled={isView}
                              />
                            </div>

                            {/* GST */}
                            <div className="w-20">
                              <Select
                                compact
                                options={GST_OPTIONS}
                                value={item.gst}
                                onChange={(v) => updateItem(idx, "gst", v)}
                                disabled={isView}
                              />
                            </div>

                            {/* Total (Calculated) */}
                            <div className="w-32 text-right flex flex-col justify-center">
                              <span className="text-[11px] font-bold text-slate-800">
                                {r.total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                              <span className="text-[8px] text-slate-400">GST: {r.tax.toFixed(2)}</span>
                            </div>

                            {/* Remark */}
                            <div className="flex-1">
                              <input
                                type="text"
                                value={item.remark}
                                onChange={(e) => updateItem(idx, "remark", e.target.value)}
                                className={editCell}
                                placeholder="Notes..."
                                disabled={isView}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </Card>

                <div className="grid grid-cols-3 gap-6">
                  {/* Notes Card */}
                  <div className="col-span-2">
                    <Card title="Additional Notes">
                      <div className="p-4">
                        <textarea
                          className="w-full min-h-[100px] border border-slate-200 rounded p-3 text-xs focus:ring-1 focus:ring-indigo-400 focus:outline-none transition"
                          placeholder="Internal remarks or payment instructions..."
                          value={form.notes}
                          onChange={(e) => setForm({ ...form, notes: e.target.value })}
                          disabled={isView}
                        ></textarea>
                      </div>
                    </Card>
                  </div>

                  {/* Summary Card */}
                  <Card title="Payment Summary">
                    <div className="p-6 space-y-4 text-xs">
                      <div className="flex justify-between items-center text-slate-500">
                        <span>Sub Total</span>
                        <span className="font-medium">{totals.subTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-500">
                        <span>Total GST</span>
                        <span className="font-medium text-indigo-600">+{totals.gst.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Grand Total</p>
                          <div className="text-2xl font-black text-[#222831]">
                            <span className="text-xs font-medium mr-1 text-slate-500">{form.currency.value}</span>
                            {totals.total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Actions */}
                {!isView && (
                  <div className="flex justify-center gap-4 pt-6">
                    <Button variant="cancel" onClick={() => navigate("/Purchase_Invoice_list")}>Cancel</Button>
                    <Button 
                      variant="update" 
                      onClick={() => handleSubmit("draft")} 
                      disabled={loading}
                    >
                      {loading && submitAction === "draft" ? "Processing..." : "Save Draft"}
                    </Button>
                    <Button 
                      variant="submit" 
                      onClick={() => handleSubmit("submit")} 
                      disabled={loading}
                    >
                      {loading && submitAction === "submit" ? "Processing..." : "Submit Invoice"}
                    </Button>
                  </div>
                )}
                {isView && (
                  <div className="flex justify-center gap-4 pt-6">
                    <Button variant="cancel" onClick={() => navigate("/Purchase_Invoice_list")}>Cancel</Button>
                    <Button 
                      variant="submit" 
                      onClick={handleExportPDF} 
                      disabled={exporting}
                    >
                      {exporting ? "Exporting..." : "Export PDF"}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
        <Footer />
        
        {/* Loading Overlay */}
        {(loading || fetching || exporting) && (
          <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-[2px] z-[9999] flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl shadow-2xl border flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-slate-700">
                {fetching ? "Loading Details..." : exporting ? "Exporting Invoice..." : "Processing Invoice..."}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Purchase_Invoice_form;