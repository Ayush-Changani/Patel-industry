import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/axios";
import Swal from "sweetalert2";
import Grid from "../../../assets/Grid/Grid";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

const Entity_Group_list = () => {
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [data, setData] = useState([]);

  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;

  /* ================= LOAD ================= */
  const loadSlabs = async () => {
    try {
      const res = await api.get("/i_pi_entity_group_mst_select_all_and_id", {
        params: { eg_id: 0 },
      });

      const apiData = Array.isArray(res.data.Result) ? res.data.Result : [];

      /* ===== IMPORTANT ===== */
      setOriginalData(apiData);
      setFilteredData(apiData);

      setTotalRecords(apiData.length);
      setData(apiData.slice(0, pageSize));
      setCurrentPage(1);

    } catch (err) {
      Swal.fire("Error", "Failed to fetch entity groups", "error");

      setOriginalData([]);
      setFilteredData([]);
      setData([]);
    }
  };

  useEffect(() => {
    loadSlabs();
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
        row.entity_group?.toLowerCase().includes(lower)
    );

    setFilteredData(filtered); // ✅ IMPORTANT
    setTotalRecords(filtered.length);
    setCurrentPage(1);
    setData(filtered.slice(0, pageSize));
  };

  /* ================= ACTIONS ================= */
  const handleAdd = () => navigate("/Entity_Group_Master");

  const handleEdit = (row) =>
    navigate(`/Entity_Group_Master?eid=${row.eg_id}`);

  const handleView = (row) =>
    navigate(`/Entity_Group_Master?view_id=${row.eg_id}`);

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to delete ${row.entity_group}?`, // fixed field name
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await api.post(
          `/i_pi_entity_group_mst_delete?eg_id=${row.eg_id}`
        );

        if (res.data?.Status === 1 || res.data?.status === 1) {
          Swal.fire(
            "Deleted",
            res.data?.Message || "Entity Group deleted successfully",
            "success"
          );
          loadSlabs();
        } else {
          Swal.fire(
            "Error",
            res.data?.Message || "Delete failed",
            "error"
          );
        }

      } catch {
        Swal.fire("Error", "Server Error", "error");
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
                title="Entity Group List"
                data={data}
                totalRecords={totalRecords}
                currentPage={currentPage}
                pageSize={pageSize}

                onSearch={handleSearch}
                onAdd={handleAdd}
                onReload={loadSlabs}

                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDelete}

                onPageChange={handlePageChange}

                ignoreColumns={["eg_id"]}
              />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Entity_Group_list;