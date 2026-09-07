import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../../services/axios";

import Card from "../../../components/Card";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import Select from "../../../components/Select";
import Sidebar from "../../../components/Sidebar";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";

import { validateRequired } from "../../../utils/validationUtils";

const Designation_Master = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);

  const editId = query.get("eid");
  const viewId = query.get("view_id");
  const isEdit = Boolean(editId);
  const isView = Boolean(viewId);
  const des_Id = editId || viewId || 0;

  const [form, setForm] = useState({
    desigName: "",
    desigCode: "",   // filled by i_pi_get_next_designation_code on new form
    level: "",
    minCTC: "",
    maxCTC: "",
    currency: "INR",
    isActive: true,
  });

  // ── Dropdowns ──────────────────────────────────────────────────────────────
  const [department,      setDepartment]      = useState(null);
  const [departmentOptions, setDepartmentOptions] = useState([]);

  const [reportsToOption,  setReportsToOption]  = useState(null);
  const [reportsToOptions, setReportsToOptions] = useState([]);

  const [levelOption, setLevelOption] = useState(null);
  const levelOptions = [
    { value: "L1", label: "L1 – Junior"  },
    { value: "L2", label: "L2 – Mid"     },
    { value: "L3", label: "L3 – Senior"  },
    { value: "L4", label: "L4 – Lead"    },
    { value: "L5", label: "L5 – Manager" },
    { value: "L6", label: "L6 – Director"},
    { value: "L7", label: "L7 – VP"      },
    { value: "L8", label: "L8 – C-Suite" },
  ];

  const currencyOptions = [
    { value: "INR", label: "INR – ₹" },
    { value: "USD", label: "USD – $"  },
    { value: "EUR", label: "EUR – €"  },
  ];
  const [currencyOption, setCurrencyOption] = useState(
    currencyOptions.find((c) => c.value === "INR")
  );

  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  // ── Fetch department DDL ───────────────────────────────────────────────────
  const fetchDepartments = async (search = "") => {
    try {
      const res = await api.get("/i_pi_get_all_department_ddl", {
        params: { SearchTerm: search || "" },
      });
      if (res.data?.Status === 1) {
        const options = res.data.Result.map((d) => ({
          value: String(d.dept_id),
          label: d.dept_name,
        }));
        setDepartmentOptions(options);
        return options;
      }
      return [];
    } catch {
      return [];
    }
  };

  // ── Fetch designation DDL (Reports To) ────────────────────────────────────
  const fetchDesignations = async (search = "") => {
    try {
      const res = await api.get("/i_pi_get_all_designation_ddl", {
        params: { SearchTerm: search || "" },
      });
      if (res.data?.Status === 1) {
        const options = res.data.Result.map((d) => ({
          value: String(d.des_id),
          label: d.des_name,
        }));
        setReportsToOptions(options);
        return options;
      }
      return [];
    } catch {
      return [];
    }
  };

  // ── Fetch next designation code (new form only) ───────────────────────────
  const fetchNextCode = async () => {
    try {
      const res = await api.get("/i_pi_get_next_designation_code");
      if (res.data?.Status === 1) {
        setForm((prev) => ({ ...prev, desigCode: res.data.Result }));
      }
    } catch {
      // non-critical — field stays blank
    }
  };

  // ── Init ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([fetchDepartments(""), fetchDesignations("")]);

      if (des_Id) {
        // ── Edit / View: load existing record ──────────────────────────────
        try {
          const res = await api.get("/i_pi_designation_mst_select_all_and_id", {
            params: { des_id: parseInt(des_Id) },
          });
          if (res.data?.Status === 1 && res.data.Result?.length) {
            const d = res.data.Result[0];

            // Department
            if (d.des_department_id) {
              const selDept = { value: String(d.des_department_id), label: d.department_name };
              setDepartment(selDept);
              setDepartmentOptions((prev) => {
                const exists = prev.find((o) => o.value === selDept.value);
                return exists ? prev : [selDept, ...prev];
              });
            }

            // Level
            if (d.designation_level) {
              setLevelOption(levelOptions.find((l) => l.value === d.designation_level) || null);
            }

            // Reports To
            if (d.reports_to) {
              const selRpt = { value: String(d.reports_to), label: d.reports_to_name };
              setReportsToOption(selRpt);
              setReportsToOptions((prev) => {
                const exists = prev.find((o) => o.value === selRpt.value);
                return exists ? prev : [selRpt, ...prev];
              });
            }

            // Currency
            if (d.currency) {
              setCurrencyOption(
                currencyOptions.find((c) => c.value === d.currency) || currencyOptions[0]
              );
            }

            setForm({
              desigName: d.designation_name     || "",
              desigCode: d.designation_code     || "",    
              level:     d.designation_level    || "",
              minCTC:    d.minimum_ctc  || "",
              maxCTC:    d.maximum_ctc  || "",
              currency:  d.currency || "INR",
              isActive:  d.des_status   === 1,
            });
          }
        } catch {
          Swal.fire("Error", "Failed to fetch designation data", "error");
        }
      } else {
        // ── New form: fetch next auto code ──────────────────────────────────
        await fetchNextCode();
      }

      setLoading(false);
    };

    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [des_Id]);

  // ── onChange ───────────────────────────────────────────────────────────────
  const onChange = (e) => {
    if (isView) return;
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      if (next[name]) delete next[name];
      return next;
    });
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateForm = () => {
    const newErrors = {};

    newErrors.desigName = validateRequired(form.desigName, "Designation Name");

    newErrors.department = department
      ? null
      : { message: "Department is required", color: "#F63049" };

    newErrors.level = levelOption
      ? null
      : { message: "Level / Grade is required", color: "#F63049" };

    setErrors(newErrors);
    return Object.values(newErrors).every((err) => !err?.message);
  };
 
  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView || !validateForm()) return;

    setLoading(true);
    try {
      const payload = {
  des_id:            isEdit ? parseInt(des_Id) : 0,
  des_name:          form.desigName.trim(),
  des_code:          form.desigCode.trim(),
  des_department_id: department?.value  ? parseInt(department.value)       : 0,
  des_level:         levelOption?.value || "",
  des_reports_to:    reportsToOption?.value ? parseInt(reportsToOption.value) : 0,
  des_currency:      currencyOption?.value  || "INR",
  des_min_ctc:       form.minCTC !== "" ? parseFloat(form.minCTC) : 0,
  des_max_ctc:       form.maxCTC !== "" ? parseFloat(form.maxCTC) : 0,
  des_status:        form.isActive ? 1 : 0,
};

      const res = await api.post("/i_pi_designation_mst_detail_insert", payload);
  
      if (res.data?.Status === 1 || res.data?.status === 1) {
        Swal.fire("Success", res.data?.message || "Data Saved Successfully", "success");
        navigate("/Designation_list");
      } else {
        Swal.fire("Error", res.data?.message || "Failed to save", "error");
      }
    } catch {
      Swal.fire("Error", "Internal Server Error", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Error helper ───────────────────────────────────────────────────────────
  const ErrorMsg = ({ name }) =>
    errors[name]?.message ? (
      <p style={{ color: errors[name].color || "#F63049" }} className="text-xxxs mt-1">
        {errors[name].message}
      </p>
    ) : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col h-full overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar-sidebar">
          <div className="max-w-5xl mx-auto">
            <Card title="Designation Master">
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-2 gap-x-6 gap-y-4 p-4"
              >
                {/* ── Designation Name ── */}
                <div>
                  <Input
                    label="Designation Name"
                    name="desigName"
                    required
                    value={form.desigName}
                    onChange={onChange}
                    disabled={isView}
                  />
                  <ErrorMsg name="desigName" />
                </div>

                {/* ── Designation Code (auto — read only) ── */}
                <div>
                  <Input
                    label="Designation Code"
                    name="desigCode"
                    value={form.desigCode}
                    disabled
                    placeholder="Auto-generated"
                  />
                </div>

                {/* ── Department ── */}
                <div>
                  <Select
                    key={department ? `dept-${department.value}` : "dept-empty"}
                    label="Department"
                    options={departmentOptions}
                    value={department}
                    disabled={isView}
                    onChange={(val) => {
                      setDepartment(val);
                      setErrors((prev) => { const n = { ...prev }; delete n.department; return n; });
                    }}
                    searchable
                    serverSearch
                    onSearch={fetchDepartments}
                    placeholder="Search Department..."
                  />
                  <ErrorMsg name="department" />
                </div>

                {/* ── Level / Grade ── */}
                <div>
                  <Select
                    key={levelOption ? `level-${levelOption.value}` : "level-empty"}
                    label="Level / Grade"
                    options={levelOptions}
                    value={levelOption}
                    disabled={isView}
                    onChange={(val) => {
                      setLevelOption(val);
                      setErrors((prev) => { const n = { ...prev }; delete n.level; return n; });
                    }}
                    placeholder="Select Level..."
                  />
                  <ErrorMsg name="level" />
                </div>

                {/* ── Reports To ── */}
                <div className="col-span-2">
                  <Select
                    key={reportsToOption ? `rpt-${reportsToOption.value}` : "rpt-empty"}
                    label="Reports To Designation"
                    options={reportsToOptions}
                    value={reportsToOption}
                    disabled={isView}
                    onChange={(val) => setReportsToOption(val)}
                    searchable
                    serverSearch
                    onSearch={fetchDesignations}
                    placeholder="Search designation (optional)..."
                  />
                </div>

                {/* ── Salary Band heading ── */}
                <div className="col-span-2">
                  <p className="text-xs font-medium text-gray-500 mb-1 mt-2 uppercase tracking-wide">
                    Salary Band (Optional)
                  </p>
                </div>

                {/* ── Currency ── */}
                <div>
                  <Select
                    label="Currency"
                    options={currencyOptions}
                    value={currencyOption}
                    disabled={isView}
                    onChange={(val) => setCurrencyOption(val)}
                    placeholder="Select Currency"
                  />
                </div>

                {/* ── Min CTC ── */}
                <div>
                  <Input
                    label="Minimum CTC (Annual)"
                    name="minCTC"
                    type="number"
                    value={form.minCTC}
                    onChange={onChange}
                    disabled={isView}
                    placeholder="e.g. 500000"
                  />
                </div>

                {/* ── Max CTC ── */}
                <div>
                  <Input
                    label="Maximum CTC (Annual)"
                    name="maxCTC"
                    type="number"
                    value={form.maxCTC}
                    onChange={onChange}
                    disabled={isView}
                    placeholder="e.g. 1200000"
                  />
                </div>

                {/* ── Status ── */}
                <div className="col-span-2 flex items-center gap-2 mt-2">
                  <Input
                    type="checkbox"
                    id="status-check"
                    label="Active"
                    checked={form.isActive}
                    disabled={isView}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
                    }
                  />
                </div>

                {/* ── Actions ── */}
                <div className="col-span-2 flex justify-center gap-4 mt-8 pt-6">
                  {!isView && (
                    <Button type="submit" variant="submit" disabled={loading}>
                      {loading ? "Saving..." : "Save"}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="cancel"
                    onClick={() => navigate("/Designation_list")}
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

export default Designation_Master;