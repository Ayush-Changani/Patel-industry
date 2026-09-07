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

const Entity_Group_Master = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);

  const editId = query.get("eid");
  const viewId = query.get("view_id");
  const isEdit = Boolean(editId);
  const isView = Boolean(viewId);
  const currentGroupId = editId || viewId || 0;

  const [form, setForm] = useState({
    entityGroupName: "",
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
    const fetchGroupData = async () => {
      if (currentGroupId > 0) {
        setLoading(true);
        try {
          const res = await api.get("/i_pi_entity_group_mst_select_all_and_id", {
            params: { eg_id: currentGroupId },
          });

          if (res.data?.Status === 1 && res.data.Result?.length) {
            const d = res.data.Result[0];
            setForm({
              entityGroupName: d.entity_group || "",
            });
          }
        } catch (err) {
          Swal.fire("Error", "Failed to load group data", "error");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchGroupData();
  }, [currentGroupId]);

  // ✅ Added: validateForm function
  const validateForm = () => {
    const newErrors = {};
    newErrors.entityGroupName = validateRequired(form.entityGroupName, "Entity Group Name");
    setErrors(newErrors);
    return Object.values(newErrors).every((err) => !err?.message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView || !validateForm()) return; // ✅ Changed

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("eg_id", currentGroupId);
      formData.append("eg_group", form.entityGroupName);

      const res = await api.post("/i_pi_entity_group_mst_insert", formData);

      if (res.data?.Status === 1 || res.data?.status === 1) {
        Swal.fire("Success", res.data.message || "Saved successfully", "success");
        navigate("/Entity_Group_list");
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
            <Card title="Entity Group Master">
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 p-2">

                {/* ✅ Wrapped in div, added ErrorMsg, clears error on change */}
                <div>
                  <Input
                    label="Entity Group Name"
                    placeholder="Enter Group Name (e.g. Corporate, Retail)"
                    value={form.entityGroupName}
                    onChange={(e) => {
                      setForm({ ...form, entityGroupName: e.target.value });
                      if (errors.entityGroupName)
                        setErrors({ ...errors, entityGroupName: null });
                    }}
                    required
                    disabled={isView || loading}
                  />
                  <ErrorMsg name="entityGroupName" />
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
                    onClick={() => navigate("/Entity_Group_list")}
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

export default Entity_Group_Master;