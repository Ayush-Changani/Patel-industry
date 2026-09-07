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

const Item_Category_Master = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);

  const editId = query.get("eid");
  const viewId = query.get("view_id");
  const isEdit = Boolean(editId);
  const isView = Boolean(viewId);
  const currentIcId = editId || viewId || 0;

  const [form, setForm] = useState({
    categoryCode: "",
    categoryName: "",
    isActive: true,
  });

  const [itemType, setItemType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [itemTypeOptions, setItemTypeOptions] = useState([]);
  const [errors, setErrors] = useState({}); // ✅ Added

  // ✅ Added: ErrorMsg component
  const ErrorMsg = ({ name }) =>
    errors[name]?.message ? (
      <p style={{ color: errors[name].color || "#F63049" }} className="text-xxxs mt-1">
        {errors[name].message}
      </p>
    ) : null;

  const fetchItemTypes = async (search = "") => {
    try {
      const res = await api.get("/i_pi_get_all_item_type_ddl", {
        params: { SearchTerm: search || "" },
      });
      if (res.data?.Status === 1) {
        const mapped = res.data.Result.map((x) => ({
          value: x.it_id,
          label: x.it_name,
        }));
        setItemTypeOptions(mapped);
        return mapped;
      }
      return [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchItemTypes("");

      if (currentIcId > 0) {
        try {
          const res = await api.get("/i_pi_item_category_mst_select_all_and_id", {
            params: { ic_id: currentIcId },
          });

          if (res.data?.Status === 1 && res.data.Result?.length) {
            const d = res.data.Result[0];
            setForm({
              categoryCode: d.category_code || "",
              categoryName: d.item_category || "",
              isActive: d.ic_is_active === 1,
            });

            if (d.ic_item_type) {
              const selectedType = {
                value: d.ic_item_type,
                label: d.item_name,
              };
              setItemType(selectedType);
              setItemTypeOptions((prev) => {
                const exists = prev.find((opt) => opt.value === selectedType.value);
                return exists ? prev : [selectedType, ...prev];
              });
            }
          }
        } catch (err) {
          Swal.fire("Error", "Failed to load category data", "error");
        }
      }
      setLoading(false);
    };
    init();
  }, [currentIcId]);

  // ✅ Added: validateForm function
  const validateForm = () => {
    const newErrors = {};
    newErrors.itemType = itemType
      ? null
      : { message: "Item Type is required", color: "#F63049" };
    newErrors.categoryName = validateRequired(form.categoryName, "Category Name");
    setErrors(newErrors);
    return Object.values(newErrors).every((err) => !err?.message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView || !validateForm()) return; // ✅ Changed

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("ic_id", currentIcId);
      formData.append("ic_item_type", itemType.value);
      formData.append("ic_category_code", form.categoryCode);
      formData.append("ic_item_category", form.categoryName);
      formData.append("ic_is_active", form.isActive ? 1 : 0);

      const res = await api.post("/i_pi_item_category_mst_insert", formData);

      if (res.data?.status === 1 || res.data?.Status === 1) {
        Swal.fire("Success", res.data.message || "Saved successfully", "success");
        navigate("/Item_Category_list");
      } else {
        Swal.fire("Warning", res.data.message || "Operation failed", "warning");
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
          <div className="max-w-6xl mx-auto">
            <Card title="Item Category Master">
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 p-2">

                {/* ✅ Wrapped in div, added ErrorMsg, clears on select */}
                <div>
                  <Select
                    label="Item Type"
                    options={itemTypeOptions}
                    value={itemType}
                    onChange={(val) => {
                      setItemType(val);
                      setErrors({ ...errors, itemType: null });
                    }}
                    searchable
                    serverSearch
                    onSearch={fetchItemTypes}
                    disabled={isView}
                  />
                  <ErrorMsg name="itemType" />
                </div>

                {/* Category Code — not required, no ErrorMsg needed */}
                <Input
                  label="Category Code"
                  placeholder="Enter category code"
                  value={form.categoryCode}
                  onChange={(e) => setForm({ ...form, categoryCode: e.target.value })}
                  disabled={isView}
                />

                {/* ✅ Wrapped in div, added ErrorMsg, clears on change */}
                <div>
                  <Input
                    label="Category Name"
                    placeholder="Enter category name"
                    value={form.categoryName}
                    onChange={(e) => {
                      setForm({ ...form, categoryName: e.target.value });
                      if (errors.categoryName)
                        setErrors({ ...errors, categoryName: null });
                    }}
                    required
                    disabled={isView}
                  />
                  <ErrorMsg name="categoryName" />
                </div>

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
                      {loading ? "Saving..." : "Save"}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="cancel"
                    onClick={() => navigate("/Item_Category_list")}
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

export default Item_Category_Master;