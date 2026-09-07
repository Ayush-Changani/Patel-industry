import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/axios";
import Swal from "sweetalert2";
import { FaPlus, FaMinus } from "react-icons/fa";

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

const formatPINumber = (num) => {
  const year = new Date().getFullYear();
  return `PI-${year}-${String(num).padStart(5, "0")}`;
};

const statusBadgeStyle = (status) => {
  const map = {
    Draft:  { background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1" },
    Sent:   { background: "#dbeafe", color: "#1e40af", border: "1px solid #93c5fd" },
    Closed: { background: "#dcfce7", color: "#166534", border: "1px solid #86efac" },
  };
  return map[status] || map.Draft;
};

const emptyItem = () => ({
  prItemId:   null,
  itemId:     null,
  itemName:   "",
  itemCode:   "",
  category:   "",
  uom:        "",
  prQty:      "",
  inquiryQty: "",
  remarks:    "",
});

const emptyVendor = () => ({
  vendorId:      null,
  vendorName:    "",
  contactPerson: "",
  phone:         "",
  remarks:       "",
});

const readonlyCell =
  "w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-400 focus:outline-none cursor-default tracking-wide";
const editCell =
  "w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition placeholder-slate-300";

/* ─────────────────────────────────────────────
    Component
───────────────────────────────────────────── */
const Purchase_Inquiry_form = () => {
  const location               = useLocation();
  const navigate               = useNavigate();
  const query                  = new URLSearchParams(location.search);
  const { user, getPagePerms } = useAuth();

  const editId    = query.get("eid");
  const viewId    = query.get("view_id");
  const isEdit    = Boolean(editId);
  const isView    = Boolean(viewId);
  const currentId = editId || viewId || 0;

  const perms = getPagePerms("/Purchase_Inquiry_form");

  /* ── Form state ── */
  const [form, setForm] = useState({
    piNumber:             "",
    piDate:               today(),
    expectedDeliveryDate: "",
    termsConditions:      "",
    remarks:              "",
    piStatus:             "Draft",
    preparedBy:           "",
  });

  const [selectedPR, setSelectedPR] = useState(null);
  const [entity,     setEntity]     = useState(null);
  const [department, setDepartment] = useState(null);

  const [prOptions,     setPROptions]     = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);

  const [items,   setItems]   = useState([emptyItem()]);
  const [vendors, setVendors] = useState([emptyVendor()]);

  const [loading,      setLoading]      = useState(false);
  const [submitAction, setSubmitAction] = useState("draft");
  const [errors,       setErrors]       = useState({});

  const ErrorMsg = ({ name }) =>
    errors[name]?.message ? (
      <p style={{ color: "#F63049" }} className="text-xxxs mt-1">
        {errors[name].message}
      </p>
    ) : null;

  /* ─────────────────────────────────────────────
      FETCH: PI Number
  ───────────────────────────────────────────── */
  useEffect(() => {
    if (!isEdit && !isView) {
      api.get("/i_pi_get_next_pi_number")
        .then((res) => {
          if (res.data?.Status === 1)
            setForm((f) => ({ ...f, piNumber: formatPINumber(res.data.Result) }));
        })
        .catch(() => setForm((f) => ({ ...f, piNumber: formatPINumber(1) })));
    }
  }, [isEdit, isView]);

  useEffect(() => {
    if (user?.name) setForm((f) => ({ ...f, preparedBy: user.name }));
  }, [user]);

  const convertToInputDate = (dateStr) => {
  if (!dateStr) return "";

  // If already in correct format (YYYY-MM-DD or ISO)
  if (dateStr.includes("-")) return dateStr.split("T")[0];

  // Convert DD/MM/YYYY → YYYY-MM-DD
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return "";
};
  /* ─────────────────────────────────────────────
      FETCH: Dropdowns
  ───────────────────────────────────────────── */
  const fetchApprovedPRs = async (search = "") => {
    try {
      const res = await api.get("/i_pi_get_approved_pr_ddl", { params: { SearchTerm: search } });
      if (res.data?.Status === 1)
        setPROptions(
          res.data.Result.map((p) => ({
            value:          p.pr_id,
            label:          p.pr_number,
            entityId:       p.pr_entity_id,
            entityName:     p.entity_name,
            entityGroupId:  p.pr_entity_group_id,
            entityGroup:    p.entity_group,
            departmentId:   p.pr_department_id,
            departmentName: p.department_name,
          }))
        );
    } catch (err) { console.error(err); }
  };

  const fetchVendors = async (search = "") => {
    try {
      const res = await api.get("/i_pi_get_vendor_ddl", { params: { SearchTerm: search } });
      if (res.data?.Status === 1)
        setVendorOptions(
          res.data.Result.map((v) => ({
            value:         v.vendor_id,
            label:         v.vendor_name,
            contactPerson: v.contact_person || "",
            phone:         v.phone          || "",
          }))
        );
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchApprovedPRs(); fetchVendors(); }, []);

  /* ─────────────────────────────────────────────
      PR selected → auto-load items + entity/dept
  ───────────────────────────────────────────── */
  const handlePRSelect = async (val) => {
    setSelectedPR(val);
    setErrors((p) => { const n = { ...p }; delete n.selectedPR; return n; });

    if (!val) {
      setItems([emptyItem()]); setEntity(null); setDepartment(null);
      return;
    }

    setEntity({ value: val.entityId, label: val.entityName, groupId: val.entityGroupId, groupName: val.entityGroup });
    setDepartment({ value: val.departmentId, label: val.departmentName });

    try {
      const res = await api.get("/i_pi_purchase_requisition_items_select_by_master", { params: { pr_id: val.value } });
      if (res.data?.Status === 1 && res.data.Result?.length > 0) {
        const firstItem = res.data.Result[0];

        setDepartment((prev) => {
          if (!prev?.label && firstItem.department_name) {
            return { value: firstItem.pr_department_id || firstItem.pi_department_id || prev?.value, label: firstItem.department_name };
          }
          return prev;
        });

        setEntity((prev) => {
          if ((!prev?.groupName || !prev?.label) && (firstItem.entity_group || firstItem.entity_name)) {
            return {
              value: firstItem.pr_entity_id || firstItem.pi_entity_id || prev?.value,
              label: firstItem.entity_name || prev?.label,
              groupId: firstItem.pr_entity_group_id || firstItem.pi_entity_group_id || prev?.groupId,
              groupName: firstItem.entity_group || prev?.groupName,
            };
          }
          return prev;
        });

        setItems(
          res.data.Result.map((i) => ({
            prItemId:   i.pri_id || null,
            itemId:     i.pri_item_id,
            itemName:   i.itm_item_name,
            itemCode:   i.itm_item_code,
            category:   i.ic_item_category,
            uom:        i.uom_name,
            prQty:      i.pri_quantity?.toString() || "",
            inquiryQty: i.pri_quantity?.toString() || "",
            remarks:    "",
          }))
        );
      } else {
        setItems([emptyItem()]);
      }
    } catch (err) { console.error(err); setItems([emptyItem()]); }
  };

  /* ─────────────────────────────────────────────
      FETCH: Edit / View data (dates ignored)
  ───────────────────────────────────────────── */
  useEffect(() => {
    const fetchDetails = async () => {
      if (!currentId || currentId === "0" || currentId === 0) return;
      try {
        /* ── Header ── */
        const res  = await api.get("/i_pi_purchase_inquiry_select_all_and_id", { params: { pi_id: currentId } });
        const data = res.data;
        console.log("[PI fetchDetails] raw response:", data);

        // Normalise: handle { Status, Result:[...] }, { Status, Result:{...} }, or direct array/object
        let h = null;
        if (data?.Result) {
          h = Array.isArray(data.Result) ? data.Result[0] : data.Result;
        } else if (Array.isArray(data)) {
          h = data[0];
        } else if (data && typeof data === "object" && data.pi_id) {
          h = data;
        }

        if (h) {
          // IMPORTANT: Do NOT set piDate or expectedDeliveryDate from API.
          // piDate remains today() and expectedDeliveryDate stays empty.
          setForm({
            piNumber:             h.purchase_inquiry_number || h.pi_number || "",
            piDate: convertToInputDate(h.purchase_inquiry_date) || today(),
            expectedDeliveryDate: convertToInputDate(h.expected_delivery_date) || "",
            termsConditions:      h.terms_conditions || h.pi_terms_conditions || "",
            remarks:              h.pi_remarks || h.remarks || "",
            piStatus:             h.status || h.pi_status || "Draft",
            preparedBy:           h.prepared_by_name || "",
});
          setSelectedPR({ value: h.pi_pr_id, label: h.purchase_requisition_number || h.pr_number });
          setEntity({ value: h.pi_entity_id, label: h.entity_name, groupId: h.pi_entity_group_id, groupName: h.entity_group });
          setDepartment({ value: h.pi_department_id, label: h.department_name });
        }

        /* ── Items ── */
        const itemsRes  = await api.get("/i_pi_purchase_inquiry_items_select_by_master", { params: { pi_id: currentId } });
        const itemsData = itemsRes.data;
        console.log("[PI fetchDetails] items response:", itemsData);
        const itemsList = itemsData?.Result
          ? (Array.isArray(itemsData.Result) ? itemsData.Result : [itemsData.Result])
          : Array.isArray(itemsData) ? itemsData : [];
        if (itemsList.length > 0) {
          const firstItem = itemsList[0]; 
          setDepartment((prev) => {
            if (!prev?.label && firstItem.department_name) {
              return { value: firstItem.pi_department_id || prev?.value, label: firstItem.department_name };
            }
            return prev;
          });

          setEntity((prev) => {
            if ((!prev?.groupName || !prev?.label) && (firstItem.entity_group || firstItem.entity_name)) {
              return {
                value: firstItem.pi_entity_id || prev?.value,
                label: firstItem.entity_name || prev?.label,
                groupId: firstItem.pi_entity_group_id || prev?.groupId,
                groupName: firstItem.entity_group || prev?.groupName,
              };
            }
            return prev;
          });

          setItems(
            itemsList.map((i) => ({
              prItemId:   i.pii_pr_item_id || null,
              itemId:     i.pii_item_id,
              itemName:   i.itm_item_name,
              itemCode:   i.itm_item_code,
              category:   i.ic_item_category,
              uom:        i.uom_name,
              prQty:      i.pr_quantity?.toString() || "",
              inquiryQty: i.pii_quantity?.toString() || "",
              remarks:    i.pii_item_remarks || "",
            }))
          );
        }

        /* ── Vendors ── */
        const vendorsRes  = await api.get("/i_pi_purchase_inquiry_vendors_select_by_master", { params: { pi_id: currentId } });
        const vendorsData = vendorsRes.data;
        console.log("[PI fetchDetails] vendors response:", vendorsData);
        const vendorsList = vendorsData?.Result
          ? (Array.isArray(vendorsData.Result) ? vendorsData.Result : [vendorsData.Result])
          : Array.isArray(vendorsData) ? vendorsData : [];
        if (vendorsList.length > 0) {
          setVendors(
            vendorsList.map((v) => ({
              vendorId:      v.piv_vendor_id,
              vendorName:    v.vendor_name,
              contactPerson: v.contact_person || "",
              phone:         v.phone          || "",
              remarks:       v.piv_remarks    || "",
            }))
          );
        }
      } catch (err) { console.error("[PI fetchDetails] error:", err); }
    };
    fetchDetails();
  }, [currentId]);

  /* ─────────────────────────────────────────────
      Item grid logic (with strict qty cap)
  ───────────────────────────────────────────── */
  const handleItemField = (index, field, value) => {
    if (field === "inquiryQty") {
      // Strict validation: cap at PR qty if a valid PR qty exists
      const prQty = parseFloat(items[index].prQty);
      let newValue = value === "" ? "" : parseFloat(value);
      if (!isNaN(newValue) && !isNaN(prQty) && prQty > 0 && newValue > prQty) {
        newValue = prQty;
      }
      // If value is not a number (or empty), keep as string for input
      const finalValue = newValue === "" ? "" : newValue.toString();
      const u = [...items];
      u[index] = { ...u[index], [field]: finalValue };
      setItems(u);
    } else {
      const u = [...items];
      u[index] = { ...u[index], [field]: value };
      setItems(u);
    }
  };

  const addItemRow       = (index) => { const u = [...items]; u.splice(index + 1, 0, emptyItem()); setItems(u); };
  const removeItemRow    = (index) => { const u = items.filter((_, i) => i !== index); setItems(u.length ? u : [emptyItem()]); };

  /* ─────────────────────────────────────────────
      Vendor list logic
  ───────────────────────────────────────────── */
  const selectVendor = (index, val) => {
    const u = [...vendors];
    u[index] = !val
      ? emptyVendor()
      : { vendorId: val.value, vendorName: val.label, contactPerson: val.contactPerson, phone: val.phone, remarks: u[index].remarks };
    setVendors(u);
    setErrors((p) => { const n = { ...p }; delete n.vendors; return n; });
  };

  const handleVendorField = (index, field, value) => { const u = [...vendors]; u[index] = { ...u[index], [field]: value }; setVendors(u); };
  const addVendorRow      = (index) => { const u = [...vendors]; u.splice(index + 1, 0, emptyVendor()); setVendors(u); };
  const removeVendorRow   = (index) => { const u = vendors.filter((_, i) => i !== index); setVendors(u.length ? u : [emptyVendor()]); };
  const isDuplicateVendor = (index) => { const id = vendors[index].vendorId; if (!id) return false; return vendors.some((v, i) => i !== index && v.vendorId === id); };

  /* ─────────────────────────────────────────────
      Validation
  ───────────────────────────────────────────── */
  const validateForm = () => {
    const newErrors = {};

    if (!selectedPR)                          newErrors.selectedPR           = { message: "Please select an approved PR" };
    if (!form.expectedDeliveryDate)           newErrors.expectedDeliveryDate = { message: "Expected delivery date is mandatory" };
    else if (form.expectedDeliveryDate < today()) newErrors.expectedDeliveryDate = { message: "Must be today or a future date" };

    let hasValidItem = false;
    items.forEach((item, idx) => {
      if (!item.itemId) return;
      const qty = parseFloat(item.inquiryQty);
      const prQty = parseFloat(item.prQty);
      if (!item.inquiryQty || isNaN(qty) || qty <= 0)
        newErrors[`qty_${idx}`] = { message: "Qty must be > 0" };
      else if (!/^\d+(\.\d{1,2})?$/.test(item.inquiryQty))
        newErrors[`qty_${idx}`] = { message: "Max 2 decimals" };
      else if (!isNaN(prQty) && qty > prQty)
        newErrors[`qty_${idx}`] = { message: "Cannot exceed PR Qty" };
      else hasValidItem = true;
    });
    if (!hasValidItem && !Object.keys(newErrors).some((k) => k.startsWith("qty_")))
      newErrors.items = { message: "At least one item with valid quantity is required" };

    const filledVendors = vendors.filter((v) => v.vendorId);
    if (filledVendors.length === 0)
      newErrors.vendors = { message: "Add at least one vendor" };
    else if (new Set(filledVendors.map((v) => v.vendorId)).size !== filledVendors.length)
      newErrors.vendors = { message: "Duplicate vendors found — each vendor can appear only once" };

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
      pi_id:                     currentId,
      pi_number:                 form.piNumber,
      pi_pr_id:                  selectedPR?.value,
      pi_entity_id:              entity?.value,
      pi_entity_group_id:        entity?.groupId || 0,
      pi_department_id:          department?.value,
      pi_expected_delivery_date: form.expectedDeliveryDate,
      pi_terms_conditions:       form.termsConditions,
      pi_remarks:                form.remarks,
      pi_prepared_by_user_id:    user?.id,
      pi_status:                 action === "send" ? "Sent" : "Draft",
      items: items
        .filter((i) => i.itemId && parseFloat(i.inquiryQty) > 0)
        .map((i) => ({
          pii_pr_item_id:   i.prItemId,
          pii_item_id:      i.itemId,
          pii_quantity:     parseFloat(parseFloat(i.inquiryQty).toFixed(2)),
          pii_item_remarks: i.remarks,
        })),
      vendors: vendors
        .filter((v) => v.vendorId)
        .map((v) => ({
          piv_vendor_id: v.vendorId,
          piv_remarks:   v.remarks,
        })),
    };

    try {
      const res = await api.post("/i_pi_purchase_inquiry_insert_update", payload);
      if (res.data?.status === 1 || res.data?.Status === 1) {
        Swal.fire("Success", res.data?.message || res.data?.Message || "Inquiry saved successfully.", "success");
        navigate("/Purchase_Inquiry_list");
      } else {
        Swal.fire("Error", res.data?.message || res.data?.Message || "Failed to save.", "error");
      }
    } catch {
      Swal.fire("Error", "Server error.", "error");
    } finally {
      setLoading(false);
    }
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
            <Card title="Purchase Inquiry">
              <div className="p-4 space-y-6">

                {/* Status + mode badges */}
                {(isEdit || isView) && (
                  <div className="flex justify-end items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold border" style={statusBadgeStyle(form.piStatus)}>
                      {form.piStatus}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-300">
                      {isView ? "View" : "Edit"}
                    </span>
                  </div>
                )}

                {/* ══ SECTION 1 — Header ══ */}
                <Card title="Header Information">
                  <div className="p-4 space-y-4">

                    <div className="grid grid-cols-3 gap-4">
                      <Input label="PI Number" value={form.piNumber} disabled readOnly />
                      <Input label="PI Date"   type="date" value={form.piDate} disabled readOnly />
                      <div>
                        <Input
                          label="Expected Delivery Date" type="date"
                          value={form.expectedDeliveryDate} min={today()}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v < today()) { setErrors((p) => ({ ...p, expectedDeliveryDate: { message: "Must be today or a future date" } })); return; }
                            setErrors((p) => { const n = { ...p }; delete n.expectedDeliveryDate; return n; });
                            setForm({ ...form, expectedDeliveryDate: v });
                          }}
                          disabled={isView} required
                        />
                        <ErrorMsg name="expectedDeliveryDate" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Select
                          label="Purchase Requisition" value={selectedPR} options={prOptions}
                          onChange={handlePRSelect} searchable serverSearch onSearch={fetchApprovedPRs}
                          required disabled={isView || isEdit}
                        />
                        <ErrorMsg name="selectedPR" />
                      </div>
                      <Input label="Entity"     value={entity?.label    || ""} disabled readOnly />
                      <Input label="Department" value={department?.label || ""} disabled readOnly />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <Input label="Prepared By" value={form.preparedBy} disabled readOnly />
                    </div>

                  </div>
                </Card>

                {/* ══ SECTION 2 — Vendors ══ */}
                <Card title="Vendors to Inquire">
                  <div className="p-4 space-y-3">

                    {!isView && (
                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 font-bold text-[9px]">i</span>
                        Add all vendors you want to send this inquiry to.
                      </p>
                    )}

                    {/* Vendor grid header */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl select-none"
                      style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)", boxShadow: "0 2px 8px rgba(30,41,59,.18)" }}>
                      <span style={{ width: "32px",  flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">#</span>
                      <span style={{ width: "220px", flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Vendor / Supplier <span className="text-rose-400">*</span></span>
                      <span style={{ width: "130px", flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Contact Person</span>
                      <span style={{ width: "120px", flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Phone</span>
                      <span style={{ flex: 1 }}                        className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Remarks</span>
                      {!isView && <span style={{ width: "64px", flexShrink: 0 }} />}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {vendors.map((vendor, index) => (
                        <VendorRow
                          key={index} index={index} vendor={vendor} isView={isView}
                          vendorOptions={vendorOptions} onVendorSearch={fetchVendors}
                          onSelectVendor={selectVendor} onFieldChange={handleVendorField}
                          onAddRow={addVendorRow} onRemoveRow={removeVendorRow}
                          isDuplicate={isDuplicateVendor(index)}
                          totalRows={vendors.length}
                        />
                      ))}
                    </div>

                    {errors.vendors?.message && (
                      <p style={{ color: "#F63049" }} className="text-xxxs px-1 flex items-center gap-1">
                        <span>⚠</span> {errors.vendors.message}
                      </p>
                    )}
                  </div>
                </Card>

                {/* ══ SECTION 3 — Items ══ */}
                <Card title="Item Details">
                  <div className="p-4 space-y-3">

                    {!isView && selectedPR && (
                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-100 text-green-600 font-bold text-[9px]">✓</span>
                        Items loaded from PR <span className="font-semibold text-indigo-600">{selectedPR.label}</span>. Adjust Inquiry Qty if needed.
                      </p>
                    )}

                    {/* Item grid header */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl select-none"
                      style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)", boxShadow: "0 2px 8px rgba(30,41,59,.18)", position: "sticky", top: 0, zIndex: 10 }}>
                      <span style={{ width: "32px",  flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">#</span>
                      <span style={{ width: "200px", flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Item Name</span>
                      <span style={{ width: "90px",  flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Code</span>
                      <span style={{ width: "110px", flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Category</span>
                      <span style={{ width: "56px",  flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">UoM</span>
                      <span style={{ width: "72px",  flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">PR Qty</span>
                      <span style={{ width: "80px",  flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-slate-300 text-right">Inq. Qty <span className="text-rose-400">*</span></span>
                      <span style={{ flex: 1 }}                        className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Remarks</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {items.map((item, index) => (
                        <ItemRow
                          key={index} index={index} item={item} isView={isView}
                          onFieldChange={handleItemField}
                          totalRows={items.length}
                          qtyError={errors[`qty_${index}`]?.message}
                        />
                      ))}
                    </div>

                    {errors.items?.message && (
                      <p style={{ color: "#F63049" }} className="text-xxxs px-1 flex items-center gap-1">
                        <span>⚠</span> {errors.items.message}
                      </p>
                    )}
                  </div>
                </Card>

                {/* ══ SECTION 4 — Additional Info ══ */}
                <Card title="Additional Information">
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Input label="Terms & Conditions" value={form.termsConditions} multiline rows={4} maxLength={1000}
                          onChange={(e) => { if (e.target.value.length <= 1000) setForm({ ...form, termsConditions: e.target.value }); }} disabled={isView} />
                        {!isView && (
                          <p className="text-right text-xs mt-1" style={{ color: form.termsConditions.length > 900 ? "#dc2626" : "#94a3b8" }}>
                            {form.termsConditions.length} / 1000
                          </p>
                        )}
                      </div>
                      <div>
                        <Input label="Remarks" value={form.remarks} multiline rows={4} maxLength={500}
                          onChange={(e) => { if (e.target.value.length <= 500) setForm({ ...form, remarks: e.target.value }); }} disabled={isView} />
                        {!isView && (
                          <p className="text-right text-xs mt-1" style={{ color: form.remarks.length > 450 ? "#dc2626" : "#94a3b8" }}>
                            {form.remarks.length} / 500
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* ══ ACTION BUTTONS ══ */}
                <div className="flex justify-center gap-4 pt-4">
                  {!isView ? (
                    <>
                      <Button variant="cancel" onClick={() => navigate("/Purchase_Inquiry_list")}>Cancel</Button>
                      <Button variant="update" disabled={loading}
                        onClick={() => { setSubmitAction("draft"); handleSubmit("draft"); }}>
                        {loading && submitAction === "draft" ? "Saving..." : "Save Draft"}
                      </Button>
                      <Button variant="submit" disabled={loading}
                        onClick={() => { setSubmitAction("send"); handleSubmit("send"); }}>
                        {loading && submitAction === "send" ? "Sending..." : "Send to Vendors"}
                      </Button>
                    </>
                  ) : (
                    <Button variant="cancel" onClick={() => navigate("/Purchase_Inquiry_list")}>Cancel</Button>
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
    VendorRow
───────────────────────────────────────────── */
const VendorRow = ({ index, vendor, isView, vendorOptions, onVendorSearch, onSelectVendor, onFieldChange, onAddRow, onRemoveRow, isDuplicate, totalRows }) => {
  const isEven = index % 2 === 0;
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: "8px",
        padding: "8px 12px", borderRadius: "12px",
        background:  isDuplicate ? "#fff7ed" : isEven ? "#f8fafc" : "#ffffff",
        border: "1px solid",
        borderColor: isDuplicate ? "#fdba74" : isEven ? "#e2e8f0" : "#f1f5f9",
        boxShadow: "0 1px 3px rgba(0,0,0,.04)", transition: "box-shadow .15s, border-color .15s",
        position: "relative", zIndex: 50 - index,
      }}
      onMouseEnter={(e) => { if (!isDuplicate) { e.currentTarget.style.boxShadow = "0 4px 12px rgba(99,102,241,.12)"; e.currentTarget.style.borderColor = "#c7d2fe"; } }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,.04)"; e.currentTarget.style.borderColor = isDuplicate ? "#fdba74" : isEven ? "#e2e8f0" : "#f1f5f9"; }}
    >
      <div style={{ width: "32px", flexShrink: 0 }} className="flex items-center justify-center">
        <span className="text-[10px] font-bold text-slate-400 flex items-center justify-center rounded-full"
          style={{ width: "22px", height: "22px", background: isEven ? "#e2e8f0" : "#f1f5f9" }}>{index + 1}</span>
      </div>

      <div style={{ width: "220px", flexShrink: 0 }}>
        {isView
          ? <input type="text" value={vendor.vendorName || "—"} readOnly className={readonlyCell} />
          : (
            <Select
              value={vendor.vendorId ? { value: vendor.vendorId, label: vendor.vendorName } : null}
              options={vendorOptions} onChange={(val) => onSelectVendor(index, val)}
              searchable serverSearch onSearch={onVendorSearch} placeholder="Select vendor..."
            />
          )}
        {isDuplicate && !isView && <p style={{ color: "#ea580c" }} className="text-xxxs mt-0.5">Duplicate vendor</p>}
      </div>

      <div style={{ width: "130px", flexShrink: 0 }}><input type="text" value={vendor.contactPerson || "—"} readOnly className={readonlyCell} /></div>
      <div style={{ width: "120px", flexShrink: 0 }}><input type="text" value={vendor.phone          || "—"} readOnly className={readonlyCell} /></div>

      <div style={{ flex: 1 }}>
        <input type="text" value={vendor.remarks} disabled={isView} placeholder="Optional note…"
          onChange={(e) => onFieldChange(index, "remarks", e.target.value)}
          className={isView ? readonlyCell : editCell} />
      </div>

      {!isView && (
        <div style={{ width: "64px", flexShrink: 0 }} className="flex items-center justify-center gap-1">
          <button type="button" onClick={() => onAddRow(index)}
            className="flex items-center justify-center rounded-lg transition-all"
            style={{ width: "26px", height: "26px", background: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#bbf7d0"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#dcfce7"; }}>
            <FaPlus size={9} />
          </button>
          {totalRows > 1 && (
            <button type="button" onClick={() => onRemoveRow(index)}
              className="flex items-center justify-center rounded-lg transition-all"
              style={{ width: "26px", height: "26px", background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#fecaca"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#fee2e2"; }}>
              <FaMinus size={9} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
    ItemRow
───────────────────────────────────────────── */
const ItemRow = ({ index, item, isView, onFieldChange, totalRows, qtyError }) => {
  const isEven = index % 2 === 0;
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: "8px",
        padding: "8px 12px", borderRadius: "12px",
        background: isEven ? "#f8fafc" : "#ffffff",
        border: "1px solid", borderColor: isEven ? "#e2e8f0" : "#f1f5f9",
        boxShadow: "0 1px 3px rgba(0,0,0,.04)", transition: "box-shadow .15s, border-color .15s",
        position: "relative", zIndex: 50 - index,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(99,102,241,.12)"; e.currentTarget.style.borderColor = "#c7d2fe"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,.04)";       e.currentTarget.style.borderColor = isEven ? "#e2e8f0" : "#f1f5f9"; }}
    >
      <div style={{ width: "32px", flexShrink: 0 }} className="flex items-center justify-center">
        <span className="text-[10px] font-bold text-slate-400 flex items-center justify-center rounded-full"
          style={{ width: "22px", height: "22px", background: isEven ? "#e2e8f0" : "#f1f5f9" }}>{index + 1}</span>
      </div>

      <div style={{ width: "200px", flexShrink: 0 }}><input type="text" value={item.itemName || "—"} readOnly className={readonlyCell} /></div>
      <div style={{ width: "90px",  flexShrink: 0 }}><input type="text" value={item.itemCode || "—"} readOnly className={readonlyCell} /></div>
      <div style={{ width: "110px", flexShrink: 0 }}><input type="text" value={item.category || "—"} readOnly className={readonlyCell} /></div>

      <div style={{ width: "56px", flexShrink: 0 }} className="flex justify-center">
        {item.uom
          ? <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "#ede9fe", color: "#6d28d9", border: "1px solid #ddd6fe", whiteSpace: "nowrap" }}>{item.uom}</span>
          : <span className="text-slate-300 text-xs">—</span>}
      </div>

      {/* PR Qty — blue reference */}
      <div style={{ width: "72px", flexShrink: 0 }}>
        <input type="text" value={item.prQty || "—"} readOnly
          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-blue-50 text-blue-500 font-semibold text-right focus:outline-none cursor-default" />
      </div>

      {/* Inquiry Qty — editable */}
      <div style={{ width: "80px", flexShrink: 0 }}>
        <input type="number" value={item.inquiryQty} disabled={isView} placeholder="0"
          onChange={(e) => onFieldChange(index, "inquiryQty", e.target.value)}
          className={`w-full px-2.5 py-1.5 text-xs rounded-lg border text-right font-semibold focus:outline-none focus:ring-2 transition ${
            qtyError ? "border-rose-400 bg-rose-50 text-rose-600 focus:ring-rose-300"
                     : "border-slate-300 bg-white text-slate-700 focus:ring-indigo-300"}`}
          style={{ appearance: "textfield" }} />
        {qtyError && <p style={{ color: "#F63049" }} className="text-xxxs mt-0.5 text-right">{qtyError}</p>}
      </div>

      <div style={{ flex: 1 }}>
        <input type="text" value={item.remarks} disabled={isView} placeholder="Optional note…"
          onChange={(e) => onFieldChange(index, "remarks", e.target.value)}
          className={isView ? readonlyCell : editCell} />
      </div>

    </div>
  );
};

export default Purchase_Inquiry_form;