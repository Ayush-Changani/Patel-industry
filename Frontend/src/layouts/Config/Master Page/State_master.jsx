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

const State_Master = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);

  const editId = query.get("eid");
  const viewId = query.get("view_id");
  const isEdit = Boolean(editId);
  const isView = Boolean(viewId);
  const currentStateId = editId || viewId || 0;

  const [form, setForm] = useState({
    stateName: "",
    gstCode: "",
    isActive: true,
  });

  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countryOptions, setCountryOptions] = useState([]);
  const [errors, setErrors] = useState({}); // ✅ Added

  // ✅ Added: ErrorMsg component
  const ErrorMsg = ({ name }) =>
    errors[name]?.message ? (
      <p style={{ color: errors[name].color || "#F63049" }} className="text-xxxs mt-1">
        {errors[name].message}
      </p>
    ) : null;

  const fetchCountries = async (search = "") => {
    try {
      const res = await api.get("/i_pi_get_all_country_ddl", {
        params: { SearchTerm: search || "" },
      });
      if (res.data?.Status === 1) {
        const mapped = res.data.Result.map((c) => ({
          value: c.cu_id,
          label: c.cu_name,
        }));
        setCountryOptions(mapped);
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
      await fetchCountries("");

      if (currentStateId > 0) {
        try {
          const res = await api.get("/i_pi_state_mst_select_all_and_id", {
            params: { st_id: currentStateId },
          });

          if (res.data?.Status === 1 && res.data.Result?.length) {
            const d = res.data.Result[0];
            setForm({
              stateName: d.state_name || "",
              gstCode: d.gst_code || "",
              isActive: d.st_is_active === 1,
            });

            if (d.st_country_name) {
              const selectedCountry = {
                value: String(d.st_country_name),
                label: d.country_name,
              };
              setCountry(selectedCountry);
              setCountryOptions((prev) => {
                const exists = prev.find((opt) => opt.value === selectedCountry.value);
                return exists ? prev : [selectedCountry, ...prev];
              });
            }
          }
        } catch (err) {
          Swal.fire("Error", "Failed to load state data", "error");
        }
      }
      setLoading(false);
    };
    init();
  }, [currentStateId]);

  // ✅ Added: validateForm function
  const validateForm = () => {
    const newErrors = {};
    newErrors.stateName = validateRequired(form.stateName, "State Name");
    newErrors.country = country
      ? null
      : { message: "Country is required", color: "#F63049" };
    setErrors(newErrors);
    return Object.values(newErrors).every((err) => !err?.message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView || !validateForm()) return; // ✅ Changed

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("st_id", currentStateId);
      formData.append("st_name", form.stateName);
      formData.append("st_country_name", country.value);
      formData.append("st_gst_code", form.gstCode);
      formData.append("st_is_active", form.isActive ? 1 : 0);

      const res = await api.post("/i_pi_state_mst_detail_insert", formData);

      if (res.data?.Status === 1 || res.data?.status === 1) {
        Swal.fire("Success", "State saved successfully", "success");
        navigate("/State_list");
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
            <Card title="State Master">
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 p-2">

                {/* ✅ Wrapped in div, added ErrorMsg, clears error on change */}
                <div>
                  <Input
                    label="State Name"
                    placeholder="Enter state name"
                    value={form.stateName}
                    onChange={(e) => {
                      setForm({ ...form, stateName: e.target.value });
                      if (errors.stateName) setErrors({ ...errors, stateName: null });
                    }}
                    required
                    disabled={isView}
                  />
                  <ErrorMsg name="stateName" />
                </div>

                {/* ✅ Wrapped in div, added ErrorMsg, clears error on select */}
                <div>
                  <Select
                    label="Country Name"
                    options={countryOptions}
                    value={country}
                    onChange={(val) => {
                      setCountry(val);
                      setErrors({ ...errors, country: null });
                    }}
                    searchable
                    serverSearch
                    onSearch={fetchCountries}
                    placeholder="Search Country..."
                    disabled={isView}
                  />
                  <ErrorMsg name="country" />
                </div>

                {/* GST Code — not required, no ErrorMsg needed */}
                <Input
                  label="GST Code"
                  placeholder="Enter GST state code"
                  value={form.gstCode}
                  onChange={(e) => setForm({ ...form, gstCode: e.target.value })}
                  disabled={isView}
                />

                <div className="col-span-2 flex items-center gap-2 mt-2">
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
                    onClick={() => navigate("/State_list")}
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

export default State_Master;