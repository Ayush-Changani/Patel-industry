import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/axios";
import Swal from "sweetalert2";
import Grid from "../../../assets/Grid/Grid";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

const Store_Location_list = () => {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 30;

  /* ================= LOAD ================= */
  const loadLocations = async () => {
    try {
      const res = await api.get("/i_pi_location_of_store_select_all_and_id", {
        params: { sl_id: 0 },
      });

      const apiData = Array.isArray(res.data.Result)
        ? res.data.Result
        : [];

      setAllData(apiData);

      // IMPORTANT
      setFilteredData(apiData);
      setTotalRecords(apiData.length);
      setData(apiData.slice(0, pageSize));
      setCurrentPage(1);

    } catch (err) {
      Swal.fire("Error", "Failed to fetch store locations", "error");
      setAllData([]);
      setFilteredData([]);
      setData([]);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  /* ================= PAGINATION (FIXED) ================= */
  const handlePageChange = (page) => {
    const start = (page - 1) * pageSize;

    setData(filteredData.slice(start, start + pageSize)); // ✅ FIX
    setCurrentPage(page);
  };

  /* ================= SEARCH (FIXED) ================= */
  const handleSearch = (text) => {
    const lower = text.toLowerCase();

    const filtered = allData.filter((row) =>
      row.store_location?.toLowerCase().includes(lower)
    );

    setFilteredData(filtered); // ✅ IMPORTANT
    setTotalRecords(filtered.length);
    setCurrentPage(1);
    setData(filtered.slice(0, pageSize));
  };

  /* ================= ACTIONS ================= */
  const handleAdd = () => navigate("/Store_Location_Master");

  const handleEdit = (row) =>
    navigate(`/Store_Location_Master?eid=${row.sl_id}`);

  const handleView = (row) =>
    navigate(`/Store_Location_Master?view_id=${row.sl_id}`);

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to delete ${row.sl_location}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await api.post(
          `/i_pi_location_of_store_delete?sl_id=${row.sl_id}`
        );

        if (res.data?.Status === 1 || res.data?.status === 1) {
          Swal.fire(
            "Deleted",
            res.data?.Message || "Location deleted successfully",
            "success"
          );
          loadLocations();
        } else {
          Swal.fire(
            "Error",
            res.data?.Message || "Delete failed",
            "error"
          );
        }
      } catch (err) {
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
                title="Store Location List"
                data={data}
                totalRecords={totalRecords}
                currentPage={currentPage}
                pageSize={pageSize}

                onSearch={handleSearch}
                onAdd={handleAdd}
                onReload={loadLocations}

                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDelete}

                onPageChange={handlePageChange}

                ignoreColumns={["sl_id", "sl_is_active"]}
              />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Store_Location_list;