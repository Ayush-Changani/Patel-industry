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

const Taluka_Master = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);

  const editId = query.get("eid");
  const viewId = query.get("view_id");
  const isEdit = Boolean(editId);
  const isView = Boolean(viewId);
  const currentTalId = editId || viewId || 0;

  const [form, setForm] = useState({
    talukaName: "",
    isActive: true,
  });

  const [district, setDistrict] = useState(null);
  const [loading, setLoading] = useState(false);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [errors, setErrors] = useState({}); // ✅ Added

  // ✅ Added: ErrorMsg component
  const ErrorMsg = ({ name }) =>
    errors[name]?.message ? (
      <p style={{ color: errors[name].color || "#F63049" }} className="text-xxxs mt-1">
        {errors[name].message}
      </p>
    ) : null;

  const fetchDistricts = async (search = "") => {
    try {
      const res = await api.get("/i_pi_get_all_district_ddl", {
        params: { SearchTerm: search || "" },
      });
      if (res.data?.Status === 1) {
        const mapped = res.data.Result.map((d) => ({
          value: d.dis_id,
          label: d.dis_name,
        }));
        setDistrictOptions(mapped);
        return mapped;
      }
      return [];
    } catch (err) {
      console.error("District fetch error:", err);
      return [];
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchDistricts("");

      if (currentTalId > 0) {
        try {
          const res = await api.get("/i_pi_taluka_mst_select_all_and_id", {
            params: { tal_id: currentTalId },
          });

          if (res.data?.Status === 1 && res.data.Result?.length) {
            const d = res.data.Result[0];
            setForm({
              talukaName: d.taluka_name || "",
              isActive: d.tal_is_active === 1,
            });

            if (d.tal_district_name) {
              const selectedDis = {
                value: String(d.tal_district_name),
                label: d.district_name,
              };
              setDistrict(selectedDis);
              setDistrictOptions((prev) => {
                const exists = prev.find((opt) => opt.value === selectedDis.value);
                return exists ? prev : [selectedDis, ...prev];
              });
            }
          }
        } catch (err) {
          Swal.fire("Error", "Failed to load taluka data", "error");
        }
      }
      setLoading(false);
    };
    init();
  }, [currentTalId]);

  // ✅ Added: validateForm function
  const validateForm = () => {
    const newErrors = {};
    newErrors.talukaName = validateRequired(form.talukaName, "Taluka Name");
    newErrors.district = district
      ? null
      : { message: "District is required", color: "#F63049" };
    setErrors(newErrors);
    return Object.values(newErrors).every((err) => !err?.message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView || !validateForm()) return; // ✅ Changed

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("tal_id", currentTalId);
      formData.append("tal_name", form.talukaName);
      formData.append("tal_district_name", district.value);
      formData.append("tal_is_active", form.isActive ? 1 : 0);

      const res = await api.post("/i_pi_taluka_mst_detail_insert", formData);

      if (res.data?.status === 1 || res.data?.Status === 1) {
        Swal.fire("Success", res.data.message || "Taluka saved successfully", "success");
        navigate("/Taluka_list");
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
            <Card title="Taluka Master">
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6 p-2">

                {/* ✅ Wrapped in div, added ErrorMsg, clears error on change */}
                <div>
                  <Input
                    label="Taluka Name"
                    placeholder="Enter taluka name"
                    value={form.talukaName}
                    onChange={(e) => {
                      setForm({ ...form, talukaName: e.target.value });
                      if (errors.talukaName) setErrors({ ...errors, talukaName: null });
                    }}
                    required
                    disabled={isView}
                  />
                  <ErrorMsg name="talukaName" />
                </div>

                {/* ✅ Wrapped in div, added ErrorMsg, clears error on select */}
                <div>
                  <Select
                    label="District Name"
                    options={districtOptions}
                    value={district}
                    onChange={(val) => {
                      setDistrict(val);
                      setErrors({ ...errors, district: null });
                    }}
                    searchable
                    serverSearch
                    onSearch={fetchDistricts}
                    placeholder="Search District..."
                    disabled={isView}
                  />
                  <ErrorMsg name="district" />
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
                    onClick={() => navigate("/Taluka_list")}
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

export default Taluka_Master;