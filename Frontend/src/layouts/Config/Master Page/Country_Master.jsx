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

const Country_Master = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);

  const editId = query.get("eid");
  const viewId = query.get("view_id");
  const isEdit = Boolean(editId);
  const isView = Boolean(viewId);
  const currentCuId = editId || viewId || 0;

  // Consolidated form state to match demo style
  const [form, setForm] = useState({
    countryName: "",
    countryCode: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    const init = async () => {
      if (currentCuId > 0) {
        setLoading(true);
        try {
          const res = await api.get("/i_pi_country_mst_select_all_and_id", {
            params: { cu_id: currentCuId },
          });

          if (res.data?.Status === 1 && res.data.Result?.length) {
            const d = res.data.Result[0];
            setForm({
              countryName: d.country_name || "",
              countryCode: d.country_code || "",
              isActive: d.cu_is_active === 1,
            });
          }
        } catch (err) {
          Swal.fire("Error", "Failed to load country data", "error");
        } finally {
          setLoading(false);
        }
      }
    };
    init();
  }, [currentCuId]);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView) return;

    if (!form.countryName.trim()) {
      Swal.fire("Validation", "Please enter country name", "warning");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("cu_id", currentCuId);
      formData.append("cu_name", form.countryName);
      formData.append("cu_country_code", form.countryCode);
      formData.append("cu_is_active", form.isActive ? 1 : 0);

      const res = await api.post("/i_pi_country_mst_detail_insert", formData);

      if (res.data?.status === 1 || res.data?.Status === 1) {
        Swal.fire("Success", res.data.message || "Saved successfully", "success");
        navigate("/Country_list");
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
    <div className="flex h-screen overflow-hidden  ">
      <Sidebar />

      {/* Container for Header, Content, and Footer */}
      <main className="flex-1 ml-64 flex flex-col h-full overflow-hidden">
        <Header />

        {/* Scrollable Form Section */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar-sidebar"> 
          <div className="max-w-6xl mx-auto">
            <Card title={"Country Master"}>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 p-2">
                <Input
                  label="Country Name"
                  placeholder="Enter country name"
                  value={form.countryName}
                  onChange={(e) => setForm({ ...form, countryName: e.target.value })}
                  required
                  disabled={isView}
                />
                <Input
                  label="Country Code"
                  placeholder="Enter country code (e.g., +91)"
                  value={form.countryCode}
                  onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
                  disabled={isView}
                />

                <div className="col-span-2 flex items-center gap-2 mt-2">
                  <Input
                    label="Active" 
                    type="checkbox" 
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
                    onClick={() => navigate("/Country_list")}
                  >
                    {isView ? "Back to List" : "Cancel"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>

        {/* Footer strictly at the bottom */}
        <Footer />
      </main>
    </div>
  );
};

export default Country_Master;