import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../../services/axios";
import Swal from "sweetalert2";
import Card from "../../../components/Card";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import Sidebar from "../../../components/Sidebar";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";

// ✅ Added
import { validateRequired } from "../../../utils/validationUtils";

const Unit_of_Measure_Master = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);

  const editId = query.get("eid");
  const viewId = query.get("view_id");
  const isEdit = Boolean(editId);
  const isView = Boolean(viewId);
  const currentUomId = editId || viewId || 0;

  const [form, setForm] = useState({
    uomName: "",
    uomDescription: "",
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
    const fetchUomData = async () => {
      if (currentUomId > 0) {
        setLoading(true);
        try {
          const res = await api.get("/i_pi_unit_of_measure_mst_select_all_and_id", {
            params: { uom_id: currentUomId },
          });

          if (res.data?.Status === 1 && res.data.Result?.length) {
            const d = res.data.Result[0];
            setForm({
              uomName: d.unit_of_measure || "",
              uomDescription: d.discription || "",
              isActive: d.uom_is_active === 1,
            });
          }
        } catch (err) {
          Swal.fire("Error", "Failed to load UoM data", "error");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUomData();
  }, [currentUomId]);

  // ✅ Added: validateForm function
  const validateForm = () => {
    const newErrors = {};
    newErrors.uomName = validateRequired(form.uomName, "Unit of Measure Name");
    setErrors(newErrors);
    return Object.values(newErrors).every((err) => !err?.message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView || !validateForm()) return; // ✅ Changed

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("uom_id", currentUomId);
      formData.append("uom_name", form.uomName);
      formData.append("uom_discription", form.uomDescription);
      formData.append("uom_is_active", form.isActive ? 1 : 0);

      const res = await api.post("/i_pi_unit_of_measure_mst_detail_insert", formData);

      if (res.data?.status === 1 || res.data?.Status === 1) {
        Swal.fire("Success", "UOM saved successfully", "success");
        navigate("/Unit_of_Measure_list");
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
            <Card title="Unit of Measure Master">
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6 p-2">

                {/* ✅ Added ErrorMsg, clears error on change */}
                <div className="col-span-2 md:col-span-1">
                  <Input
                    label="Unit of Measure Name"
                    placeholder="e.g. Kilogram, Meter, Pieces"
                    value={form.uomName}
                    onChange={(e) => {
                      setForm({ ...form, uomName: e.target.value });
                      if (errors.uomName) setErrors({ ...errors, uomName: null });
                    }}
                    required
                    disabled={isView}
                  />
                  <ErrorMsg name="uomName" />
                </div>

                {/* Description — not required, no ErrorMsg needed */}
                <div className="col-span-2">
                  <Input
                    label="UoM Description"
                    placeholder="Provide additional details about this unit..."
                    value={form.uomDescription}
                    onChange={(e) => setForm({ ...form, uomDescription: e.target.value })}
                    multiline
                    rows={2}
                    disabled={isView}
                  />
                </div>

                <div className="col-span-2 flex items-center gap-2">
                  <Input
                    type="checkbox"
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
                    onClick={() => navigate("/Unit_of_Measure_list")}
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

export default Unit_of_Measure_Master;