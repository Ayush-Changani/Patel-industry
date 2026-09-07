import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../../services/axios";
import Swal from "sweetalert2";
import { FaPlus, FaTrash } from "react-icons/fa";

import Card from "../../../components/Card";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import Sidebar from "../../../components/Sidebar";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";
import Select from "../../../components/Select";

// ✅ Added
import { validateRequired } from "../../../utils/validationUtils";

const HSN_Code_Master = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);

  const editId = query.get("eid");
  const viewId = query.get("view_id");
  const isEdit = Boolean(editId);
  const isView = Boolean(viewId);
  const currentId = editId || viewId || 0;

  const [form, setForm] = useState({
    hsnEffectiveDate: "",
    isActive: true,
  });

  const [gstSlab, setGstSlab] = useState(null);
  const [hsnCodes, setHsnCodes] = useState([""]);
  const [gstOptions, setGstOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // ✅ Added

  // ✅ Added: ErrorMsg component
  const ErrorMsg = ({ name }) =>
    errors[name]?.message ? (
      <p style={{ color: errors[name].color || "#F63049" }} className="text-xxxs mt-1">
        {errors[name].message}
      </p>
    ) : null;

  useEffect(() => {
    const fetchDetails = async () => {
      if (currentId && currentId !== "0") {
        try {
          const res = await api.get("/i_pi_hsn_code_mst_select_all_and_id", {
            params: { hsn_id: currentId },
          });
          if (res.data?.Status === 1 && res.data.Result?.length > 0) {
            const results = res.data.Result;
            const first = results[0];
            setForm({
              hsnEffectiveDate: first.effective_date?.split("T")[0] || "",
              isActive: first.hsn_is_active === 1,
            });
            setGstSlab({ value: first.hsn_gst_slab, label: first.slab_name });
            const codes = results.map((item) => item.hsn_code.toString());
            setHsnCodes(codes.length > 0 ? codes : [""]);
          }
        } catch (err) {
          console.error("Fetch detail error", err);
        }
      }
    };
    fetchDetails();
  }, [currentId]);

  const fetchGstSlab = async (search = "") => {
    try {
      const res = await api.get("/i_pi_get_all_gst_slab_ddl", {
        params: { SearchTerm: search || "" },
      });
      if (res.data?.Status === 1) {
        setGstOptions(
          res.data.Result.map((g) => ({
            value: g.slab_id,
            label: g.slab_name,
          }))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGstSlab("");
  }, []);

  /* ================= REPEATER LOGIC ================= */
  const handleCodeChange = (index, value) => {
    const updated = [...hsnCodes];
    updated[index] = value.replace(/\D/g, "").slice(0, 10);
    setHsnCodes(updated);
    // ✅ Clear hsnCodes error when user types in any code row
    if (errors.hsnCodes) setErrors((prev) => ({ ...prev, hsnCodes: null }));
  };

  const addRowAt = (index) => {
    const updated = [...hsnCodes];
    updated.splice(index + 1, 0, "");
    setHsnCodes(updated);
  };

  const removeRow = (index) => {
    const updated = hsnCodes.filter((_, i) => i !== index);
    setHsnCodes(updated.length > 0 ? updated : [""]);
  };

  // ✅ Added: validateForm function
  const validateForm = () => {
    const newErrors = {};
    newErrors.hsnEffectiveDate = validateRequired(form.hsnEffectiveDate, "Effective Date");
    newErrors.gstSlab = gstSlab
      ? null
      : { message: "GST Slab is required", color: "#F63049" };
    const validCodes = hsnCodes.filter((code) => code.trim() !== "");
    newErrors.hsnCodes =
      validCodes.length === 0
        ? { message: "At least one HSN Code is required", color: "#F63049" }
        : null;
    setErrors(newErrors);
    return Object.values(newErrors).every((err) => !err?.message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView || !validateForm()) return; // ✅ Changed

    const validCodes = hsnCodes.filter((code) => code.trim() !== "");
    setLoading(true);
    const payload = new FormData();
    payload.append("hsn_id", currentId);
    payload.append("hsn_effective_date", form.hsnEffectiveDate);
    payload.append("hsn_gst_slab", gstSlab.value);
    payload.append("hsn_is_active", form.isActive ? 1 : 0);
    validCodes.forEach((code) => payload.append("hsn_codes", code));

    try {
      const res = await api.post("/i_pi_hsn_code_mst_detail_insert", payload);
      if (res.data?.Status === 1 || res.data?.status === 1) {
        Swal.fire("Success", res.data?.message || "Record Saved Successfully", "success");
        navigate("/HSN_Code_List");
      } else {
        Swal.fire("Warning", res.data.message, "warning");
      }
    } catch (err) {
      Swal.fire("Error", "Server error", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col h-full overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar-sidebar">
          <div className="max-w-6xl mx-auto">
            <Card title="HSN Code Master">
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 p-2">

                {/* ✅ Wrapped in div, added ErrorMsg, clears error on change */}
                <div>
                  <Input
                    label="Effective Date"
                    type="date"
                    value={form.hsnEffectiveDate}
                    onChange={(e) => {
                      setForm({ ...form, hsnEffectiveDate: e.target.value });
                      if (errors.hsnEffectiveDate)
                        setErrors({ ...errors, hsnEffectiveDate: null });
                    }}
                    required
                    disabled={isView}
                  />
                  <ErrorMsg name="hsnEffectiveDate" />
                </div>

                {/* ✅ Wrapped in div, added ErrorMsg, clears error on select */}
                <div>
                  <Select
                    label="GST Slab"
                    value={gstSlab}
                    options={gstOptions}
                    onChange={(val) => {
                      setGstSlab(val);
                      setErrors({ ...errors, gstSlab: null });
                    }}
                    searchable
                    serverSearch
                    onSearch={fetchGstSlab}
                    placeholder="Select GST Slab..."
                    disabled={isView}
                  />
                  <ErrorMsg name="gstSlab" />
                </div>

                <div className="col-span-2 flex items-center gap-2 mt-2">
                  <Input
                    type="checkbox"
                    id="active-check"
                    label="Active"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    disabled={isView}
                  />
                </div>

                {/* Repeater Section */}
                <div className="col-span-2 mt-4 space-y-4">
                  {hsnCodes.map((code, index) => (
                    <div key={index} className="flex gap-4 items-end p-3 rounded-lg">
                      <div className="flex-1">
                        <Input
                          label={`HSN Code ${index + 1}`}
                          value={code}
                          placeholder="Enter HSN Code"
                          disabled={isView}
                          onChange={(e) => handleCodeChange(index, e.target.value)}
                        />
                      </div>

                      {!isView && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => addRowAt(index)}
                            className="p-3 transition-colors"
                            title="Add Row"
                          >
                            <FaPlus size={14} />
                          </button>
                          {hsnCodes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRow(index)}
                              className="p-3 transition-colors"
                              title="Remove Row"
                            >
                              <FaTrash size={14} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {/* ✅ HSN repeater error shown below the list */}
                  <ErrorMsg name="hsnCodes" />
                </div>

                <div className="col-span-2 flex justify-center gap-4 mt-8 pt-4">
                  {!isView && (
                    <Button type="submit" variant="submit" disabled={loading}>
                      {loading ? "Saving..." : "Save"}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="cancel"
                    onClick={() => navigate("/HSN_Code_List")}
                  >
                    Cancel
                  </Button>
                </div>

              </form>
            </Card>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
};

export default HSN_Code_Master;