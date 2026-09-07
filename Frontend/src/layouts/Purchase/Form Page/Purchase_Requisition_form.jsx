import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/axios";
import Swal from "sweetalert2";
import { FaPlus, FaMinus, FaCheck, FaTimes } from "react-icons/fa";

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

const formatPRNumber = (num) => {
  const year = new Date().getFullYear();
  return `PR-${year}-${String(num).padStart(5, "0")}`;
};

const PRIORITY_OPTIONS = [
  { value: 1, label: "Normal" },
  { value: 2, label: "Urgent" },
  { value: 3, label: "Critical" },
];

const emptyItem = () => ({
  itemId: null, itemName: "", itemCode: "", category: "", uom: "", quantity: "", remarks: "",
});

const statusBadgeStyle = (status) => {
  const map = {
    Draft:    { background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1" },
    Pending:  { background: "#fef9c3", color: "#854d0e", border: "1px solid #fde047" },
    Approved: { background: "#dcfce7", color: "#166534", border: "1px solid #86efac" },
    Rejected: { background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" },
  };
  return map[status] || map.Draft;
};

const readonlyCell = "w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-400 focus:outline-none cursor-default tracking-wide";
const editCell     = "w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition placeholder-slate-300";

/* ─────────────────────────────────────────────
    Component
───────────────────────────────────────────── */
const Purchase_Requisition_form = () => {
  const location               = useLocation();
  const navigate               = useNavigate();
  const query                  = new URLSearchParams(location.search);
  const { user, getPagePerms } = useAuth();

  const editId    = query.get("eid");
  const viewId    = query.get("view_id");
  const isEdit    = Boolean(editId);
  const isView    = Boolean(viewId);
  const currentId = editId || viewId || 0;

  // ── Permissions ──
  const perms      = getPagePerms("/Purchase_Requisition_form");

  /* ── Form state ── */
  const [form, setForm] = useState({
    prNumber: "", prDate: today(), requiredByDate: "", entityGroup: "",
    requestedBy: "", priority: { value: 1, label: "Normal" },
    purposeJustification: "", remarks: "", prStatus: "Draft",
  });

  const [entity,     setEntity]     = useState(null);
  const [department, setDepartment] = useState(null);
  const [store,      setStore]      = useState(null);

  const [entityOptions,     setEntityOptions]     = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [storeOptions,      setStoreOptions]      = useState([]);
  const [itemOptions,       setItemOptions]       = useState([]);

  const [items,        setItems]        = useState([emptyItem()]);
  const [loading,      setLoading]      = useState(false);
  const [submitAction, setSubmitAction] = useState("draft");
  const [errors,       setErrors]       = useState({});

  const ErrorMsg = ({ name }) =>
    errors[name]?.message ? (
      <p style={{ color: "#F63049" }} className="text-xxxs mt-1">{errors[name].message}</p>
    ) : null;
const convertToInputDate = (dateStr) => {
  if (!dateStr) return "";

  // If already in YYYY-MM-DD or ISO
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
      FETCH: PR Number
  ───────────────────────────────────────────── */
  useEffect(() => {
    if (!isEdit && !isView) {
      api.get("/i_pi_get_next_pr_number")
        .then((res) => { if (res.data?.Status === 1) setForm((f) => ({ ...f, prNumber: formatPRNumber(res.data.Result) })); })
        .catch(() => setForm((f) => ({ ...f, prNumber: formatPRNumber(1) })));
    }
  }, [isEdit, isView]);

  useEffect(() => {
    if (user?.name) setForm((f) => ({ ...f, requestedBy: user.name, userId: user.id }));
  }, [user]);

  /* ─────────────────────────────────────────────
      FETCH: Dropdowns
  ───────────────────────────────────────────── */
  const fetchEntities = async (search = "") => {
    try {
      const res = await api.get("/i_pi_get_entity_ddl", { params: { SearchTerm: search } });
      if (res.data?.Status === 1)
        setEntityOptions(res.data.Result.map((e) => ({ value: e.entity_id, label: e.entity_name, groupId: e.entity_group_id, groupName: e.entity_group_name })));
    } catch (err) { console.error(err); }
  };

  const fetchDepartments = async (search = "") => {
    try {
      const res = await api.get("/i_pi_get_all_department_ddl", { params: { SearchTerm: search } });
      if (res.data?.Status === 1)
        setDepartmentOptions(res.data.Result.map((d) => ({ value: d.dept_id, label: d.dept_name })));
    } catch (err) { console.error(err); }
  };

  const fetchStores = async (search = "") => {
    try {
      const res = await api.get("/i_pi_location_of_store_ddl", { params: { SearchTerm: search } });
      if (res.data?.Status === 1)
        setStoreOptions(res.data.Result.map((s) => ({ value: s.sl_id, label: s.location })));
    } catch (err) { console.error(err); }
  };

  const fetchItemSuggestions = async (search = "") => {
    try {
      const res = await api.get("/i_pi_all_item_master_mst_ddl", { params: { SearchTerm: search } });
      if (res.data?.Status === 1)
        setItemOptions(res.data.Result.map((i) => ({ value: i.itm_id, label: i.item_name, itemCode: i.item_code, category: i.item_category, uom: i.unit_of_measure })));
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchEntities(); fetchDepartments(); fetchStores(); fetchItemSuggestions(); }, []);

  /* ─────────────────────────────────────────────
      FETCH: Edit / View data
  ───────────────────────────────────────────── */
  useEffect(() => {
    const fetchDetails = async () => {
      if (!currentId || currentId === "0" || currentId === 0) return;
      try {
        const headerRes = await api.get("/i_pi_purchase_requisition_select_all_and_id", { params: { pr_id: currentId } });
        const resData = headerRes.data;
        const status = resData?.status ?? resData?.Status;
        if (status === 1 && resData.Result?.length > 0) {
          const h = resData.Result[0];
          const priorityMap = { 1: "Normal", 2: "Urgent", 3: "Critical" };
          const priorityVal = h.pr_priority ?? h.priority ?? 1;

          setForm({
            prNumber: h.purchase_requisition_number || "",
            prDate: convertToInputDate(h.purchase_requisition_date) || today(),
            requiredByDate: convertToInputDate(h.required_by_date) || "",
            entityGroup: h.entity_group || "",
            requestedBy: h.requested_by_name || "",
            priority: { value: priorityVal, label: priorityMap[priorityVal] || "Normal" },
            purposeJustification: h.pr_purpose_justification ?? h.purpose_justification ?? "",
            remarks: h.pr_remarks ?? h.remarks ?? "",
            prStatus: h.status || "Draft",
          });
          setEntity({ 
            value: h.pr_entity_id, 
            label: h.entity_name || h.ent_name || "", 
            groupId: h.pr_entity_group_id || 0, 
            groupName: h.entity_group || "" 
          });
          setDepartment({ value: h.pr_department_id, label: h.department_name || "" });
          setStore({ value: h.pr_store_location_id, label: h.store_location_name || "" });
        }

        const itemsRes = await api.get("/i_pi_purchase_requisition_items_select_by_master", { params: { pr_id: currentId } });
        if (itemsRes.data?.Status === 1 && itemsRes.data.Result?.length > 0) {
          setItems(itemsRes.data.Result.map((i) => ({ itemId: i.pri_item_id, itemName: i.itm_item_name, itemCode: i.itm_item_code, category: i.ic_item_category, uom: i.uom_name, quantity: i.pri_quantity?.toString() || "", remarks: i.pri_item_remarks || "" })));
        } else {
          setItems([emptyItem()]);
        }
      } catch (err) { console.error(err); }
    };
    fetchDetails();
  }, [currentId]);

  /* ─────────────────────────────────────────────
      Item grid logic
  ───────────────────────────────────────────── */
  const selectItem = (index, selectedOption) => {
    const updated = [...items];
    updated[index] = !selectedOption ? emptyItem() : { ...updated[index], itemId: selectedOption.value, itemName: selectedOption.label, itemCode: selectedOption.itemCode, category: selectedOption.category, uom: selectedOption.uom };
    setItems(updated);
    if (errors.items) setErrors((p) => ({ ...p, items: null }));
  };

  const handleItemField = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const addItemRow    = (index) => { const u = [...items]; u.splice(index + 1, 0, emptyItem()); setItems(u); };
  const removeItemRow = (index) => { const u = items.filter((_, i) => i !== index); setItems(u.length > 0 ? u : [emptyItem()]); };

  /* ─────────────────────────────────────────────
      Validation
  ───────────────────────────────────────────── */
  const validateForm = () => {
    const newErrors = {};
    if (!form.requiredByDate)            newErrors.requiredByDate = { message: "Required by date is mandatory" };
    else if (form.requiredByDate < today()) newErrors.requiredByDate = { message: "Must be today or a future date" };
    if (!entity)     newErrors.entity     = { message: "Entity is required"    };
    if (!department) newErrors.department = { message: "Department is required" };
    if (!store)      newErrors.store      = { message: "Store is required"      };

    let hasValidItem = false;
    items.forEach((item, idx) => {
      if (!item.itemId) return;
      const qty = parseFloat(item.quantity);
      if (!item.quantity || isNaN(qty) || qty <= 0) newErrors[`qty_${idx}`] = { message: "Qty must be > 0" };
      else if (!/^\d+(\.\d{1,2})?$/.test(item.quantity)) newErrors[`qty_${idx}`] = { message: "Max 2 decimals allowed" };
      else hasValidItem = true;
    });
    if (!hasValidItem && !Object.keys(newErrors).some((k) => k.startsWith("qty_")))
      newErrors.items = { message: "Add at least one item with valid quantity" };

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (action) => {
    if (isView || !validateForm()) return;
    setLoading(true);
    const payload = {
      pr_id: currentId, pr_number: form.prNumber, pr_required_by_date: form.requiredByDate,
      pr_entity_id: entity?.value, pr_entity_group_id: entity?.groupId || 0,
      pr_department_id: department?.value, pr_store_location_id: store?.value,
      pr_requested_by_user_id: user?.id, pr_priority: form.priority?.value || 1,
      pr_purpose_justification: form.purposeJustification, pr_remarks: form.remarks,
      pr_status: action === "submit" ? "Pending" : "Draft",
      items: items.filter((i) => i.itemId && parseFloat(i.quantity) > 0)
        .map((i) => ({ pri_item_id: i.itemId, pri_quantity: parseFloat(parseFloat(i.quantity).toFixed(2)), pri_item_remarks: i.remarks })),
    };
    try {
      const res = await api.post("/i_pi_purchase_requisition_insert_update", payload);
      if (res.data?.status === 1 || res.data?.Status === 1) {
        Swal.fire("Success", res.data?.message || res.data?.Message || "PR saved successfully.", "success");
        navigate("/Purchase_Requisition_list");
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
            <Card title="Purchase Requisition">
              <div className="p-4 space-y-6">

                {/* Status + mode badges */}
                {(isEdit || isView) && (
                  <div className="flex justify-end items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold border" style={statusBadgeStyle(form.prStatus)}>
                      {form.prStatus}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-300">
                      {isView ? "View" : "Edit"}
                    </span>
                  </div>
                )}

                {/* SECTION 1 — Header */}
                <Card title="Header Information">
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <Input label="PR Number" value={form.prNumber} disabled readOnly />
                      <Input label="PR Date" type="date" value={form.prDate} disabled readOnly />
                      <div>
                        <Input
                          label="Required By Date" type="date" value={form.requiredByDate} min={today()}
                          onChange={(e) => {
                            const selected = e.target.value;
                            if (selected < today()) { setErrors((p) => ({ ...p, requiredByDate: { message: "Must be today or a future date" } })); return; }
                            setErrors((p) => { const n = { ...p }; delete n.requiredByDate; return n; });
                            setForm({ ...form, requiredByDate: selected });
                          }}
                          disabled={isView} required
                        />
                        <ErrorMsg name="requiredByDate" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Select label="Entity" value={entity} options={entityOptions}
                          onChange={(val) => { setEntity(val); setForm((f) => ({ ...f, entityGroup: val?.groupName || "" })); setErrors((p) => { const n = { ...p }; delete n.entity; return n; }); }}
                          searchable serverSearch onSearch={fetchEntities} required disabled={isView} />
                        <ErrorMsg name="entity" />
                      </div>
                      <Input label="Entity Group" value={form.entityGroup} disabled readOnly />
                      <div>
                        <Select label="Department" value={department} options={departmentOptions}
                          onChange={(val) => { setDepartment(val); setErrors((p) => { const n = { ...p }; delete n.department; return n; }); }}
                          searchable serverSearch onSearch={fetchDepartments} required disabled={isView} />
                        <ErrorMsg name="department" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <Input label="Requested By" value={form.requestedBy} disabled readOnly />
                      <div>
                        <Select label="Store / Deliver To" value={store} options={storeOptions}
                          onChange={(val) => { setStore(val); setErrors((p) => { const n = { ...p }; delete n.store; return n; }); }}
                          searchable serverSearch onSearch={fetchStores} required disabled={isView} />
                        <ErrorMsg name="store" />
                      </div>
                      <Select label="Priority" value={form.priority} options={PRIORITY_OPTIONS}
                        onChange={(val) => setForm({ ...form, priority: val })} disabled={isView} />
                    </div>
                  </div>
                </Card>

                {/* SECTION 2 — Items */}
                <Card title="Item Details">
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl select-none"
                      style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)", boxShadow: "0 2px 8px rgba(30,41,59,.18)", position: "sticky", top: 0, zIndex: 10 }}>
                      <span style={{ width: "32px",  flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">#</span>
                      <span style={{ width: "220px", flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Item Name <span className="text-rose-400">*</span></span>
                      <span style={{ width: "96px",  flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Code</span>
                      <span style={{ width: "120px", flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Category</span>
                      <span style={{ width: "64px",  flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">UoM</span>
                      <span style={{ width: "80px",  flexShrink: 0 }} className="text-[10px] font-bold uppercase tracking-widest text-slate-300 text-right">Qty <span className="text-rose-400">*</span></span>
                      <span style={{ flex: 1 }}                        className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Remarks</span>
                      {!isView && <span style={{ width: "64px", flexShrink: 0 }} />}
                    </div>

                    <div style={{ maxHeight: "360px", overflowY: "inherit", overflowX: "visible", display: "flex", flexDirection: "column", gap: "6px" }}>
                      {items.map((item, index) => (
                        <ItemRow key={index} index={index} item={item} isView={isView} itemOptions={itemOptions}
                          onItemSearch={fetchItemSuggestions} onSelectItem={selectItem} onFieldChange={handleItemField}
                          onAddRow={addItemRow} onRemoveRow={removeItemRow} totalRows={items.length}
                          qtyError={errors[`qty_${index}`]?.message} />
                      ))}
                    </div>

                    {errors.items?.message && (
                      <p style={{ color: "#F63049" }} className="text-xxxs px-1 flex items-center gap-1"><span>⚠</span> {errors.items.message}</p>
                    )}
                    {!isView && items.length === 0 && (
                      <button type="button" onClick={() => addItemRow(-1)}
                        className="w-full py-2 rounded-xl border-2 border-dashed border-indigo-300 text-indigo-400 text-xs font-semibold hover:border-indigo-500 hover:text-indigo-600 transition-all">
                        + Add Item
                      </button>
                    )}
                  </div>
                </Card>

                {/* SECTION 3 — Additional Info */}
                <Card title="Additional Information">
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Input label="Purpose / Justification" value={form.purposeJustification} multiline rows={4} maxLength={500}
                          onChange={(e) => { if (e.target.value.length <= 500) setForm({ ...form, purposeJustification: e.target.value }); }} disabled={isView} />
                        {!isView && <p className="text-right text-xs mt-1" style={{ color: form.purposeJustification.length > 450 ? "#dc2626" : "#94a3b8" }}>{form.purposeJustification.length} / 500</p>}
                      </div>
                      <div>
                        <Input label="Remarks" value={form.remarks} multiline rows={4} maxLength={500}
                          onChange={(e) => { if (e.target.value.length <= 500) setForm({ ...form, remarks: e.target.value }); }} disabled={isView} />
                        {!isView && <p className="text-right text-xs mt-1" style={{ color: form.remarks.length > 450 ? "#dc2626" : "#94a3b8" }}>{form.remarks.length} / 500</p>}
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
                      <Button variant="cancel" onClick={() => navigate("/Purchase_Requisition_list")}>Cancel</Button>
                      <Button variant="update" disabled={loading}
                        onClick={() => { setSubmitAction("draft"); handleSubmit("draft"); }}>
                        {loading && submitAction === "draft" ? "Saving..." : "Save Draft"}
                      </Button>
                      <Button variant="submit" disabled={loading}
                        onClick={() => { setSubmitAction("submit"); handleSubmit("submit"); }}>
                        {loading && submitAction === "submit" ? "Submitting..." : "Submit"}
                      </Button>
                    </>
                  ) : (
                    <Button variant="cancel" onClick={() => navigate("/Purchase_Requisition_list")}>Cancel</Button>
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
    ItemRow
───────────────────────────────────────────── */
const ItemRow = ({ index, item, isView, itemOptions, onItemSearch, onSelectItem, onFieldChange, onAddRow, onRemoveRow, totalRows, qtyError }) => {
  const isEven = index % 2 === 0;
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "12px", background: isEven ? "#f8fafc" : "#ffffff", border: "1px solid", borderColor: isEven ? "#e2e8f0" : "#f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,.04)", transition: "box-shadow .15s, border-color .15s", position: "relative", overflow: "visible", zIndex: 50 - index }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(99,102,241,.12)"; e.currentTarget.style.borderColor = "#c7d2fe"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,.04)";       e.currentTarget.style.borderColor = isEven ? "#e2e8f0" : "#f1f5f9"; }}
    >
      <div style={{ width: "32px", flexShrink: 0 }} className="flex items-center justify-center">
        <span className="text-[10px] font-bold text-slate-400 flex items-center justify-center rounded-full" style={{ width: "22px", height: "22px", background: isEven ? "#e2e8f0" : "#f1f5f9" }}>{index + 1}</span>
      </div>
      <div style={{ width: "220px", flexShrink: 0 }}>
        {isView ? <input type="text" value={item.itemName || "—"} readOnly className={readonlyCell} /> : (
          <Select value={item.itemId ? { value: item.itemId, label: item.itemName, itemCode: item.itemCode, category: item.category, uom: item.uom } : null}
            options={itemOptions} onChange={(val) => onSelectItem(index, val)} searchable serverSearch onSearch={onItemSearch} placeholder="Select item..." />
        )}
      </div>
      <div style={{ width: "96px",  flexShrink: 0 }}><input type="text" value={item.itemCode} readOnly placeholder="—" className={readonlyCell} /></div>
      <div style={{ width: "120px", flexShrink: 0 }}><input type="text" value={item.category} readOnly placeholder="—" className={readonlyCell} /></div>
      <div style={{ width: "64px",  flexShrink: 0 }} className="flex justify-center">
        {item.uom ? <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#ede9fe", color: "#6d28d9", border: "1px solid #ddd6fe", whiteSpace: "nowrap" }}>{item.uom}</span>
          : <span className="text-slate-300 text-xs">—</span>}
      </div>
      <div style={{ width: "80px", flexShrink: 0 }}>
        <input type="number" value={item.quantity} disabled={isView} placeholder="0"
          onChange={(e) => onFieldChange(index, "quantity", e.target.value)}
          className={`w-full px-2.5 py-1.5 text-xs rounded-lg border text-right font-semibold focus:outline-none focus:ring-2 transition ${qtyError ? "border-rose-400 bg-rose-50 text-rose-600 focus:ring-rose-300" : "border-slate-300 bg-white text-slate-700 focus:ring-indigo-300"}`}
          style={{ appearance: "textfield" }} />
        {qtyError && <p style={{ color: "#F63049" }} className="text-xxxs mt-0.5 text-right">{qtyError}</p>}
      </div>
      <div style={{ flex: 1 }}>
        <input type="text" value={item.remarks} disabled={isView} placeholder="Optional note…"
          onChange={(e) => onFieldChange(index, "remarks", e.target.value)} className={isView ? readonlyCell : editCell} />
      </div>
      {!isView && (
        <div style={{ width: "64px", flexShrink: 0 }} className="flex items-center justify-center gap-1">
          <button type="button" onClick={() => onAddRow(index)} className="flex items-center justify-center rounded-lg transition-all"
            style={{ width: "26px", height: "26px", background: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#bbf7d0"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#dcfce7"; }}>
            <FaPlus size={9} />
          </button>
          {totalRows > 1 && (
            <button type="button" onClick={() => onRemoveRow(index)} className="flex items-center justify-center rounded-lg transition-all"
              style={{ width: "26px", height: "26px", background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#fecaca"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#fee2e2"; }}>
              <FaMinus size={9} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Purchase_Requisition_form;