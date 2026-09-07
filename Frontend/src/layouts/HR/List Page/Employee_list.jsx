import React, { useState, useEffect } from "react";
import api from "../../../services/axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import Grid from "../../../assets/Grid/Grid";

const Employee_list = () => {
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [data, setData] = useState([]);

  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;

  /* ================= LOAD ================= */
  const loadEmployees = async () => {
    try {
      const res = await api.get("/i_pi_employee_mst_select_all_and_id", {
        params: { emp_id: 0 },
      });

      const apiData = Array.isArray(res.data.Result)
        ? res.data.Result
        : [];

      setOriginalData(apiData);
      setFilteredData(apiData);

      setTotalRecords(apiData.length);
      setData(apiData.slice(0, pageSize));
      setCurrentPage(1);

    } catch {
      Swal.fire("Error", "Failed to fetch employees", "error");

      setOriginalData([]);
      setFilteredData([]);
      setData([]);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  /* ================= PAGINATION ================= */
  const handlePageChange = (page) => {
    const start = (page - 1) * pageSize;

    setData(filteredData.slice(start, start + pageSize)); // ✅ FIX
    setCurrentPage(page);
  };

  /* ================= SEARCH ================= */
  const handleSearch = (text) => {
    const lower = (text || "").toLowerCase();

    const filtered = originalData.filter((row) =>
      Object.values(row).some(
        (val) =>
          val &&
          val.toString().toLowerCase().includes(lower)
      )
    );

    setFilteredData(filtered);
    setTotalRecords(filtered.length);
    setCurrentPage(1);
    setData(filtered.slice(0, pageSize));
  };

  /* ================= ACTIONS ================= */
  const handleAdd = () => navigate("/Employee_master");

  const handleEdit = (row) =>
    navigate(`/Employee_master?eid=${row.emp_id}`);

  const handleView = (row) =>
    navigate(`/Employee_master?view_id=${row.emp_id}`);

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete employee "${row.emp_full_name}" (${row.emp_code})?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await api.post(
          `/i_pi_employee_mst_delete?emp_id=${row.emp_id}`
        );

        if (res.data?.Status === 1 || res.data?.status === 1) {
          Swal.fire(
            "Deleted!",
            res.data.Message || "Employee deleted successfully",
            "success"
          );
          loadEmployees();
        } else {
          Swal.fire(
            "Action Blocked",
            res.data?.message || "Delete failed",
            "warning"
          );
        }

      } catch {
        Swal.fire("Error", "Internal Server Error during delete", "error");
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 ml-64 flex flex-col h-full overflow-hidden">
        <Header />

        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-[1200px] mx-auto">

            <div className="rounded-xl shadow-sm border">
              <Grid
                title="Employee List"
                data={data}
                totalRecords={totalRecords}
                currentPage={currentPage}
                pageSize={pageSize}

                onSearch={handleSearch}
                onAdd={handleAdd}
                onReload={loadEmployees}

                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDelete}

                onPageChange={handlePageChange}

                ignoreColumns={[
                  "emp_id", "emp_is_delete",
                  "emp_city", "emp_taluka", "emp_district", "emp_state", "emp_country",
                  "emp_department_id", "emp_designation_id", "emp_reporting_manager_id",
                  "emp_address", "emp_aadhar", "emp_pan",
                  "emp_doc_aadhar", "emp_doc_pan", "emp_doc_offer",
                  "emp_doc_experience", "emp_doc_education", "emp_doc_other",
                  "emp_doc_aadhar_url", "emp_doc_pan_url", "emp_doc_offer_url",
                  "emp_doc_experience_url", "emp_doc_education_url",
                  "emp_doc_other_url", "emp_photo_url",
                  "emp_account_number", "emp_ifsc_code", "emp_branch_name", "emp_upi_id",
                  "employee_upi_id"
                ]}
              />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Employee_list;