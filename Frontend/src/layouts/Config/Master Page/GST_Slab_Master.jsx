import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../../services/axios";

import Card from "../../../components/Card";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import Sidebar from "../../../components/Sidebar";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";

// ✅ Added
import { validateRequired } from "../../../utils/validationUtils";

const GST_Slab_Master = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);

  const editId = query.get("eid");
  const viewId = query.get("view_id");
  const isEdit = Boolean(editId);
  const isView = Boolean(viewId);
  const currentSlabId = editId || viewId || 0;

  const [form, setForm] = useState({
    slabName: "",
    isActive: true,
  });

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
    const fetchSlabData = async () => {
      if (currentSlabId > 0) {
        setLoading(true);
        try {
          const res = await api.get("/i_pi_gst_slab_mst_select_all_and_id", {
            params: { slab_id: currentSlabId },
          });

          if (res.data?.Status === 1 && res.data.Result?.length) {
            const d = res.data.Result[0];
            setForm({
              slabName: d.slab_name || "",
              isActive: d.slab_is_active === 1,
            });
          }
        } catch (err) {
          Swal.fire("Error", "Failed to load GST slab data", "error");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchSlabData();
  }, [currentSlabId]);

  // ✅ Added: validateForm function
  const validateForm = () => {
    const newErrors = {};
    newErrors.slabName = validateRequired(form.slabName, "GST Slab Name");
    setErrors(newErrors);
    return Object.values(newErrors).every((err) => !err?.message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView || !validateForm()) return; // ✅ Changed

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("slab_id", currentSlabId);
      formData.append("slab_name", form.slabName);
      formData.append("slab_is_active", form.isActive ? 1 : 0);

      const res = await api.post("/i_pi_gst_slab_detail_insert", formData);

      if (res.data?.status === 1 || res.data?.Status === 1) {
        Swal.fire("Success", res.data.message || "Saved successfully", "success");
        navigate("/GST_Slab_list");
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
            <Card title="GST Slab Master">
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 p-2">

                {/* ✅ Wrapped in div, added ErrorMsg, clears error on change */}
                <div>
                  <Input
                    label="GST Slab Name"
                    placeholder="e.g. GST 18%"
                    value={form.slabName}
                    onChange={(e) => {
                      setForm({ ...form, slabName: e.target.value });
                      if (errors.slabName) setErrors({ ...errors, slabName: null });
                    }}
                    required
                    disabled={isView}
                  />
                  <ErrorMsg name="slabName" />
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

                <div className="col-span-2 flex justify-center gap-4 mt-6">
                  {!isView && (
                    <Button type="submit" variant="submit" disabled={loading}>
                      {loading ? "Saving..." : "Save"}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="cancel"
                    onClick={() => navigate("/GST_Slab_list")}
                  >
                    {isView ? "Back to List" : "Cancel"}
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

export default GST_Slab_Master;