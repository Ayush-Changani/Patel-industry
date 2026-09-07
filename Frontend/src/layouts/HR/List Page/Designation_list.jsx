import React, { useState, useEffect } from "react";
import api from "../../../services/axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import Grid from "../../../assets/Grid/Grid";

const Designation_list = () => {
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [data, setData] = useState([]);

  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;

  /* ================= LOAD ================= */
  const loadDesignations = async () => {
    try {
      const res = await api.get("/i_pi_designation_mst_select_all_and_id", {
        params: { des_id: 0 },
      });

      const apiData = Array.isArray(res.data.Result) ? res.data.Result : [];

      setOriginalData(apiData);
      setFilteredData(apiData);

      setTotalRecords(apiData.length);
      setData(apiData.slice(0, pageSize));
      setCurrentPage(1);

    } catch (err) {
      Swal.fire("Error", "Failed to fetch designations", "error");

      setOriginalData([]);
      setFilteredData([]);
      setData([]);
    }
  };

  useEffect(() => {
    loadDesignations();
  }, []);

  /* ================= PAGINATION ================= */
  const handlePageChange = (page) => {
    const start = (page - 1) * pageSize;
    setData(filteredData.slice(start, start + pageSize));
    setCurrentPage(page);
  };

  /* ================= SEARCH (FIXED + GLOBAL) ================= */
  const handleSearch = (text) => {
    const lower = (text || "").toLowerCase();

    const filtered = originalData.filter((row) =>
      Object.values(row).some((val) =>
        val && val.toString().toLowerCase().includes(lower)
      )
    );

    setFilteredData(filtered);
    setTotalRecords(filtered.length);
    setCurrentPage(1);
    setData(filtered.slice(0, pageSize));
  };

  /* ================= ACTIONS ================= */
  const handleAdd = () => navigate("/Designation_master");

  const handleEdit = (row) =>
    navigate(`/Designation_master?eid=${row.des_id}`);

  const handleView = (row) =>
    navigate(`/Designation_master?view_id=${row.des_id}`);

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to delete "${row.des_name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await api.post(
          `/i_pi_designation_mst_delete?des_id=${row.des_id}`
        );

        if (res.data?.Status === 1 || res.data?.status === 1) {
          Swal.fire(
            "Deleted!",
            res.data.Message || "Designation deleted successfully",
            "success"
          );
          loadDesignations();
        } else {
          Swal.fire(
            "Action Blocked",
            res.data?.message || "Delete failed",
            "warning"
          );
        }

      } catch (err) {
        console.error("Delete Error:", err);
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
                title="Designation List"
                data={data}
                totalRecords={totalRecords}
                currentPage={currentPage}
                pageSize={pageSize}

                onSearch={handleSearch}
                onAdd={handleAdd}
                onReload={loadDesignations}

                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDelete}

                onPageChange={handlePageChange}

                ignoreColumns={[
                  "des_id",
                  "des_is_delete",
                  "des_department_id",
                  "des_status",
                  "reports_to",
                ]}
              />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Designation_list;