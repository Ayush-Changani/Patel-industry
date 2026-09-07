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
import Select from "../../../components/Select";

// ✅ Added
import { validateRequired } from "../../../utils/validationUtils";

const District_Master = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);

  const editId = query.get("eid");
  const viewId = query.get("view_id");
  const isEdit = Boolean(editId);
  const isView = Boolean(viewId);
  const currentDisId = editId || viewId || 0;

  const [form, setForm] = useState({
    districtName: "",
    isActive: true,
  });

  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stateOptions, setStateOptions] = useState([]);
  const [errors, setErrors] = useState({}); // ✅ Added

  // ✅ Added: ErrorMsg component
  const ErrorMsg = ({ name }) =>
    errors[name]?.message ? (
      <p style={{ color: errors[name].color || "#F63049" }} className="text-xxxs mt-1">
        {errors[name].message}
      </p>
    ) : null;

  const fetchStates = async (search = "") => {
    try {
      const res = await api.get("/i_pi_get_all_state_ddl", {
        params: { SearchTerm: search || "" },
      });
      if (res.data?.Status === 1) {
        const mapped = res.data.Result.map((s) => ({
          value: String(s.st_id),
          label: s.st_name,
        }));
        setStateOptions(mapped);
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
      await fetchStates("");

      if (currentDisId > 0) {
        try {
          const res = await api.get("/i_pi_district_mst_select_all_and_id", {
            params: { dis_id: currentDisId },
          });

          if (res.data?.Status === 1 && res.data.Result?.length) {
            const d = res.data.Result[0];
            setForm({
              districtName: d.district_name || "",
              isActive: d.dis_is_active === 1,
            });

            if (d.dis_state_name) {
              const selectedState = {
                value: String(d.dis_state_name),
                label: d.state_name,
              };
              setState(selectedState);
              setStateOptions((prev) => {
                const exists = prev.find((opt) => opt.value === selectedState.value);
                return exists ? prev : [selectedState, ...prev];
              });
            }
          }
        } catch (err) {
          Swal.fire("Error", "Failed to load district data", "error");
        }
      }
      setLoading(false);
    };
    init();
  }, [currentDisId]);

  // ✅ Added: validateForm function
  const validateForm = () => {
    const newErrors = {};
    newErrors.districtName = validateRequired(form.districtName, "District Name");
    newErrors.state = state
      ? null
      : { message: "State is required", color: "#F63049" };
    setErrors(newErrors);
    return Object.values(newErrors).every((err) => !err?.message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView || !validateForm()) return; // ✅ Changed

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("dis_id", currentDisId);
      formData.append("dis_name", form.districtName);
      formData.append("dis_state_name", state.value);
      formData.append("dis_is_active", form.isActive ? 1 : 0);

      const res = await api.post("/i_pi_district_mst_detail_insert", formData);

      if (res.data?.Status === 1 || res.data?.status === 1) {
        Swal.fire("Success", res.data.message || "Saved successfully", "success");
        navigate("/District_list");
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
            <Card title="District Master">
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 p-2">

                {/* ✅ Wrapped in div, added ErrorMsg, clears error on change */}
                <div>
                  <Input
                    label="District Name"
                    placeholder="Enter district name"
                    value={form.districtName}
                    onChange={(e) => {
                      setForm({ ...form, districtName: e.target.value });
                      if (errors.districtName) setErrors({ ...errors, districtName: null });
                    }}
                    required
                    disabled={isView}
                  />
                  <ErrorMsg name="districtName" />
                </div>

                {/* ✅ Wrapped in div, added ErrorMsg, clears error on select */}
                <div>
                  <Select
                    label="State Name"
                    options={stateOptions}
                    value={state}
                    onChange={(val) => {
                      setState(val);
                      setErrors({ ...errors, state: null });
                    }}
                    searchable
                    serverSearch
                    onSearch={fetchStates}
                    placeholder="Search State..."
                    disabled={isView}
                  />
                  <ErrorMsg name="state" />
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
                    onClick={() => navigate("/District_list")}
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

export default District_Master;