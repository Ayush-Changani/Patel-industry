import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/axios";
import Swal from "sweetalert2";
import Grid from "../../../assets/Grid/Grid";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

const Taluka_list = () => {
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [data, setData] = useState([]);

  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;

  /* ================= LOAD ================= */
  const loadTalukas = async () => {
    try {
      const res = await api.get("/i_pi_taluka_mst_select_all_and_id", {
        params: { tal_id: 0 },
      });

      const apiData = Array.isArray(res.data.Result) ? res.data.Result : [];

      /* ===== IMPORTANT ===== */
      setOriginalData(apiData);
      setFilteredData(apiData);

      setTotalRecords(apiData.length);
      setData(apiData.slice(0, pageSize));
      setCurrentPage(1);

    } catch (err) {
      Swal.fire("Error", "Failed to fetch talukas", "error");

      setOriginalData([]);
      setFilteredData([]);
      setData([]);
    }
  };

  useEffect(() => {
    loadTalukas();
  }, []);

  /* ================= PAGINATION ================= */
  const handlePageChange = (page) => {
    const start = (page - 1) * pageSize;

    setData(filteredData.slice(start, start + pageSize)); // ✅ FIX
    setCurrentPage(page);
  };

  /* ================= SEARCH ================= */
  const handleSearch = (text) => {
    const lower = text.toLowerCase();

    const filtered = originalData.filter(
      (row) =>
        row.taluka_name?.toLowerCase().includes(lower) ||
        row.district_name?.toLowerCase().includes(lower)
    );

    setFilteredData(filtered); // ✅ IMPORTANT
    setTotalRecords(filtered.length);
    setCurrentPage(1);
    setData(filtered.slice(0, pageSize));
  };

  /* ================= ACTIONS ================= */
  const handleAdd = () => navigate("/Taluka_master");

  const handleEdit = (row) =>
    navigate(`/Taluka_master?eid=${row.tal_id}`);

  const handleView = (row) =>
    navigate(`/Taluka_master?view_id=${row.tal_id}`);

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to delete ${row.taluka_name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await api.post(
          `/i_pi_taluka_mst_delete?tal_id=${row.tal_id}`
        );

        if (res.data?.Status === 1 || res.data?.status === 1) {
          Swal.fire(
            "Deleted",
            res.data?.message || "Taluka has been deleted.",
            "success"
          );
          loadTalukas();
        } else {
          Swal.fire(
            "Error",
            res.data?.message || "Delete failed",
            "error"
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
                title="Taluka List"
                data={data}
                totalRecords={totalRecords}
                currentPage={currentPage}
                pageSize={pageSize}

                onSearch={handleSearch}
                onAdd={handleAdd}
                onReload={loadTalukas}

                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDelete}

                onPageChange={handlePageChange}

                ignoreColumns={[
                  "tal_id",
                  "tal_district_name",
                  "tal_is_active",
                ]}
              />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Taluka_list;