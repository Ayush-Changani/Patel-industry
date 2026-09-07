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

import { validateRequired } from "../../../utils/validationUtils";

const User_Group_master = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);

  const editId = query.get("eid");
  const viewId = query.get("view_id");
  const isEdit = Boolean(editId);
  const isView = Boolean(viewId);
  const currentUgId = editId || viewId || 0;

  const [form, setForm] = useState({
    userGroupName: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ✅ Fixed: using shared ErrorMsg component pattern
  const ErrorMsg = ({ name }) =>
    errors[name]?.message ? (
      <p style={{ color: errors[name].color || "#F63049" }} className="text-xxxs mt-1">
        {errors[name].message}
      </p>
    ) : null;

  useEffect(() => {
    const fetchGroupData = async () => {
      if (currentUgId > 0) {
        setLoading(true);
        try {
          const res = await api.get("/i_pi_user_group_mst_select_all_and_id", {
            params: { ug_id: currentUgId },
          });

          if (res.data?.Status === 1 && res.data.Result?.length) {
            const d = res.data.Result[0];
            setForm({
              userGroupName: d.user_group_name || "",
              isActive: d.ug_is_active === 1,
            });
          }
        } catch (err) {
          Swal.fire("Error", "Failed to load user group data", "error");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchGroupData();
  }, [currentUgId]);

  // ✅ Fixed: using optional chaining on err?.message (consistent with other forms)
  const validateForm = () => {
    const newErrors = {};
    newErrors.userGroupName = validateRequired(form.userGroupName, "User Group Name");
    setErrors(newErrors);
    return Object.values(newErrors).every((err) => !err?.message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView || !validateForm()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("ug_id", currentUgId);
      formData.append("ug_name", form.userGroupName);
      formData.append("ug_is_active", form.isActive ? 1 : 0);

      const res = await api.post("/i_pi_user_group_mst_detail_insert", formData);

      if (res.data?.status === 1 || res.data?.Status === 1) {
        Swal.fire("Success", "User Group saved successfully", "success");
        navigate("/User_Group_list");
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
            <Card title="User Group Master">
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6 p-2">

                <div className="col-span-2 md:col-span-1">
                  <Input
                    label="User Group Name"
                    placeholder="e.g. Administrators, Managers"
                    value={form.userGroupName}
                    required
                    disabled={isView}
                    onChange={(e) => {
                      setForm({ ...form, userGroupName: e.target.value });
                      // ✅ Fixed: set null instead of { message: "", color: "" }
                      if (errors.userGroupName) setErrors({ ...errors, userGroupName: null });
                    }}
                  />
                  {/* ✅ Fixed: replaced inline JSX with ErrorMsg component */}
                  <ErrorMsg name="userGroupName" />
                </div>

                <div className="col-span-2 flex items-center mt-2">
                  <Input
                    type="checkbox"
                    label="Active"
                    checked={form.isActive}
                    disabled={isView}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
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
                    onClick={() => navigate("/User_Group_list")}
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

export default User_Group_master;