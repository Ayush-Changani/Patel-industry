import React, { useState, useEffect } from "react";
import api from "../../../services/axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import Grid from "../../../assets/Grid/Grid";

const Entity_list = () => {
  const navigate = useNavigate();

  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [data, setData] = useState([]);

  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;

  /* ================= LOAD ================= */
  const loadEntities = async () => {
    try {
      const res = await api.get("/i_pi_entity_mst_select_all_and_id", {
        params: { ent_id: 0 },
      });

      const apiData = Array.isArray(res.data.Result) ? res.data.Result : [];

      setOriginalData(apiData);
      setFilteredData(apiData);

      setTotalRecords(apiData.length);
      setData(apiData.slice(0, pageSize));
      setCurrentPage(1);

    } catch (err) {
      Swal.fire("Error", "Failed to fetch entities", "error");
      setOriginalData([]);
      setFilteredData([]);
      setData([]);
    }
  };

  useEffect(() => {
    loadEntities();
  }, []);

  /* ================= PAGINATION ================= */
  const handlePageChange = (page) => {
    const start = (page - 1) * pageSize;

    setData(filteredData.slice(start, start + pageSize));
    setCurrentPage(page);
  };

  /* ================= SEARCH ================= */
  const handleSearch = (text) => {
    const lower = text.toLowerCase();

    const filtered = originalData.filter(
      (row) =>
        row.ent_name?.toLowerCase().includes(lower) ||
        row.ent_code?.toLowerCase().includes(lower) ||
        row.entity_group_name?.toLowerCase().includes(lower)
    );

    setFilteredData(filtered);
    setTotalRecords(filtered.length);
    setCurrentPage(1);
    setData(filtered.slice(0, pageSize));
  };

  /* ================= ACTIONS ================= */
  const handleAdd = () => navigate("/Entity_master");
  const handleEdit = (row) => navigate(`/Entity_master?eid=${row.ent_id}`);
  const handleView = (row) => navigate(`/Entity_master?view_id=${row.ent_id}`);

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to delete "${row.ent_name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await api.post(`/i_pi_entity_mst_delete?ent_id=${row.ent_id}`);

        if (res.data?.Status === 1) {
          Swal.fire("Deleted!", res.data.Message || "Entity deleted successfully", "success");
          loadEntities();
        } else {
          Swal.fire("Action Blocked", res.data?.message || "Delete failed", "warning");
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
                title="Entity List"
                data={data}
                totalRecords={totalRecords}
                currentPage={currentPage}
                pageSize={pageSize}

                onSearch={handleSearch}
                onAdd={handleAdd}
                onReload={loadEntities}

                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDelete}

                onPageChange={handlePageChange}

                ignoreColumns={[
                  "ent_id",
                  "ent_eg_id",
                  "ent_is_active",
                  "created_date",
                  "modified_date",
                ]}
              />

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Entity_list;