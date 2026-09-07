import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../../services/axios";
import Swal from "sweetalert2";

import Card from "../../../components/Card";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import Sidebar from "../../../components/Sidebar";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";
import Select from "../../../components/Select";

// ✅ Added
import { validateRequired } from "../../../utils/validationUtils";

const Item_Master = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);

  const editId = query.get("eid");
  const viewId = query.get("view_id");
  const isEdit = Boolean(editId);
  const isView = Boolean(viewId);
  const currentItemId = editId || viewId || 0;

  const [form, setForm] = useState({
    itemName: "",
    itemCode: "",
    appliText: 1,
    maxStock: "",
    reOrder: "",
    isActive: true,
  });

  const [category, setCategory] = useState(null);
  const [uom, setUom] = useState(null);
  const [hsn, setHsn] = useState(null);
  const [gst, setGst] = useState({ slab_id: "", slab_name: "" });

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [uomOptions, setUomOptions] = useState([]);
  const [hsnOptions, setHsnOptions] = useState([]);
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
    const fetchItemDetail = async () => {
      if (currentItemId && currentItemId !== "0") {
        try {
          const res = await api.get("/i_pi_item_master_mst_select_all_and_id", {
            params: { itm_id: currentItemId },
          });

          if (
            (res.data?.Status === 1 || res.data?.status === 1) &&
            res.data.Result?.length > 0
          ) {
            const d = res.data.Result[0];
            setForm({
              itemName: d.item_name || "",
              itemCode: d.item_code || "",
              appliText: Number(d.applicable_text) || 1,
              maxStock: d.maximum_stok || "",
              reOrder: d.re_order_level || "",
              isActive: d.itm_is_active === 1,
            });
            setCategory({
              value: d.itm_item_category,
              label: d.item_category || "Selected Category",
              code: d.ic_category_code,
            });
            setUom({ value: d.itm_uom, label: d.unit_of_measure || "Selected UOM" });
            setHsn({ value: d.itm_hsn_code, label: d.hsn_code || "Selected HSN" });
            setGst({ slab_id: d.itm_gst, slab_name: d.GST || "" });
          }
        } catch (err) {
          console.error("Fetch Detail Error:", err);
        }
      }
    };
    fetchItemDetail();
  }, [currentItemId]);

  const fetchCategory = async (search = "") => {
    try {
      const res = await api.get("/i_pi_get_all_item_category_ddl", {
        params: { SearchTerm: search },
      });
      if (res.data?.Status === 1) {
        setCategoryOptions(
          res.data.Result.map((x) => ({
            value: x.ic_id,
            label: x.ic_item_category,
            code: x.ic_category_code,
          }))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUOM = async (search = "") => {
    try {
      const res = await api.get("/i_pi_get_all_uom_ddl", {
        params: { SearchTerm: search },
      });
      if (res.data?.Status === 1) {
        setUomOptions(
          res.data.Result.map((x) => ({ value: x.uom_id, label: x.uom_name }))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHSN = async (search = "") => {
    try {
      const res = await api.get("/i_pi_get_all_hsn_code_ddl", {
        params: { SearchTerm: search },
      });
      if (res.data?.Status === 1) {
        setHsnOptions(
          res.data.Result.map((x) => ({ value: x.hsn_dtl_id, label: x.hsn_code }))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchGST = async () => {
      if (!hsn?.value || isView || isEdit) return;
      try {
        const res = await api.get("/i_pi_get_gst_on_hsn_code", {
          params: { hsn_dtl_id: hsn.value },
        });
        if (res.data?.Result?.length > 0) {
          setGst({
            slab_id: res.data.Result[0].slab_id || "",
            slab_name: res.data.Result[0].slab_name || "",
          });
        }
      } catch (err) {
        setGst({ slab_id: "", slab_name: "" });
      }
    };
    fetchGST();
  }, [hsn, isView, isEdit]);

  useEffect(() => {
    if (category?.code && !isEdit && !isView) {
      const rnd = Math.floor(100000 + Math.random() * 900000);
      setForm((prev) => ({ ...prev, itemCode: `${category.code}-${rnd}` }));
    }
  }, [category, isEdit, isView]);

  useEffect(() => {
    fetchCategory();
    fetchUOM();
    fetchHSN();
  }, []);

  // ✅ Added: validateForm function
  const validateForm = () => {
    const newErrors = {};
    newErrors.category = category
      ? null
      : { message: "Item Category is required", color: "#F63049" };
    newErrors.itemName = validateRequired(form.itemName, "Item Name");
    newErrors.uom = uom
      ? null
      : { message: "UOM is required", color: "#F63049" };
    newErrors.hsn = hsn
      ? null
      : { message: "HSN Code is required", color: "#F63049" };
    setErrors(newErrors);
    return Object.values(newErrors).every((err) => !err?.message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView || !validateForm()) return; // ✅ Changed

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("itm_id", currentItemId);
      formData.append("itm_item_category", category.value);
      formData.append("itm_item_name", form.itemName);
      formData.append("itm_item_code", form.itemCode);
      formData.append("itm_uom", uom.value);
      formData.append("itm_appli_text", form.appliText);
      formData.append("itm_hsn_code", hsn.label);
      formData.append("itm_gst", gst.slab_id || "");
      formData.append("itm_re_order_level", form.reOrder);
      formData.append("itm_maximum_stok", form.maxStock);
      formData.append("itm_is_active", form.isActive ? 1 : 0);

      const res = await api.post("/i_pi_item_master_mst_insert", formData);
      if (res.data?.Status === 1 || res.data?.status === 1) {
        Swal.fire("Success", res.data?.message || "Item Saved Successfully", "success");
        navigate("/Item_Master_List");
      }
    } catch (err) {
      Swal.fire("Error", "Server Error", "error");
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
          <div className="max-w-8xl mx-auto">
            <Card title="Item Master">
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 p-2">

                {/* ✅ Wrapped in div, added ErrorMsg, clears on select */}
                <div>
                  <Select
                    label="Item Category"
                    options={categoryOptions}
                    value={category}
                    onChange={(val) => {
                      setCategory(val);
                      setErrors({ ...errors, category: null });
                    }}
                    searchable
                    serverSearch
                    onSearch={fetchCategory}
                    disabled={isView}
                  />
                  <ErrorMsg name="category" />
                </div>

                <Input label="Item Code" value={form.itemCode} disabled />

                {/* ✅ Wrapped in div, added ErrorMsg, clears on change */}
                <div>
                  <Input
                    label="Item Name"
                    placeholder="Enter full item name"
                    value={form.itemName}
                    onChange={(e) => {
                      setForm({ ...form, itemName: e.target.value });
                      if (errors.itemName) setErrors({ ...errors, itemName: null });
                    }}
                    required
                    disabled={isView}
                  />
                  <ErrorMsg name="itemName" />
                </div>

                {/* ✅ Wrapped in div, added ErrorMsg, clears on select */}
                <div>
                  <Select
                    label="UOM"
                    options={uomOptions}
                    value={uom}
                    onChange={(val) => {
                      setUom(val);
                      setErrors({ ...errors, uom: null });
                    }}
                    searchable
                    serverSearch
                    onSearch={fetchUOM}
                    disabled={isView}
                  />
                  <ErrorMsg name="uom" />
                </div>

                <div className="col-span-2 flex items-center gap-2 mt-2">
                  <Input
                    type="radio"
                    label="Applicable Tax"
                    name="appliText"
                    value={form.appliText}
                    options={[
                      { label: "Taxable", value: 1 },
                      { label: "Tax Free", value: 2 },
                    ]}
                    onChange={(val) => setForm({ ...form, appliText: val })}
                    disabled={isView}
                  />
                </div>

                {/* ✅ Wrapped in div, added ErrorMsg, clears on select */}
                <div>
                  <Select
                    label="HSN Code"
                    options={hsnOptions}
                    value={hsn}
                    onChange={(val) => {
                      setHsn(val);
                      setErrors({ ...errors, hsn: null });
                    }}
                    searchable
                    serverSearch
                    onSearch={fetchHSN}
                    disabled={isView}
                  />
                  <ErrorMsg name="hsn" />
                </div>

                {/* GST — auto-filled, no validation needed */}
                <Input label="GST(%)" value={gst.slab_name || "N/A"} disabled />

                <Input
                  label="Maximum Stock"
                  type="number"
                  value={form.maxStock}
                  onChange={(e) => setForm({ ...form, maxStock: e.target.value })}
                  disabled={isView}
                />

                <Input
                  label="Re-Order Level"
                  type="number"
                  value={form.reOrder}
                  onChange={(e) => setForm({ ...form, reOrder: e.target.value })}
                  disabled={isView}
                />

                <div className="col-span-2 flex items-center gap-2 mt-2">
                  <Input
                    type="checkbox"
                    id="isActive"
                    label="Active"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    disabled={isView}
                  />
                </div>

                <div className="col-span-2 flex justify-center gap-4 mt-6">
                  {!isView && (
                    <Button type="submit" variant="submit" disabled={loading}>
                      {loading ? "Processing..." : "Save"}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="cancel"
                    onClick={() => navigate("/Item_Master_List")}
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

export default Item_Master;