import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import api from "../../../services/axios";
import Swal from "sweetalert2";

import Card from "../../../components/Card";
import Sidebar from "../../../components/Sidebar";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";
import Button from "../../../components/Button";

const Attendance_List = () => {
  const navigate = useNavigate();

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState("");
  const [attendance, setAttendance] = useState([]);

  const daysInMonth = new Date(year, month, 0).getDate();

  // 🔷 CHANGE THIS (GET FROM LOGIN CONTEXT)x
  const isAdmin = true; 
  const loggedEmpId = 1;

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  // 🔷 LOAD EMPLOYEE LIST (ADMIN ONLY)
  useEffect(() => {
    if (isAdmin) {
      api.get("/i_pi_get_all_employee_ddl")
        .then(res => {
          if (res.data?.Status === 1 || res.data?.status === 1) {
            setEmployees(res.data.Result);
          }
        });
    }
  }, []);

  // 🔷 FETCH ATTENDANCE
  const fetchAttendance = async () => {
    try {
      const empId = isAdmin ? selectedEmp : loggedEmpId;

      if (isAdmin && !empId) {
        Swal.fire("Warning", "Select Employee", "warning");
        return;
      }

      const res = await api.get("/i_pi_attendance_get", {
        params: { emp_id: empId, month, year }
      });

      if (res.data?.Status === 1 && Array.isArray(res.data.Result) && res.data.Result.length > 0) {
        setAttendance(res.data.Result);
      } else {
        setAttendance([]);
      }

    } catch {
      setAttendance([]);
      Swal.fire("Error", "Failed to load data", "error");
    }
  };

  // 🔷 FORMAT DATA TO GRID
  const formatData = () => {
    let map = {};

    attendance.forEach(a => {
      if (!map[a.att_emp_id]) {
        map[a.att_emp_id] = { emp_id: a.att_emp_id, days: {} };
      }
      map[a.att_emp_id].days[a.day_no] = a.att_status;
    });

    return Object.values(map);
  };

  const data = formatData();

  const getTotal = (days, type) => {
    return Object.values(days).filter(d => d === type).length;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col h-full overflow-hidden">
        <Header />

        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-full mx-auto">

            <Card title="Attendance List">

              {/* 🔷 FILTERS & ACTIONS */}
              <div className="flex flex-wrap gap-4 mb-6 items-center">

                {isAdmin && (
                  <select
                    value={selectedEmp}
                    onChange={(e) => setSelectedEmp(e.target.value)}
                    className="px-4 py-2 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#948979]"
                  >
                    <option value="">Select Employee</option>
                    {employees.map(e => (
                      <option key={e.emp_id} value={e.emp_id}>
                        {e.emp_code ? `${e.emp_code} - ` : ""}{e.emp_full_name || e.emp_name}
                      </option>
                    ))}
                  </select>
                )}

                <select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="px-4 py-2 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#948979]"
                >
                  {months.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>

                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="px-4 py-2 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#948979]"
                />

                <div className="flex gap-4 ml-auto sm:ml-0">
                  <button
                    onClick={fetchAttendance}
                    className="px-6 py-2 bg-[#948979] text-white rounded-2xl hover:bg-[#827869] hover:shadow-md hover:scale-105 transition-all duration-200 w-full sm:w-auto"
                  >
                    Load
                  </button>

                  <Button 
                    type="button"
                    variant="submit"
                    onClick={() => navigate("/Attendance_Form")}
                    // className="inline-flex justify-center items-center gap-2 px-6 py-2 rounded-2xl font-medium text-sm bg-[#1E7E34] text-white hover:bg-[#145C26] hover:shadow-md hover:scale-105 transition-all duration-200 transform focus:outline-none w-full sm:w-auto"
                  > 
                    Add
                  </Button>
                </div>
              </div>

              {/* 🔷 TABLE */}
              <div className="overflow-auto">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr>
                      <th className="border px-2">Emp ID</th>

                      {[...Array(daysInMonth)].map((_, i) => (
                        <th key={i} className="border px-2">
                          {String(i + 1).padStart(2, "0")}
                        </th>
                      ))}

                      <th className="border px-2">P</th>
                      <th className="border px-2">A</th>
                      <th className="border px-2">L</th>
                      <th className="border px-2">H</th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.length > 0 ? (
                      data.map((emp, index) => (
                        <tr key={index}>
                          <td className="border px-2">{emp.emp_id}</td>

                          {[...Array(daysInMonth)].map((_, i) => {
                            const day = i + 1;
                            const status = emp.days[day];
                            let colorClass = "text-gray-400";
                            if (status === "P") {
                              colorClass = "bg-green-100 text-green-700 font-bold rounded";
                            } else if (status === "A") {
                              colorClass = "bg-red-100 text-red-700 font-bold rounded";
                            } else if (status) {
                              colorClass = "bg-yellow-100 text-yellow-700 font-bold rounded";
                            }

                            return (
                              <td key={i} className="border text-center p-1">
                                <div className="flex justify-center items-center">
                                  <span className={`inline-flex items-center justify-center w-6 h-6 text-xs ${colorClass}`}>
                                    {status || "-"}
                                  </span>
                                </div>
                              </td>
                            );
                          })}

                          <td className="border text-center font-bold text-green-700">{getTotal(emp.days, "P")}</td>
                          <td className="border text-center font-bold text-red-700">{getTotal(emp.days, "A")}</td>
                          <td className="border text-center font-bold text-yellow-600">{getTotal(emp.days, "L")}</td>
                          <td className="border text-center font-bold text-yellow-600">{getTotal(emp.days, "H")}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={daysInMonth + 5} className="py-12 text-center text-gray-500 font-medium border bg-gray-50/50">
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <span className="text-[15px]">No attendance data found for the selected criteria</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </Card>

          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
};

export default Attendance_List;