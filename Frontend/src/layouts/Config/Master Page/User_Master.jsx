import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../../services/axios";
import Swal from "sweetalert2";

import Card from "../../../components/Card";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import Sidebar from "../../../components/Sidebar";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";
import Select from "../../../components/Select";

import {
  validateRequired,
  validateEmail,
  validateNumber,
} from "../../../utils/validationUtils";

const User_Master = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);

  const editId = query.get("eid");
  const viewId = query.get("view_id");
  const isEdit = Boolean(editId);
  const isView = Boolean(viewId);
  const currentUserId = editId || viewId || 0;

  const [form, setForm] = useState({
    userName:      "",
    displayName:   "",
    officialEmail: "",
    personalEmail: "",
    mobileNumber:  "",
    password:      "",
    isActive:      true,
  });

  const [userGroup,        setUserGroup]        = useState(null);
  const [userGroupOptions, setUserGroupOptions] = useState([]);

  const [company,        setCompany]        = useState(null);
  const [companyOptions, setCompanyOptions] = useState([]);

  // ✅ NEW: department state
  const [department,        setDepartment]        = useState(null);
  const [departmentOptions, setDepartmentOptions] = useState([]);

  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const ErrorMsg = ({ name }) =>
    errors[name]?.message ? (
      <p style={{ color: errors[name].color || "#F63049" }} className="text-xxxs mt-1">
        {errors[name].message}
      </p>
    ) : null;

  // ── Fetch user groups ──────────────────────────────────────────────────────
  const fetchUserGroups = async (search = "") => {
    try {
      const res = await api.get("/i_pi_get_all_user_group_ddl", {
        params: { SearchTerm: search || "" },
      });
      if (res.data?.Status === 1 || res.data?.status === 1) {
        const mapped = (res.data.Result || res.data.result || []).map((g) => ({
          value: g.ug_id,
          label: g.ug_name,
        }));
        setUserGroupOptions(mapped);
        return mapped;
      }
      return [];
    } catch (err) { console.error(err); return []; }
  };

  // ── Fetch companies ────────────────────────────────────────────────────────
  const fetchCompanies = async (search = "") => {
    try {
      const res = await api.get("/i_pi_get_all_company_ddl", {
        params: { SearchTerm: search || "" },
      });
      if (res.data?.Status === 1 || res.data?.status === 1) {
        const mapped = (res.data.Result || res.data.result || []).map((c) => ({
          value: c.com_id,
          label: c.company_name,
        }));
        setCompanyOptions(mapped);
        return mapped;
      }
      return [];
    } catch (err) { console.error(err); return []; }
  };

  // ✅ NEW: Fetch departments
  const fetchDepartments = async (search = "") => {
    try {
      const res = await api.get("/i_pi_get_all_department_ddl", {
        params: { SearchTerm: search || "" },
      });
      if (res.data?.Status === 1 || res.data?.status === 1) {
        const mapped = (res.data.Result || res.data.result || []).map((d) => ({
          value: d.dept_id,
          label: d.dept_name,
        }));
        setDepartmentOptions(mapped);
        return mapped;
      }
      return [];
    } catch (err) { console.error(err); return []; }
  };

  // ── Init ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        fetchUserGroups(""),
        fetchCompanies(""),
        fetchDepartments(""),   // ✅ NEW
      ]);

      if (currentUserId > 0) {
        try {
          const res = await api.get("/i_pi_user__mst_select_all_and_id", {
            params: { usr_id: currentUserId },
          });

          if (res.data?.Status === 1 && res.data.Result?.length) {
            const d = res.data.Result[0];
            setForm({ 
              userName:      d.user_name      || "",
              displayName:   d.display_name   || "",
              officialEmail: d.official_email || "",
              personalEmail: d.personal_email || "",
              mobileNumber:  d.mobile_number  || "",
              password:      d.password       || "",
              isActive:      d.usr_is_active === 1,
            });

            // Restore user group
            if (d.usr_group) {
              const sel = { value: String(d.usr_group), label: d.user_group };
              setUserGroup(sel);
              setUserGroupOptions((prev) =>
                prev.find((o) => o.value === sel.value) ? prev : [sel, ...prev]
              );
            }

            // Restore company
            if (d.company_id) {
              const sel = { value: String(d.company_id), label: d.company_name || String(d.company_id) };
              setCompany(sel);
              setCompanyOptions((prev) =>
                prev.find((o) => String(o.value) === String(d.company_id)) ? prev : [sel, ...prev]
              );
            }

            // ✅ NEW: Restore department
            if (d.dept_id) {
              const sel = { value: String(d.dept_id), label: d.department || String(d.dept_id) };
              setDepartment(sel);
              setDepartmentOptions((prev) =>
                prev.find((o) => String(o.value) === String(d.dept_id)) ? prev : [sel, ...prev]
              );
            }
          }
        } catch (err) {
          Swal.fire("Error", "Failed to load user data", "error");
        }
      }
      setLoading(false);
    };
    init();
  }, [currentUserId]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateForm = () => {
    const newErrors = {};
    newErrors.userName = validateRequired(form.userName, "User Name");

    newErrors.userGroup = userGroup
      ? null : { message: "User Group is required", color: "#F63049" };

    newErrors.company = company
      ? null : { message: "Company is required", color: "#F63049" };
 
    
    newErrors.department = department
      ? null : { message: "Department is required", color: "#F63049" };

    newErrors.officialEmail = form.officialEmail
      ? validateEmail(form.officialEmail)
      : validateRequired(form.officialEmail, "Official Email");

    newErrors.mobileNumber = form.mobileNumber
      ? validateNumber(form.mobileNumber, 10, "Mobile Number")
      : validateRequired(form.mobileNumber, "Mobile Number");

    newErrors.password = validateRequired(form.password, "Password");

    setErrors(newErrors);
    return Object.values(newErrors).every((err) => !err?.message);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView || !validateForm()) return;

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("usr_id",             currentUserId);
      payload.append("usr_group",          userGroup.value);
      payload.append("com_id",             company.value);
      payload.append("dept_id",            department.value);    
      payload.append("usr_name",           form.userName);
      payload.append("usr_display_name",   form.displayName.trim() || form.userName);
      payload.append("usr_official_email", form.officialEmail || "");
      payload.append("usr_personal_email", form.personalEmail || "");
      payload.append("usr_mobile_number",  form.mobileNumber  || "");
      payload.append("usr_password",       form.password      || "");
      payload.append("usr_is_active",      form.isActive ? 1 : 0);

      const res = await api.post("/i_pi_user_detail_insert", payload);

      if (res.data?.status === 1 || res.data?.Status === 1) {
        Swal.fire("Success", res.data?.message ||"User saved successfully", "success");
        navigate("/User_list");
      } else {
        Swal.fire("Error", res.data?.message || "Operation failed", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Internal Server Error", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── JSX ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col h-full overflow-hidden">
        <Header />

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar-sidebar">
          <div className="max-w-6xl mx-auto">
            <Card title="User Master">
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6 p-2">

                {/* User Name */}
                <div>
                  <Input
                    label="User Name"
                    name="userName"
                    placeholder="Enter login username"
                    required
                    value={form.userName}
                    onChange={onChange}
                    disabled={isView}
                  />
                  <ErrorMsg name="userName" />
                </div>

                {/* User Group */}
                <div>
                  <Select
                    label="User Group"
                    options={userGroupOptions}
                    value={userGroup}
                    onChange={(val) => {
                      setUserGroup(val);
                      setErrors({ ...errors, userGroup: null });
                    }}
                    searchable
                    serverSearch
                    onSearch={fetchUserGroups}
                    disabled={isView}
                  />
                  <ErrorMsg name="userGroup" />
                </div>

                {/* Company */}
                <div>
                  <Select
                    label="Company"
                    options={companyOptions}
                    value={company}
                    onChange={(val) => {
                      setCompany(val);
                      setErrors({ ...errors, company: null });
                    }}
                    searchable
                    serverSearch
                    onSearch={fetchCompanies}
                    placeholder="Search and select company"
                    disabled={isView}
                  />
                  <ErrorMsg name="company" />
                </div>

                {/* ✅ NEW: Department */}
                <div>
                  <Select
                    label="Department"
                    options={departmentOptions}
                    value={department}
                    onChange={(val) => {
                      setDepartment(val);
                      setErrors({ ...errors, department: null });
                    }}
                    searchable
                    serverSearch
                    onSearch={fetchDepartments}
                    placeholder="Search and select department"
                    disabled={isView}
                  />
                  <ErrorMsg name="department" />
                </div>

                {/* Display Name */}
                <Input
                  label="Display Name"
                  name="displayName"
                  placeholder="Full name of the user"
                  value={form.displayName}
                  onChange={onChange}
                  disabled={isView}
                />

                {/* Official Email */}
                <div>
                  <Input
                    label="Official Email"
                    name="officialEmail"
                    placeholder="work@company.com"
                    value={form.officialEmail}
                    onChange={onChange}
                    disabled={isView}
                    required
                  />
                  <ErrorMsg name="officialEmail" />
                </div>

                {/* Personal Email */}
                <Input
                  label="Personal Email"
                  name="personalEmail"
                  placeholder="personal@email.com"
                  value={form.personalEmail}
                  onChange={onChange}
                  disabled={isView}
                />

                {/* Mobile Number */}
                <div>
                  <Input
                    label="Mobile Number"
                    name="mobileNumber"
                    maxLength={10}
                    placeholder="10-digit number"
                    value={form.mobileNumber}
                    onChange={(e) =>
                      /^[0-9]{0,10}$/.test(e.target.value) && onChange(e)
                    }
                    disabled={isView}
                    required
                  />
                  <ErrorMsg name="mobileNumber" />
                </div>

                {/* Password */}
                <div>
                  <Input
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={onChange}
                    disabled={isView}
                    required
                  />
                  <ErrorMsg name="password" />
                </div>

                {/* Active */}
                <div className="col-span-2 flex items-center gap-2 mt-2">
                  <Input
                    type="checkbox"
                    label="Active"
                    checked={form.isActive}
                    disabled={isView}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, isActive: e.target.checked }))
                    }
                  />
                </div>

                {/* Buttons */}
                <div className="col-span-2 flex justify-center gap-4 mt-6">
                  {!isView && (
                    <Button type="submit" variant="submit" disabled={loading}>
                      {loading ? "Saving..." : "Save"}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="cancel"
                    onClick={() => navigate("/User_list")}
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

export default User_Master;