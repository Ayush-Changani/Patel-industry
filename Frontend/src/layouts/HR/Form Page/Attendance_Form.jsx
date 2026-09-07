import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import { FaFileExcel, FaUpload } from "react-icons/fa";
import api from "../../../services/axios";

import Card from "../../../components/Card";
import Button from "../../../components/Button";
import Sidebar from "../../../components/Sidebar";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";

const Attendance_Form = () => {
  const navigate = useNavigate();
  const [month, setMonth] = useState(3);
  const [year, setYear] = useState(2026);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

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

  const today = new Date();
  const currMonth = today.getMonth() + 1;
  const currYear = today.getFullYear();

  const isFuture = year > currYear || (year === currYear && month > currMonth);
  const daysInMonth = new Date(year, month, 0).getDate();


  const handleFileUpload = (e) => {
    if (isFuture) {
      Swal.fire("Blocked", "Future attendance uploads are not allowed", "error");
      e.target.value = "";
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      let temp = [];

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[0]) continue;

        let emp = {
          emp_id: parseInt(row[0]),
          days: {},
        };

        for (let j = 1; j < row.length; j++) {
          if (!row[j]) continue;

          const val = row[j].toString().toUpperCase();

          // ✅ ONLY VALID VALUES
          if (["P", "A", "L", "H"].includes(val)) {
            emp.days[j] = val;
          }
        }

        temp.push(emp);
      }

      setEmployees(temp);
    };

    reader.readAsBinaryString(file);
  };

  // 🔷 Change Attendance
  const handleChange = (empIndex, day, value) => {
    const updated = [...employees];

    if (value && !["P", "A", "L", "H"].includes(value)) return;

    updated[empIndex].days[day] = value;
    setEmployees(updated);
  };

  // 🔷 Total Count
  const getTotal = (days, type) => {
    return Object.values(days).filter((d) => d === type).length;
  };

  // 🔷 Download Template (NO DESIGN CHANGE)
  const handleDownloadTemplate = () => {
    const headers = ["Emp ID", ...[...Array(daysInMonth)].map((_, i) => String(i + 1).padStart(2, "0"))];
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance_Template");
    XLSX.writeFile(wb, `Attendance_Template_${months[month - 1].label}_${year}.xlsx`);
  };

  // 🔷 Save (FINAL SAFE)
  const handleSave = async () => {
    if (employees.length === 0) {
      Swal.fire("Warning", "No data to save", "warning");
      return;
    }

    setLoading(true);

    try {
      let finalData = [];

      employees.forEach((emp) => {
        Object.keys(emp.days).forEach((day) => {
          const status = (emp.days[day] || "").toUpperCase();

          if (!status) return;
          if (!["P", "A", "L", "H"].includes(status)) return;

          finalData.push({
            emp_id: parseInt(emp.emp_id),
            att_date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
            status: status,
          });
        });
      });

      if (finalData.length === 0) {
        Swal.fire("Warning", "No valid attendance data", "warning");
        setLoading(false);
        return;
      }

      const res = await api.post("/i_pi_attendance_bulk_insert", finalData);

      if (res.data?.Status === 1 || res.data?.status === 1) {
        await Swal.fire("Success", res.data?.Message || res.data?.message, "success");
        navigate("/Attendance_List");
      } else {
        Swal.fire("Error", res.data?.Message || res.data?.message, "error");
      }
    } catch {
      Swal.fire("Error", "Server Error", "error");
    } finally {
      setLoading(false);
    }
  };

  // 🔷 UI (UNCHANGED)
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col h-full overflow-hidden">
        <Header />

        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-full mx-auto">
            <Card title="Attendance Management">

              {/* 🔷 Top Controls */}
              <div className="flex flex-wrap items-end gap-6 mb-8 p-6 bg-[#DFD0B8]/30 rounded-3xl border border-[#393E46]/10 shadow-sm">
                
                {/* Month */}
                <div className="flex flex-col gap-1.5 min-w-[120px]">
                  <label className="text-xs font-semibold text-[#393E46] uppercase tracking-wider ml-1">Month</label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#393E46]/20 focus:border-[#948979] focus:ring-2 focus:ring-[#948979]/20 bg-[#DFD0B8]/50 text-[#222831] font-medium transition-all duration-200 outline-none hover:border-[#948979]/50"
                  >
                    {months.map((m) => {
                      const isDisabled = year > currYear || (year === currYear && m.value > currMonth);
                      return (
                        <option key={m.value} value={m.value} disabled={isDisabled}>
                          {m.label} {isDisabled ? " (Future)" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Year */}
                <div className="flex flex-col gap-1.5 min-w-[120px]">
                  <label className="text-xs font-semibold text-[#393E46] uppercase tracking-wider ml-1">Year</label>
                  <input
                    type="number"
                    max={currYear}
                    value={year}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val > currYear) {
                        Swal.fire("Warning", "Future years are not allowed", "warning");
                        setYear(currYear);
                      } else {
                        setYear(val || "");
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#393E46]/20 focus:border-[#948979] focus:ring-2 focus:ring-[#948979]/20 bg-[#DFD0B8]/50 text-[#222831] font-medium transition-all duration-200 outline-none hover:border-[#948979]/50"
                    placeholder="Year"
                  />
                </div>

                {/* Upload */}
                <div className="flex flex-col gap-1.5 flex-1 min-w-[280px]">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-semibold text-[#393E46] uppercase tracking-wider">
                      Upload Attendance Sheet
                    </label>
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-800 underline uppercase tracking-tighter"
                    >
                      Download Template
                    </button>
                  </div>

                  <div className="relative group">
                    <input
                      id="attendance-upload"
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <label
                      htmlFor={isFuture ? "" : "attendance-upload"}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border-2 border-dashed transition-all duration-300 ${
                        isFuture
                          ? "border-red-300 bg-red-50/10 text-red-500 cursor-not-allowed opacity-60"
                          : "border-[#948979]/40 bg-[#DFD0B8]/20 text-[#393E46] cursor-pointer hover:border-[#948979] hover:bg-[#DFD0B8]/40 group-hover:shadow-inner"
                      }`}
                      onClick={() => isFuture && Swal.fire("Warning", "Future months cannot be edited", "warning")}
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-xl ${isFuture ? "bg-red-100 text-red-400" : "bg-[#948979]/10 text-[#948979]"}`}>
                        <FaUpload className="text-sm" />
                      </div>

                      <span className="flex-1 truncate font-medium">
                        {isFuture ? "Future Months Blocked" : (fileName || "Choose Excel File...")}
                      </span>

                      {fileName && !isFuture && (
                        <FaFileExcel className="text-[#107C41] text-lg" title="Excel file ready" />
                      )}        
                    </label>
                  </div>
                </div>

                {/* Save & Cancel */}
                <div className="flex items-end gap-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={loading || isFuture}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#948979]
                      ${loading || isFuture
                        ? "bg-[#948979] text-[#222831] opacity-50 cursor-not-allowed"
                        : "bg-[#948979] text-[#222831] hover:bg-[#393E46] hover:text-[#DFD0B8] hover:shadow-md hover:scale-105"
                      }`}
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/Attendance_List")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm bg-[#DFD0B8] text-[#222831] border border-[#393E46] hover:bg-[#393E46] hover:text-[#DFD0B8] hover:shadow-md hover:scale-105 transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#DFD0B8]"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Grid */}
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
                      <th>P</th>
                      <th>A</th>
                      <th>L</th>
                      <th>H</th>
                    </tr>
                  </thead>

                  <tbody>
                    {employees.map((emp, index) => (
                      <tr key={index}>
                        <td className="border px-2">{emp.emp_id}</td>

                        {[...Array(daysInMonth)].map((_, i) => {
                          const day = i + 1;

                          return (
                            <td key={i} className="border">
                              <select
                                className="w-full"
                                value={emp.days[day] || ""}
                                onChange={(e) =>
                                  handleChange(index, day, e.target.value)
                                }
                              >
                                <option value="">-</option>
                                <option value="P">P</option>
                                <option value="A">A</option>
                                <option value="L">L</option>
                                <option value="H">H</option>
                              </select>
                            </td>
                          );
                        })}

                        <td>{getTotal(emp.days, "P")}</td>
                        <td>{getTotal(emp.days, "A")}</td>
                        <td>{getTotal(emp.days, "L")}</td>
                        <td>{getTotal(emp.days, "H")}</td>
                      </tr>
                    ))}
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

export default Attendance_Form;