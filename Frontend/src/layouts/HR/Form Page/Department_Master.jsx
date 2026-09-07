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

import { validateRequired } from "../../../utils/validationUtils";

const Department_Master = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);

  const editId = query.get("eid");
  const viewId = query.get("view_id");
  const isEdit = Boolean(editId);
  const isView = Boolean(viewId);
  const currentDeptId = editId || viewId || 0;

  const [form, setForm] = useState({
    deptName: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const ErrorMsg = ({ name }) =>
    errors[name]?.message ? (
      <p style={{ color: errors[name].color || "#F63049" }} className="text-xxxs mt-1">
        {errors[name].message}
      </p>
    ) : null;

  useEffect(() => {
    const init = async () => {
      if (currentDeptId > 0) {
        setLoading(true);
        try {
          const res = await api.get("/i_pi_department_mst_select_all_and_id", {
            params: { dept_id: currentDeptId },
          });
          if (res.data?.Status === 1 && res.data.Result?.length) {
            const d = res.data.Result[0];
            setForm({
              deptName: d.department_name || "",
              isActive: d.dept_is_active === 1,
            });
          }
        } catch (err) {
          Swal.fire("Error", "Failed to load department data", "error");
        } finally {
          setLoading(false);
        }
      }
    };
    init();
  }, [currentDeptId]);

  const validateForm = () => {
    const newErrors = {};
    newErrors.deptName = validateRequired(form.deptName, "Department Name");
    setErrors(newErrors);
    return Object.values(newErrors).every((err) => !err?.message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView || !validateForm()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("dept_id", currentDeptId);
      formData.append("dept_name", form.deptName);
      formData.append("dept_is_active", form.isActive ? 1 : 0);

      const res = await api.post("/i_pi_department_mst_insert", formData);

      if (res.data?.Status === 1 || res.data?.status === 1) {
        Swal.fire("Success", res.data.message || "Saved successfully", "success");
        navigate("/Department_list");
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
            <Card title="Department Master">
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 p-2">

                <div>
                  <Input
                    label="Department Name"
                    placeholder="Enter department name"
                    value={form.deptName}
                    onChange={(e) => {
                      setForm({ ...form, deptName: e.target.value });
                      if (errors.deptName) setErrors({ ...errors, deptName: null });
                    }}
                    required
                    disabled={isView}
                  />
                  <ErrorMsg name="deptName" />
                </div>

                <div className="col-span-2 flex items-center gap-2 mt-2">
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
                  <Button type="button" variant="cancel" onClick={() => navigate("/Department_list")}>
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

export default Department_Master;