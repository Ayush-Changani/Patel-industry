import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../../services/axios";
import { useNavigate } from "react-router-dom";

import Card from "../../../components/Card";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import Select from "../../../components/Select";
import Sidebar from "../../../components/Sidebar";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";
import { useAuth } from "../../../context/AuthContext";

import { validateRequired } from "../../../utils/validationUtils";

const Leave_Master = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    employee: null,
    leaveType: null, // 🔥 object-based
    fromDate: "",
    toDate: "",
    days: "",
    reason: "",
  });

  const [leaveTypeOptions, setLeaveTypeOptions] = useState([]);
  const [balance, setBalance] = useState([]);
  const [history, setHistory] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ================================
  // FETCH DATA
  // ================================
  const fetchData = async (id) => {
    try {
      const bal = await api.get("/i_pi_leave_balance_get", {
        params: { emp_id: id },
      });

      const list = await api.get("/i_pi_leave_request_get", {
        params: { lr_employee_id: id },
      });

      if (bal.data?.Status === 1) {
        const balanceData = bal.data.Result;

        setBalance(balanceData);

        // 🔥 SMART DROPDOWN OPTIONS
        const options = balanceData.map((b) => ({
          value: b.lb_leave_type,
          label: `${b.lb_leave_type} (Remaining: ${b.lb_remaining_leave})`,
        }));

        setLeaveTypeOptions(options);
      }

      if (list.data?.Status === 1) {
        setHistory(list.data.Result);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (user?.id) {
      const empData = { value: user.id, label: user.name };
      setForm((p) => ({ ...p, employee: empData }));
      fetchData(user.id);
    }
  }, [user]);

  // ================================
  // AUTO DAYS
  // ================================
  useEffect(() => {
    if (form.fromDate && form.toDate) {
      const from = new Date(form.fromDate);
      const to = new Date(form.toDate);

      if (to >= from) {
        const diff = (to - from) / (1000 * 60 * 60 * 24) + 1;
        setForm((p) => ({ ...p, days: diff }));
      } else {
        setForm((p) => ({ ...p, days: "" }));
      }
    }
  }, [form.fromDate, form.toDate]);

  // ================================
  // HANDLE CHANGE
  // ================================
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  // ================================
  // VALIDATION
  // ================================
  const validateForm = () => {
    let newErrors = {};

    newErrors.leaveType = form.leaveType
      ? null
      : { message: "Leave Type required" };

    newErrors.fromDate = validateRequired(form.fromDate, "From Date");
    newErrors.toDate = validateRequired(form.toDate, "To Date");

    if (form.fromDate && form.toDate) {
      const from = new Date(form.fromDate);
      const to = new Date(form.toDate);
      if (to < from)
        newErrors.toDate = { message: "To Date must be >= From Date" };
    }

    newErrors.reason = validateRequired(form.reason, "Reason");

    setErrors(newErrors);

    return Object.values(newErrors).every((x) => !x?.message);
  };

  // 🔥 FIXED
  const selectedBalance = balance.find(
    (b) => b.lb_leave_type === form.leaveType?.value
  );

  // ================================
  // SUBMIT
  // ================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (
      selectedBalance &&
      Number(form.days) > selectedBalance.lb_remaining_leave
    ) {
      Swal.fire("Error", "Insufficient leave balance", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/i_pi_leave_request_insert", {
        lr_employee_id: form.employee.value,
        lr_leave_type: form.leaveType?.value,
        lr_from_date: form.fromDate,
        lr_to_date: form.toDate,
        lr_reason: form.reason,
      });

      if (res.data?.Status === 1 || res.data?.status === 1) {
        Swal.fire("Success", res.data.Message || res.data.message, "success");

        fetchData(form.employee.value);

        setForm({
          employee: form.employee,
          leaveType: null,
          fromDate: "",
          toDate: "",
          days: "",
          reason: "",
        });

        navigate("/Leave_Request_List");
      } else {
        Swal.fire("Error", res.data.Message || res.data.message, "error");
      }
    } catch {
      Swal.fire("Error", "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  const ErrorMsg = ({ name }) =>
    errors[name]?.message ? (
      <p className="text-red-500 text-xs mt-1">
        {errors[name].message}
      </p>
    ) : null;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col">
        <Header />

        <div className="p-4 overflow-y-auto">
          <div className="max-w-6xl mx-auto grid grid-cols-3 gap-6">

            {/* FORM */}
            <div className="col-span-2">
              <Card title="Leave Request">
                <form className="grid grid-cols-2 gap-4 p-4" onSubmit={handleSubmit}>

                  <Input label="Employee" value={user?.name || ""} disabled />

                  {/* 🔥 PROFESSIONAL SELECT */}
                  <Select
                    label="Leave Type"
                    options={leaveTypeOptions}
                    value={form.leaveType}
                    onChange={(val) =>
                      setForm({ ...form, leaveType: val })
                    }
                    placeholder="Select Leave Type..."
                  />
                  <ErrorMsg name="leaveType" />

                  {form.leaveType && selectedBalance && (
                    <p className="col-span-2 text-xs text-gray-400">
                      Available Leave: {selectedBalance.lb_remaining_leave} days
                    </p>
                  )}

                  <Input
                    type="date"
                    label="From Date"
                    name="fromDate"
                    value={form.fromDate}
                    onChange={onChange}
                  />

                  <Input
                    type="date"
                    label="To Date"
                    name="toDate"
                    value={form.toDate}
                    onChange={onChange}
                    min={form.fromDate}
                  />
                  <ErrorMsg name="toDate" />

                  <Input label="Total Days" value={form.days} disabled />

                  <div className="col-span-2">
                    <Input
                      label="Reason"
                      name="reason"
                      value={form.reason}
                      onChange={onChange}
                      multiline
                      rows={2}
                    />
                  </div>

                  <div className="col-span-2 flex justify-center mt-6 gap-4">
                    <Button
                      type="button"
                      variant="cancel"
                      onClick={() =>
                        navigate("/Leave_Request_List")
                      }
                    >
                      Cancel
                    </Button>

                    <Button type="submit" variant="submit">
                      {loading ? "Saving..." : "Apply Leave"}
                    </Button>
                  </div>

                </form>
              </Card>
            </div>

            {/* RIGHT PANEL */}
            <div>
              <Card title="Leave Summary">

                {form.leaveType && selectedBalance && (
                  <div className="space-y-2 text-sm">
                    <p>Type: {selectedBalance.lb_leave_type}</p>
                    <p>Total: {selectedBalance.lb_total_leave}</p>
                    <p>Used: {selectedBalance.lb_used_leave}</p>
                    <p>Remaining: {selectedBalance.lb_remaining_leave}</p>
                  </div>
                )}

                <div className="mt-4">
                  <h4 className="mb-2">History</h4>
                  <div className="max-h-60 overflow-auto text-xs">
                    {history.map((h, i) => (
                      <div key={i} className="border-b py-1">
                        {h.lr_from_date} → {h.lr_to_date} ({h.lr_status})
                      </div>
                    ))}
                  </div>
                </div>

              </Card>
            </div>

          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
};

export default Leave_Master;