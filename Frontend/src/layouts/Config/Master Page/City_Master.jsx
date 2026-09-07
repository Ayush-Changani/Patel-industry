import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../../services/axios";

import Card from "../../../components/Card";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import Sidebar from "../../../components/Sidebar"
import Header from "../../../components/Header";;
import Footer from "../../../components/Footer";
import Select from "../../../components/Select";

// ✅ Added: import validateRequired
import { validateRequired } from "../../../utils/validationUtils";

const City_Master = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);

  const editId = query.get("eid");
  const viewId = query.get("view_id");
  const isEdit = Boolean(editId);
  const isView = Boolean(viewId);
  const currentCitId = editId || viewId || 0;

  const [form, setForm] = useState({
    cityName: "",
    isActive: true,
  });

  const [taluka, setTaluka] = useState(null);
  const [loading, setLoading] = useState(false);
  const [talukaOptions, setTalukaOptions] = useState([]);
  const [errors, setErrors] = useState({}); // ✅ Added

  // ✅ Added: ErrorMsg component (same as Company Master)
  const ErrorMsg = ({ name }) =>
    errors[name]?.message ? (
      <p style={{ color: errors[name].color || "#F63049" }} className="text-xxxs mt-1">
        {errors[name].message}
      </p>
    ) : null;

  const fetchTalukas = async (search = "") => {
    try {
      const res = await api.get("/i_pi_get_all_taluka_ddl", {
        params: { SearchTerm: search || "" },
      });
      if (res.data?.Status === 1) {
        const mapped = res.data.Result.map((t) => ({
          value: String(t.tal_id),
          label: t.tal_name,
        }));
        setTalukaOptions(mapped);
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
      await fetchTalukas("");

      if (currentCitId > 0) {
        try {
          const res = await api.get("/i_pi_city_mst_select_all_and_id", {
            params: { cit_id: currentCitId },
          });

          if (res.data?.Status === 1 && res.data.Result?.length) {
            const d = res.data.Result[0];
            setForm({
              cityName: d.city_name || "",
              isActive: d.cit_is_active === 1,
            });

            if (d.cit_taluka_name) {
              const selectedTaluka = {
                value: String(d.cit_taluka_name),
                label: d.taluka_name,
              };
              setTaluka(selectedTaluka);
              setTalukaOptions((prev) => {
                const exists = prev.find((opt) => opt.value === selectedTaluka.value);
                return exists ? prev : [selectedTaluka, ...prev];
              });
            }
          }
        } catch (err) {
          Swal.fire("Error", "Failed to load city data", "error");
        }
      }
      setLoading(false);
    };
    init();
  }, [currentCitId]);

  // ✅ Added: proper validateForm function
  const validateForm = () => {
    const newErrors = {};
    newErrors.cityName = validateRequired(form.cityName, "City Name");
    newErrors.taluka = taluka
      ? null
      : { message: "Taluka is required", color: "#F63049" };
    setErrors(newErrors);
    return Object.values(newErrors).every((err) => !err?.message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView || !validateForm()) return; // ✅ Changed

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("cit_id", currentCitId);
      formData.append("cit_name", form.cityName);
      formData.append("cit_taluka_name", taluka.value);
      formData.append("cit_is_active", form.isActive ? 1 : 0);

      const res = await api.post("/i_pi_city_mst_detail_insert", formData);

      if (res.data?.Status === 1 || res.data?.status === 1) {
        Swal.fire("Success", res.data.message || "Saved successfully", "success");
        navigate("/City_list");
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
      <main className="flex-1 ml-30 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar-sidebar">
          <div className="max-w-5xl mx-auto">
            <Card title="City Master">
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 p-2">

                {/* ✅ Wrapped in div, added ErrorMsg */}
                <div>
                  <Input
                    label="City Name"
                    placeholder="Enter city name"
                    value={form.cityName}
                    onChange={(e) => {
                      setForm({ ...form, cityName: e.target.value });
                      if (errors.cityName) setErrors({ ...errors, cityName: null }); // ✅ clears on change
                    }}
                    required
                    disabled={isView}
                  />
                  <ErrorMsg name="cityName" />
                </div>

                {/* ✅ Wrapped in div, added ErrorMsg, clear error on select */}
                <div>
                  <Select
                    label="Taluka Name"
                    options={talukaOptions}
                    value={taluka}
                    onChange={(val) => {
                      setTaluka(val);
                      setErrors({ ...errors, taluka: null }); // ✅ clears on change
                    }}
                    searchable
                    serverSearch
                    onSearch={fetchTalukas}
                    placeholder="Search Taluka..."
                    disabled={isView}
                  />
                  <ErrorMsg name="taluka" />
                </div>

                <div>
                  <Input
                    type="checkbox"
                    label="Active"
                    id="isActive"
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
                  <Button type="button" variant="cancel" onClick={() => navigate("/City_list")}>
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

export default City_Master;